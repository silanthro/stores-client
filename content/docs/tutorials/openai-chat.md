---
title: Use Stores with OpenAI Chat Completions API
short_title: Chat Completions
package: OpenAI
---

# Use Stores with OpenAI Chat Completions API

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While OpenAI models can generate text, they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=chat) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import json
import os
from openai import OpenAI
import stores

# Initialize OpenAI client
client = OpenAI()

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
completion = client.chat.completions.create(
    model="gpt-4o-mini-2024-07-18",
    messages=[
        {"role": "user", "content": "Send a haiku about dreams to email@example.com"}
    ],
    tools=index.format_tools("openai-chat-completions"),
)

# Execute the tool call
tool_call = completion.choices[0].message.tool_calls[0]
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
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

`index.format_tools("openai-chat-completions")` formats the tools according to the JSON schema required by the OpenAI Chat Completions API.

```python{6}
completion = client.chat.completions.create(
    model="gpt-4o-mini-2024-07-18",
    messages=[
        {"role": "user", "content": "Send a haiku about dreams to email@example.com"}
    ],
    tools=index.format_tools("openai-chat-completions"),
)
```

### 3. Parse the model response

```python{3-6}[completion.choices[0\\].message.tool_calls[0\\]]
ChatCompletionMessageToolCall(
    id="random_tool_call_id",
    function=Function(
        arguments='{"subject":"A Haiku About Dreams","body":"In the quiet night,\\nWhispers from the stars collide,\\nHope\'s light in our dreams.","recipients":["email@example.com"]}',
        name="tools-send_gmail",
    ),
    type="function",
)
```

In the example above, you may have noticed that the tool name `"tools-send_gmail"` is slightly different from `"tools.send_gmail"` documented in the [silanthro/send-gmail](https://github.com/silanthro/send-gmail) index. The discrepancy is because OpenAI's API does not support `.` in function names and hence `index.format_tools` substitutes `.` with `-`. The `index.execute` method in the next section resolves this automatically as well.

### 4. Execute the function

Use `index.execute` with the tool name and arguments to run the tool.

```python{2-5}
tool_call = completion.choices[0].message.tool_calls[0]
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
```

## Full code

```python
import json
import os
from openai import OpenAI
import stores

# Initialize OpenAI client
client = OpenAI()

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
completion = client.chat.completions.create(
    model="gpt-4o-mini-2024-07-18",
    messages=[
        {"role": "user", "content": "Send a haiku about dreams to email@example.com"}
    ],
    tools=index.format_tools("openai-chat-completions"),
)

# Execute the tool call
tool_call = completion.choices[0].message.tool_calls[0]
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
print(f"Tool output: {result}")
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/docs/contribute).
