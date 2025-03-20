# Use Stores with LiteLLM (Native Tool Calls)

In this tutorial, we will be creating an agent that can generate a haiku about dreams and email it to a recipient. While LiteLLM models can generate text, they need [additional tools](https://docs.litellm.ai/docs/completion/function_call) to perform actions like sending emails. Using Stores, we will add a tool for sending a simple plaintext email via Gmail to a list of recipients.

## Tool calling example

```python
import json
import os

from litellm import completion

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

    response = completion(
        model="gemini/gemini-2.0-flash-001",
        messages=[
            {
                "role": "user",
                "content": "Send a haiku about dreams to x@gmail.com. Don't ask questions.",
            }
        ],
        tools=index.format_tools("google-gemini"),
    )

    print(response.choices[0].message.tool_calls)

if __name__ == "__main__":
    main()
```

**Output**

```bash
{
    "function": {
        "name": "tools-send_gmail",
        "arguments": {
            "subject": "Dreams",
            "body": "Silent whispers flow,\nWorlds unseen begin to bloom,\nDawn awakes the soul.",
            "recipients": ["x@gmail.com"]
        }
    },
    "id": "call_64c9ff1e-839c-4775-abcd-de26c0984265",
    "type": "function"
}
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

### 2. Call the model with tools

```python
response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {
            "role": "user",
            "content": "Send a haiku about dreams to x@gmail.com. Don't ask questions.",
        }
    ],
    tools=index.format_tools("google-gemini"),
)
```

`index.format_tools("google-gemini")` formats the tools according to the JSON schema required by the Google Gemini API via LiteLLM.

### 3. Get the tool name and arguments from the model

```bash
# response.choices[0].message.tool_calls
{
    "function": {
        "name": "tools-send_gmail",
        "arguments": {
            "subject": "Dreams",
            "body": "Silent whispers flow,\nWorlds unseen begin to bloom,\nDawn awakes the soul.",
            "recipients": ["x@gmail.com"]
        }
    },
    "id": "call_64c9ff1e-839c-4775-abcd-de26c0984265",
    "type": "function"
}
```

### 4. Execute the tool call

```python
fn_name = tool_call.function.name.replace("-", ".")
fn_args = json.loads(tool_call.function.arguments)
result = index.execute(fn_name, fn_args)
```

If you want, you can supply the result to the model and call the model again.

## Full code

```python
"""
This example shows how to use stores with LiteLLM with native function calls.
"""

import json
import os

from litellm import completion

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

    # Get the response from the model
    response = completion(
        model="gemini/gemini-2.0-flash-001",
        messages=[
            {
                "role": "user",
                "content": "Send a haiku about dreams to x@gmail.com. Don't ask questions.",
            }
        ],
        tools=index.format_tools("google-gemini"),
    )

    print(response.choices[0].message.tool_calls)


if __name__ == "__main__":
    main()

```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
