# Behind the scenes

One of the aims of `stores` is to provide a simple universal interface for tool-calling.

In order to achieve that, there are several decisions made "behind-the-scenes". This section describes some of these.

## Formatting valid tool names

Both Anthropic and OpenAI restrict tool names to strings that are compliant with the regex `^[a-zA-Z0-9_-]{1,64}$`.

When loading tool indexes, `stores` includes the module name in the tool name. Since `.` is an invalid character, we substitute this with `-` within `Index.format_tools` if the provider belongs to Anthropic or OpenAI.

When the LLM returns a tool call that includes a substituted tool name, this is resolved automatically via `Index.execute`. For example, running `index.execute("foo-bar")` will correctly retrieve the `foo.bar` tool.

## Tools with optional arguments

Google Gemini's [Automatic Function Calling](https://ai.google.dev/gemini-api/docs/function-calling#automatic_function_calling_python_only) feature allows developers to supply tools as a list of functions i.e. `list[Callable]`, instead of a schema. However, this does not handle certain functions, including functions that have non-`None` default argument values.

```python
"""
As of writing (March 2025), these functions trigger an error
in Automatic Function Calling
"""
def foo(bar="test"):
    pass

def foo(bar: str = "test"):
    pass

def foo(bar: Optional[str] = "test"):
    pass

# This function is fine
def foo(bar: Optional[str] = None):
    pass
```

In order to handle this, `stores` wraps all loaded tools in a function wrapper. The wrapper helps convert all non-`None` default argument values to `None` and injects the actual default value at runtime.

```python
# Original function
def foo(bar="test"):
    pass

# Simulated wrapped function (not actual implementation)
def wrapped_foo(bar: Optional[str] = None):
    # Inject default value if None is passed
    if bar == None: bar = "test"
    return foo(bar)
```

One pitfall of this implementation is the following edge case, where `None` is a valid argument value but it is not the default. 

```python
def foo(bar: None|str = "test"):
    if bar == None:
        # Do something special
        return
    else:
        # Do something else
        return
```

In this case, the wrapper will erroneously replace `None` with `"test"` at runtime.

If you have any suggestions on a better solution, send us a message!

## Loading remote indexes

In order to make it easy for developers to share and use tools, tool indexes are installed with separate virtual environments. This helps to simplify dependency management and reduce dependency conflicts between different tool indexes.

Learn more about how remote indexes are installed in [Remote indexes in detail](/docs/reference/remote_index/remote_indexes_in_detail).
