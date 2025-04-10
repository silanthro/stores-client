---
title: 'Complete tasks with Todoist'
description: 'Build an AI agent that can get tasks from Todoist and complete them'
author:
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
tags: ['Productivity']
createdAt: 2025-04-03
updatedAt: 2025-04-03
---

# Get things done with a Todoist agent

We all dream to have our own AI personal assistant someday. While the perfect AI assistant might still be far away, we can build simple AI agents that work with Todoist today.

## Scenario

![Todoist Flowchart](/img/cookbook/complete-todoist-tasks/todoist-flowchart.jpg)

For this demo, we will show how to build an AI agent that can get tasks from Todoist, complete them, and close them in Todoist.

In my Todoist, I have a simple demo task, "Email email@example.com the top 3 HN posts".

Our AI agent will:

- Get the task from Todoist
- Get the top 3 HN posts
- Send them to the recipient via Gmail
- Mark the task as done in Todoist

To do this, our AI agent is equipped with tools to:

- [Get, update, and close tasks in Todoist](https://github.com/silanthro/todoist)
- [Fetch the top stories on Hacker News](https://github.com/silanthro/hackernews)
- [Send plain-text email via Gmail](https://github.com/silanthro/send-gmail)

For a simpler demo for Todoist, check out [Getting tasks from Todoist](/docs/cookbook/get-todoist-tasks).

## Setup

To get started, we first set the following environment variables in a `.env` file:

- `TODOIST_API_TOKEN`: The API key of the Todoist account you want to use
- `GMAIL_ADDRESS`: The sender's email
- `GMAIL_PASSWORD`: The sender's [app password](https://myaccount.google.com/apppasswords), **not account password**
- `<COMPANY>_API_KEY`: The API key of the model you want to use

The Hacker News tools do not require an API key.

## Scripts

Some APIs and frameworks (e.g. Gemini, LangGraph, and LlamaIndex agent) automatically execute tool calls, which make the code much simpler. For the rest, we will need to add a `while` loop so that the agent will keep working on the next step until the task is completed.

::content-multi-code
```python {4, 9-21, 39-40, 59-62} [Anthropic]
import os
import anthropic
from dotenv import load_dotenv
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/hackernews", "silanthro/send-gmail"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Initialize Anthropic client and messages
client = anthropic.Anthropic()
messages = [
    {
        "role": "user",
        "content": "What tasks are due today? Use your tools to complete them for me. Don't ask questions.",
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

            # Append the assistant's tool call as context
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

            # Append the tool call result as context
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
```python {5, 10-22, 24-26} [Gemini]
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/hackernews", "silanthro/send-gmail"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Initialize the chat with the model and tools
client = genai.Client()
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.0-flash", config=config)

# Get the response from the model. Gemini will automatically execute the tool call.
response = chat.send_message(
    "What tasks are due today? Use your tools to complete them for me. Don't ask questions."
)
print(f"Assistant response: {response.candidates[0].content.parts[0].text}")
```
```python {5, 10-22, 39-40, 58-61} [OpenAI]
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/hackernews", "silanthro/send-gmail"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Initialize OpenAI client and messages
client = OpenAI()
messages = [
    {
        "role": "user",
        "content": "What tasks are due today? Use your tools to complete them for me. Don't ask questions.",
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
            messages.append(
                item
            )

            # Append the tool call result as context
            messages.append(
                {
                    "type": "function_call_output",
                    "call_id": item.call_id,
                    "output": str(output),
                }
            )
```
```python {5, 10-22, 24-26, 58-61} [LangChain]
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, ToolMessage
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/hackernews", "silanthro/send-gmail"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Initialize the model with tools
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)
messages = [
    HumanMessage(
        content="What tasks are due today? Use your tools to complete them for me. Don't ask questions."
    ),
]

# Run the agent loop
while True:
    # Get the response from the model
    response = model_with_tools.invoke(messages)

    text = response.content
    tool_calls = response.tool_calls

    # Append the assistant's response as context
    messages.append(response)

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
```python {6, 11-23, 25-27} [LangGraph]
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/hackernews", "silanthro/send-gmail"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Initialize the LangGraph agent with the tools
agent_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
agent_executor = create_react_agent(agent_model, index.tools)

# Get the response from the agent. The LangGraph agent will automatically
# execute the tool call.
response = agent_executor.invoke(
    {
        "messages": [
            HumanMessage(
                content="What tasks are due today? Use your tools to complete them for me. Don't ask questions."
            )
        ]
    }
)
print(f"Assistant response: {response['messages'][-1].content}")
```
```python {6, 11-23, 25-26, 28-30} [LlamaIndex]
import os
from dotenv import load_dotenv
from llama_index.core.agent import AgentRunner
from llama_index.core.tools import FunctionTool
from llama_index.llms.google_genai import GoogleGenAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/hackernews", "silanthro/send-gmail"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
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
response = agent.chat(
    "What tasks are due today? Do them for me."
)
print(f"Assistant response: {response}")
```
```python {4, 6-18, 34-35, 57-60} [LiteLLM]
import json
import os
from litellm import completion
import stores

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/hackernews", "silanthro/send-gmail"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Initialize messages
messages = [
    {
        "role": "user",
        "content": "What tasks are due today? Use your tools to complete them for me. Don't ask questions.",
    },
]

# Run the agent loop
while True:
    # Get the response from the model
    response = completion(
        model="gemini/gemini-2.0-flash-001",
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
python complete-task.py
```

The AI agent will get the task, complete it, and mark it as done in Todoist.

![Hacker New posts in email](/img/cookbook/complete-todoist-tasks/hn-email.jpg)

If you have any questions, let us know on [GitHub](https://github.com/silanthro/stores).
