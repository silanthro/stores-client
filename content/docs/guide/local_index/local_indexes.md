# Local indexes

A local directory with Python functions can also be loaded, which can be helpful to take advantage of utilities like `Index.format_tools`.

In order for `stores` to load the correct tools, the local directory should include a [`tools.toml`](/docs/reference/the_tools_toml_file) file in its root.

## Loading a local index

A local index can be loaded using the path to the local directory containing the index and the `tools.toml` file.

```python
index = Index(["path/to/local/folder"])
```

Alternatively, `stores` provides a dedicated `LocalIndex` class for loading a local index. This can be useful if a  separate [virtual environment](/docs/reference/local_index/managing_dependencies) is desired.


```python
from stores.indexes import LocalIndex

index = LocalIndex(
    index_folder="path/to/local/folder",
    # create_venv=True,  # Uncomment this to create a venv
)
```

## Sample local index structure

Your local index directory should look something like this.

```txt
-| module_a/
---| submodule.py
-| module_b.py
-| tools.toml
```

Given the directory above, we might have the following `tools.toml` config.

```toml [tools.toml]
[index]

description = "My local tool index"

# Only these functions will be available in the loaded index
tools = [
    "module_a.submodule.a_tool",
    "module_b.another_tool",
]
```
