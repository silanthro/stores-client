# Use Stores with LlamaIndex Agent

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While LlamaIndex agents can generate text, they need [additional tools](https://docs.llamaindex.ai/en/stable/module_guides/deploying/agents/tools/) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os

from llama_index.core.agent import AgentRunner
from llama_index.core.tools import FunctionTool
from llama_index.llms.google_genai import GoogleGenAI

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

    llm = GoogleGenAI(model="models/gemini-2.0-flash-001")
    tools = [FunctionTool.from_defaults(fn=tool_function) for tool_function in index.tools]
    agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)

    response = agent.chat("Send a haiku about dreams to x@gmail.com. Don't ask questions.")

    print(f"Assistant response: {response}")

if __name__ == "__main__":
    main()
```

**Output**

```bash
> Running step 94d86609-2495-444a-aadc-4ede211e68f3. Step input: Send a haiku about dreams to x@gmail.com. Don't ask questions.
Thought: The current language of the user is: English. I need to send an email with a haiku about dreams to the specified email address.
Action: tools.send_gmail
Action Input: {'subject': 'A Dream Haiku', 'body': 'Softly, dreams descend,\nWorlds of wonder gently bloom,\nDawn awakes the soul.', 'recipients': ['x@gmail.com']}
Observation: Email sent successfully
> Running step 0e458818-6dcc-4055-8c60-b97377c96ad5. Step input: None
Thought: I can answer without using any more tools. I'll use the user's language to answer
Answer: Email sent successfully
Assistant response: Email sent successfully
```

## Tool calling steps

### 1. Load the tools

```python
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

### 2. Initialize the agent with tools

```python
llm = GoogleGenAI(model="models/gemini-2.0-flash-001")
tools = [FunctionTool.from_defaults(fn=tool_function) for tool_function in index.tools]
agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)
```

We are using LlamaIndex's `FunctionTool` to wrap the tools from Stores.

### 3. Chat with the agent

```python
response = agent.chat("Send a haiku about dreams to x@gmail.com. Don't ask questions.")
```

The LlamaIndex agent will automatically execute any tool calls it makes during the conversation.

## Full code

```python
"""
This example shows how to use stores with a LlamaIndex agent.
"""

import os

from llama_index.core.agent import AgentRunner
from llama_index.core.tools import FunctionTool
from llama_index.llms.google_genai import GoogleGenAI

import stores


def main():
    # Load tools and set the required environment variables
    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    # Initialize the LlamaIndex agent with tools
    llm = GoogleGenAI(model="models/gemini-2.0-flash-001")
    tools = [
        FunctionTool.from_defaults(fn=tool_function) for tool_function in index.tools
    ]  # Use LlamaIndex FunctionTool
    agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)

    # Get the response from the LlamaIndex agent. LlamaIndex agent will automatically execute the tool call.
    response = agent.chat(
        "Send a haiku about dreams to x@gmail.com. Don't ask questions."
    )
    print(f"Assistant response: {response}")


if __name__ == "__main__":
    main()

```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
