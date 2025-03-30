# The tools.toml file

Every published index in the Stores repository contains a `tools.toml` config file that declares which functions are available to the LLM as tools.

## A sample config

```toml [tools.toml]
[index]

# An optional description summarizing this index
description = "Lorem ipsum"

# A list of tools identified by module and function name, similar to how
# you might import these functions in a Python script
tools = [
    "foo.bar",
    "hello.world",
]
```

Assuming the config file above, the loaded index will contain the two functions declared. 

```python
print(index.tools)
# [<function foo.bar at 0x7fbf4a54ce50>, <function hello.world at 0x7fbf4a54cee0>]
```

## A note on tool names

For consistency, the loaded tools have `__name__` attributes identical to their declared names in the config file. The same names are used when running `Index.execute`.

```python
index.execute("foo.bar", kwargs)
```

When using `stores` you may discover that the following also works, where the `.` character is substituted with `-`.

```python
index.execute("foo-bar", kwargs)
```

This is because some providers, including Anthropic and OpenAI, do not support the `.` character in the tool name. When formatting the tool schema for these providers via `Index.format_tools`, we automatic substitute invalid characters.

```python [anthropic_example.py]
response = client.messages.create(
    model=model,
    messages=messages,
    # Index.format_tools replaces tool name "foo.bar" with "foo-bar"
    tools=index.format_tools("anthropic"),
)

# The LLM might want to call "foo-bar"
tool_call = response.content[-1]
# Index.execute accepts "foo-bar" as well, so we do not need to undo the substitution
result = index.execute(tool_call.name, tool_call.input)
```