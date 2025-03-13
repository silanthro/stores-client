<template>
  <Listbox v-model="model">
    <div class="relative">
      <ListboxButton>
        <div class="border flex items-center">
          <div class="grow px-4 py-2">
            {{ model[props.labelKey] }}
          </div>
          <div class="p-1">
            <ChevronUpDownIcon
              class="h-5 w-5 text-neutral-600"
              aria-hidden="true" />
          </div>
        </div>
      </ListboxButton>
      <ListboxOptions class="absolute border w-full bg-white shadow">
        <ListboxOption
          v-for="(option, i) in props.options"
          :key="i"
          :value="option"
          v-slot="{ active }">
          <button
            class="w-full text-left px-4 py-2"
            :class="[active ? 'bg-neutral-100' : '']">
            {{ option[props.labelKey] }}
          </button>
        </ListboxOption>
      </ListboxOptions>
    </div>
  </Listbox>
</template>
<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'
import { ChevronUpDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  options: {
    type: Array<any>,
    default: [],
  },
  labelKey: {
    type: String,
    default: 'label',
  },
})
const model = defineModel<any>({ required: true })
</script>
