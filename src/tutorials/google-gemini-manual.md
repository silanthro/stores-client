# Use Stores with Google Gemini API (Manual Tool Calling)

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While Gemini models can generate text, they need [additional tools](https://ai.google.dev/gemini-api/docs/function-calling) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os

from google import genai
from google.genai import types

import stores

def main():
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    config = types.GenerateContentConfig(
        tools=index.tools,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(
            disable=True
        ),
    )

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Send a haiku about dreams to x@gmail.com. Don't ask questions.",
        config=config,
    )

    print(response.candidates[0].content.parts[0].function_call)

if __name__ == "__main__":
    main()
```

**Output**

```bash
{
    "name": "tools.send_gmail",
    "args": {
        "subject": "Dreams",
        "recipients": ["x@gmail.com"],
        "body": "Sleep takes us away,\nTo worlds of endless wonder,\nThen morning arrives."
    }
}
```

## Tool calling steps

### 1. Load the tools

```python
index = stores.Index(
    ["silanthro/send-gmail"],
    env_vars={
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)
```

You can also load your own custom tools from your repository. Each local tools folder must have the function(s) and a `TOOLS.yml` file that lists the functions. See [silanthro/send-gmail](https://github.com/silanthro/send-gmail) for an example.

```python
index = stores.Index(["./local_tools"])
```

### 2. Configure the model with tools

```python
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
config = types.GenerateContentConfig(
    tools=index.tools,
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        disable=True  # Gemini automatically executes tool calls. This script shows how to manually execute tool calls.
    ),
)
```

### 3. Call the model with the tools

```python
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Send a haiku about dreams to x@gmail.com. Don't ask questions.",
    config=config,
)
```

### 4. Get the tool name and arguments from the model

```bash
# response.candidates[0].content.parts[0].function_call
{
    "name": "tools.send_gmail",
    "args": {
        "subject": "Dreams",
        "recipients": ["x@gmail.com"],
        "body": "Sleep takes us away,\nTo worlds of endless wonder,\nThen morning arrives."
    }
}
```

### 5. Execute the tool call

```python
tool_call = response.candidates[0].content.parts[0].function_call
fn_name = tool_call.name
fn_args = tool_call.args
result = index.execute(fn_name, fn_args)
```

## Full code

```python
"""
This example shows how to use stores with Google's Gemini API with manual tool calling.
"""

import os

from google import genai
from google.genai import types

import stores


def main():
    # Initialize Google Gemini client
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    # Load custom tools and set the required environment variables
    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    # Configure the model with tools
    config = types.GenerateContentConfig(
        tools=index.tools,
        automatic_function_calling=types.AutomaticFunctionCallingConfig(
            disable=True  # Gemini automatically executes tool calls. This script shows how to manually execute tool calls.
        ),
    )

    # Get the response from the model
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Send a haiku about dreams to x@gmail.com. Don't ask questions.",
        config=config,
    )

    # Execute the tool call
    tool_call = response.candidates[0].content.parts[0].function_call
    fn_name = tool_call.name
    fn_args = tool_call.args
    result = index.execute(fn_name, fn_args)
    print(f"Tool output: {result}")


if __name__ == "__main__":
    main()

```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
