# Use Stores with LlamaIndex (Tool Calling)

In this tutorial, we will be creating an agent that can generate a poem and email it to a recipient using LlamaIndex with native function calls. LlamaIndex provides a convenient way to create agents that can use tools directly through its `AgentRunner` class.

## Agent building steps

### 1. Load custom tools and set environment variables

Our custom tools are stored in our local `custom_tools` directory. We will load them and set the required environment variables in the `.env` file. Not all tools require environment variables but this allows you to securely pass information, such as API keys, to your tools.

- GMAIL_ADDRESS: This is the sender's Gmail address
- GMAIL_PASSWORD: This is the sender's [app password](https://myaccount.google.com/apppasswords), **not the regular Gmail password**
- GOOGLE_API_KEY: Since we're using Gemini in this example, we need to set the [Google AI API key](https://ai.google.dev/)

```python
import os

from llama_index.llms.gemini import Gemini
from llama_index.core.tools import FunctionTool
from llama_index.core.agent import AgentRunner
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

### 2. Set up variables and convert tools

To keep things tidy, we will specify these variables upfront.

We are using the `models/gemini-2.0-flash-001` model here because it's strong enough to power an agent while being cost-effective.

Note that we need to convert our Stores tools to LlamaIndex's `FunctionTool` format using the `FunctionTool.from_defaults()` method.

```python
# Set up the user request, model parameters, and tools
user_request = "Make up a parenting poem in an email and send it to x@gmail.com, without asking any questions"
model="models/gemini-2.0-flash-001"
tools = [FunctionTool.from_defaults(fn=tool_function) for tool_function in index.tools] # Convert custom tools to LlamaIndex FunctionTool format
```

### 3. Initialize LlamaIndex with Gemini model

We'll initialize the LlamaIndex model with the Gemini provider.

```python
# Initialize the model with Gemini
llm = Gemini(model=model)
```

### 4. Create and run the LlamaIndex agent

One of the benefits of using LlamaIndex's `AgentRunner` is that it handles the agent loop for us, including tool calling and response generation. We just need to create the agent and run it with our user request.

```python
# Create LlamaIndex agent with tools
agent = AgentRunner.from_llm(
    tools,
    llm=llm,
    verbose=True
)

# Run the agent
response = agent.chat(user_request)
print(f"Assistant Response: {response}")
```

## Full code

Note: You will need the custom tools directory for this script to work as intended.

```python
import os

from llama_index.llms.gemini import Gemini
from llama_index.core.tools import FunctionTool
from llama_index.core.agent import AgentRunner
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

    # Set up the user request, model parameters, and tools
    user_request = "Make up a parenting poem in an email and send it to x@gmail.com, without asking any questions"
    model="models/gemini-2.0-flash-001"
    tools = [FunctionTool.from_defaults(fn=tool_function) for tool_function in index.tools] # Convert custom tools to LlamaIndex FunctionTool format

    # Initialize the model with Gemini
    llm = Gemini(model=model)

    # Create LlamaIndex agent with tools
    agent = AgentRunner.from_llm(
        tools,
        llm=llm,
        verbose=True
    )

    # Run the agent
    response = agent.chat(user_request)
    print(f"Assistant Response: {response}")


if __name__ == "__main__":
    main()
```

## Expected output

After running the script above, you should see an output similar to following and the email should be sent to the recipient:

```
I'll create a heartfelt parenting poem and send it via email to x@gmail.com.

I'll use the comms_gmail_send_email_via_gmail tool to send the email.

Action: comms_gmail_send_email_via_gmail
Action Input: {
  "subject": "A Heartfelt Parenting Poem",
  "body": "Little Hands, Big Hearts\n\nTiny fingers wrap around mine,\nA grip so small, yet so divine.\nWith each step, each stumble, each fall,\nI'm here to catch you through it all.\n\nBedtime stories and lullabies sweet,\nPatching up scrapes on tiny feet.\nLaughter that fills our home with joy,\nMoments no time could ever destroy.\n\nThrough tears and tantrums, smiles and play,\nYou're growing stronger day by day.\nThis journey of ours, both wild and mild,\nThe beautiful chaos of raising a child.\n\nSo here's to the messes, the hugs, and the fights,\nThe morning wake-ups and late bedtime nights.\nFor in all of these moments, both easy and tough,\nI've discovered what matters: our love is enough.",
  "recipients": ["x@gmail.com"]
}

Observation: Email sent successfully

Assistant Response: I've created a heartfelt parenting poem titled "Little Hands, Big Hearts" and sent it to x@gmail.com. The email has been delivered successfully. The poem captures the journey of parenthood - from the tiny fingers and first steps to the bedtime stories and everyday moments that make parenting both challenging and rewarding.
```

## Next steps

- If you have built an agent with Stores, [let us know](http://twitter.com/alfred_lua).
- If you are interested in building tools for other developers, [get started here](/contribute).
