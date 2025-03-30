# Execute tools

In some cases, the LLM package you are using might handle the tool execution automatically.

But in other cases, the LLM model returns a tool call response that contains the tool name to execute, as well as the arguments. In such instances, use `Index.execute` to execute the tool.

## Calling `Index.execute`

`Index.execute` takes the tool name and a dictionary comprising the arguments, and returns the output of the executed function.

**A note on async:** For now, regardless of whether the tool is an `async` function, `Index.execute` will run in a synchronous manner.

```python {10-13} [openai_example.py]
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
```

## Calling the tool function directly

Alternatively, since `Index.tools` is a list of Callables, you can also run the functions directly.

```python
# Run the first tool function in the list
index.tools[0](*args, **kwargs)
```