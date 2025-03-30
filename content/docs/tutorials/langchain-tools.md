---
title: Use Stores with LangChain (Native Tool Calls)
short_title: Tool Calling
package: LangChain
---

# Use Stores with LangChain (Native Tool Calls)

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While AI models can generate text, they need [additional tools](https://python.langchain.com/docs/modules/model_io/models/llms/integrations/google_genai) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/send-gmail"],
    env_var={
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Initialize the model with tools
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)

# Get the response from the model
response = model_with_tools.invoke(
    "Send a haiku about dreams to email@example.com. Don't ask questions."
)

# Execute the tool call
tool_call = response.tool_calls[0]
result = index.execute(tool_call["name"], tool_call["args"])
print(f"Tool output: {result}")
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

You can also load your own custom tools from your repository. Each local tools folder must have the function(s) and a `tools.yml` file that lists the functions. See [silanthro/send-gmail](https://github.com/silanthro/send-gmail) for an example.

```python
index = stores.Index(["./local_tools"])
```

### 2. Bind the tools to the model

`index.tools` is a list of functions loaded in the index. This can be used directly in `model.bind_tools`.

```python{2}
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)
```

### 3. Call the model with tools

```python
response = model_with_tools.invoke(
    "Send a haiku about dreams to email@example.com. Don't ask questions."
)
```

### 4. Get the tool name and arguments from the model

We can then parse `response.tool_calls` to retrieve the tool name and arguments.

```python {2-7} [response.tool_calls[0\\]]
{
    "name": "tools.send_gmail",
    "args": {
        "subject": "Dreams",
        "recipients": ["email@example.com"],
        "body": "Night visions unfold,\nWorlds of wonder bloom and fade,\nDawn awakes the soul."
    },
    "id": "random-tool-use-uuid",
    "type": "tool_call"
}
```

### 5. Execute the tool call

Use `index.execute` with the tool name and arguments to run the tool.

```python{2}
tool_call = response.tool_calls[0]
result = index.execute(tool_call["name"], tool_call["args"])
```

## Full code

```python
import os
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load tools and set the required environment variables
index = stores.Index(
    ["silanthro/send-gmail"],
    env_var={
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Initialize the model with tools
model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
model_with_tools = model.bind_tools(index.tools)

# Get the response from the model
response = model_with_tools.invoke(
    "Send a haiku about dreams to email@example.com. Don't ask questions."
)

# Execute the tool call
tool_call = response.tool_calls[0]
result = index.execute(tool_call["name"], tool_call["args"])
print(f"Tool output: {result}")
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/docs/contribute).
