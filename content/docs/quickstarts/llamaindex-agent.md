---
title: Use Stores with LlamaIndex Agent
short_title: Agent
package: LlamaIndex
---

# Use Stores with LlamaIndex Agent

In this quickstart, we will be creating a simple agent that can get the top posts on Hacker News. While LlamaIndex agents can generate text, they need [additional tools](https://docs.llamaindex.ai/en/stable/module_guides/deploying/agents/tools/) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

## Hacker News agent

```python
from llama_index.core.agent import AgentRunner
from llama_index.core.tools import FunctionTool
from llama_index.llms.google_genai import GoogleGenAI

import stores

# Load the Hacker News tool index
index = stores.Index(["silanthro/hackernews"])

# Initialize the LlamaIndex agent with tools
llm = GoogleGenAI(model="models/gemini-2.0-flash-001")
tools = [
    FunctionTool.from_defaults(fn=fn) for fn in index.tools
]  # Use LlamaIndex FunctionTool
agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)

# Get the response from the agent. The LlamaIndex agent will automatically execute
# tool calls and generate a response.
response = agent.chat("What are the top 10 posts on Hacker News today?")
print(f"Assistant response: {response}")
```

## Steps walkthrough

### 1. Load the tools

First, we will load the Hacker News tools from the [`silanthro/hackernews`](https://github.com/silanthro/hackernews) tool index.

```python
index = stores.Index(["silanthro/hackernews"])
```

You can also load a tool index from a public GitHub repository or load your own custom tools from your repository. [Learn more about what a tool index is here](/docs/guide/_index/what_is_an_index).

The [Hacker News API](https://github.com/HackerNews/API) doesn't require any API key. If a tool requires an API key, you can [pass it via the `env_var` parameter](/docs/guide/remote_index/environment_variables).

### 2. Initialize the agent with the tools

We will use LlamaIndex's `FunctionTool` to wrap the tools from `index.tools`.

```python{2}
llm = GoogleGenAI(model="models/gemini-2.0-flash-001")
tools = [FunctionTool.from_defaults(fn=fn) for fn in index.tools]
agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)
```


### 3. Run the agent

The LlamaIndex agent will automatically execute any functions required by the input task and generate a response with the tool call result.

```python
response = agent.chat("What are the top 10 posts on Hacker News today?")
```

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
