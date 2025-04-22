# Execute tools

In some cases, the LLM package you are using might handle the tool execution automatically.

But in other cases, the LLM model returns a tool call response that contains the tool name to execute, as well as the arguments. In such instances, use `Index.execute` to execute the tool.

## Executing tool calls

There are four ways to execute a tool call:

1. `Index.execute` (for sync)
2. `Index.aexecute` (for async)
3. `Index.stream_execute` (for streaming)
4. `Index.astream_execute` (for async streaming)

### 1. Index.execute

`Index.execute` takes the tool name and a dictionary comprising the arguments, and returns the output of the executed function.

**A note on async:** For now, regardless of whether the tool is an `async` function, `Index.execute` will run in a synchronous manner.

```python {10-14} [openai_example.py]
# Call the model
completion = client.chat.completions.create(
    model=model,
    messages=messages,
    tools=index.format_tools("openai-chat-completions"),
)

# Execute the tool call
tool_call = completion.choices[0].message.tool_calls[0]
result = index.execute(
    toolname=tool_call.function.name,
    kwargs=json.loads(tool_call.function.arguments),
)
print(result)
```

### 2. Index.aexecute

`Index.aexecute` is the async version of `Index.execute`.

Use `await Index.aexecute(...)` when calling from an async function to ensure non-blocking execution, regardless of whether the underlying tool is synchronous or asynchronous.

```python {11-15} [openai_example.py]
async def main():
    # Call the model asynchronously
    completion = await client.chat.completions.create(
        model=model,
        messages=messages,
        tools=index.format_tools("openai-chat-completions"),
    )

    # Execute the tool call asynchronously
    tool_call = completion.choices[0].message.tool_calls[0]
    result = await index.aexecute(
        toolname=tool_call.function.name,
        kwargs=json.loads(tool_call.function.arguments),
    )
    print(result)
```

### 3. Index.stream_execute

`Index.stream_execute` similarly takes the tool name and a dictionary comprising the arguments but returns a generator that yields the output of the executed function.

This is suitable for tools that stream their output, such as [the Basic Browser Use tool](/tools/silanthro/basic-browser-use). You can see an example in [this cookbook recipe](/docs/cookbook/browse-to-slack#streaming-browser-use-steps).

```python {10-15} [openai_example.py]
# Call the model
completion = client.chat.completions.create(
    model=model,
    messages=messages,
    tools=index.format_tools("openai-chat-completions"),
)

# Execute the tool call
tool_call = completion.choices[0].message.tool_calls[0]
for result in index.stream_execute(
    toolname=tool_call.function.name,
    kwargs=json.loads(tool_call.function.arguments),
):
    print(result)
```

### 4. Index.astream_execute

`Index.astream_execute` is the async version of `Index.stream_execute`.

Use `await Index.astream_execute(...)` when calling from an async function to ensure non-blocking execution, regardless of whether the underlying tool is synchronous or asynchronous.

```python {10-15} [openai_example.py]
async def main():
    # Call the model asynchronously
    completion = await client.chat.completions.create(
        model=model,
        messages=messages,
        tools=index.format_tools("openai-chat-completions"),
    )

    # Execute the tool call asynchronously
    tool_call = completion.choices[0].message.tool_calls[0]
    async for result in index.astream_execute(
        toolname=tool_call.function.name,
        kwargs=json.loads(tool_call.function.arguments),
    ):
        print(result)
```

## Calling the tool function directly

Alternatively, since `Index.tools` is a list of Callables, you can also run the functions directly.

```python
# Run the first tool function in the list
index.tools[0](*args, **kwargs)
```