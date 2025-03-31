---
title: Use Stores with LiteLLM (Native Tool Calls)
short_title: Tool Calling
package: LiteLLM
---

# Use Stores with LiteLLM (Native Tool Calls)

In this tutorial, we will be creating a simple agent that can get the top posts on Hacker News. While AI models can generate text, they need [additional tools](https://docs.litellm.ai/docs/completion/function_call) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

## Hacker News agent

```python
import json
from litellm import completion
import stores

# Load the Hacker News tool index
index = stores.Index(["silanthro/hackernews"])

# Get the response from the model
response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {
            "role": "user",
            "content": "What are the top 10 posts on Hacker News today?",
        }
    ],
    tools=index.format_tools("google-gemini"),  # Format tools for Google Gemini
)

# Execute the tool call
tool_call = response.choices[0].message.tool_calls[0]
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

To format the tools according to the JSON schema required by the Google Gemini API via LiteLLM, we will use `index.format_tools("google-gemini")`.

```python{9}
response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {
            "role": "user",
            "content": "What are the top 10 posts on Hacker News today?",
        }
    ],
    tools=index.format_tools("google-gemini"),
)
```

### 3. Parse the model response

We can then parse `response.choices[0].message.tool_calls` to retrieve the tool name and arguments.

```python {3-6} [response.choices[0\\].message.tool_calls[0\\]]
ChatCompletionMessageToolCall(
    index=0,
    function=Function(
        arguments='{"num": 10}',
        name='tools.get_top_stories'
    ),
    id='call_random_uuid',
    type='function'
)
```

### 4. Execute the function

Finally, we will use `index.execute` with the tool name and arguments to run the tool.

```python{2-5}
tool_call = response.choices[0].message.tool_calls[0]
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
