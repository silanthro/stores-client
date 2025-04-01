---
title: Use Stores with Google Gemini API (Automatic Tool Calling)
short_title: Gemini (Auto)
package: Google
order: 5
---

# Use Stores with Google Gemini API (Automatic Tool Calling)

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

# Initialize the chat with the model
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.0-flash", config=config)

# Get the response from the model. Gemini will automatically execute tool calls
# and generate a response.
response = chat.send_message("What are the top 10 posts on Hacker News today?")
print(f"Assistant response: {response.candidates[0].content.parts[0].text}")
```

## Agent script walkthrough

### 1. Load the tools

First, we will load the Hacker News tools from the [`silanthro/hackernews`](https://github.com/silanthro/hackernews) tool index.

```python
index = stores.Index(["silanthro/hackernews"])
```

You can also load a tool index from a public GitHub repository or load your own custom tools from your repository. [Learn more about what a tool index is here](/docs/guide/_index/what_is_an_index).

The [Hacker News API](https://github.com/HackerNews/API) doesn't require any API key. If a tool requires an API key, you can [pass it via the `env_var` parameter](/docs/guide/remote_index/environment_variables).

### 2. Initialize the chat with the tools

Remember to add your [Gemini API key](https://aistudio.google.com/apikey) (`GEMINI_API_KEY`) to your `.env` file.

`index.tools` is a list of functions loaded in the index. This can be passed directly to the config when using Gemini's Python SDK, which will automatically create the required function declaration JSON schema for us.

```python{3}
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.0-flash", config=config)
```

### 3. Call the model with the tools

Gemini's Python SDK will also automatically execute any functions required by the input task and generate a response with the tool call result.

```python
response = chat.send_message("What are the top 10 posts on Hacker News today?")
```

## Next steps

- Learn more about [how the Stores package works](/docs/guide)
- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua)
- If you are interested in building tools for other developers, [get started here](/docs/contribute)
