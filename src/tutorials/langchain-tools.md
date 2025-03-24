# Use Stores with LangChain (Native Tool Calls)

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While AI models can generate text, they need [additional tools](https://python.langchain.com/docs/modules/model_io/models/llms/integrations/google_genai) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os

from langchain_google_genai import ChatGoogleGenerativeAI

import stores


def main():
    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
    model_with_tools = model.bind_tools(index.tools)

    response = model_with_tools.invoke(
        "Send a haiku about dreams to x@gmail.com. Don't ask questions."
    )

    print(response.tool_calls)

if __name__ == "__main__":
    main()
```

**Output**

```bash
[
    {
        "name": "tools.send_gmail",
        "args": {
            "subject": "Dreams",
            "recipients": ["x@gmail.com"],
            "body": "Night visions unfold,\nWorlds of wonder bloom and fade,\nDawn awakes the soul."
        },
        "id": "dbb24951-7811-47c4-a342-5805df4cfe9f",
        "type": "tool_call"
    }
]
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

### 2. Initialize the model with tools

```python
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)
```

### 3. Call the model with the tools

```python
response = model_with_tools.invoke(
    "Send a haiku about dreams to x@gmail.com. Don't ask questions."
)
```

### 4. Get the tool name and arguments from the model

```bash
# response.tool_calls
[
    {
        "name": "tools.send_gmail",
        "args": {
            "subject": "Dreams",
            "recipients": ["x@gmail.com"],
            "body": "Night visions unfold,\nWorlds of wonder bloom and fade,\nDawn awakes the soul."
        },
        "id": "dbb24951-7811-47c4-a342-5805df4cfe9f",
        "type": "tool_call"
    }
]
```

### 5. Execute the tool call

```python
tool_call = response.tool_calls[0]
fn_name = tool_call["name"]
fn_args = tool_call["args"]
result = index.execute(fn_name, fn_args)
```

If you want, you can supply the result to the model and call the model again.

## Full code

```python
"""
This example shows how to use stores with LangChain with native function calls.
"""

import os

from langchain_google_genai import ChatGoogleGenerativeAI

import stores


def main():
    # Load tools and set the required environment variables
    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    # Initialize the model with tools
    model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
    model_with_tools = model.bind_tools(index.tools)

    # Get the response from the model
    response = model_with_tools.invoke(
        "Send a haiku about dreams to x@gmail.com. Don't ask questions."
    )

    # Execute the tool call
    tool_call = response.tool_calls[0]
    fn_name = tool_call["name"]
    fn_args = tool_call["args"]
    result = index.execute(fn_name, fn_args)
    print(f"Tool output: {result}")


if __name__ == "__main__":
    main()

```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
