<template>
  <Combobox v-model="model" v-slot="{ open }">
    <div class="relative">
      <div class="border flex items-center">
        <ComboboxInput
          ref="input"
          class="grow px-4 py-2"
          :displayValue="(o: any) => o[labelKey]"
          @change="query = $event.target.value"
          @focus="handleInputFocus"
          @blur="openOptions = false" />
        <ComboboxButton class="p-1">
          <ChevronUpDownIcon
            class="h-5 w-5 text-neutral-600"
            aria-hidden="true" />
        </ComboboxButton>
      </div>
      <div v-show="open || openOptions">
        <ComboboxOptions static class="absolute border w-full bg-white shadow">
          <div
            v-if="filteredOptions.length === 0 && query !== ''"
            class="relative cursor-default select-none px-4 py-2 text-neutral-500">
            Nothing found.
          </div>
          <ComboboxOption
            v-for="(option, i) in filteredOptions"
            :key="i"
            :value="option"
            v-slot="{ selected, active }"
            @click="openOptions = false">
            <button
              class="w-full text-left px-4 py-2"
              :class="[active ? 'bg-neutral-100' : '']">
              {{ option[labelKey] }}
            </button>
          </ComboboxOption>
        </ComboboxOptions>
      </div>
    </div>
  </Combobox>
</template>
<script setup lang="ts">
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue'
import { ChevronUpDownIcon } from '@heroicons/vue/24/outline'
import { computed, ref, watch } from 'vue'

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
const openOptions = ref(false)
const input = ref<any>(undefined)
watch(openOptions, (openOptions) => {
  if (!openOptions && input.value) {
    input.value.el.blur()
  }
})
const query = ref('')
function handleInputFocus() {
  openOptions.value = true
  query.value = ''
}

const filteredOptions = computed(() =>
  query.value === ''
    ? props.options
    : props.options.filter((o) => {
        return o[props.labelKey]
          .toLowerCase()
          .includes(query.value.toLowerCase())
      }),
)
const model = defineModel<any>({ required: true })
watch(model, () => {
  openOptions.value = false
})
</script>
