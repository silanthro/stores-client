---
title: Use Stores with Google Gemini API (Manual Tool Calling)
short_title: Gemini (Manual)
package: Google
order: 6
---

# Use Stores with Google Gemini API (Manual Tool Calling)

In this quickstart, we will be creating a simple agent that can get the top posts on Hacker News. 

While Gemini models can generate text, they need [additional tools](https://ai.google.dev/gemini-api/docs/function-calling) to perform actions like fetching data from Hacker News. Using Stores, we will add tools for querying the Hacker News API.

## Hacker News agent

```python
import os
from google import genai
from google.genai import types
import stores

# Initialize Google Gemini client
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Load the Hacker News tool index
index = stores.Index(["silanthro/hackernews"])

# Configure the model with tools
config = types.GenerateContentConfig(
    tools=index.tools,
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        disable=True  # Disable automatic function calling to manually execute tool calls
    ),
)

# Get the response from the model
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="What are the top 10 posts on Hacker News today?",
    config=config,
)

# Execute the tool call
tool_call = response.candidates[0].content.parts[0].function_call
result = index.execute(tool_call.name, tool_call.args)
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

### 2. Create a config with the tools

`index.tools` is a list of functions loaded in the index. This can be passed directly to the config when using Gemini's Python SDK, which will automatically create the required function declaration JSON schema for us.

```python{2}
config = types.GenerateContentConfig(
    tools=index.tools,
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        # Gemini automatically executes tool calls
        # We disable this to show how to manually execute tool calls
        disable=True
    ),
)
```

### 3. Call the model with the request and created config

Remember to add your [Gemini API key](https://aistudio.google.com/apikey) (`GEMINI_API_KEY`) to your `.env` file.

```python
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="What are the top 10 posts on Hacker News today?",
    config=config,
)
```

### 4. Parse the model response

Because we disabled automatic function calling, we need to manually parse `response.candidates[0].content.parts[0].function_call` to retrieve the tool name and arguments.

```python {3-6} [response.candidates[0\\].content.parts[0\\].function_call]
FunctionCall(
    id=None,
    name="tools.get_top_stories",
    args={
        "num": 10,
    },
)
```

### 5. Execute the function

Finally, we will use `index.execute` with the tool name and arguments to run the tool.

```python{2}
tool_call = response.candidates[0].content.parts[0].function_call
result = index.execute(tool_call.name, tool_call.args)
```

This gives us the tool call result. You can then supply the result to the model and call the model again to get its final response with the supplied information.

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
