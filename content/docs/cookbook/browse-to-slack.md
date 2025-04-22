---
title: Get latest launches in Slack
description: 'Build an AI agent that can browse Product Hunt, get the latest launches, and send them to Slack'
image: '/img/cookbook/browse-to-slack/browse-flowchart.jpg'
author:
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
tags: ['Research']
createdAt: 2025-04-22
updatedAt: 2025-04-22
---

# Get latest Product Hunt launches in Slack

I love trying out new products but visiting Product Hunt is a chore. Why not bring Product Hunt to me? Let's build an AI agent to browse Product Hunt and send me a summary of the latest products in Slack.

## Scenario

![Browse Flowchart](/img/cookbook/browse-to-slack/browse-flowchart.jpg)

For this demo, we will show how to build an AI agent that can browse Product Hunt, get the latest product launches, and message us on Slack.

Specifically, our AI agent will:

1. Use [Browser Use](https://browser-use.com/) to browse producthunt.com
2. Get the top product launches for the past day
3. Message us a list on Slack

To complete this task, our AI agent is equipped with tools to:

- [Browse the web](/tools/silanthro/basic-browser-use)
- [Send messages on Slack](/tools/silanthro/slack)

Even though we are using Slack in this example, you can also use [an email tool to email yourself](/docs/cookbook/send-email) the latest product launches.

## Setup

To get started, we first set the following environment variables in our `.env` file:

- `SLACK_WEBHOOKS`: The channels and respective webhook URLs for the AI agent to post in (see below)
- `GEMINI_API_KEY`: Your Gemini API key for the Browser Use tool (the tool only supports Gemini for now)
- `<COMPANY>_API_KEY`: The API key of the model you want to use (unless you are using Gemini; note that LangChain, LangGraph, and LlamaIndex uses `GOOGLE_API_KEY` for Gemini)

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

You must format your `SLACK_WEBHOOKs` environment variable as a strictly valid JSON-encoded object:

```bash [.env]
SLACK_WEBHOOKS='{"general": "<WEBHOOK_TO_GENERAL_CHANNEL>", "random": "<WEBHOOK_TO_RANDOM_CHANNEL>"}'
```

The AI agent will then be able to only post messages to only these channels. It won't have the permission to read messages in your Slack workspace.

## Scripts

Some frameworks (e.g. LangGraph and LlamaIndex agent) automatically execute tool calls, which make the code much simpler. For the rest, we will need to add a `while` loop so that the agent will keep working on the next step until the task is completed.

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
    ["silanthro/basic-browser-use", "silanthro/slack"],
    env_var={
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
        "content": "Message me in #general the top 5 launches on Product Hunt from the past day and their descriptions",
    }
]

# Run agent loop
while True:
    # Get the response from the model
    response = client.messages.create(
        model="claude-3-7-sonnet-20250219",
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
```python {5, 10-18, 23-24, 65-68} [Gemini]
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/basic-browser-use", "silanthro/slack"],
    env_var={
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize Gemini client and messages
client = genai.Client()
config = types.GenerateContentConfig(
    # Pass tools
    tools=index.tools,
    # Automatic function calling doesn't support coroutine functions, such as the Basic Browser Use tools
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        disable=True 
    ),
)
messages = [
    {
        "role": "user",
        "parts": [
            {
                "text": "Message me in #general the top 5 launches on Product Hunt from the past day and their descriptions. Don't ask questions."
            }
        ],
    }
]

# Run the agent loop
while True:
    # Get the response from the model
    response = client.models.generate_content(
        model="gemini-2.0-flash-001",
        contents=messages,
        config=config,
    )

    # Check if all parts contain only text and no function call, which indicates task completion for this example
    parts = response.candidates[0].content.parts
    if all(part.text and not part.function_call for part in parts):
        print(f"Assistant response: {parts[0].text}")
        break  # End the agent loop

    # Otherwise, process the response, which could include both text and tool use
    for part in parts:
        if part.text:
            print(f"Assistant response: {part.text}")
            messages.append({"role": "model", "parts": [{"text": part.text}]})
        elif part.function_call:
            name = part.function_call.name
            args = part.function_call.args

            # Execute the tool call
            print(f"Executing tool call: {name}({args})\n")
            output = index.execute(name, args)
            print(f"Tool output: {output}\n")

            # Append the assistant's tool call as context
            messages.append(
                {"role": "model", "parts": [{"functionCall": part.function_call}]}
            )

            # Append the tool call result as context
            messages.append(
                {
                    "role": "user",
                    "parts": [
                        {
                            "functionResponse": {
                                "name": name,
                                "response": {"output": output},
                            }
                        }
                    ],
                }
            )
```
```python {5,10-18,35-36,54-57} [OpenAI]
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/basic-browser-use", "silanthro/slack"],
    env_var={
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
        "content": "Message me in #general the top 5 launches on Product Hunt from the past day and their descriptions",
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
```python {5,10-18,20-22,54-57} [LangChain]
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/basic-browser-use", "silanthro/slack"],
    env_var={
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize the model with tools
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)
messages = [
    HumanMessage(
        content="Message me in #general the top 5 launches on Product Hunt from the past day and their descriptions. Don't ask questions.",
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
import asyncio
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
    ["silanthro/basic-browser-use", "silanthro/slack"],
    env_var={
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize the LangGraph agent with the tools
agent_model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-preview-04-17")
agent_executor = create_react_agent(agent_model, index.tools)

# Get the response from the agent. The LangGraph agent will automatically
# execute the tool call.
async def main():
    # Basic Browser Use tools are async functions
    response = await agent_executor.ainvoke(
        {
            "messages": [
                HumanMessage(
                    content="Message me in #general the top 5 launches on Product Hunt from the past day and their descriptions. Don't ask questions.",
                )
            ]
        }
    )
    print(f"Assistant response: {response['messages'][-1].content}")

if __name__ == "__main__":
    asyncio.run(main())
```
```python {6,11-19,21-22,24-26} [LlamaIndex]
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
    ["silanthro/basic-browser-use", "silanthro/slack"],
    env_var={
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
response = agent.chat("Message me in #general the top 5 launches on Product Hunt from the past day and their descriptions. Don't ask questions.")
print(f"Assistant response: {response}")
```
```python {4,6-14,30-31,53-56} [LiteLLM]
import json
import os
from litellm import completion
import stores

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/basic-browser-use", "silanthro/slack"],
    env_var={
        "silanthro/slack": {
            "SLACK_WEBHOOKS": os.environ["SLACK_WEBHOOKS"],
        },
    },
)

# Initialize messages
messages = [
    {
        "role": "user",
        "content": "Message me in #general the top 5 launches on Product Hunt from the past day and their descriptions. Don't ask questions.",
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

### Streaming Browser Use steps

For simplicity, the scripts above don't stream the steps of Browser Use. 

By default, the LLM will ignore `stream_browser_agent` if `run_browser_agent` is provided. `run_browser_agent` will simply return the final result of the browsing task. If you want to stream the steps, specifically include only `stream_browser_agent` so that your agent will use it.

```python
index = stores.Index(
    ["silanthro/basic-browser-use"],
    include={"silanthro/basic-browser-use": ["basic_browser_use.stream_browser_agent"]}
)
```

Then to print the steps, use `stream_execute`, instead of `execute`, and iterate over the output:

```python
print(f"[agent] 🚀 Starting task: {args}")
for i, output in enumerate(index.stream_execute(name, args)):
    print(f"[agent] 📍 Step {i+1}")
    if "type" in output and output["type"] == "result":
        print(f"[agent] 📄 Result: {output['data']}")
        print()
    else:
        print(f"[agent] 👍 Eval: {output['data']['current_state']['evaluation_previous_goal']}")
        print(f"[agent] 🧠 Memory: {output['data']['current_state']['memory']}")
        print(f"[agent] 🎯 Next Goal: {output['data']['current_state']['next_goal']}")
        print(f"[agent] 🛠️ Action: {output['data']['action']}")
        print()
```

It will look something like this:

![Streaming Browser Use steps](/img/cookbook/browse-to-slack/browser-use-stream.jpg)

### Running the agent

In the folder where you have this script, you can run the AI agent with the command:

```bash
python browse-to-slack.py
```

The AI agent will get the latest product launches from Product Hunt and message you on Slack.

![Product Launches in Slack](/img/cookbook/browse-to-slack/product-launches-in-slack.jpg)

To make this AI agent even more useful, you can set up a cron job to run this script every morning and get a daily product launch alert in your Slack.

If you have any questions, let us know on [GitHub](https://github.com/silanthro/stores).
