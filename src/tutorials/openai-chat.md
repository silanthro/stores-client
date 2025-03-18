# Use Stores with OpenAI Chat Completions API

In this tutorial, we will be creating an agent that can generate a poem and email it to a recipient. Open AI models can generate text but they need [additional tools](https://platform.openai.com/docs/guides/function-calling?api-mode=chat) to perform actions like sending emails. Using Stores, we will add a custom tool to send an email via Gmail to a list of recipients.

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

```python
user_request = "Make up a parenting poem and email it to x@gmail.com"
system_instruction = "You are a helpful assistant who can generate poems in emails. When necessary, you have tools at your disposal. Always use the REPLY tool when you have completed the task. You do not have to ask for confirmations."
model = "gpt-4o-mini-2024-07-18"
tools = index.format_tools("openai-chat-completions")
messages = [
    {"role": "developer", "content": system_instruction},
    {"role": "user", "content": user_request},
]
```

### 3. Create the agent loop

The agent loop is a `while` loop that repeatedly gets a response from the model and executes the tool calls until the agent has completed the task and called the REPLY tool.

```python
# Initialize the model with OpenAI
client = OpenAI()

# Run the agent loop
while True:

    # Get the response from the model
    completion = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools,
    )

    # Execute the tool calls
    tool_calls = completion.choices[0].message.tool_calls
    for tool_call in tool_calls:
        print(f"Tool Call: {tool_call}")
        name = tool_call.function.name.replace("-", ".")
        args = json.loads(tool_call.function.arguments)

        # If the REPLY tool is called, break the loop and return the message
        if name == "REPLY":
            print(f"Assistant Response: {args['msg']}")
            return

        # Otherwise, execute the tool call
        output = index.execute(name, args)
        messages.append(completion.choices[0].message) # Append the assistant's tool call message as context
        messages.append(
            {"role": "tool", "tool_call_id": tool_call.id, "content": str(output)}
        )
        print(f"Tool Output: {output}")
```

## Full code

Note: You will need the custom tools directory for this script to work as intented.

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
    tools = index.format_tools("openai-chat-completions")
    messages = [
        {"role": "developer", "content": system_instruction},
        {"role": "user", "content": user_request},
    ]

    # Initialize the model with OpenAI
    client = OpenAI()

    # Run the agent loop
    while True:

        # Get the response from the model
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
        )

        # Execute the tool calls
        tool_calls = completion.choices[0].message.tool_calls
        for tool_call in tool_calls:
            print(f"Tool Call: {tool_call}")
            name = tool_call.function.name.replace("-", ".")
            args = json.loads(tool_call.function.arguments)

            # If the REPLY tool is called, break the loop and return the message
            if name == "REPLY":
                print(f"Assistant Response: {args['msg']}")
                return

            # Otherwise, execute the tool call
            output = index.execute(name, args)
            messages.append(completion.choices[0].message) # Append the assistant's tool call message as context
            messages.append(
                {"role": "tool", "tool_call_id": tool_call.id, "content": str(output)}
            )
            print(f"Tool Output: {output}")


if __name__ == "__main__":
    main()
```

## Expected output

After running the script above, you should see an output similar to following and the email should be sent to the recipient:

```
Tool Call: ChatCompletionMessageToolCall(id='call_VcD2T27Vdhbc4ktam14BXJRX', function=Function(arguments='{"subject":"A Heartfelt Parenting Poem","body":"In the morning light, we rise with glee,\\nWith little hands that cling to me.\\nEach giggle, each tear, a treasure to hold,\\nIn the pages of memories, our story unfolds.\\n\\nTiny footsteps in a world so wide,\\nWith every stumble, I’m right by your side.\\nWe dance through the days, both wild and sweet,\\nIn this journey of love, there’s no greater feat.\\n\\nThrough bedtime chats and whispered dreams,\\nWe forge our bond with laughter and beans.\\nEvery hug a promise, every kiss a spell,\\nIn the garden of parenting, we blossom so well.\\n\\nAs you grow taller, I\'ll cheer from afar,\\nMy heart filled with pride, like a shimmering star.\\nSo here’s to the journey, wherever it goes,\\nIn the art of parenting, love always grows!","recipients":["x@gmail.com"]}', name='comms-gmail-send_email_via_gmail'), type='function')
Tool Output: Email sent successfully
Tool Call: ChatCompletionMessageToolCall(id='call_LdvH5Wl8rVCE8i1sPIdT037W', function=Function(arguments='{"msg":"I\'ve sent the parenting poem to x@gmail.com successfully!"}', name='REPLY'), type='function')
Assistant Response: I've sent the parenting poem to x@gmail.com successfully!
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
