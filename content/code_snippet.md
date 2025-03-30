::content-multi-code
```python {3,5-6,18-19,23-24} [Anthropic]
import os
import anthropic
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    messages=[
        {
            "role": "user",
            "content": "Find the latest posts on HackerNews",
        }
    ],
    # Pass tools
    tools=index.format_tools("anthropic"),
)

tool_call = response.content[-1]
# Execute tools
result = index.execute(tool_call.name, tool_call.input)
```
```python {3,5-6,10-11,14} [Gemini]
from google import genai
from google.genai import types
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

client = genai.Client()

# Pass tools
config = types.GenerateContentConfig(tools=index.tools)
chat = client.chats.create(model="gemini-2.0-flash", config=config)

# Tools executed automatically
response = chat.send_message(
    "Find the latest posts on HackerNews"
)
```
```python {3,5-6,18-19,23-27} [OpenAI]
import json
from openai import OpenAI
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

client = OpenAI()

response = client.responses.create(
    model="gpt-4o-mini-2024-07-18",
    input=[
        {
            "role": "user",
            "content": "Find the latest posts on HackerNews",
        }
    ],
    # Pass tools
    tools=index.format_tools("openai-responses"),
)

tool_call = response.output[0]
# Execute tools
result = index.execute(
    tool_call.name,
    json.loads(tool_call.arguments),
)
```
```python {2,4-5,8-9,16-17} [LangChain]
from langchain_google_genai import ChatGoogleGenerativeAI
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

model = ChatGoogleGenerativeAI(model="gemini-2.0-flash-001")
# Pass tools
model_with_tools = model.bind_tools(index.tools)

response = model_with_tools.invoke(
    "Find the latest posts on HackerNews"
)

tool_call = response.tool_calls[0]
# Execute tools
result = index.execute(tool_call["name"], tool_call["args"])
```
```python {4,6-7,11-12,16} [LlamaIndex]
from llama_index.core.agent import AgentRunner
from llama_index.core.tools import FunctionTool
from llama_index.llms.google_genai import GoogleGenAI
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

llm = GoogleGenAI(model="models/gemini-2.0-flash-001")
tools = [
    # Pass tools
    FunctionTool.from_defaults(fn=fn) for fn in index.tools
]
agent = AgentRunner.from_llm(tools, llm=llm, verbose=True)

# Tools executed automatically
response = agent.chat(
    "Find the latest posts on HackerNews"
)
```
```python {4,6-7,17-18,22-26} [LiteLLM]
import json
import os
from litellm import completion
import stores

# Load tools
index = stores.Index(["silanthro/hackernews"])

response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=[
        {
            "role": "user",
            "content": "Find the latest posts on HackerNews",
        }
    ],
    # Pass tools
    tools=index.format_tools("google-gemini"),
)

tool_call = response.choices[0].message.tool_calls[0]
# Execute tools
result = index.execute(
    tool_call.function.name,
    json.loads(tool_call.function.arguments),
)
```
::