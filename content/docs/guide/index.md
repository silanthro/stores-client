# Stores

Just as tool use is often cited as a key development in human civilization, we believe that tool use represents a major transition in AI development.

**The aim of Stores is to make it super simple to build LLM Agents that use tools.**

There are two main elements:
1. A public repository of [tools](/) that anyone can contribute to
2. A [Python library](https://github.com/silanthro/stores) that handles tool installation and formatting

Stores is designed with several principles in mind:
- **Open-source**: Each set of tools in the Stores collection is a public git repository. In the event the Stores database is no longer operational, the library and tools will still work as long as the git repositories exist.
- **Isolation**: Tools are isolated in their own virtual environments. This makes it trivial to manage tools with conflicting dependencies and prevents unnecessary access to sensitive environment variables.
- **Framework compatibility**: In order to pass information about tools, LLM providers often require different formats that can make it cumbersome to switch between providers. Stores makes it easy to output the required formats across providers.

## Install

```sh
pip install stores
```

Or if you are using `uv`:

```sh
uv add stores
```

## Usage

Then load one of the available indexes for your LLM or Agent application.

```python
from stores import Index

index = Index(["silanthro/hackernews"])
```

`Index.tools` provides a list of loaded functions, which can be passed to
any LLM package that accepts a list of functions.

For example, with LangChain:

```python{4}
from langchain_google_genai import ChatGoogleGenerativeAI

model = ChatGoogleGenerativeAI(model=model)
model_with_tools = model.bind_tools(index.tools)  # Directly pass index.tools
```


`stores` also supports popular LLM packages that require special tool formats via `Index.format_tools`.

For example, with OpenAI:

```python{4}
completion = client.chat.completions.create(
    model=model,
    messages=messages,
    tools=index.format_tools("openai-chat-completions"),  # Use Index.format_tools
)
```

You can also run any of the tools using `Index.execute`.
The tool name follows the name listed in the index's `tools.toml`.

```python
index.execute("tools.get_top_stories", kwargs={"num": 10})

# Or by calling the function directly as a member of Index.tools
index.tools[0](num=10)
```
