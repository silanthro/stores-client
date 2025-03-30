---
title: Use Stores with OpenAI Responses API
short_title: Responses
package: OpenAI
---

# Use Stores with OpenAI Responses API

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While OpenAI models can generate text, they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=responses&strict-mode=enabled) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

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
response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[
        {"role": "user", "content": "Send a haiku about dreams to email@example.com"}
    ],
    tools=index.format_tools("openai-responses"),
)

# Execute the tool call
tool_call = response.output[0]
result = index.execute(
    tool_call.name,
    json.loads(tool_call.arguments),
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

You can also load your own custom tools from your repository. Each local tools folder must have the function(s) and a `tools.yml` file that lists the functions. See [silanthro/send-gmail](https://github.com/silanthro/send-gmail) for an example.

```python
index = stores.Index(["./local_tools"])
```

### 2. Call the model with the tools

`index.format_tools("openai-responses")` formats the tools according to the JSON schema required by the OpenAI Responses API.

```python
response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[{"role": "user", "content": "Send a haiku about dreams to email@example.com"}],
    tools=index.format_tools("openai-responses"),
)
```

### 3. Parse the model response

We can then parse `response.output` to retrieve the tool name and arguments.

```python{2-3}[response.output[0\\]]
ResponseFunctionToolCall(
    arguments='{"subject":"Haiku about Dreams","body":"Drifting through the night,\\nWhispers of the soul\'s delight,\\nStars in silent flight.","recipients":["email@example.com"]}', call_id='call_lpi4KphXO08HX3TTeT2LUTDk',
    name="tools-send_gmail",
    type="function_call",
    id="random_tool_call_id",
    status="completed"
)
```

In the example above, you may have noticed that the tool name `"tools-send_gmail"` is slightly different from `"tools.send_gmail"` documented in the [silanthro/send-gmail](https://github.com/silanthro/send-gmail) index. The discrepancy is because OpenAI's API does not support `.` in function names and hence `index.format_tools` substitutes `.` with `-`. The `index.execute` method in the next section resolves this automatically as well.

### 4. Execute the tool call

Use `index.execute` with the tool name and arguments to run the tool.

```python{2-5}
tool_call = response.output[0]
result = index.execute(
    tool_call.name,
    json.loads(tool_call.arguments),
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
response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[
        {"role": "user", "content": "Send a haiku about dreams to email@example.com"}
    ],
    tools=index.format_tools("openai-responses"),
)

# Execute the tool call
tool_call = response.output[0]
result = index.execute(
    tool_call.name,
    json.loads(tool_call.arguments),
)
print(f"Tool output: {result}")
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/docs/contribute).
