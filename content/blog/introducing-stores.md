---
title: Introducing Stores, a lightweight, open-source library for AI agent tools
description: 'Give your AI agent tools in as few as three lines of code: Import, load, and pass to model'
author:
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
coverImg: '/img/blog/introducing-stores/introducing-stores-cover.jpg'
coverAlt: 'Stores launch banner'
tags: ['Product']
createdAt: 2025-04-07
updatedAt: 2025-04-07
---

Today, we are releasing an early preview of Stores.

Stores is an open-source library for adding tools to your AI agents in as few as three lines of code.

1. Import Stores
2. Load the tools
3. Pass the tools to the model

Here's how easy it is to add a set of Hacker News tools to various LLM models via the popular APIs and frameworks:

::content-multi-code
```python {3,5-6,18-19,23-24} [Anthropic]
import os
import anthropic
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    messages=[
        {
            "role": "user",
            "content": "Find the latest posts on HackerNews",
        }
    ],
    # Pass tools
    tools=index.format_tools("anthropic"),
)

tool_call = response.content[-1]
# Execute tools
result = index.execute(tool_call.name, tool_call.input)
```
```python {3,5-6,10-11,14} [Gemini]
from google import genai
from google.genai import types
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

client = genai.Client()

# Pass tools
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.0-flash", config=config)

# Tools executed automatically
response = chat.send_message(
    "Find the latest posts on HackerNews"
)
```
```python {3,5-6,18-19,23-27} [OpenAI]
import json
from openai import OpenAI
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

client = OpenAI()

response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[
        {
            "role": "user",
            "content": "Find the latest posts on HackerNews",
        }
    ],
    # Pass tools
    tools=index.format_tools("openai-responses"),
)

tool_call = response.output[0]
# Execute tools
result = index.execute(
    tool_call.name,
    json.loads(tool_call.arguments),
)
```
```python {2,4-5,8-9,16-17} [LangChain]
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
# Pass tools
model_with_tools = model.bind_tools(index.tools)

response = model_with_tools.invoke(
    "Find the latest posts on HackerNews"
)

tool_call = response.tool_calls[0]
# Execute tools
result = index.execute(tool_call["name"], tool_call["args"])
```
```python {4,6-7,11-12,16} [LlamaIndex]
from llama_index.core.agent import AgentRunner
from llama_index.core.tools import FunctionTool
from llama_index.llms.google_genai import GoogleGenAI
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

llm = GoogleGenAI(model="models/gemini-2.0-flash-001")
tools = [
    # Pass tools
    FunctionTool.from_defaults(fn=fn) for fn in index.tools
]
agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)

# Tools executed automatically
response = agent.chat(
    "Find the latest posts on HackerNews"
)
```
```python {4,6-7,17-18,22-26} [LiteLLM]
import json
import os
from litellm import completion
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {
            "role": "user",
            "content": "Find the latest posts on HackerNews",
        }
    ],
    # Pass tools
    tools=index.format_tools("google-gemini"),
)

tool_call = response.choices[0].message.tool_calls[0]
# Execute tools
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
```
::

You can think of Stores as something like the [Python Package Index (PyPI) but for LLM tools](/blog/stores-not-mcp-more-pypi).

We are launching this early preview with a small set of tools that we think agent builders will find useful. To list a few:

- [Send an email via Gmail](https://github.com/silanthro/send-gmail)
- [Get, create, and manage Todoist tasks](https://github.com/silanthro/todoist)
- [Read, edit, and move files in specified directories](https://github.com/silanthro/filesystem)

You can use these tools to build agents that [complete Todoist tasks](/docs/cookbook/complete-todoist-tasks), [send emails](/docs/cookbook/send-email), [rename files on your computer](/docs/cookbook/rename-files), and more.

We will be adding more tools, so let us know what will be useful to you. It'll be awesome if you want to build and [contribute your tools](/docs/contribute) too!

---

## Why we built Stores

**With Stores, we want to make it super simple to build LLM Agents that use tools.**

For the past few months, my cofounder SK and I have been prototyping several AI agents. One of the most tedious parts was building the tools to extend the model's capability. We spent a lot of time building, testing, and fixing our tools. Even a tool to "simply" search on Google (without using their API) wasn't trivial.

There is no reason for developers to keep building tools from scratch when someone else has already built them. Imagine building a calculator yourself whenever you want to add two numbers.

To make things worse, developers also need to build their agents' memory, orchestration layer, and user interface, which is a lot! With Stores, we are starting with tools because of the pain we felt ourselves and the lack of an open-source, light-weight solution.

We built Stores to have two main components:

1. A [Python library](https://github.com/silanthro/stores) that handles tool installation and formatting for major LLM providers
2. A directory of [open-source tools](/) that anyone can use and contribute to

## Why you might like Stores

As developers ourselves, we appreciate the importance of open source and understand the pain of building reliable tools that also play nicely with different LLM providers.

So, we designed Stores with these principles in mind:

- **Open-source**: Each set of tools in the Stores directory is a public git repository. Even if the Stores directory goes away, the library and tools will still work as long as the git repositories exist.
- **Isolation**: Tools are isolated in their own virtual environments. This prevents conflicting dependencies of tools and reduces unnecessary access to sensitive environment variables.
- **Framework compatibility**: Each LLM provider requires developers to pass tools in different schema formats to its APIs, making it cumbersome to switch between providers. Stores makes it easy to create the required formats for the providers you use.

## What exactly can you do with Stores?

We aim to make building LLM agents with tools as simple as possible for you. For now, Stores focuses on letting you easily add tools to your agents and work with the major LLM providers.

### 1. Add tools with a few lines of code

At its core, Stores make it easy to give your agents tools via an `Index`. You can add tools to an `Index` from [any of the following sources](/docs/guide/_index/what_is_an_index):

- Tools published on the Stores directory
- Tools in public GitHub repositories
- Tools in your local directories
- Or simply Python functions

```python
# Load tools from different sources
index = Index([
    "silanthro/hackernews",
    "github_account/repo_name",
    "path/to/local/folder",
    foo_function,
])
```

### 2. Easily format tools for all major LLM providers

Annoyingly, LLM providers and frameworks require slightly different schemas for tools. You can see [the various formats here](/docs/guide/_index/pass_tools_to_llms#passing-a-schema). Even OpenAI Chat Completions and OpenAI Responses require different schemas.

[The `Index.format_tools` method](/docs/guide/_index/pass_tools_to_llms) lets you easily comply with the different schema requirements from the major LLM providers (Anthropic, OpenAI Chat Completions & Responses, and Google Gemini).

```python {6-8} [anthropic_example.py]
client = anthropic.Anthropic()
response = client.messages.create(
    model=model,
    messages=messages,
    tools=(
        # Both are equivalent
        index.format_tools("anthropic")
        or index.format_tools(ProviderFormat.ANTHROPIC)
    ),
)
```

### 3. Securely provide credentials if needed

If a tool requires credentials or other sensitive information, you can provide them securely via [environment variables](/docs/guide/remote_index/environment_variables).

```python
index = stores.Index(
    [
        "remote_index_1",
        "remote_index_2",
    ],
    env_var={
        "remote_index_1": {
            "env_var_1": ENV_VAR_1,
            "env_var_2": ENV_VAR_2,
        },
        "remote_index_2": {
            "env_var_3": ENV_VAR_3,
            "env_var_4": ENV_VAR_4,
        },
    },
)
```

**Note:** For now, tools are not executed in a sandbox, which is something we plan to add in the future. In the meantime, please check the code of the tools you want to use to ensure they do not unnecessarily access sensitive information.

### 4. Execute tools with a helper function

Finally, for LLM packages that don't execute tools automatically, such as Anthropic and LiteLLM, you can use the `Index.execute` method to execute tools.

```python {10-13} [openai_example.py]
# Call the model
completion = client.chat.completions.create(
    model=model,
    messages=messages,
    tools=index.format_tools("openai-chat-completions"),
)

# Execute the tool call
tool_call = completion.choices[0].message.tool_calls[0]
result = index.execute(
    toolname=tool_call.function.name,
    kwargs=json.loads(tool_call.function.arguments),
)
```

You could write this helper function yourself but we want to make things as simple as possible for you.

## How to get started

If you have been annoyed by how tedious adding tools to your agents is, we would love for you to give Stores a try! 

Here are some resources to help you get started:

- [Documentation](/docs)
- [Quickstarts](/docs/quickstarts)
- [Cookbook](/docs/cookbook)

We are happy to help if you have any questions or feedback. 

And if you are excited by the idea behind Stores, please consider [contributing](/docs/contribute)!
