---
title: 'Introducing Stores, an open-source tools library for AI agents'
description: 'Give your AI agent tools in as few as three lines of code: Import, load, and pass to model'
author: 
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
coverImg: '/img/blog/introducing-stores/introducing-stores-cover.jpg'
coverAlt: "Stores launch banner"
tags: ["Product"]
createdAt: 2025-04-07
updatedAt: 2025-04-07
---

Today, we are releasing Stores. 

It is an open-source library of pre-tested tools that you can add to your AI agents in as few as three lines of code.

1. Import Stores
2. Load the tools
3. Pass the tools to the model

Here's a sample code that adds a set of Hacker News tools to an Anthropic model:

```python {2, 6, 11} 
import anthropic
import stores

client = anthropic.Anthropic()

index = stores.Index(["silanthro/hackernews"])

response = client.messages.create(
    model=model,
    messages=messages,
    tools=index.format_tools("anthropic"),
)
```

With Stores, you can empower your AI agents with a whole set of tools to manage your to-dos on Todoist, send emails via Gmail, research Hacker News, and much more—all without building those tools and dealing with endless edge cases yourself.

We and our community will handle all that for you.

---

## Why we built Stores

For the past few months, my cofounder SK and I have been prototyping several AI agents. One of the most tedious parts was building the tools to extend the model's capability. We spent a lot of time building, testing, and fixing our tools. Even a tool to "simply" search on Google (without using their API) wasn't trivial.

**With Stores, we want to make it super simple to build LLM Agents that use tools.**

There is no reason for developers to keep building tools from scratch when someone else has already built them. Imagine building a calculator yourself whenever you want to add two numbers.

Instead, developers should focus on picking the relevant tools and building other parts of their AI agents, such as the memory and user interface.

(In fact, we think developers might not even need to pick tools in the future. That could be handled by more powerful models or dynamic tool search.)

Stores has two main elements:

1. A directory of [open-source tools](/) that anyone can use and contribute to
2. A [Python library](https://github.com/silanthro/stores) that handles tool installation and formatting for all major LLM providers

## Why you might like Stores

As developers ourselves, we appreciate the importance of open source and understand the pain of building reliable tools that also play nicely with different LLM providers.

So, we designed Stores with these principles in mind:

- **Open-source**: Each set of tools in the Stores directory is a public git repository. Even if the Stores directory goes away, the library and tools will still work as long as the git repositories exist.
- **Isolation**: Tools are isolated in their own virtual environments. This prevents conflicting dependencies of tools and reduces unnecessary access to sensitive environment variables.
- **Framework compatibility**: Each LLM provider requires developers to pass tools in different schema formats to its APIs, making it cumbersome to switch between providers. Stores makes it easy to create the required formats for the providers you use.

## What exactly can you do with Stores?

We aim to make building LLM agents with tools as simple as possible for you. For now, Stores focuses on letting you give your agents tools and working with the major LLM providers.

1. Give your agent tools
2. Easily format tools for all major LLM providers
3. Securely provide credentials if needed
4. Execute tools with a helper function

### 1. Give your agent tools

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

The `Index.format_tools` method lets you easily comply with the different schema requirements from the major LLM providers (Anthropic, OpenAI Chat Completions & Responses, and Google Gemini).

```python {6} [anthropic_example.py]
client = anthropic.Anthropic()
response = client.messages.create(
    model=model,
    messages=messages,
    tools=(
        index.format_tools("anthropic")
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

**Note:** For now, tools are not executed in a sandbox, which is something we plan to add in the future. In the meantime, please check the code of the tools you use to ensure they do not unnecessarily access sensitive information.

### 4. Execute tools with a helper function

Finally, for LLM packages that don't execute tools automatically, you can use the `Index.execute` method to execute tools—without having to write your own helper function.

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

You could write this helper function yourself, but like I said above, we want to make things as simple for you as possible.

## Why not use MCP?

Given its hype, you might be wondering why not use MCP instead. 

It is a great question that requires much explanation, so SK wrote a detailed comparison of MCP and Stores in [this other blog post](/blog/stores-vs-mcp).

## How to get started

If I have convinced you to give Stores a try, you can find our documentation, quickstarts, and cookbook [here](/docs).

We are happy to help if you have any questions or feedback. If you can't find a suitable tool, just let us know or consider [contributing](/docs/contribute)!