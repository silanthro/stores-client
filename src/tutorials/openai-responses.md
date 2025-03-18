# Use Stores with OpenAI Responses API

In this tutorial, we will be creating an agent that can generate a poem and email it to a recipient. OpenAI models can generate text but they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=chat) to perform actions like sending emails. The Responses API is OpenAI's latest API for building applications with function calls. Using Stores, we will add a custom tool to send an email via Gmail to a list of recipients.

## Agent building steps

### 1. Load custom tools and set environment variables

Our custom tools are stored in our local `custom_tools` directory. We will load them and set the required environment variables in the `.env` file. Not all tools require environment variables but this allows you to securely pass information, such as API keys, to your tools.

- GMAIL_ADDRESS: This is the sender's Gmail address
- GMAIL_PASSWORD: This is the sender's [app password](https://myaccount.google.com/apppasswords), **not the regular Gmail password**
- OPENAI_API_KEY: We also need to set the [OpenAI API key](https://platform.openai.com/api-keys) to power our agent with OpenAI's model

```python
import json
import os

from openai import OpenAI

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

We are using the `gpt-4o-mini-2024-07-18` model here because it's strong enough to power an agent while being cost-effective.

Stores contains a REPLY tool by default for the agent to communicate with the user. This allows us to detect when the agent has completed the task and to break the agent's `while` loop. See more in the next step.

Note that we need to format our tools using `index.format_tools("openai-responses")` to match the format expected by the OpenAI Responses API.

```python
user_request = "Make up a parenting poem and email it to x@gmail.com"
system_instruction = "You are a helpful assistant who can generate poems in emails. When necessary, you have tools at your disposal. Always use the REPLY tool when you have completed the task. You do not have to ask for confirmations."
model = "gpt-4o-mini-2024-07-18"
tools = index.format_tools("openai-responses")
messages = [
    {"role": "developer", "content": system_instruction},
    {"role": "user", "content": user_request},
]
```

### 3. Create the agent loop

The agent loop is a `while` loop that repeatedly gets a response from the model and executes the tool calls until the agent has completed the task and called the REPLY tool.

Note that the Responses API has a different format compared to the Chat Completions API. The tool calls are in the `response.output` field, and the tool call outputs need to be appended to the messages with a `type` of `function_call_output`.

```python
# Initialize the model with OpenAI
client = OpenAI()

# Run the agent loop
while True:

    # Get the response from the model
    response = client.responses.create(
        model=model,
        input=messages,
        tools=tools,
    )

    # Execute the tool calls
    tool_calls = response.output
    for tool_call in tool_calls:
        print(f"Tool Call: {tool_call}")
        name = tool_call.name.replace("-", ".")
        args = json.loads(tool_call.arguments)

        # If the REPLY tool is called, break the loop and return the message
        if name == "REPLY":
            print(f"Assistant Response: {args['msg']}")
            return

        # Otherwise, execute the tool call
        output = index.execute(name, args)
        messages.append(tool_call) # Append the assistant's tool call message as context
        messages.append(
            {
                "type": "function_call_output",
                "call_id": tool_call.call_id,
                "output": str(output),
            }
        )
        print(f"Tool Output: {output}")
```

## Full code

Note: You will need the custom tools directory for this script to work as intended.

```python
import json
import os

from openai import OpenAI

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
    system_instruction = "You are a helpful assistant who can generate poems in emails. When necessary, you have tools at your disposal. Always use the REPLY tool when you have completed the task. You do not have to ask for confirmations."
    model = "gpt-4o-mini-2024-07-18"
    tools = index.format_tools("openai-responses")
    messages = [
        {"role": "developer", "content": system_instruction},
        {"role": "user", "content": user_request},
    ]

    # Initialize the model with OpenAI
    client = OpenAI()

    # Run the agent loop
    while True:

        # Get the response from the model
        response = client.responses.create(
            model=model,
            input=messages,
            tools=tools,
        )

        # Execute the tool calls
        tool_calls = response.output
        for tool_call in tool_calls:
            print(f"Tool Call: {tool_call}")
            name = tool_call.name.replace("-", ".")
            args = json.loads(tool_call.arguments)

            # If the REPLY tool is called, break the loop and return the message
            if name == "REPLY":
                print(f"Assistant Response: {args['msg']}")
                return

            # Otherwise, execute the tool call
            output = index.execute(name, args)
            messages.append(tool_call) # Append the assistant's tool call message as context
            messages.append(
                {
                    "type": "function_call_output",
                    "call_id": tool_call.call_id,
                    "output": str(output),
                }
            )
            print(f"Tool Output: {output}")


if __name__ == "__main__":
    main()
```

## Expected output

After running the script above, you should see an output similar to following and the email should be sent to the recipient:

```
Tool Call: ToolCall(call_id='func_Xl3GvHdEKF3EzMUHKBa4rP7q', name='comms-gmail-send_email_via_gmail', type='function', arguments='{"subject":"A Parent\'s Love - A Poem","body":"In the whispers of the morning light,\\nI watch you slumber, peaceful and bright.\\nLittle hands, and a heart so pure,\\nA bond so strong, that will endure.\\n\\nThrough scraped knees and bedtime tales,\\nLaughter that across the years sails.\\nI guide your steps, both steady and small,\\nReady to catch you, should you fall.\\n\\nIn your eyes, I see the future unfold,\\nStories yet unwritten, dreams yet untold.\\nThis journey of parenting, a gift so divine,\\nA privilege each day, to call you mine.\\n\\nSo grow with courage, love without measure,\\nKnow that your smile is my greatest treasure.\\nFor in this dance of parent and child,\\nLies the purest love, free and wild.","recipients":["x@gmail.com"]}')
Tool Output: Email sent successfully
Assistant Response: I've crafted a heartfelt parenting poem titled "A Parent's Love" and successfully sent it to x@gmail.com. The poem celebrates the special bond between parent and child, from watching them sleep peacefully to guiding their steps and witnessing their growth. The email has been delivered!
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
