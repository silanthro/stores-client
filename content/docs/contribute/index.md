# Contribute a tool index

A tool index is essentially a list of Python functions, along with a `tools.toml` file in your folder or repository declaring what functions are accessible to the LLM agent.

In addition, any required dependencies should be declared via any of the following files:
- `requirements.txt`
- `setup.py`
- `pyproject.toml`

## tools.toml

The `tools.toml` file is used by the `stores` library to deduce which functions are available for the LLM agent, and subsequently included in formatted function schemas passed to providers like OpenAI, Anthropic, or Google.

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

We are also looking at supporting declaration of required environment variables in the future.

## Testing your tool index

Before submitting your tool index, we encourage you to make sure that it loads in the way you expect.

You can do this by creating a Python script that loads the index via its local folder.

```python [test_index.py]
from stores import Index

index = Index(["local/path/to/index"])
# This should print the list of loaded functions
print(index.tools)

# You can also try running some of the tools using Index.execute
index.execute("fn_name", kwargs={"foo": "bar"})
# Or by calling the function directly
index.tools[0](foo="bar")
```

Alternatively, if you have already uploaded your index as a GitHub repository, you can try loading the index via the repository. This will also make sure that any requirements are correctly listed in `requirements.txt`, `setup.py`, or `pyproject.toml`.

```python [test_github_index.py]
from stores import Index

index = Index(["githubAccount/repoName"])
# This should print the list of loaded functions
print(index.tools)
```

## Uploading your tool index

Finally, when you are ready to upload it to the Stores repository, follow these instructions.

1. Log in via your GitHub account at the top right
2. Click on your username again and click on "Add tools" or click on [this](/add_tools)
3. Select your repository
4. Select a specific branch or commit, specify a version, then click on "Add index"

Thank you for your contribution to Stores!
