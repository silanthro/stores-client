---
title: Get today's tasks in Slack
description: 'Build an AI agent that can get tasks from Slack'
image: '/img/cookbook/get-tasks-in-slack/slack-flowchart.jpg'
author:
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
tags: ['Productivity']
createdAt: 2025-04-10
updatedAt: 2025-04-10
---

# Get today's tasks in Slack

If I have a personal assistant, I'd love the person to message me my todo list for the day, ordered by priority, in Slack. For now, I'll build an AI agent to do that instead.

## Scenario

![Slack Flowchart](/img/cookbook/get-tasks-in-slack/slack-flowchart.jpg)

For this demo, we will show how to build an AI agent that can get the tasks due today from Todoist and message us on Slack.

Specifically, our AI agent will:

1. Get the tasks due today from Todoist
2. Message us on Slack

To complete this task, our AI agent is equipped with tools to:

- [Get, update, and close tasks in Todoist](https://github.com/silanthro/todoist)
- [Send messages in Slack](https://github.com/silanthro/slack)

Even though we are using Todoist and Slack in this example, you can also use [a research tool](/docs/cookbook/research-to-notion) to message yourself news or [email yourself](/docs/cookbook/send-email) your tasks.

## Setup

To get started, we first set the following environment variables in our `.env` file:

- `TODOIST_API_TOKEN`: The API key of your Todoist account (see below)
- `SLACK_WEBHOOKS`: The webhook URL of the Slack channel for the AI agent to post in (see below)
- `<COMPANY>_API_KEY`: The API key of the model you want to use

### Todoist API key

To get your Todoist API key:

1. Click on your profile icon in the top-left corner
2. Select "Settings"
3. Click on "Integrations"
4. Click on "Developer"
5. Copy the API token and save it as an environment variable

### Slack webhooks setup

We will need to set up [a Slack webhook](https://api.slack.com/messaging/webhooks) so that our AI agent can send messages to our Slack workspace securely. To do that:

1. Sign up to the [Slack Developer Program](https://api.slack.com/developer-program)
2. Under "Your Apps", click on "Create New App" (Either "From manifest" or "From scratch" is fine.)
3. Under "Features", click on "Incoming Webhooks"
4. Toggle "Activate Incoming Webhooks" to "On"
5. Scroll down and click on "Add New Webhook to Workspace"
6. Select the channel you want your AI agent to post to (If you are not seeing any channels, you may need to refresh the page as the channels may take a few minutes to show up.)
7. Copy the newly created webhook and save it as an environment variable
8. Repeat this for as many channels as you want your AI agent to post to

You can format your `SLACK_WEBHOOKs` environment variable as a string or an object:

```env
# A string for a single webhook
SLACK_WEBHOOKS=<WEBHOOK_TO_GENERAL_CHANNEL>

# A strictly valid JSON-encoded object for multiple webhooks
SLACK_WEBHOOKS='{"general": "<WEBHOOK_TO_GENERAL_CHANNEL>", "random": "<WEBHOOK_TO_RANDOM_CHANNEL>"}'
```

The AI agent will then be able to post messages to only these channels. 

## Scripts

Some APIs and frameworks (e.g. Gemini, LangGraph, and LlamaIndex agent) automatically execute tool calls, which make the code much simpler. For the rest, we will need to add a `while` loop so that the agent will keep working on the next step until the task is completed.

From my experiments, Gemini 2.0 Flash prefers to ask questions instead of using the tools to find the information it needs. You can either specify in the system prompt to use tools or try Gemini 2.5 Pro, which is much better at using tools.

::content-multi-code
```python {4, 9-20, 38-39, 58-61} [Anthropic]
import os
import anthropic
from dotenv import load_dotenv
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/slack"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize Anthropic client and messages
client = anthropic.Anthropic()
messages = [
    {
        "role": "user",
        "content": "Let me know my tasks and their priority for today in bullet points in Slack #general",
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
```python {5, 10-21, 23-25} [Gemini]
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/slack"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize the chat with the model and tools
client = genai.Client()
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.5-pro-exp-03-25", config=config)

# Get the response from the model. Gemini will automatically execute the tool call.
response = chat.send_message(
    "Let me know my tasks and their priority for today in bullet points in Slack #general. Don't ask questions; use your tools.",
)
print(f"Assistant response: {response.candidates[0].content.parts[0].text}")
```
```python {5,10-21,38-39,57-60} [OpenAI]
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/slack"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize OpenAI client and messages
client = OpenAI()
messages = [
    {
        "role": "user",
        "content": "Let me know my tasks and their priority for today in bullet points in Slack #general",
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
```python {5,10-21,23-25,57-60} [LangChain]
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/slack"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize the model with tools
model = ChatGoogleGenerativeAI(model="gemini-2.5-pro-exp-03-25")
model_with_tools = model.bind_tools(index.tools)
messages = [
    HumanMessage(
        content="Let me know my tasks and their priority for today in bullet points in Slack #general. Don't ask questions; use your tools.",
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
```python {6,11-22,24-26} [LangGraph]
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
    ["silanthro/todoist", "silanthro/slack"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
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
                content="Let me know my tasks and their priority for today in bullet points in Slack #general. Don't ask questions; use your tools.",
            )
        ]
    }
)
print(f"Assistant response: {response['messages'][-1].content}")
```
```python {6,11-22,24-25,27-29} [LlamaIndex]
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
    ["silanthro/todoist", "silanthro/slack"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
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
response = agent.chat("Let me know my tasks and their priority for today in bullet points in Slack #general. Don't ask questions; use your tools.")
print(f"Assistant response: {response}")
```
```python {4,6-17,33-34,56-59} [LiteLLM]
import json
import os
from litellm import completion
import stores

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist", "silanthro/slack"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize messages
messages = [
    {
        "role": "user",
        "content": "Let me know my tasks and their priority for today in bullet points in Slack #general. Don't ask questions; use your tools.",
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
python get-tasks-in-slack.py
```

The AI agent will get the tasks due today from Todoist and message you in Slack.

![Tasks in Slack](/img/cookbook/get-tasks-in-slack/tasks-in-slack.jpg)

To make this AI agent even more useful, you can set up a cron job to run this script every morning and you will get a daily task brief in your Slack.

If you have any questions, let us know on [GitHub](https://github.com/silanthro/stores).
