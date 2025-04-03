---
title: 'Stores - not MCP, more like PyPI'
description: 'We just wanted an easy way to share tools for LLM apps.'
author: 
  name: 'SK'
  title: 'Co-founder'
  img: '/img/sk.jpg'
tags: ["Product"]
createdAt: 2025-03-31
updatedAt: 2025-03-31
---

# 

## Stores is not MCP

From the [Introduction of Model Context Protocol](https://modelcontextprotocol.io/introduction):
> MCP is an open protocol that standardizes how applications provide context to LLMs. Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect your devices to various peripherals and accessories, MCP provides a standardized way to connect AI models to different data sources and tools.

1. **Stores is not a protocol**

Stores does not aspire to standardize how applications provide context to LLMs.<br/>We just wanted an easy way to share tools for LLM apps.

2. **Stores is not a USB-C port**

Stores is not a universal connector plugging LLMs into the rest of the world.<br/>We just wanted an easy way to share tools for LLM apps.

3. **Stores is not a standardized way to connect AI models to other stuff**

Stores does not have any concept of a host or client or server etc.<br/>We just wanted an easy way to share tools for LLM apps.


## Stores is more like PyPI

From the [frontpage of PyPI](https://pypi.org/):
> The Python Package Index (PyPI) is a repository of software for the Python programming language. PyPI helps you find and install software developed and shared by the Python community.

1. **Stores is a public repository of open-source tools for LLMs**

PyPI is a repository of open-source Python packages.<br/>Stores is a repository of open-source tools for LLMs.

2. **Stores has a Python library that makes it super simple to use the tools**

The `pip` CLI is the standard way to install packages from PyPI.<br/>The `stores` library offers a standard way to integrate tools from the Stores collection.

3. **Stores has a (very lightweight) way of declaring tools**

Most Python packages use `pyproject.toml` or `setup.py` to define the package metadata.<br/>Tool indexes in the Stores collection use `tools.toml` to declare available tools.

Here's what it looks like:

```toml
[index]

description="A cool set of tools"

tools=[
  "module_a.a_cool_function",
  "module_b.another_cool_function",
]
```

## A longer answer

MCP aims to be a standard protocol for LLMs to interact with the world. Partly because of that goal, along with all of the considerations, use cases, scenarios that the goal entails, MCP comes with a full glossary of concepts (e.g. hosts, clients, servers, and other concepts detailed in its [specification](https://spec.modelcontextprotocol.io/)). This also makes implementing a MCP server significantly more loaded than implementing a tool (which is really just a function).

```python
# This is a tool defined in two lines, albeit not a very useful one
def hello_world() -> str:
    return "hello world"

# Hey look a more useful tool, also defined in two lines
def sum_numbers(a: float, b: float) -> float:
    return a + b
```

MCP is great! Tremendous thought has gone into its design and I am excited about [its roadmap](https://modelcontextprotocol.io/development/roadmap). It has also found significant traction and useful integrations, especially in apps like Cursor.

But there are also times when all we need is a Python function and not a full MCP server.

Especially for developers working with current LLM APIs and libraries: most APIs require passing tools as either function schemas or a list of Python functions.<br/>(Though OpenAI Agents SDK did recently [add support for MCP servers](https://openai.github.io/openai-agents-python/mcp/).)

```python
import anthropic

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    messages=[
        {"role": "user", "content": "Help me do a thing"}
    ],
    tools=? # This has a function(schema)-shaped hole
)
```

And for all the times when all we needed was a Python function:
1. We wished there was a collection of already-built tools, plus
2. A super simple way to add these to our application

And so **Stores** is really just two things:

1. A public repository of [tools](/) that anyone can contribute to
2. A [Python library](https://github.com/silanthro/stores) that handles tool installation, execution, and formatting of function schemas for the different providers

## Appendix

- **Is Stores like Composio?**<br/>Stores and [Composio](https://composio.dev) solve for similar problems - tool distribution and discovery. We think Composio built a great product and a great community. But it wasn't quite what we were looking for. We believe that the ideal solution should be primarily open-source, super easy to use, and ultra-lightweight. Stores is our attempt at an alternative that better fulfills these goals.
