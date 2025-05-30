---
title: Use Stores with OpenAI Responses API
short_title: Responses
package: OpenAI
order: 2
---

# Use Stores with OpenAI Responses API

In this quickstart, we will be creating a simple agent that can get the top posts on Hacker News. 

While OpenAI models can generate text, they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=responses&strict-mode=enabled) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

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
response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[
        {"role": "user", "content": "What are the top 10 posts on Hacker News today?"}
    ],
    tools=index.format_tools(
        "openai-responses"
    ),  # Format tools for OpenAI Responses API
)

# Execute the tool call
tool_call = response.output[0]
result = index.execute(
    tool_call.name,
    json.loads(tool_call.arguments),
)
print(f"Tool output: {result}")
```

## Agent script walkthrough

### 1. Load the tools

First, we will load the Hacker News tools from the [`silanthro/hackernews`](https://github.com/silanthro/hackernews) tool index.

```python
index = stores.Index(["silanthro/hackernews"])
```

You can also load a tool index from a public GitHub repository or load your own custom tools from your repository. [Learn more about what a tool index is here](/docs/guide/_index/what_is_an_index).

The [Hacker News API](https://github.com/HackerNews/API) doesn't require any API key. If a tool requires an API key, you can [pass it via the `env_var` parameter](/docs/guide/remote_index/environment_variables).

### 2. Call the model with the tools

Remember to add your [OpenAI API key](https://platform.openai.com/api-keys) (`OPENAI_API_KEY`) to your `.env` file.

To format the tools according to the JSON schema required by the OpenAI Responses API, we will use `index.format_tools("openai-responses")`.

```python{6}
client = OpenAI()

response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[{"role": "user", "content": "What are the top 10 posts on Hacker News today?"}],
    tools=index.format_tools("openai-responses"),
)
```

### 3. Parse the model response

We can then parse `response.output` to retrieve the tool name and arguments.

```python{3-4}[response.output[0\\]]
ResponseFunctionToolCall(
    call_id='call_lpi4KphXO08HX3TTeT2LUTDk',
    name="tools-get_top_stories",
    arguments='{"num":10}',
    type="function_call",
    id="random_tool_call_id",
    status="completed"
)
```

Notice how the tool name `"tools-get_top_stories"` is slightly different from `"tools.get_top_stories"` documented in the [silanthro/hackernews](https://github.com/silanthro/hackernews) index. OpenAI's API does not support `.` in function names, so `index.format_tools` substitutes `.` with `-`. The `index.execute` method in the next step resolves this automatically.

### 4. Execute the function

Finally, we will use `index.execute` with the tool name and arguments to run the tool.

```python{2-5}
tool_call = response.output[0]
result = index.execute(
    tool_call.name,
    json.loads(tool_call.arguments),
)
```

This gives us the tool call result. You can then supply the result to the model and call the model again to get its final response with the supplied information.

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
