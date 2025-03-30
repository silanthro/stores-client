import { h } from 'vue'

export default {
  setup(_props: any, { slots }: any) {
    if (!slots.default) return null
    const selected = ref(0)
    return () => [
      h('div', [
        h(
          'div',
          {
            class:
              'text-sm font-medium flex gap-4 border border-neutral-200 border-b-0',
          },
          slots.default().map((slot: any, i: number) =>
            h(
              'button',
              {
                class:
                  'px-4 py-2.5 display-block h-full border-b' +
                  (selected.value === i
                    ? ' border-black'
                    : 'border-transparent text-neutral-500'),
                onClick() {
                  selected.value = i
                },
              },
              [slot.props.filename || 'Untitled'],
            ),
          ),
        ),
        ...slots.default().map((slot: any, i: number) => {
          // Remove filename to since we are rendering this above
          slot.props.filename = undefined
          return i === selected.value ? h('div', slot) : h('div')
        }),
      ]),
    ]
  },
}
