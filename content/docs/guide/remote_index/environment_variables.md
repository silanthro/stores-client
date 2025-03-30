# Environment variables

Tools will often require credentials or other sensitive information, which are best supplied as environment variables.

## Passing environment variables to remote indexes

When initializing an `Index`, you can pass environment variables to specific remote indexes via the `env_var` parameter. This should be a dictionary where each key corresponds to an index name and each value is another dictionary comprising the environment variables.

These can then be accessed within the tool indexes like regular environment variables, using methods like `os.getenv` or `os.environ`.

```python
index = stores.Index(
    [
        "remote_index_1",
        "remote_index_2",
    ],
    env_var={
        "remote_index_1": {
            "env_var_1": ENV_VAR_1,
            "env_var_2": ENV_VAR_2,
        },
        "remote_index_2": {
            "env_var_3": ENV_VAR_3,
            "env_var_4": ENV_VAR_4,
        },
    },
)
```

## Important caveats

The above implementation helps to limit the sharing of sensitive environment variables between indexes.

However, it is important to remember that the tools are not executed within a sandbox. This means that an index can still access information such as a `.env` file using `dotenv.load_dotenv` or other similar methods.

We are looking at adding proper sandboxing capabilities on our roadmap via methods such as Docker containers. In the meantime, all published indexes in the Stores repository are public repositories. Please verify the code when handling any critically sensitive data.
