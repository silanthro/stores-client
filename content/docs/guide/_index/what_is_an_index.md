# What is an Index

```python
from stores import Index
```

At its heart, an `Index` is a collection of tools and can be initialized with any of the following:
- A tool index published in the Stores repository
- A tool index in a public GitHub repository
- A local tool index
- A list of Python functions
- Any combination of the above

An `Index` automatically generates the correct function schema for different LLM providers. Different tool indexes are also loaded in separate virtual environments. This makes it easy to run tools with conflicting dependencies, while handling separated environment variables and credentials.

## Using a published tool index

You can browse the available indexes in our growing repository. If you are unable to find a tool that fits your requirements, consider [contributing](/docs/contribute)!

Any of the published indexes in the Stores repository can be loaded by its name. If a specific version is desired, you can use the format `<index_name>:<version>`.

```python
index = Index([
    "silanthro/hackernews",
    "silanthro/send-gmail:0.3.0",  # You can also load multiple indexes at once
])
```

## Using a public GitHub repository

In order to use a public GitHub repository, the repository needs to have a `tools.toml` file that declares which functions are available to the LLM.

In addition, any required dependencies should be declared via any of the following files:
- `requirements.txt`
- `setup.py`
- `pyproject.toml`

Assuming that is all available, you can load a GitHub repository the same way you load a published tool index. In fact, all published tool indexes have a corresponding public GitHub repository.

This will clone the latest commit on the default branch. To use a specific branch or commit, use the format `<github_account>/<repo_name>:<branch_or_commit>`.

```python
index = Index([
    "github_account/repo_name",
    "foo/bar:branch_name",  # Specify a specific branch
    "hello/world:da43e6f2",  # Specify a specific commit
])
```

## Using a local tool index

A local directory with Python functions can also be loaded, which can be helpful to take advantage of utilities like `Index.format_tools`.

The local directory should include a `tools.toml` file in its root.

```python
index = Index(["path/to/local/folder"])
```

## Using functions

Since tools are really just functions, an Index can also be created from a list of Python functions.

```python
def foo_function():
    pass

def bar_function():
    pass

index = Index([foo_function, bar_function])
```

## Combining tool indexes

Finally, any of the above methods can be combined, which will load all of the functions into a single list.

```python
index = Index([
    "silanthro/hackernews",
    "github_account/repo_name",
    "path/to/local/folder",
    foo_function,
])
```