---
title: Use Stores with LangChain (Native Tool Calls)
short_title: Tool Calling
package: LangChain
---

# Use Stores with LangChain (Native Tool Calls)

In this tutorial, we will be creating a simple agent that can get the top posts on Hacker News. While AI models can generate text, they need [additional tools](https://python.langchain.com/docs/modules/model_io/models/llms/integrations/google_genai) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

## Hacker News agent

```python
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load the Hacker News tool index
index = stores.Index(["silanthro/hackernews"])

# Initialize the model with tools
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)

# Get the response from the model
response = model_with_tools.invoke("What are the top 10 posts on Hacker News today?")

# Execute the tool call
tool_call = response.tool_calls[0]
result = index.execute(tool_call["name"], tool_call["args"])
print(f"Tool output: {result}")
```

## Tool calling steps

### 1. Load the tools

First, we will load the Hacker News tools from the [`silanthro/hackernews`](https://github.com/silanthro/hackernews) tool index.

```python
index = stores.Index(["silanthro/hackernews"])
```

You can also load a tool index from a public GitHub repository or load your own custom tools from your repository. [Learn more about what a tool index is here](/docs/guide/_index/what_is_an_index).


The [Hacker News API](https://github.com/HackerNews/API) doesn't require any API key. If a tool requires an API key, you can [pass it via the `env_var` parameter](/docs/guide/remote_index/environment_variables).

### 2. Bind the tools to the model

`index.tools` is a list of functions loaded in the index. This can be used directly in `model.bind_tools` because LangChain will automatically create the required function declaration JSON schema for us.

```python{2}
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)
```

### 3. Call the model with tools

```python
response = model_with_tools.invoke("What are the top 10 posts on Hacker News today?")
```

### 4. Get the tool name and arguments from the model

We can then parse `response.tool_calls` to retrieve the tool name and arguments.

```python {2-5} [response.tool_calls[0\\]]
{
    "name": "tools.get_top_stories",
    "args": {
        "num": 10,
    },
    "id": "random-tool-use-uuid",
    "type": "tool_call"
}
```

### 5. Execute the function

Finally, we will use `index.execute` with the tool name and arguments to run the tool.

```python{2}
tool_call = response.tool_calls[0]
result = index.execute(tool_call["name"], tool_call["args"])
```

This gives us the tool call result. You can then supply the result to the model and call the model again to get its final response with the supplied information.

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
