# Use Stores with OpenAI Chat Completions API

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While OpenAI models can generate text, they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=chat) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

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

    completion = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        messages=[{"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}],
        tools=index.format_tools("openai-chat-completions"),
    )

    print(completion.choices[0].message.tool_calls)

if __name__ == "__main__":
    main()
```

**Output**

```bash
[{
    "id": "call_12345xyz",
    "type": "function",
    "function": {
        "name": "tools-send_gmail",
        "arguments": "{\"subject\":\"Haiku About Dreams\",\"body\":\"In the quiet night,\\nWhispers of dreams take their flight,\\nStars guide the heart\'s hope.\",\"recipients\":[\"x@gmail.com\"]}"
    }
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

if __name__ == "__main__":
    main()
```

You can also load your own custom tools from your repository. Each local tools folder must have the function(s) and a `TOOLS.yml` file that lists the functions. See [silanthro/send-gmail](https://github.com/silanthro/send-gmail) for an example.

```python
index = stores.Index(["./local_tools"])
```

### 2. Call the model with the tools

```python
completion = client.chat.completions.create(
    model="gpt-4o-mini-2024-07-18",
    messages=[
        {"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}
    ],
    tools=index.format_tools("openai-chat-completions"),
)
```

`index.format_tools("openai-chat-completions")` formats the tools according to the JSON schema required by the OpenAI Chat Completions API.

### 3. Get the tool name and arguments from the model

```bash
# completion.choices[0].message.tool_calls
[{
    "id": "call_12345xyz",
    "type": "function",
    "function": {
        "name": "tools-send_gmail",
        "arguments": "{\"subject\":\"Haiku About Dreams\",\"body\":\"In the quiet night,\\nWhispers of dreams take their flight,\\nStars guide the heart\'s hope.\",\"recipients\":[\"x@gmail.com\"]}"
    }
}]
```

### 4. Execute the function

```python
tool_call = completion.choices[0].message.tool_calls[0]
fn_name = tool_call.function.name.replace("-", ".")
fn_args = json.loads(tool_call.function.arguments)
result = index.execute(fn_name, fn_args)
```

If you want, you can supply the result to the model and call the model again.

## Full code

```python
"""
This example shows how to use stores with OpenAI's Chat Completions API.
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
    completion = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}
        ],
        tools=index.format_tools("openai-chat-completions"),
    )

    # Execute the tool call
    tool_call = completion.choices[0].message.tool_calls[0]
    fn_name = tool_call.function.name.replace("-", ".")
    fn_args = json.loads(tool_call.function.arguments)
    result = index.execute(fn_name, fn_args)
    print(f"Tool output: {result}")


if __name__ == "__main__":
    main()

```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
