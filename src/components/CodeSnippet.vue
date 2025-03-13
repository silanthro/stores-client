<template>
  <pre class="text-sm">
from litellm import completion
import stores

request = "Search for latest AI news"

index = stores.Index()

messages = [{
  "role": "user",
  "content": index.format_query(request),
}]

response = completion(
    model="gemini/gemini-2.0-flash-001",
    messages=messages,
).choices[0].message.content

output = index.parse_and_execute(response)

toolcall = stores.llm_parse_json(response)</pre
  >
</template>
