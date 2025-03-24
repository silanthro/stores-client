# Use Stores with LangGraph Agent

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While LangGraph agents can generate text, they need [additional tools](https://python.langchain.com/docs/tutorials/agents/#create-the-agent) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent

import stores

def main():
    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    agent_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
    agent_executor = create_react_agent(agent_model, index.tools)

    response = agent_executor.invoke(
        {
            "messages": [
                HumanMessage(
                    content="Send a haiku about dreams to x@gmail.com. Don't ask questions."
                )
            ]
        }
    )
    print(f"Assistant response: {response['messages'][-1].content}")

if __name__ == "__main__":
    main()
```

**Output**

```bash
Assistant response: Email sent successfully
```

## Tool calling steps

### 1. Load the tools

```python
import os

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent

import stores

def main():
    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )
```

You can also load your own custom tools from your repository. Each local tools folder must have the function(s) and a `TOOLS.yml` file that lists the functions. See [silanthro/send-gmail](https://github.com/silanthro/send-gmail) for an example.

```python
index = stores.Index(["./local_tools"])
```

### 2. Initialize the LangGraph agent

```python
agent_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
agent_executor = create_react_agent(agent_model, index.tools)
```

### 3. Invoke the agent

```python
response = agent_executor.invoke(
    {
        "messages": [
            HumanMessage(
                content="Send a haiku about dreams to x@gmail.com. Don't ask questions."
            )
        ]
    }
)
```

The LangGraph agent will automatically execute any tool calls it makes during the conversation.

## Full code

```python
"""
This example shows how to use stores with LangChain and a LangGraph agent.
"""

import os

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent

import stores

def main(): # Load tools and set the required environment variables
index = stores.Index(
["silanthro/send-gmail"],
env_vars={
"silanthro/send-gmail": {
"GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
"GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
},
},
)

    # Initialize the LangGraph agent
    agent_model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
    agent_executor = create_react_agent(agent_model, index.tools)

    # Get the response from the agent. The LangGraph agent will automatically execute the tool call.
    response = agent_executor.invoke(
        {
            "messages": [
                HumanMessage(
                    content="Send a haiku about dreams to x@gmail.com. Don't ask questions."
                )
            ]
        }
    )
    print(f"Assistant response: {response['messages'][-1].content}")

if **name** == "**main**":
main()

```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).

```

```
