---
title: Use Stores with LangGraph Agent
short_title: Agent
package: LangChain
order: 8
---

# Use Stores with LangGraph Agent

In this quickstart, we will be creating a simple agent that can get the top posts on Hacker News. 

While large language models can generate text, they need [additional tools](https://python.langchain.com/docs/quickstarts/agents/#create-the-agent) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

## Hacker News agent

```python
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
import stores

# Load the Hacker News tool index
index = stores.Index(["silanthro/hackernews"])

# Initialize the LangGraph agent
agent_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
agent_executor = create_react_agent(agent_model, index.tools)

# Get the response from the agent. The LangGraph agent will automatically execute
# tool calls and generate a response.
response = agent_executor.invoke(
    {
        "messages": [
            HumanMessage(content="What are the top 10 posts on Hacker News today?")
        ]
    }
)
print(f"Assistant response: {response['messages'][-1].content}")
```

## Agent script walkthrough

### 1. Load the tools

First, we will load the Hacker News tools from the [`silanthro/hackernews`](https://github.com/silanthro/hackernews) tool index.

```python
index = stores.Index(["silanthro/hackernews"])
```

You can also load a tool index from a public GitHub repository or load your own custom tools from your repository. [Learn more about what a tool index is here](/docs/guide/_index/what_is_an_index).

The [Hacker News API](https://github.com/HackerNews/API) doesn't require any API key. If a tool requires an API key, you can [pass it via the `env_var` parameter](/docs/guide/remote_index/environment_variables).

### 2. Create a ReAct agent with the tools

Remember to add your [Gemini API key](https://aistudio.google.com/apikey) (`GOOGLE_API_KEY`) to your `.env` file.

`index.tools` is a list of functions loaded in the index. It can be used directly in the agent initialization because LangChain will automatically create the required function declaration JSON schema for us.

```python {2}
agent_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
agent_executor = create_react_agent(agent_model, index.tools)
```

### 3. Invoke the agent

The LangGraph agent will automatically execute any functions required by the input task and generate a response with the tool call result.

```python
response = agent_executor.invoke(
    {
        "messages": [
            HumanMessage(content="What are the top 10 posts on Hacker News today?")
        ]
    }
)
```

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
