# Remote indexes

A remote index refers to a tool index that is either
- Published in the Stores repository, or
- A valid GitHub repository containing a `tools.toml` file

When these indexes are loaded for the very first time, `stores` will clone the relevant repository locally in a cache folder (`./.tools` by default). Any required dependencies will also be installed in a virtual environment created for each index.

## Loading a published Stores tool index

You can browse the available indexes in our growing repository. If you are unable to find a tool that fits your requirements, consider [contributing](/docs/contribute)!

Any of the published indexes in the Stores repository can be loaded by its name. If a specific version is desired, you can use the format `<index_name>:<version>`.

```python
index = Index([
    "silanthro/hackernews",
    "silanthro/send-gmail:0.3.0",
])
```

## Loading a valid GitHub repo

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
