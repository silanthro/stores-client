# Use Stores with LangChain (with Tool Calling)

In this tutorial, we will be creating an agent that can generate a poem and email it to a recipient using LangChain with native function calls. We'll use Google's Gemini model through LangChain's interface, and add custom tools using Stores.

## Agent building steps

### 1. Load custom tools and set environment variables

Our custom tools are stored in our local `custom_tools` directory. We will load them and set the required environment variables in the `.env` file. Not all tools require environment variables but this allows you to securely pass information, such as API keys, to your tools.

- GMAIL_ADDRESS: This is the sender's Gmail address
- GMAIL_PASSWORD: This is the sender's [app password](https://myaccount.google.com/apppasswords), **not the regular Gmail password**
- GOOGLE_API_KEY: We also need to set the [Google AI API key](https://ai.google.dev/) to power our agent with Gemini

```python
import os

from langchain_google_genai import ChatGoogleGenerativeAI

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

Stores contains a REPLY tool by default for the agent to communicate with the user. This allows us to detect when the agent has completed the task and to break the agent's `while` loop.

```python
user_request = "Make up a parenting poem and email it to x@gmail.com"
system_instruction = "You are a helpful assistant who can generate poems in emails. You do not have to ask for confirmations."
model = "gemini-2.0-flash-001"
tools = index.tools
messages = [
    {"role": "system", "content": system_instruction},
    {"role": "user", "content": user_request},
]
```

### 3. Initialize LangChain with tools

We'll initialize the LangChain model and bind our tools to it.

```python
# Initialize the model with LangChain
model = ChatGoogleGenerativeAI(model=model)
model_with_tools = model.bind_tools(tools)
```

### 4. Create the agent loop

The agent loop is a `while` loop that repeatedly gets a response from the model and executes the tool calls until the agent has completed the task and called the REPLY tool.

```python
# Run the agent loop
while True:
    # Get the response from the model
    response = model_with_tools.invoke(messages)

    # Execute the tool calls
    tool_calls = response.tool_calls
    for tool_call in tool_calls:
        print(f"Tool Call: {tool_call}")

        # If the REPLY tool is called, break the loop and return the message
        if tool_call["name"] == "REPLY":
            print(f"Assistant Response: {tool_call['args']['msg']}")
            return

        # Otherwise, execute the tool call
        selected_tool = index.tools_dict[tool_call["name"]]
        output = selected_tool(**tool_call["args"])
        messages.append({"role": "assistant", "content": str(tool_call)}) # Append the assistant's tool call as context
        messages.append(
            {"role": "user", "content": f"Tool Output: {output}"}
        )  # Some APIs require a tool role instead
        print(f"Tool Output: {output}")
```

## Full code

Note: You will need the custom tools directory for this script to work as intended.

```python
import os

from langchain_google_genai import ChatGoogleGenerativeAI

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
    tools = index.tools
    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": user_request},
    ]

    # Initialize the model with LangChain
    model = ChatGoogleGenerativeAI(model=model)
    model_with_tools = model.bind_tools(tools)

    # Run the agent loop
    while True:
        # Get the response from the model
        response = model_with_tools.invoke(messages)

        # Execute the tool calls
        tool_calls = response.tool_calls
        for tool_call in tool_calls:
            print(f"Tool Call: {tool_call}")

            # If the REPLY tool is called, break the loop and return the message
            if tool_call["name"] == "REPLY":
                print(f"Assistant Response: {tool_call['args']['msg']}")
                return

            # Otherwise, execute the tool call
            selected_tool = index.tools_dict[tool_call["name"]]
            output = selected_tool(**tool_call["args"])
            messages.append({"role": "assistant", "content": str(tool_call)}) # Append the assistant's tool call as context
            messages.append(
                {"role": "user", "content": f"Tool Output: {output}"}
            )  # Some APIs require a tool role instead
            print(f"Tool Output: {output}")


if __name__ == "__main__":
    main()
```

## Expected output

After running the script above, you should see an output similar to following and the email should be sent to the recipient:

```
Tool Call: {'name': 'comms.gmail.send_email_via_gmail', 'args': {'subject': 'A Special Parenting Poem', 'body': 'In the quiet of the morning light,\nWatching you sleep, such pure delight.\nTiny fingers, gentle breath,\nLove deeper than any depth.\n\nThrough the days of scraped knees and tears,\nLaughter, hugs that calm all fears.\nEvery moment, precious and new,\nBuilding memories, just us two.\n\nAs you grow and learn to soar,\nMy heart expands even more.\nThis journey of parenthood divine,\nBlessed beyond words that you are mine.', 'recipients': ['x@gmail.com']}}
Tool Output: Email sent successfully
Assistant Response: I've created a heartfelt parenting poem and sent it to x@gmail.com. The email has been delivered successfully!
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
