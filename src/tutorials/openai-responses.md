# Use Stores with OpenAI Responses API

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While OpenAI models can generate text, they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=responses&strict-mode=enabled) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import json
import os

from openai import OpenAI

import stores

def main():
    client = OpenAI()

    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    response = client.responses.create(
        model="gpt-4o-mini-2024-07-18",
        input=[{"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}],
        tools=index.format_tools("openai-responses"),
    )

    print(response.output)

if __name__ == "__main__":
    main()
```

**Output**

```bash
[{
    "type": "function_call",
    "id": "fc_12345xyz",
    "call_id": "call_12345xyz",
    "name": "tools-send_gmail",
    "arguments": "{\"subject\":\"Haiku About Dreams\",\"body\":\"In the quiet night,\\nWhispers of dreams take their flight,\\nStars guide the heart\\'s hope.\",\"recipients\":[\"x@gmail.com\"]}"
}]
```

## Tool calling steps

### 1. Load the tools

```python
import json
import os

from openai import OpenAI

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
```

You can also load your own custom tools from your repository. Each local tools folder must have the function(s) and a `TOOLS.yml` file that lists the functions. See [silanthro/send-gmail](https://github.com/silanthro/send-gmail) for an example.

```python
index = stores.Index(["./local_tools"])
```

### 2. Call the model with the tools

```python
client = OpenAI()

response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[{"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}],
    tools=index.format_tools("openai-responses"),
)
```

`index.format_tools("openai-responses")` formats the tools according to the JSON schema required by the OpenAI Responses API.

### 3. Get the tool name and arguments from the model

```bash
# response.output
[{
    "type": "function_call",
    "id": "fc_12345xyz",
    "call_id": "call_12345xyz",
    "name": "tools-send_gmail",
    "arguments": "{\"subject\":\"Haiku About Dreams\",\"body\":\"In the quiet night,\\nWhispers of dreams take their flight,\\nStars guide the heart\\'s hope.\",\"recipients\":[\"x@gmail.com\"]}"
}]
```

### 4. Execute the tool call

```python
tool_call = response.output[0]
fn_name = tool_call.name.replace("-", ".")
fn_args = json.loads(tool_call.arguments)
result = index.execute(fn_name, fn_args)
```

## Full code

```python
"""
This example shows how to use stores with OpenAI's Responses API.
"""

import json
import os

from openai import OpenAI

import stores


def main():
    # Initialize OpenAI client
    client = OpenAI()

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

    # Get the response from the model
    response = client.responses.create(
        model="gpt-4o-mini-2024-07-18",
        input=[{"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}],
        tools=index.format_tools("openai-responses"),
    )

    # Execute the tool call
    tool_call = response.output[0]
    fn_name = tool_call.name.replace("-", ".")
    fn_args = json.loads(tool_call.arguments)
    result = index.execute(fn_name, fn_args)
    print(f"Tool output: {result}")


if __name__ == "__main__":
    main()

```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
