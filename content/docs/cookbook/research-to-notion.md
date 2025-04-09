---
title: 'Research and add to Notion'
description: 'Build an AI agent that can research Hacker News and add it to Notion'
author:
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
tags: ['Productivity']
createdAt: 2025-04-09
updatedAt: 2025-04-09
---

# Creating research documents with AI

While apps like ChatGPT (Deep Research) and Perplexity can research for you, you still have to manually copy and paste the research into your documents. Let's build an AI agent that can research and add its findings to Notion for us.

In this simple example, our AI agent has the following tools:

- [Fetch the top stories on Hacker News](https://github.com/silanthro/hackernews)
- [Get, create, and edit Notion pages](https://github.com/silanthro/notion)

## Scenario

For this demo, we will show how to build an AI agent that can get the top three Hacker News posts and add them to a Notion page named "News".

Specifically, our AI agent will:

- Get the top 3 Hacker News posts
- Find the "News" page in our Notion workspace
- In the "News" page, create a new page with the specified title and the relevant findings

Even though we are researching Hacker News here, you can use a web search or Reddit search tool to find the news you are interested in.

## Setup

To get started, we first set the following environment variables:

- `NOTION_INTEGRATION_SECRET`: The integration secret of the Notion account you want to use (see below)
- `<COMPANY>_API_KEY`: The API key of the model you want to use
- The Hacker News tools do not require an API key.

### Notion integration setup

We will need to set up a Notion integration so that our AI agent can access our Notion workspace securely. To do that and to get the Notion integration secret:

- Go to https://www.notion.so/profile/integrations/
- Click on "New integration"
- Add your integration name (e.g. "Stores" or "AI Assistant")
- Select the workspace for this integration
- Select "Internal" for [the integration type](https://developers.notion.com/docs/getting-started#internal-vs-public-integrations) (This keeps things simple, unless you want to share your integration with others)
- Click on "Save"
- Copy the "Internal Integration Secret" and save it in your environment variables

With an internal integration, we have to explicitly grant access to specific pages. I find this helpful because I can restrict the pages that the AI agent can access.

- Go to the page you want to grant access to (e.g. a "News" page)
- Click on the three dots at the top-right corner
- Click on "Connections" (usually the last item in the menu)
- Click on your integration to enable access to this page and its children

![Notion Connections](/img/cookbook/research-to-notion/notion-connections.jpg)

The AI agent will then be able to access only this page and its children. 

## Scripts

Some APIs and frameworks (e.g. Gemini, LangGraph, and LlamaIndex agent) automatically execute tool calls, which make the code much simpler. For the rest, we will need to add a `while` loop so that the agent will keep working on the next step until the task is completed.

From my experiments, Gemini 2.0 Flash prefers to ask questions instead of using the tools to find the information it needs. You can either specify in the system prompt to use tools or try Gemini 2.5 Pro, which is much better at using tools.

::content-multi-code
```python {4, 9-17, 35-36, 54-57} [Anthropic]
import os
import anthropic
from dotenv import load_dotenv
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/notion", "silanthro/hackernews"],
    env_var={
        "silanthro/notion": {
            "NOTION_INTEGRATION_SECRET": os.environ["NOTION_INTEGRATION_SECRET"],
        },
    },
)

# Initialize Anthropic client and messages
client = anthropic.Anthropic()
messages = [
    {
        "role": "user",
        "content": "Add the top 3 Hacker News posts to a new Notion page, Top HN Posts (today's date in YYYY-MM-DD), in my News page",
    }
]

# Run agent loop
while True:
    # Get the response from the model
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=messages,
        # Pass tools
        tools=index.format_tools("anthropic"),
    )

    # Check if all blocks contain only text, which indicates task completion for this example
    blocks = response.content
    if all(block.type == "text" for block in blocks):
        print(f"Assistant response: {blocks[0].text}\n")
        break  # End the agent loop

    # Otherwise, process the response, which could include both text and tool use
    for block in blocks:
        if block.type == "text" and block.text:
            print(f"Assistant response: {block.text}\n")
            messages.append({"role": "assistant", "content": block.text})
        elif block.type == "tool_use":
            name = block.name
            args = block.input

            # Execute tool call
            print(f"Executing tool call: {name}({args})\n")
            output = index.execute(name, args)
            print(f"Tool output: {output}\n")
            messages.append(
                {
                    "role": "assistant",
                    "content": [
                        {
                            "type": "tool_use",
                            "id": block.id,
                            "name": block.name,
                            "input": block.input,
                        }
                    ],
                }
            )
            messages.append(
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": str(output),
                        }
                    ],
                }
            )
```
```python {6, 11-19, 21-23} [Gemini]
import datetime
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/notion", "silanthro/hackernews"],
    env_var={
        "silanthro/notion": {
            "NOTION_INTEGRATION_SECRET": os.environ["NOTION_INTEGRATION_SECRET"],
        },
    },
)

# Initialize the chat with the model and tools
client = genai.Client()
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.5-pro-exp-03-25", config=config)

# Get the response from the model. Gemini will automatically execute the tool call.
response = chat.send_message(
    f"Add the top 3 Hacker News posts to a new Notion page, Top HN Posts ({datetime.date.today()}), in my News page",
)
print(f"Assistant response: {response.candidates[0].content.parts[0].text}")
```
```python {6,11-19,36-37,54-57} [OpenAI]
import json
import os
import datetime
from dotenv import load_dotenv
from openai import OpenAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/notion", "silanthro/hackernews"],
    env_var={
        "silanthro/notion": {
            "NOTION_INTEGRATION_SECRET": os.environ["NOTION_INTEGRATION_SECRET"],
        },
    },
)

# Initialize OpenAI client and messages
client = OpenAI()
messages = [
    {
        "role": "user",
        "content": f"Add the top 3 Hacker News posts to a new Notion page, Top HN Posts ({datetime.date.today()}), in my News page",
    }
]

# Run agent loop
while True:
    # Get the response from the model
    response = client.responses.create(
        model="gpt-4o-mini-2024-07-18",
        input=messages,
        # Pass tools
        tools=index.format_tools("openai-responses"),
    )

    # Check if the response contains only text and no tool call, which indicates task completion for this example
    if len(response.output) == 1 and response.output_text:
        print(f"Assistant response: {response.output_text}\n")
        break  # End the agent loop

    # Otherwise, process the response, which could include both text and tool calls
    for item in response.output:
        if item.type == "text" and item.text:
            print(f"Assistant response: {item.text}\n")
            messages.append({"role": "assistant", "content": item.text})
        elif item.type == "function_call":
            name = item.name
            args = json.loads(item.arguments)

            # Execute tool call
            print(f"Executing tool call: {name}({args})\n")
            output = index.execute(name, args)
            print(f"Tool output: {output}\n")
            messages.append(item)  # Append the assistant's tool call message as context
            messages.append(
                {
                    "type": "function_call_output",
                    "call_id": item.call_id,
                    "output": str(output),
                }
            )  # Append the tool call result as context
```
```python {6,11-19,21-23,53-56} [LangChain]
import os
import datetime
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/notion", "silanthro/hackernews"],
    env_var={
        "silanthro/notion": {
            "NOTION_INTEGRATION_SECRET": os.environ["NOTION_INTEGRATION_SECRET"],
        },
    },
)

# Initialize the model with tools
model = ChatGoogleGenerativeAI(model="gemini-2.5-pro-exp-03-25")
model_with_tools = model.bind_tools(index.tools)
messages = [
    HumanMessage(
        content=f"Add the top 3 Hacker News posts to a new Notion page, Top HN Posts ({datetime.date.today()}), in my News page",
    ),
]

# Run the agent loop
while True:
    # Get the response from the model
    response = model_with_tools.invoke(messages)

    text = response.content
    tool_calls = response.tool_calls

    # Check if the response contains only text and no tool calls, which indicates task completion for this example
    if text and not tool_calls:
        print(f"Assistant response: {text}\n")
        break  # End the agent loop

    # Otherwise, process the response, which could include both text and tool calls
    messages.append(response)  # Append the response as context
    if text:
        print(f"Assistant response: {text}\n")

    if tool_calls:
        for tool_call in tool_calls:
            name = tool_call["name"]
            args = tool_call["args"]

            # Execute the tool call
            print(f"Executing tool call: {name}({args})\n")
            output = index.execute(name, args)
            print(f"Tool Output: {output}\n")
            messages.append(
                ToolMessage(content=output, tool_call_id=tool_call["id"])
            )  # Append the tool call result as context
```
```python {7,12-20,22-24} [LangGraph]
import os
import datetime
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/notion", "silanthro/hackernews"],
    env_var={
        "silanthro/notion": {
            "NOTION_INTEGRATION_SECRET": os.environ["NOTION_INTEGRATION_SECRET"],
        },
    },
)

# Initialize the LangGraph agent with the tools
agent_model = ChatGoogleGenerativeAI(model="gemini-2.5-pro-exp-03-25")
agent_executor = create_react_agent(agent_model, index.tools)

# Get the response from the agent. The LangGraph agent will automatically
# execute the tool call.
response = agent_executor.invoke(
    {
        "messages": [
            HumanMessage(
                content=f"Add the top 3 Hacker News posts to a new Notion page, Top HN Posts ({datetime.date.today()}), in my News page",
            )
        ]
    }
)
print(f"Assistant response: {response['messages'][-1].content}")
```
```python {7,12-20,22-23,25-27} [LlamaIndex]
import os
import datetime
from dotenv import load_dotenv
from llama_index.core.agent import AgentRunner
from llama_index.core.tools import FunctionTool
from llama_index.llms.google_genai import GoogleGenAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/notion", "silanthro/hackernews"],
    env_var={
        "silanthro/notion": {
            "NOTION_INTEGRATION_SECRET": os.environ["NOTION_INTEGRATION_SECRET"],
        },
    },
)

# Wrap tools with LlamaIndex FunctionTool
tools = [FunctionTool.from_defaults(fn=fn) for fn in index.tools]

# Initialize the LlamaIndex agent with tools
llm = GoogleGenAI(model="models/gemini-2.0-flash-001")
agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)

# Get the response from the LlamaIndex agent. The LlamaIndex agent will
# automatically execute the tool call.
response = agent.chat(f"Add the top 3 Hacker News posts to a new Notion page, Top HN Posts ({datetime.date.today()}), in my News page")
print(f"Assistant response: {response}")
```
```python {5,7-15,31-32,52-55} [LiteLLM]
import datetime
import json
import os
from litellm import completion
import stores

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/notion", "silanthro/hackernews"],
    env_var={
        "silanthro/notion": {
            "NOTION_INTEGRATION_SECRET": os.environ["NOTION_INTEGRATION_SECRET"],
        },
    },
)

# Initialize messages
messages = [
    {
        "role": "user",
        "content": f"Add the top 3 Hacker News posts to a new Notion page, Top HN Posts ({datetime.date.today()}), in my News page",
    },
]

# Run the agent loop
while True:
    # Get the response from the model
    response = completion(
        model="gemini/gemini-2.5-pro-exp-03-25",
        messages=messages,
        # Pass tools
        tools=index.format_tools("google-gemini"),
    )

    text = response.choices[0].message.content
    tool_calls = response.choices[0].message.tool_calls

    # Check if the response contains only text and no tool calls, which indicates task completion for this example
    if text and not tool_calls:
        print(f"Assistant response: {text}\n")
        break  # End the agent loop

    # Otherwise, process the response, which could include both text and tool calls
    if text:
        messages.append({"role": "assistant", "content": text})

    if tool_calls:
        for tool_call in tool_calls:
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            # Execute the tool call
            print(f"Executing tool call: {name}({args})\n")
            output = index.execute(name, args)
            print(f"Tool output: {output}\n")
            messages.append(
                {"role": "assistant", "tool_calls": [tool_call]}
            )  # Append the assistant's tool call as context
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": str(output),
                }
            )  # Append the tool call result as context
```
::

In the folder where you have this script, you can run the AI agent with the command:

```bash
python research-to-notion.py
```

The AI agent will research Hacker News, find the "News" page, and add a new page with the top 3 posts.

![Page created in Notion](/img/cookbook/research-to-notion/notion-result.jpg)

To make this AI agent even more useful, you can set up a cron job to run this script every morning and you will get a daily digest waiting for you in your Notion.

If you have any questions, let us know on [GitHub](https://github.com/silanthro/stores).
