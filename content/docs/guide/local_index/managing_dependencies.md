# Managing dependencies

Unlike in remote indexes, `stores` does not automatically create virtual environments for local indexes. But this might be desired, especially if there are conflicting dependencies between the local index and your main project.

In such cases, use the `LocalIndex` class and set `create_venv=True` when initializing the index.

```python
from stores.indexes import LocalIndex

index = LocalIndex(
    index_folder="path/to/local/folder",
    create_venv=True,  # False by default
    # env_var={},  # Optionally, pass any required environment variables
)
```

The first time this is run, it will create a virtual environment in `path/to/local/folder/.venv` if its not already created.

It will also proceed to install dependencies if any of the following are found in the local index folder.
- `requirements.txt`
- `setup.py`
- `pyproject.toml`

`LocalIndex` works the same way as `Index`. You can access the list of tools via the `LocalIndex.tools` property. You can also use the `LocalIndex.format_tools` method to output tool schemas.

The implementation details of the virtual environment here is similar to [the implementation in remote indexes](/docs/reference/remote_index/remote_indexes_in_detail). 