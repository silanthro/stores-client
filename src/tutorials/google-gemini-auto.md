# Use Stores with Google Gemini API (Automatic Tool Calling)

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While Gemini models can generate text, they need [additional tools](https://ai.google.dev/gemini-api/docs/function-calling) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import os

from google import genai
from google.genai import types

import stores

def main():
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    index = stores.Index(
        ["silanthro/send-gmail"],
        env_vars={
            "silanthro/send-gmail": {
                "GMAIL_ADDRESS": os.environ["GMAIL_ADDRESS"],
                "GMAIL_PASSWORD": os.environ["GMAIL_PASSWORD"],
            },
        },
    )

    config = types.GenerateContentConfig(tools=index.tools)
    chat = client.chats.create(model="gemini-2.0-flash", config=config)

    response = chat.send_message(
        "Send a haiku about dreams to x@gmail.com. Don't ask questions."
    )
    print(f"Assistant response: {response.candidates[0].content.parts[0].text}")


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

### 2. Initialize the chat with the tools

```python
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.0-flash", config=config)
```

### 3. Call the model with the tools (Gemini will automatically execute the tool call)

```python
response = chat.send_message(
    "Send a haiku about dreams to x@gmail.com. Don't ask questions."
)
print(f"Assistant response: {response.candidates[0].content.parts[0].text}")
```

## Full code

```python
"""
This example shows how to use stores with Google's Gemini API with automatic tool calling.
"""

import os

from google import genai
from google.genai import types

import stores


def main():
    # Initialize Google Gemini client
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

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

    # Initialize the chat with the model
    config = types.GenerateContentConfig(tools=index.tools)
    chat = client.chats.create(model="gemini-2.0-flash", config=config)

    # Get the response from the model. Gemini will automatically execute the tool call.
    response = chat.send_message(
        "Send a haiku about dreams to x@gmail.com. Don't ask questions."
    )
    print(f"Assistant response: {response.candidates[0].content.parts[0].text}")


if __name__ == "__main__":
    main()

```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
