---
title: Use Stores with LiteLLM (Native Tool Calls)
short_title: Tool Calling
package: LiteLLM
---

# Use Stores with LiteLLM (Native Tool Calls)

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While LiteLLM models can generate text, they need [additional tools](https://docs.litellm.ai/docs/completion/function_call) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import json
import os
from litellm import completion
import stores

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
response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {
            "role": "user",
            "content": "Send a haiku about dreams to email@example.com. Don't ask questions.",
        }
    ],
    tools=index.format_tools("google-gemini"),
)

# Execute the tool call
tool_call = response.choices[0].message.tool_calls[0]
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

### 2. Call the model with tools

`index.format_tools("google-gemini")` formats the tools according to the JSON schema required by the Google Gemini API via LiteLLM.

```python{9}
response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {
            "role": "user",
            "content": "Send a haiku about dreams to email@example.com. Don't ask questions.",
        }
    ],
    tools=index.format_tools("google-gemini"),
)
```

### 3. Parse the model response

We can then parse `response` to retrieve the tool name and arguments.

```python {3-6} [response.choices[0\\].message.tool_calls[0\\]]
ChatCompletionMessageToolCall(
    index=0,
    function=Function(
        arguments='{"subject": "Dreams", "recipients": ["email@example.com"], "body": "Night visions unfold,\\nA world of strange delight blooms,\\nThen morning arrives."}',
        name='tools.send_gmail'
    ),
    id='call_random_uuid',
    type='function'
)
```

### 4. Execute the tool call

Use `index.execute` with the tool name and arguments to run the tool.

```python{2-5}
tool_call = response.choices[0].message.tool_calls[0]
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
```

## Full code

```python
import json
import os
from litellm import completion
import stores

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
response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {
            "role": "user",
            "content": "Send a haiku about dreams to email@example.com. Don't ask questions.",
        }
    ],
    tools=index.format_tools("google-gemini"),
)

# Execute the tool call
tool_call = response.choices[0].message.tool_calls[0]
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
print(f"Tool output: {result}")
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/docs/contribute).
