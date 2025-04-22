---
title: 'Research and add to Notion'
description: 'Build an AI agent that can research Hacker News and add its findings to Notion'
image: '/img/cookbook/research-to-notion/notion-flowchart.jpg'
author:
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
tags: ['Research']
createdAt: 2025-04-09
updatedAt: 2025-04-09
---

# Research and add findings to Notion

While apps like ChatGPT (Deep Research) and Perplexity can research for you, you still have to manually copy and paste the research into your documents. Let's build an AI agent that can research and add its findings to Notion for us.

## Scenario

![Notion Flowchart](/img/cookbook/research-to-notion/notion-flowchart.jpg)

For this demo, we will show how to build an AI agent that can get the top three Hacker News posts and add them to a Notion page named "News".

Specifically, our AI agent will:

1. Get the top 3 Hacker News posts
2. Find the "News" page in our Notion workspace
3. In the "News" page, create a new page with the specified title and the research results

To complete this task, our AI agent is equipped with tools to:

- [Fetch the top stories on Hacker News](https://github.com/silanthro/hackernews)
- [Get, create, and edit Notion pages](https://github.com/silanthro/notion)

Even though we are researching Hacker News in this example, you can use a web search or Reddit search tool to find the news you are interested in.

## Setup

To get started, we first set the following environment variables in our `.env` file:

- `NOTION_INTEGRATION_SECRET`: The integration secret of the Notion account you want to use (see below)
- `<COMPANY>_API_KEY`: The API key of the model you want to use
- The Hacker News tools do not require an API key.

### Notion integration setup

We will need to set up a Notion integration so that our AI agent can access our Notion workspace securely. To do that and to get the Notion integration secret:

1. Go to https://www.notion.so/profile/integrations/
2. Click on "New integration"
3. Add your integration name (e.g. "Stores" or "AI Assistant")
4. Select the workspace for this integration
5. Select "Internal" for [the integration type](https://developers.notion.com/docs/getting-started#internal-vs-public-integrations) (This keeps things simple, unless you want to share your integration with others)
6. Click on "Save"
7. Copy the "Internal Integration Secret" and save it as an environment variable

With an internal integration, we have to explicitly grant access to specific pages. I find this helpful because I can restrict the pages that the AI agent can access.

1. Go to the page you want to grant access to (e.g. a "News" page)
2. Click on the three dots at the top-right corner
3. Click on "Connections" (usually the last item in the menu)
4. Click on your integration to enable access to this page and its children

![Notion Connections](/img/cookbook/research-to-notion/notion-connections.jpg)

The AI agent will then be able to access only this page and its children.

## Scripts

Some APIs and frameworks (e.g. Gemini, LangGraph, and LlamaIndex agent) automatically execute tool calls, which make the code much simpler. For the rest, we will need to add a `while` loop so that the agent will keep working on the next step until the task is completed.

From my experiments, Gemini 2.0 Flash prefers to ask questions instead of using the tools to find the information it needs. You can either specify in the system prompt to use tools or try Gemini 2.5 Pro, which is much better at using tools.

::content-multi-code
```python {4, 9-17, 35-36, 55-58} [Anthropic]
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
            # Append the assistant's response as context
            messages.append({"role": "assistant", "content": block.text})
        elif block.type == "tool_use":
            name = block.name
            args = block.input

            # Execute tool call
            print(f"Executing tool call: {name}({args})\n")
            output = index.execute(name, args)
            print(f"Tool output: {output}\n")

            # Append the assistant's tool call message as context
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

            # Append the tool result message as context
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
```python {6,11-19,36-37,55-58} [OpenAI]
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
            # Append the assistant's response as context
            messages.append({"role": "assistant", "content": item.text})
        elif item.type == "function_call":
            name = item.name
            args = json.loads(item.arguments)

            # Execute tool call
            print(f"Executing tool call: {name}({args})\n")
            output = index.execute(name, args)
            print(f"Tool output: {output}\n")

            # Append the assistant's tool call message as context
            messages.append(item)

            # Append the tool call result as context
            messages.append(
                {
                    "type": "function_call_output",
                    "call_id": item.call_id,
                    "output": str(output),
                }
            )
```
```python {6,11-19,21-23,55-58} [LangChain]
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

    # Append the assistant's response as context
    messages.append(response)

    text = response.content
    tool_calls = response.tool_calls

    # Check if the response contains only text and no tool calls, which indicates task completion for this example
    if text and not tool_calls:
        print(f"Assistant response: {text}\n")
        break  # End the agent loop

    # Otherwise, process the response, which could include both text and tool calls
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

            # Append the tool call result as context
            messages.append(
                ToolMessage(content=output, tool_call_id=tool_call["id"])
            )
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
```python {5,7-15,31-32,54-57} [LiteLLM]
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
        print(f"Assistant response: {text}\n")
        # Append the assistant's response as context
        messages.append({"role": "assistant", "content": text})

    if tool_calls:
        for tool_call in tool_calls:
            name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            # Execute the tool call
            print(f"Executing tool call: {name}({args})\n")
            output = index.execute(name, args)
            print(f"Tool output: {output}\n")

            # Append the assistant's tool call as context
            messages.append(
                {"role": "assistant", "tool_calls": [tool_call]}
            )

            # Append the tool call result as context
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": str(output),
                }
            )
```
::

In the folder where you have this script, you can run the AI agent with the command:

```bash
python research-to-notion.py
```

The AI agent will research Hacker News, find the "News" page, and add a new page with the top 3 posts.

![Page created in Notion](/img/cookbook/research-to-notion/notion-result.jpg)

To make this AI agent even more useful, you can set up a cron job to run this script every morning and get a daily digest waiting for you in your Notion.

If you have any questions, let us know on [GitHub](https://github.com/silanthro/stores).
