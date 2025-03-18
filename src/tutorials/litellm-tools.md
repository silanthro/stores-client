# Use Stores with LiteLLM (with Tool Calling)

In this tutorial, we will be creating an agent that can generate a poem and email it to a recipient using LiteLLM with native function calls. LiteLLM is a library that provides a unified interface to various language models, making it easy to switch between providers.

## Agent building steps

### 1. Load custom tools and set environment variables

Our custom tools are stored in our local `custom_tools` directory. We will load them and set the required environment variables in the `.env` file. Not all tools require environment variables but this allows you to securely pass information, such as API keys, to your tools.

- GMAIL_ADDRESS: This is the sender's Gmail address
- GMAIL_PASSWORD: This is the sender's [app password](https://myaccount.google.com/apppasswords), **not the regular Gmail password**
- GOOGLE_API_KEY: Since we're using Gemini in this example, we need to set the [Google AI API key](https://ai.google.dev/)

```python
import json
import os

from litellm import completion

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

We are using the `gemini/gemini-2.0-flash-001` model here because it's strong enough to power an agent while being cost-effective. Note that LiteLLM prefixes the model name with the provider.

Since we're using native function calls, we need to format our tools using `index.format_tools()` with the appropriate model type.

```python
user_request = "Make up a parenting poem and email it to x@gmail.com, without asking any questions"
system_instruction = "You are a helpful assistant who can generate poems in emails. You do not have to ask for confirmations."
model = "gemini/gemini-2.0-flash-001"
tools = index.format_tools("google-gemini")
messages = [
    {"role": "system", "content": system_instruction},
    {"role": "user", "content": user_request},
]
```

### 3. Create the agent loop

The agent loop is a `while` loop that repeatedly gets a response from the model and executes the tool calls until the agent has completed the task.

```python
# Run the agent loop
while True:
    # Get the response from the model
    # LiteLLM has a function to turn functions into dict: https://docs.litellm.ai/docs/completion/function_call#litellmfunction_to_dict---convert-functions-to-dictionary-for-openai-function-calling
    # But it doesn't support type unions: https://github.com/BerriAI/litellm/issues/4249
    # So we need to use the format_tools method
    response = completion(
        model=model,
        messages=messages,
        tools=tools,
        num_retries=3,
        timeout=60,
    )

    # Execute the tool calls
    tool_calls = response.choices[0].message.tool_calls
    for tool_call in tool_calls:
        name = tool_call.function.name.replace("-", ".")
        args = json.loads(tool_call.function.arguments)

        # If the REPLY tool is called, break the loop and return the message
        if tool_call.function.name == "REPLY":
            print(f"Assistant Response: {args['msg']}")
            return

        # Otherwise, execute the tool call
        output = index.execute(name, args)
        messages.append({"role": "assistant", "content": str(tool_call)}) # Append the assistant's tool call as context
        messages.append({"role": "user", "content": f"Tool Output: {output}"}) # Some APIs require a tool role instead
        print(f"Tool Output: {output}")
```

## Full code

Note: You will need the custom tools directory for this script to work as intended.

```python
import json
import os

from litellm import completion

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
    user_request = "Make up a parenting poem and email it to x@gmail.com, without asking any questions"
    system_instruction = "You are a helpful assistant who can generate poems in emails. You do not have to ask for confirmations."
    model = "gemini/gemini-2.0-flash-001"
    tools = index.format_tools("google-gemini")
    messages = [
        {"role": "system", "content": system_instruction},
        {"role": "user", "content": user_request},
    ]

    # Run the agent loop
    while True:
        # Get the response from the model
        # LiteLLM has a function to turn functions into dict: https://docs.litellm.ai/docs/completion/function_call#litellmfunction_to_dict---convert-functions-to-dictionary-for-openai-function-calling
        # But it doesn't support type unions: https://github.com/BerriAI/litellm/issues/4249
        # So we need to use the format_tools method
        response = completion(
            model=model,
            messages=messages,
            tools=tools,
            num_retries=3,
            timeout=60,
        )

        # Execute the tool calls
        tool_calls = response.choices[0].message.tool_calls
        for tool_call in tool_calls:
            name = tool_call.function.name.replace("-", ".")
            args = json.loads(tool_call.function.arguments)

            # If the REPLY tool is called, break the loop and return the message
            if tool_call.function.name == "REPLY":
                print(f"Assistant Response: {args['msg']}")
                return

            # Otherwise, execute the tool call
            output = index.execute(name, args)
            messages.append({"role": "assistant", "content": str(tool_call)}) # Append the assistant's tool call as context
            messages.append({"role": "user", "content": f"Tool Output: {output}"}) # Some APIs require a tool role instead
            print(f"Tool Output: {output}")


if __name__ == "__main__":
    main()
```

## Expected output

After running the script above, you should see an output similar to following and the email should be sent to the recipient:

```
Tool Call: ToolCall(function=FunctionParameters(name='comms-gmail-send_email_via_gmail', arguments='{"subject": "A Parenting Journey", "body": "In the quiet of dawn, I watch you sleep,\\nA precious gift I\'m blessed to keep.\\nTiny fingers, gentle breaths so light,\\nGuiding you through day and night.\\n\\nFrom first steps to scraped knee days,\\nYour courage shown in countless ways.\\nBedtime stories, lullabies sweet,\\nMaking every moment complete.\\n\\nThrough tears and laughter, hand in hand,\\nBuilding castles in life\'s sand.\\nWatching you grow, learn, and shine,\\nThis parenting journey, yours and mine.\\n\\nSo here\'s my promise, forever true,\\nI\'ll always be right here for you.\\nFor in this dance of love so pure,\\nTogether we\'ll forever endure.", "recipients": ["x@gmail.com"]}'))
Tool Output: Email sent successfully
Assistant Response: I've composed a heartfelt parenting poem and sent it to x@gmail.com. The email has been delivered successfully!
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
