# Remote indexes in detail

This section describes what happens when a script runs a remote index, including how remote indexes are installed and how their tools are loaded and executed.

## Installation

When a remote index is initialized for the very first time, a few steps are carried out to install the index.

1. Clone the relevant repository into a cache folder (`./.tools` by default).
2. Create a dedicated virtual environment at `<cache_folder>/<remote_index_name/.venv`
3. Install any dependencies into the virtual environment (venv)

These steps are skipped in future runs.

## Loading the tools

Then, the `tools.toml` file is parsed to retrieve the list of declared tools.

Since the remote index may have different dependencies from the main script, the tools cannot be naively imported into the main frame. Instead, the tools are imported and executed via a subprocess call that uses the dedicated remote index venv.

For each tool, we create a pseudo-tool function that wraps the subprocess call. This wrapper has the same signature as the original tool, including the function name, argument types, docstring, whether it is async etc. The pseudo-tool function is then inserted into `Index.tools`.

A caveat of this implementation is that certain argument types may not be supported.

Specifically, the following argument types are supported and preserved in the wrapper:
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

## Execution

Finally, when a remote index's tool is executed via `Index.execute`, the pseudo-tool function is called. This triggers the subprocess call and executes the actual function within the venv, with the required dependencies and any passed environment variables.

Importantly, any resulting output is encoded as a JSON string and decoded at the end of the subprocess call. **This means that the tool must always return a JSON-serializable output.**

Since the pseudo-tool function is also exposed via `Index.tools`, something like `index.tools[0](kwargs)` will also run the underlying tool within the venv in the same manner.
