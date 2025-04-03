---
title: 'Getting things done with a Todoist agent'
description: 'Build an AI agent to get, manage, and complete tasks in Todoist'
author: 
  name: 'Alfred'
  title: 'Co-founder'
  img: '/img/alfred.jpg'
tags: ["Productivity"]
createdAt: 2025-04-03
updatedAt: 2025-04-03
---

# Getting things done with a Todoist agent

We all dream to have our own AI personal assistant someday. While the perfect AI assistant might still be far away, we can build simple AI agents that work with Todoist today.

In this simple example, our AI agent has tools to do the following with our Todoist account:

- Get tasks
- Create tasks
- Update tasks
- Complete tasks
- Delete tasks

Below is a simple demonstration of getting the tasks due today. But you can also add other tools to your AI agent to help you complete your tasks in Todoist. For instance, you could add tools to do research and send emails and have your AI agent get tasks from your Todoist, complete the relevant task, and mark them as done in Todoist.

---

To get started, we first set the following environment variables: 

- `TODOIST_API_TOKEN`: The API key of the Todoist account you want to use
- `<COMPANY>_API_KEY`: The API key of the model you want to use

Now, we are ready to load the Todoist tools and build our AI agent. 

Here are the scripts for the various major LLM providers and frameworks. Remember to install the required dependencies mentioned at the top of each script.

::content-multi-code
```python {4, 13-21, 30, 35} [Anthropic]
import os
import anthropic
from dotenv import load_dotenv
import stores

# Load environment variables
load_dotenv()

# Initialize Anthropic client
client = anthropic.Anthropic()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
    },
)

# Get the response from the model
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What tasks are due today?"}
    ],
    # Pass tools
    tools=index.format_tools("anthropic"),
)

# Execute the tool call
tool_call = response.content[-1]
result = index.execute(tool_call.name, tool_call.input)
print(f"Tool output: {result}")

```
```python {5, 14-22, 25} [Gemini]
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import stores

# Load environment variables
load_dotenv()

# Initialize Google Gemini client
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
    },
)

# Initialize the chat with the model and tools
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.0-flash", config=config)

# Get the response from the model. Gemini will automatically execute the tool call.
response = chat.send_message("What tasks are due today?")
print(f"Assistant response: {response.candidates[0].content.parts[0].text}")
```
```python {5, 14-21, 30, 35-38} [OpenAI]
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
import stores

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
    },
)

# Get the response from the model
response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[
        {"role": "user", "content": "What tasks are due today?"}
    ],
    # Pass tools
    tools=index.format_tools("openai-responses"),
)

# Execute the tool call
tool_call = response.output[0]
result = index.execute(
    tool_call.name,
    json.loads(tool_call.arguments),
)
print(f"Tool output: {result}")
```
```python {4, 10-17, 21, 28} [LangChain]
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load environment variables
load_dotenv()

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
    },
)

# Initialize the model with tools
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)

# Get the response from the model
response = model_with_tools.invoke("What tasks are due today?")

# Execute the tool call
tool_call = response.tool_calls[0]
result = index.execute(tool_call["name"], tool_call["args"])
print(f"Tool output: {result}")
```
```python {6, 12-19, 23} [LangGraph]
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
    ["silanthro/todoist"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
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
        "messages": [HumanMessage(content="What tasks are due today?")]
    }
)
print(f"Assistant response: {response['messages'][-1].content}")
```
```python {6, 12-19, 22, 26} [LlamaIndex]
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
    ["silanthro/todoist"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
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
response = agent.chat("What tasks are due today?")
print(f"Assistant response: {response}")
```
```python {4,7-14, 23, 28-31} [LiteLLM]
import json
import os
from litellm import completion
import stores

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/todoist"],
    env_var={
        "silanthro/todoist": {
            "TODOIST_API_TOKEN": os.environ["TODOIST_API_TOKEN"],
        },
    },
)

# Get the response from the model
response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {"role": "user", "content": "What tasks in Todoist are due today?"}
    ],
    # Pass tools
    tools=index.format_tools("google-gemini"),
)

# Execute the tool call
tool_call = response.choices[0].message.tool_calls[0]
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
print(f"Tool output: {result}")

```
::

In the folder where you have this script, you can run the AI agent with the command:

```bash
python get-todoist-tasks.py
```

The agent should then return the tasks in your Todoist account that are due today.

If you have any questions, let us know on [GitHub](https://github.com/silanthro/stores).