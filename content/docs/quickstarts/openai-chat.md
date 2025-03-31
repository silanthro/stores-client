---
title: Use Stores with OpenAI Chat Completions API
short_title: Chat Completions
package: OpenAI
---

# Use Stores with OpenAI Chat Completions API

In this quickstart, we will be creating a simple agent that can get the top posts on Hacker News. While OpenAI models can generate text, they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=chat) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

## Hacker News agent

```python
import json
from openai import OpenAI
import stores

# Initialize OpenAI client
client = OpenAI()

# Load the Hacker News tool index
index = stores.Index(["silanthro/hackernews"])

# Get the response from the model
completion = client.chat.completions.create(
    model="gpt-4o-mini-2024-07-18",
    messages=[
        {"role": "user", "content": "What are the top 10 posts on Hacker News today?"}
    ],
    tools=index.format_tools(
        "openai-chat-completions"
    ),  # Format tools for OpenAI Chat Completions API
)

# Execute the tool call
tool_call = completion.choices[0].message.tool_calls[0]
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
print(f"Tool output: {result}")
```

## Steps walkthrough

### 1. Load the tools

First, we will load the Hacker News tools from the [`silanthro/hackernews`](https://github.com/silanthro/hackernews) tool index.

```python
index = stores.Index(["silanthro/hackernews"])
```

You can also load a tool index from a public GitHub repository or load your own custom tools from your repository. [Learn more about what a tool index is here](/docs/guide/_index/what_is_an_index).


The [Hacker News API](https://github.com/HackerNews/API) doesn't require any API key. If a tool requires an API key, you can [pass it via the `env_var` parameter](/docs/guide/remote_index/environment_variables).

### 2. Call the model with the tools

To format the tools according to the JSON schema required by the OpenAI Chat Completions API, we will use `index.format_tools("openai-chat-completions")`.

```python{6}
completion = client.chat.completions.create(
    model="gpt-4o-mini-2024-07-18",
    messages=[
        {"role": "user", "content": "What are the top 10 posts on Hacker News today?"}
    ],
    tools=index.format_tools("openai-chat-completions"),
)
```

### 3. Parse the model response

We can then parse `completion.choices[0].message.tool_calls` to retrieve the tool name and arguments.

```python{3-6}[completion.choices[0\\].message.tool_calls[0\\]]
ChatCompletionMessageToolCall(
    id="random_tool_call_id",
    function=Function(
        arguments='{"num":10}',
        name="tools-get_top_stories",
    ),
    type="function",
)
```

Notice how the tool name `"tools-get_top_stories"` is slightly different from `"tools.get_top_stories"` documented in the [silanthro/hackernews](https://github.com/silanthro/hackernews) index. OpenAI's API does not support `.` in function names, so `index.format_tools` substitutes `.` with `-`. The `index.execute` method in the next step resolves this automatically.

### 4. Execute the function

Finally, we will use `index.execute` with the tool name and arguments to run the tool.

```python{2-5}
tool_call = completion.choices[0].message.tool_calls[0]
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
```

This gives us the tool call result. You can then supply the result to the model and call the model again to get its final response with the supplied information.

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
