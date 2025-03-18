# Use Stores with LangChain (Basic Usage)

In this tutorial, we will be creating an agent that can generate a poem and email it to a recipient using LangChain without native function calls. We'll use Google's Gemini model through LangChain's interface, and add custom tools using Stores.

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

Note that since we're not using native function calls, we need to format our user request with the available tools using `stores.format_query()`. This helps the model understand what tools are available and how to use them.

```python
user_request = "Make up a parenting poem and email it to x@gmail.com"
system_instruction = "You are a helpful assistant who can generate poems in emails. You do not have to ask for confirmations."
model = "gemini-2.0-flash-001"
messages = [
    {"role": "system", "content": system_instruction},
    {
        "role": "user",
        "content": stores.format_query(user_request, index.tools),
    },  # Describe the tools to the model
]
```

### 3. Initialize LangChain

We'll initialize the LangChain model. Since we're not using native function calls, we don't need to bind any tools to the model.

```python
# Initialize the model with LangChain
model = ChatGoogleGenerativeAI(model=model)
```

### 4. Create the agent loop

The agent loop is a `while` loop that repeatedly gets a response from the model and executes the tool calls until the agent has completed the task and called the REPLY tool. Since we're not using native function calls, we need to parse the tool calls from the model's response text using `stores.llm_parse_json()`.

```python
# Run the agent loop
while True:
    # Get the response from the model
    response = model.invoke(messages)

    # Append the assistant's response as context
    messages.append({"role": "assistant", "content": response.content})

    # Because there is no native function calling, we need to parse the tool call from the response text
    tool_call = stores.llm_parse_json(response.content)
    print(f"Tool Call: {tool_call}")

    # If the REPLY tool is called, break the loop and return the message
    if tool_call.get("toolname") == "REPLY":
        print(f"Assistant Response: {tool_call.get('kwargs', {}).get('msg')}")
        break

    # Otherwise, execute the tool call
    output = index.execute(tool_call.get("toolname"), tool_call.get("kwargs"))
    messages.append({"role": "user", "content": f"Tool Output: {output}"}) # Some APIs require a tool role instead
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
    messages = [
        {"role": "system", "content": system_instruction},
        {
            "role": "user",
            "content": stores.format_query(user_request, index.tools),
        },  # Describe the tools to the model
    ]

    # Initialize the model with LangChain
    model = ChatGoogleGenerativeAI(model=model)

    # Run the agent loop
    while True:
        # Get the response from the model
        response = model.invoke(messages)

        # Append the assistant's response as context
        messages.append({"role": "assistant", "content": response.content})

        # Because there is no native function calling, we need to parse the tool call from the response text
        tool_call = stores.llm_parse_json(response.content)
        print(f"Tool Call: {tool_call}")

        # If the REPLY tool is called, break the loop and return the message
        if tool_call.get("toolname") == "REPLY":
            print(f"Assistant Response: {tool_call.get('kwargs', {}).get('msg')}")
            break

        # Otherwise, execute the tool call
        output = index.execute(tool_call.get("toolname"), tool_call.get("kwargs"))
        messages.append({"role": "user", "content": f"Tool Output: {output}"}) # Some APIs require a tool role instead
        print(f"Tool Output: {output}")


if __name__ == "__main__":
    main()
```

## Expected output

After running the script above, you should see an output similar to following and the email should be sent to the recipient:

```
Tool Call: {'toolname': 'comms.gmail.send_email_via_gmail', 'kwargs': {'subject': 'A Beautiful Parenting Poem', 'body': 'In the morning light, a gentle start,\nYour tiny hand wrapped around my heart.\nEach step you take, each word you say,\nMakes me grateful for another day.\n\nThrough scraped knees and bedtime tales,\nYour laughter like wind in my sails.\nTeaching, learning, growing too,\nEvery moment shared with you.\n\nTime flows swift like river streams,\nBut our love grows stronger, or so it seems.\nThis journey of parenthood, pure and true,\nIs the greatest gift - just me and you.', 'recipients': ['x@gmail.com']}}
Tool Output: Email sent successfully
Assistant Response: I've composed a heartwarming parenting poem and sent it successfully to x@gmail.com. The email has been delivered!
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
