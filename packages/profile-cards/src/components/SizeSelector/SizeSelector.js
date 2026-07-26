import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      required: true,
      /** @param {unknown} value */
      validator: (value) => typeof value === 'string' && ['full', 'compact'].includes(value),
    },
    idPrefix: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(_props, { emit }) {
    /** @type {{ value: 'full' | 'compact', label: string }[]} */
    const options = [
      { value: 'full', label: 'Full' },
      { value: 'compact', label: 'Compact' },
    ]
    /** @param {'full' | 'compact'} value */
    function updateSize(value) {
      emit('update:modelValue', value)
    }
    return { options, updateSize }
  },
})
