---
title: Use Stores with Anthropic's Claude API
short_title: Claude
package: Anthropic
---

# Use Stores with Anthropic's Claude API

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While Claude models can generate text, they need [additional tools](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os
import anthropic
import stores

# Initialize Anthropic client
client = anthropic.Anthropic()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/send-gmail"],
    env_var={
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
        {"role": "user", "content": "Send a haiku about dreams to email@example.com"}
    ],
    tools=index.format_tools("anthropic"),
)

# Execute the tool call
tool_call = response.content[-1]
result = index.execute(tool_call.name, tool_call.input)
print(f"Tool output: {result}")
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

You can also load your own custom tools from your repository. Each local tools folder must have the function(s) and a `tools.toml` file that lists the functions. See [silanthro/send-gmail](https://github.com/silanthro/send-gmail) for an example.

```python
index = stores.Index(["./local_tools"])
```

### 2. Call the model with the tools

Use `index.format_tools("anthropic")` to format the tools according to the JSON schema required by the Anthropic API.

```python{9}
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Send a haiku about dreams to x@gmail.com"},
    ],
    tools=index.format_tools("anthropic"),
)
```



### 3. Parse the model response

We can then parse `response.content` to retrieve the tool name and arguments.

```python {9-14} [response.content]
[
    TextBlock(
        citations=None,
        text="I can help send the haiku via email. I'll use a standard haiku format (5-7-5 syllables) and send it through Gmail. Let me do that for you.",
        type="text",
    ),
    ToolUseBlock(
        id="a_random_tool_use_id",
        input={
            "subject": "A Haiku About Dreams",
            "body": "Dreams float like petals\nDancing on night's gentle breeze\nInto morning's light",
            "recipients": ["email@example.com"],
        },
        name="tools-send_gmail",
        type="tool_use",
    ),
]
```

In the example above, you may have noticed that the tool name `"tools-send_gmail"` is slightly different from `"tools.send_gmail"` documented in the [silanthro/send-gmail](https://github.com/silanthro/send-gmail) index. The discrepancy is because Anthropic's API does not support `.` in function names and hence `index.format_tools` substitutes `.` with `-`. The `index.execute` method in the next section resolves this automatically as well.

### 4. Execute the tool call

Use `index.execute` with the tool name and arguments to run the tool.

```python{2}
tool_call = response.content[-1]
result = index.execute(tool_call.name, tool_call.input)
```

## Full code

```python
import os
import anthropic
import stores

# Initialize Anthropic client
client = anthropic.Anthropic()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/send-gmail"],
    env_var={
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
        {"role": "user", "content": "Send a haiku about dreams to email@example.com"}
    ],
    tools=index.format_tools("anthropic"),
)

# Execute the tool call
tool_call = response.content[-1]
result = index.execute(tool_call.name, tool_call.input)
print(f"Tool output: {result}")
```

If you want, you can supply the result to the model and call the model again.

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/docs/contribute).
