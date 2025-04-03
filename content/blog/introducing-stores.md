---
title: 'Introducing Stores'
description: 'An easier way to add tools to your agents'
author: 
  name: 'Alfred'
  title: 'Co-founder'
  img: '/alfred.jpg'
coverImg: '/blog/introducing-stores/introducing-stores-cover.jpg'
coverAlt: "Stores launch banner"
tags: ["Product"]
createdAt: 2025-03-31
updatedAt: 2025-03-31
---

# Introducing Stores

Since the start of 2025, SK and I have been prototyping several AI agents. While people are still debating what exactly an AI agent is, a simple definition of an AI agent is an AI model that can use tools to extend its capability.

For example, an AI model that can search the web is an AI agent. The AI model has a tool that allows it to search the web. We can build all sorts of tools for AI models to use.

A tool to browse Reddit.<br>
A tool to send emails.<br>
A tool to edit files.<br>
A tool to draw.<br>

And so on.

Most developers currently build their AI agents to follow a fixed workflow. For example, the AI agent might browse the web for relevant information first, then summarize the information, and then email the summary to the user.

But as AI models become even smarter, we can let them figure out how to complete tasks. In fact, most leading AI models, even Claude 3.5 Sonnet, are already good enough at creating plans, using tools, and finding alternative solutions when stuck.

In such a world, building AI agents will be less about creating fixed workflows but more about creating powerful tools they can use. We are already seeing this shift. For example, to enable Claude to use a computer on our behalf, the Anthropic team created a Computer Use tool. This tool allowed Claude 3.5 Sonnet to beat the previous state-of-the-art performance in completing real-world computer tasks by a huge margin (22.0% vs 7.8%). OpenAI’s Operator is similarly an AI model1 with a tool to use the browser.

When building our AI agents, we noticed we spent a lot of time building, testing, and fixing our tools. Even a tool to “simply” search on Google (without using their API) wasn’t exactly simple.

What if we make it super easy for developers to add tools to their AI agents without having to build those tools themselves?

There is no reason for developers to keep building tools from scratch when someone else has already built them. Imagine building a calculator yourself whenever you want to multiply two numbers.

Instead, developers should focus on picking the relevant tools and building other parts of their AI agents, such as the memory and user interface.

(In fact, I think developers might not even need to pick tools eventually.)

This thought led to Stores.

With Stores, you can easily add tools that we and other developers have created to your AI agents.

Adding the default tools, such as Google search, is as simple as this:

```python
index = stores.Index()

# Initialize the model and bind the tools to the model (with LangChain)
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)
```

You can also add tools from other developers or, if you really want to, your own custom tools (which are simply Python functions).

```python
# Adding tools from other developers
index = stores.Index(["greentfrapp/file-ops"])

# Adding your custom tools
index = stores.Index(["./custom_tools"])
```

If a tool requires an API key, you can provide it securely via environment variables.

```python
index = stores.Index(
    ["./custom_tools"],
    env_vars={
        "./custom_tools": {
            "APP_API_KEY": os.environ["APP_API_KEY"],
        },    
    },
)
```