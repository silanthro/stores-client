---
title: Use Stores with Anthropic's Claude API
short_title: Claude
package: Anthropic
---

# Use Stores with Anthropic's Claude API

In this quickstart, we will be creating a simple agent that can get the top posts on Hacker News. While Claude models can generate text, they need [additional tools](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

## Hacker News agent

```python
import anthropic
import stores

# Initialize Anthropic client
client = anthropic.Anthropic()

# Load the Hacker News tool index
index = stores.Index(["silanthro/hackernews"])

# Get the response from the model
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What are the top 10 posts on Hacker News today?"}
    ],
    tools=index.format_tools("anthropic"),  # Format tools for Anthropic
)

# Execute the tool call
tool_call = response.content[-1]
result = index.execute(tool_call.name, tool_call.input)
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

To format the tools according to the JSON schema required by the Anthropic API, we will use `index.format_tools("anthropic")`.

```python{9}
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What are the top 10 posts on Hacker News today?"}
    ],
    tools=index.format_tools("anthropic"),
)
```

### 3. Parse the model response

We can then parse `response.content` to retrieve the tool name and arguments.

```python {9-13} [response.content]
[
    TextBlock(
        citations=None,
        text="I'll help you retrieve the top 10 stories from Hacker News using the get_top_stories function.",
        type="text",
    ),
    ToolUseBlock(
        id="a_random_tool_use_id",
        input={
            "num": "10",
        },
        name="tools-get_top_stories",
        type="tool_use",
    ),
]
```

Notice how the tool name `"tools-get_top_stories"` is slightly different from `"tools.get_top_stories"` documented in the [silanthro/hackernews](https://github.com/silanthro/hackernews) index. Anthropic's API does not support `.` in function names, so `index.format_tools` substitutes `.` with `-`. The `index.execute` method in the next step resolves this automatically.

### 4. Execute the function

Finally, we will use `index.execute` with the tool name and arguments to run the tool.

```python{2}
tool_call = response.content[-1]
result = index.execute(tool_call.name, tool_call.input)
```

This gives us the tool call result. You can then supply the result to the model and call the model again to get its final response with the supplied information.

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
