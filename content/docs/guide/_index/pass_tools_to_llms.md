# Pass tools to LLMs

Most LLM packages today support tool-calling in two main ways.

1. Pass a schema describing the tools, including any documentation and its parameter types
2. Pass a list of the tools as a `list[Callable]`

The `Index` class supports both of these methods.

## Passing a schema

Different LLM packages and providers require slightly different schema formats. This can be frustrating if you are intending to frequently switch between providers.

The `Index.format_tools` method provides a convenient way to comply with the different schema requirements for several providers. You do this by passing the provider via a string or a `stores.ProviderFormat` enum.

```python {6-8} [anthropic_example.py]
client = anthropic.Anthropic()
response = client.messages.create(
    model=model,
    messages=messages,
    tools=(
        # Both are equivalent
        index.format_tools("anthropic")
        or index.format_tools(ProviderFormat.ANTHROPIC)
    ),
)
```


Beyond handling simple argument types, the `Index.format_tools` method also helps to format more complex argument types, such as the function below.

```python [tool_with_complex_args.py]
class Animal(TypedDict):
    name: str
    num_legs: int

class Color(Enum):
    RED="red"
    GREEN="green"
    BLUE="blue"

def foo(animal: Animal, color: Color):
    """Lorem ipsum"""
    pass
```

The following shows how this function will be formatted for the different providers, highlighting the complex argument schemas.

::content-multi-code
```python {7-26} [Anthropic]
{
    "name": "foo",
    "description": "Lorem ipsum",
    "input_schema": {
        "type": "object",
        "properties": {
            "animal": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "",
                    },
                    "num_legs": {
                        "type": "integer",
                        "description": "",
                    },
                },
                "description": "",
                "required": ["name", "num_legs"],
            },
            "color": {
                "type": "string",
                "enum": ["red", "green", "blue"],
                "description": "",
            },
        },
        "required": ["animal", "color"],
    },
}
```
```python {7-28} [Google Gemini]
{
    "name": "foo",
    "parameters": {
        "type": "object",
        "description": "Lorem ipsum",
        "properties": {
            "animal": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "",
                    },
                    "num_legs": {
                        "type": "integer",
                        "description": "",
                    },
                },
                "description": "",
                "required": ["name", "num_legs"],
                "nullable": False,
            },
            "color": {
                "type": "string",
                "enum": ["red", "green", "blue"],
                "description": "",
                "nullable": False,
            },
        },
        "required": ["animal", "color"],
    },
}
```
```python {9-29} [OpenAI Chat Completions]
{
    "type": "function",
    "function": {
        "name": "foo",
        "description": "Lorem ipsum",
        "parameters": {
            "type": "object",
            "properties": {
                "animal": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "",
                        },
                        "num_legs": {
                            "type": "integer",
                            "description": "",
                        },
                    },
                    "description": "",
                    "required": ["name", "num_legs"],
                    "additionalProperties": False,
                },
                "color": {
                    "type": "string",
                    "enum": ["red", "green", "blue"],
                    "description": "",
                },
            },
            "required": ["animal", "color"],
            "additionalProperties": False,
        },
        "strict": True,
    },
}
```
```python {8-28} [OpenAI Responses]
{
    "type": "function",
    "name": "foo",
    "description": "Lorem ipsum",
    "parameters": {
        "type": "object",
        "properties": {
            "animal": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "",
                    },
                    "num_legs": {
                        "type": "integer",
                        "description": "",
                    },
                },
                "description": "",
                "required": ["name", "num_legs"],
                "additionalProperties": False,
            },
            "color": {
                "type": "string",
                "enum": ["red", "green", "blue"],
                "description": "",
            },
        },
        "required": ["animal", "color"],
        "additionalProperties": False,
    },
    "strict": True,
}
```
::

The following argument types are supported:
- Basic Python types including `str`, `int`, `float`, `bool`
- `dict`, including type arguments e.g. `dict[str, str]`
- `list`, including type arguments e.g. `list[str]`
- `Optional` and `Union`, including type arguments e.g. `Optional[str]`
- `Literal`, including listed values e.g. `Literal["foo", "bar"]`
- `TypedDict` classes, including attribute names and types
- `Enum` classes, including enum values

The following non-exhaustive list of argument types are **not** supported:
- Custom classes, including classes inherited from Pydantic's `BaseClass`
- Any class type whose argument includes an unsupported custom class e.g. `Optional[CustomClass]`

### Supported formats

1. [Anthropic Claude](https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview#specifying-tools) via `ProviderFormat.ANTHROPIC` or `"anthropic"`
2. [Google Gemini](https://ai.google.dev/gemini-api/docs/function-calling#function_declarations) via `ProviderFormat.GOOGLE_GEMINI` or `"google-gemini"`
3. [OpenAI Chat Completions](https://platform.openai.com/docs/guides/function-calling?api-mode=chat#defining-functions) via `ProviderFormat.OPENAI_CHAT` or `"openai-chat-completions"`
4. [OpenAI Responses](https://platform.openai.com/docs/guides/function-calling?api-mode=responses#defining-functions) via `ProviderFormat.OPENAI_RESPONSES` or `"openai-responses"`

**A note on invalid characters:** When loading tool indexes, `stores` includes the module name in the tool name. Since Anthropic and OpenAI's native APIs do not support the `.` character in tool names, we substitute this with `-` within `Index.format_tools` if the provider belongs to Anthropic or OpenAI. This is automatically resolved when we execute the tool in the next section.

```python
# For example the tool name
"graph.plot.plot_line"
# will be converted to
"graph-plot-plot_line"
# if the provider belongs to Anthropic or OpenAI
```

## Passing a list of tools

For packages that accept a list of Callables, use the `Index.tools` property, which is simply a list comprising all the loaded tool functions.

```python{3} [langgraph_example.py]
agent_executor = langgraph.prebuilt.create_react_agent(
    model=model,
    tools=index.tools,
)
```
