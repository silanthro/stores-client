---
title: Use Stores with Google Gemini API (Manual Tool Calling)
short_title: Gemini (Manual)
package: Google
---

# Use Stores with Google Gemini API (Manual Tool Calling)

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While Gemini models can generate text, they need [additional tools](https://ai.google.dev/gemini-api/docs/function-calling) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os
from google import genai
from google.genai import types
import stores

# Initialize Google Gemini client
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Load custom tools and set the required environment variables
index = stores.Index(
    ["silanthro/send-gmail"],
    env_var={
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Configure the model with tools
config = types.GenerateContentConfig(
    tools=index.tools,
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        # Gemini automatically executes tool calls
        # We disable this to show how to manually execute tool calls
        disable=True
    ),
)

# Get the response from the model
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Send a haiku about dreams to email@example.com. Don't ask questions.",
    config=config,
)

# Execute the tool call
tool_call = response.candidates[0].content.parts[0].function_call
result = index.execute(tool_call.name, tool_call.args)
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

You can also load your own custom tools from your repository. Each local tools folder must have the function(s) and a `tools.toml` file that lists the functions. See [silanthro/send-gmail](https://github.com/silanthro/send-gmail) for an example.

```python
index = stores.Index(["./local_tools"])
```

### 2. Create a config with tools

`index.tools` is a list of functions loaded in the index. This can be passed directly to the config.

```python{2}
config = types.GenerateContentConfig(
    tools=index.tools,
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        # Gemini automatically executes tool calls
        # We disable this to show how to manually execute tool calls
        disable=True
    ),
)
```

### 3. Call the model with the created config and request

```python
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Send a haiku about dreams to email@example.com. Don't ask questions.",
    config=config,
)
```

### 4. Parse the model response

We can then parse `response` to retrieve the tool name and arguments.

```python {3-8} [response.candidates[0\\].content.parts[0\\].function_call]
FunctionCall(
    id=None,
    name="tools.send_gmail",
    args={
        "subject": "Dreams",
        "recipients": ["email@example.com"],
        "body": "Sleep takes us away,\nTo worlds of endless wonder,\nThen morning arrives."
    },
)
```

### 5. Execute the tool call

Use `index.execute` with the tool name and arguments to run the tool.

```python{2}
tool_call = response.candidates[0].content.parts[0].function_call
result = index.execute(tool_call.name, tool_call.args)
```

## Full code

```python
import os
from google import genai
from google.genai import types
import stores

# Initialize Google Gemini client
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Load custom tools and set the required environment variables
index = stores.Index(
    ["silanthro/send-gmail"],
    env_var={
        "silanthro/send-gmail": {
            "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
            "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
        },
    },
)

# Configure the model with tools
config = types.GenerateContentConfig(
    tools=index.tools,
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        # Gemini automatically executes tool calls
        # We disable this to show how to manually execute tool calls
        disable=True
    ),
)

# Get the response from the model
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Send a haiku about dreams to email@example.com. Don't ask questions.",
    config=config,
)

# Execute the tool call
tool_call = response.candidates[0].content.parts[0].function_call
result = index.execute(tool_call.name, tool_call.args)
print(f"Tool output: {result}")
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/docs/contribute).
