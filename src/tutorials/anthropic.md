# Use Stores with Anthropic's Claude API

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While Claude models can generate text, they need [additional tools](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os

import anthropic

import stores

def main():
    client = anthropic.Anthropic()

    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}
        ],
        tools=index.format_tools("anthropic"),
    )

    print(response.content)

if __name__ == "__main__":
    main()
```

**Output**

```bash
[
    {
        "type": "text",
        "text": "I can help send the haiku via email. I'll use a standard haiku format (5-7-5 syllables) and send it through Gmail. Let me do that for you.",
    },
    {
        "type": "tool_use",
        "name": "tools-send_gmail",
        "input": {
            "subject": "A Haiku About Dreams",
            "body": "Dreams float like petals\nDancing on night's gentle breeze\nInto morning's light",
            "recipients": ["x@gmail.com"]
        }
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

### 2. Call the model with the tools

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}
    ],
    tools=index.format_tools("anthropic"),
)
```

`index.format_tools("anthropic")` formats the tools according to the JSON schema required by the Anthropic API.

### 3. Get the tool name and arguments from the model

```bash
# response.content
[
    {
        "type": "text",
        "text": "I can help send the haiku via email. I'll use a standard haiku format (5-7-5 syllables) and send it through Gmail. Let me do that for you.",
    },
    {
        "type": "tool_use",
        "name": "tools-send_gmail",
        "input": {
            "subject": "A Haiku About Dreams",
            "body": "Dreams float like petals\nDancing on night's gentle breeze\nInto morning's light",
            "recipients": ["x@gmail.com"]
        }
    }
]
```

### 4. Execute the tool call

```python
tool_call = response.content[-1]
fn_name = tool_call.name.replace("-", ".")
fn_args = tool_call.input
result = index.execute(fn_name, fn_args)
```

## Full code

```python
"""
This example shows how to use stores with Anthropic's API.
"""

import os

import anthropic

import stores


def main():
    # Initialize Anthropic client
    client = anthropic.Anthropic()

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
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Send a haiku about dreams to x@gmail.com"}
        ],
        tools=index.format_tools("anthropic"),
    )

    print(response.content)


if __name__ == "__main__":
    main()

```

If you want, you can supply the result to the model and call the model again.

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
