# Use Stores with Anthropic's Claude API

In this tutorial, we will be creating an agent that can generate a poem and email it to a recipient. Claude models can generate text but they need additional tools to perform actions like sending emails. Using Stores, we will add a custom tool to send an email via Gmail to a list of recipients.

## Agent building steps

### 1. Load custom tools and set environment variables

Our custom tools are stored in our local `custom_tools` directory. We will load them and set the required environment variables in the `.env` file. Not all tools require environment variables but this allows you to securely pass information, such as API keys, to your tools.

- GMAIL_ADDRESS: This is the sender's Gmail address
- GMAIL_PASSWORD: This is the sender's [app password](https://myaccount.google.com/apppasswords), **not the regular Gmail password**
- ANTHROPIC_API_KEY: We also need to set the [Anthropic API key](https://console.anthropic.com/settings/keys) to power our agent with Claude

```python
import os

import anthropic
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

We are using the `claude-3-5-sonnet-20241022` model here because it's strong enough to power an agent while being cost-effective.

Stores contains a REPLY tool by default for the agent to communicate with the user. This allows us to detect when the agent has completed the task and to break the agent's `while` loop.

```python
user_request = "Make up a parenting poem and email it to x@gmail.com"
system_instruction = "You are a helpful assistant who can generate poems in emails. When necessary, you have tools at your disposal. Always use the REPLY tool when you have completed the task. You do not have to ask for confirmations."
model = "claude-3-5-sonnet-20241022"
max_tokens = 1024
tools = index.format_tools("anthropic")
messages = [{"role": "user", "content": user_request}]
```

### 3. Create the agent loop

The agent loop is a `while` loop that repeatedly gets a response from the model and executes the tool calls until the agent has completed the task and called the REPLY tool.

```python
# Initialize the model with Anthropic
client = anthropic.Anthropic()

# Run the agent loop
while True:
    # Get the response from the model
    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system_instruction,
        messages=messages,
        tools=tools,
    )

    # Append the assistant's response as context
    messages.append({"role": "assistant", "content": response.content})

    # Process the response, which includes both text and tool use
    for blocks in response.content:
        if blocks.type == "text":
            print(f"Assistant Response: {blocks.text}")
        elif blocks.type == "tool_use":
            print(f"Tool Call: {blocks}")
            name = blocks.name.replace("-", ".")
            args = blocks.input

            # If the REPLY tool is called, break the loop and return the message
            if blocks.name == "REPLY":
                print(f"Assistant Response: {blocks.input['msg']}")
                return

            # Otherwise, execute the tool call
            output = index.execute(name, args)
            messages.append(
                {
                    "role": "user",  # Some APIs require a tool role instead
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": blocks.id,
                            "content": str(output),
                        }
                    ],
                }
            )
            print(f"Tool Output: {output}")
```

## Full code

Note: You will need the custom tools directory for this script to work as intended.

```python
import os

import anthropic
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
    model = "claude-3-5-sonnet-20241022"
    max_tokens = 1024
    tools = index.format_tools("anthropic")
    messages = [{"role": "user", "content": user_request}]

    # Initialize the model with Anthropic
    client = anthropic.Anthropic()

    # Run the agent loop
    while True:
        # Get the response from the model
        response = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system_instruction,
            messages=messages,
            tools=tools,
        )

        # Append the assistant's response as context
        messages.append({"role": "assistant", "content": response.content})

        # Process the response, which includes both text and tool use
        for blocks in response.content:
            if blocks.type == "text":
                print(f"Assistant Response: {blocks.text}")
            elif blocks.type == "tool_use":
                print(f"Tool Call: {blocks}")
                name = blocks.name.replace("-", ".")
                args = blocks.input

                # If the REPLY tool is called, break the loop and return the message
                if blocks.name == "REPLY":
                    print(f"Assistant Response: {blocks.input['msg']}")
                    return

                # Otherwise, execute the tool call
                output = index.execute(name, args)
                messages.append(
                    {
                        "role": "user",  # Some APIs require a tool role instead
                        "content": [
                            {
                                "type": "tool_result",
                                "tool_use_id": blocks.id,
                                "content": str(output),
                            }
                        ],
                    }
                )
                print(f"Tool Output: {output}")


if __name__ == "__main__":
    main()
```

## Expected output

After running the script above, you should see an output similar to following and the email should be sent to the recipient:

```
Assistant Response: I'll create a heartfelt parenting poem and send it via email.

Tool Call: ToolUse(id='tool_1', type='tool_use', name='comms-gmail-send_email_via_gmail', input={'subject': 'A Parent\'s Love - A Poem', 'body': 'Through tiny footsteps, day by day,\nI watch you grow in your special way.\nWith every smile and every tear,\nMy love for you grows, crystal clear.\n\nFrom bedtime stories, soft and sweet,\nTo muddy shoes and tired feet.\nEach moment shared between us two,\nMakes life more beautiful and true.\n\nYour laughter echoes through our home,\nAs through life\'s garden paths we roam.\nTeaching, learning, hand in hand,\nBuilding castles in the sand.\n\nThis journey of parenthood divine,\nIs a gift that\'s yours and mine.\nForever grateful, forever blessed,\nTo be the one who loves you best.', 'recipients': ['x@gmail.com']})
Tool Output: Email sent successfully

Assistant Response: I've written a heartfelt parenting poem titled "A Parent's Love" and successfully sent it via email to x@gmail.com. The poem captures the beautiful journey of parenthood, from the daily moments of growth to the special bond shared between parent and child. The email has been delivered successfully!
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
