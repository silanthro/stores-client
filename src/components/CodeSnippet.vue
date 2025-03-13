<template>
  <div class="w-full h-full overflow-auto border p-10 relative">
    <div class="absolute top-6 right-6">
      <CopyButton :copy="code" />
    </div>
    <pre class="text-sm">{{ code }}</pre>
  </div>
</template>
<script setup lang="ts">
import CopyButton from '@/components/elements/CopyButton.vue'

const code = `from litellm import completion
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

toolcall = stores.llm_parse_json(response)`
</script>
