---
title: Use Stores with OpenAI Agents SDK
short_title: Agents
package: OpenAI
order: 3
---

# Use Stores with OpenAI Agents SDK

In this quickstart, we will be creating a simple agent that can get the top posts on Hacker News. 

While OpenAI models can generate text, they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=chat) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

## Hacker News agent

```python
from agents import Agent, Runner, function_tool
import stores

# Load the Hacker News tool index
index = stores.Index(["silanthro/hackernews"])

# Set up the tools with Agents SDK's function_tool
formatted_tools = [
    # OpenAI only supports ^[a-zA-Z0-9_-]{1,64}$
    function_tool(name_override=fn.__name__.replace(".", "_"))(fn) 
    for fn in index.tools
]

# Initialize OpenAI agent
agent = Agent(
    name="Hacker News Agent",
    model="gpt-4o-mini-2024-07-18",
    tools=formatted_tools,
)

# Get the response from the agent. The OpenAI agent will automatically execute
# tool calls and generate a response.
result = Runner.run_sync(agent, "What are the top 10 posts on Hacker News today?")
print(f"Agent output: {result.final_output}")
```

## Agent script walkthrough

### 1. Load the tools

First, we will load the Hacker News tools from the [`silanthro/hackernews`](https://github.com/silanthro/hackernews) tool index.

```python
index = stores.Index(["silanthro/hackernews"])
```

You can also load a tool index from a public GitHub repository or load your own custom tools from your repository. [Learn more about what a tool index is here](/docs/guide/_index/what_is_an_index).

The [Hacker News API](https://github.com/HackerNews/API) doesn't require any API key. If a tool requires an API key, you can [pass it via the `env_var` parameter](/docs/guide/remote_index/environment_variables).

### 2. Format tools

To set up the tools as required by the Agents SDK, we will wrap our tools with Agents SDK's `function_tool`. 

When loading tool indexes, Stores includes the module name in the tool name, such as `tools.get_top_stories`. Because OpenAI does not accept `.` in the tool names, we will also substitute any `.` in the tool names with `-`.

```python
formatted_tools = [
    function_tool(name_override=fn.__name__.replace(".", "_"))(fn) 
    for fn in index.tools
]
```

### 3. Initialize the agent

Remember to add your [OpenAI API key](https://platform.openai.com/api-keys) (`OPENAI_API_KEY`) to your `.env` file.

```python
agent = Agent(
    name="Hacker News Agent",
    model="gpt-4o-mini-2024-07-18",
    tools=formatted_tools,
)
```

### 4. Run the agent

The OpenAI agent will automatically execute any functions required by the input task and generate a response with the tool call result.

```python
result = Runner.run_sync(agent, "What are the top 10 posts on Hacker News today?")
```

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
