---
title: 'Rename file'
description: 'Build an AI agent that can find, read, write, and edit files on your computer'
author: 
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
tags: ["File organization"]
createdAt: 2025-04-03
updatedAt: 2025-04-03
---

# Renaming files with AI

If you have a messy folder of files, like I do, wouldn't it be great if an AI agent can help to sort and rename them accordingly?

In this simple example, our AI agent will help me rename files in a folder using [our filesystem operation tools](https://github.com/silanthro/filesystem). It has tools to do the following:

- Read files
- Create files
- Edit files
- Create directories
- List the children of a directory
- Move files and directories
- Find files and directories
- And more

**Note:** The tool to read files can currently only read plaintext files, code files, and markdown files but not documents, media files, or binary files.

## Scenario

For this demo, we will show how to rename files in a folder with the help of an LLM.

The AI agent will list the files in the folder, read the content of the files, and then rename them accordingly.

I have a `test` folder with a `doc.md` file. It contains an itinerary for Perth. I'm too lazy to rename it myself, so I'll ask the AI agent to help me. 

``` markdown
# 5-Day Itinerary for Perth, Australia

1. **Day 1**: Visit Kings Park and Botanic Garden
2. **Day 2**: Explore Fremantle and its markets
3. **Day 3**: Take a day trip to Rottnest Island
4. **Day 4**: Visit Perth Zoo and Elizabeth Quay
5. **Day 5**: Enjoy Swan Valley wine tasting tour

This itinerary offers a perfect blend of nature, culture, and leisure activities, showcasing the best of Perth and its surroundings.
```

## Setup

To get started, we first set the following environment variables in a `.env` file: 

- `ALLOWED_DIR`: The directory that we allow the AI agent to access (e.g. `/Users/username/Documents/folder`)
- `<COMPANY>_API_KEY`: The API key of the model you want to use

Now, we are ready to load the `filesystem` tool index and build our AI agent. 

## Scripts

Here are the scripts for the various major LLM providers and frameworks. Remember to install the required dependencies mentioned at the top of each script.

::content-multi-code
```python {4, 9-17, 36-37, 48-51, 59-61} [Anthropic]
import os
import anthropic
from dotenv import load_dotenv
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/filesystem"],
    env_var={
        "silanthro/filesystem": {
            "ALLOWED_DIR": os.environ["ALLOWED_DIR"],
        },
    },
)

# Initialize Anthropic client and messages
client = anthropic.Anthropic()
messages = [
    {
        "role": "user",
        "content": "Rename the files in the '/Users/username/Documents/folder' directory according to their content",
    }
]

# Define agent loop
def run_agent_loop():
    while True:
        # Get response from the model
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
            return  # End the agent loop

        # Otherwise, process the response, which could include both text and tool use
        for block in blocks:
            # If the REPLY tool is called, break the loop and return the message
            if block.type == "tool_use" and block.name == "REPLY":
                print(f"Assistant response: {block.input['msg']}\n")
                return  # End the entire agent loop
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


# Run the agent loop
run_agent_loop()
```
```python {5, 10-18, 22-23, 26} [Gemini]
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/filesystem"],
    env_var={
        "silanthro/filesystem": {
            "ALLOWED_DIR": os.environ["ALLOWED_DIR"],
        },
    },
)

client = genai.Client()

# Pass tools
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.0-flash", config=config)

# Tool calls executed automatically
response = chat.send_message(
    "Rename the files in the '/Users/username/Documents/folder' directory according to its content. Use tools when necessary."
)
print(f"Assistant response: {response.candidates[0].content.parts[0].text}")
```
```python {5, 10-18, 35-36, 53-55} [OpenAI]
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/filesystem"],
    env_var={
        "silanthro/filesystem": {
            "ALLOWED_DIR": os.environ["ALLOWED_DIR"],
        },
    },
)

# Initialize OpenAI client and messages
client = OpenAI()
messages = [
    {
        "role": "user",
        "content": "Rename the files in the '/Users/username/Documents/folder' directory according to their content. Skip system files.",
    }
]

# Run agent loop
while True:
    # Get response from the model
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
            messages.append(
                item
            )  # Append the assistant's tool call message as context
            messages.append(
                {
                    "type": "function_call_output",
                    "call_id": item.call_id,
                    "output": str(output),
                }
            )  # Append the tool call result as context
```
```python {5, 10-18, 22-23, 54-56} [LangChain]
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, ToolMessage
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/filesystem"],
    env_var={
        "silanthro/filesystem": {
            "ALLOWED_DIR": os.environ["ALLOWED_DIR"],
        },
    },
)

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")

# Pass tools
model_with_tools = model.bind_tools(index.tools)

messages = [
    HumanMessage(
        content="Rename the files in the '/Users/username/Documents/folder' directory according to their content"
    ),
]

# Run the agent loop
while True:
    # Get response from the model
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
```python {6, 11-19, 23-24, 26} [LangGraph]
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
    ["silanthro/filesystem"],
    env_var={
        "silanthro/filesystem": {
            "ALLOWED_DIR": os.environ["ALLOWED_DIR"],
        },
    },
)

agent_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")

# Pass tools
agent_executor = create_react_agent(agent_model, index.tools)

# Tool calls executed automatically
response = agent_executor.invoke(
    {
        "messages": [
            HumanMessage(
                content="Rename the files in the '/Users/username/Documents/folder' directory according to their content"
            )
        ]
    }
)
print(f"Assistant response: {response['messages'][-1].content}")
```
```python {6, 11-19, 21-22, 26-27, 29} [LlamaIndex]
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
    ["silanthro/filesystem"],
    env_var={
        "silanthro/filesystem": {
            "ALLOWED_DIR": os.environ["ALLOWED_DIR"],
        },
    },
)

# Wrap tools with LlamaIndex FunctionTool
tools = [FunctionTool.from_defaults(fn=fn) for fn in index.tools]

llm = GoogleGenAI(model="models/gemini-2.0-flash-001")

# Pass tools
agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)

# Tool calls executed automatically
response = agent.chat(
    "Rename the files in the '/Users/username/Documents/folder' directory according to their content. Use tools when necessary."
)
print(f"Assistant response: {response}")
```
``` python {4, 6-14, 30-31, 51-53} [LiteLLM]
import json
import os
from litellm import completion
import stores

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/filesystem"],
    env_var={
        "silanthro/filesystem": {
            "ALLOWED_DIR": os.environ["ALLOWED_DIR"],
        },
    },
)

# Initialize messages
messages = [
    {
        "role": "user",
        "content": "Rename the files in the '/Users/username/Documents/folder' directory according to their content. Use tools when necessary.",
    },
]

# Run the agent loop
while True:
    # Get response from the model
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
python rename-files.py
```

The AI agent will repeatedly access, read, and rename files in the entire folder.

If you have any questions, let us know on [GitHub](https://github.com/silanthro/stores).