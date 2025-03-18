# Use Stores with LangGraph

In this tutorial, we will be creating an agent that can generate a poem and email it to a recipient using LangGraph. LangGraph is a library for building stateful, multi-actor applications with LLMs, and we'll use it along with Stores to add custom tools to our agent.

## Agent building steps

### 1. Load custom tools and set environment variables

Our custom tools are stored in our local `custom_tools` directory. We will load them and set the required environment variables in the `.env` file. Not all tools require environment variables but this allows you to securely pass information, such as API keys, to your tools.

- GMAIL_ADDRESS: This is the sender's Gmail address
- GMAIL_PASSWORD: This is the sender's [app password](https://myaccount.google.com/apppasswords), **not the regular Gmail password**
- GOOGLE_API_KEY: We also need to set the [Google AI API key](https://ai.google.dev/) to power our agent with Gemini

```python
import os

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent

import stores


# Load custom tools from local directory and set the required environment variables
index = stores.Index(
    ["./custom_tools"],
    env_vars={
        "./custom_tools": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)
```

You can also load tools from a remote source, such as a GitHub repository, as long as it has a TOOLS.yml file that lists the tools.

```python
# Alternatives

# 1. Load default tools
index = stores.Index()

# 2. Load tools from a remote source
index = stores.Index(["greentfrapp/file-ops"])
```

### 2. Set up variables

To keep things tidy, we will specify these variables upfront.

We are using the `gemini-2.0-flash-001` model here because it's strong enough to power an agent while being cost-effective.

Note that LangGraph uses a different message format than standard LangChain, using specialized message classes.

```python
user_request = "Make up a parenting poem and email it to x@gmail.com"
system_instruction = "You are a helpful assistant who can generate poems in emails. You do not have to ask for confirmations."
model = "gemini-2.0-flash-001"
messages = {
    "messages": [
        SystemMessage(content=system_instruction),
        HumanMessage(content=user_request),
    ]
}
```

### 3. Initialize and run the LangGraph agent

One of the benefits of using LangGraph is that it provides pre-built agents that can handle the complexity of reasoning, tool calling, and response generation. We'll use the `create_react_agent` function to create a ReAct agent that can use our tools.

```python
# Initialize the agent with LangChain
agent_model = ChatGoogleGenerativeAI(model=model)
agent_executor = create_react_agent(agent_model, index.tools)

# Get the agent to execute the request, call tools, and update messages
response = agent_executor.invoke(messages)

# Print the final response from the model
print(f"Assistant Response: {response['messages'][-1].content}")
```

## Full code

Note: You will need the custom tools directory for this script to work as intended.

```python
import os

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent

import stores


def main():
    # Load custom tools and set the required environment variables
    index = stores.Index(
        ["./custom_tools"],
        env_vars={
            "./custom_tools": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )
    
    # Set up the user request, system instruction, model parameters, tools, and initial messages
    user_request = "Make up a parenting poem and email it to x@gmail.com"
    system_instruction = "You are a helpful assistant who can generate poems in emails. You do not have to ask for confirmations."
    model = "gemini-2.0-flash-001"
    messages = {
        "messages": [
            SystemMessage(content=system_instruction),
            HumanMessage(content=user_request),
        ]
    }

    # Initialize the agent with LangChain
    agent_model = ChatGoogleGenerativeAI(model=model)
    agent_executor = create_react_agent(agent_model, index.tools)

    # Get the agent to execute the request, call tools, and update messages
    response = agent_executor.invoke(messages)

    # Print the final response from the model
    print(f"Assistant Response: {response['messages'][-1].content}")


if __name__ == "__main__":
    main()
```

## Expected output

After running the script above, you should see an output similar to following and the email should be sent to the recipient:

```
Assistant Response: I have composed a heartfelt parenting poem and sent it via email to x@gmail.com. The poem celebrates the special bond between parent and child, capturing moments of growth, learning, and unconditional love. The email has been delivered successfully.
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
