export default {
  props: {
    modelValue: {
      type: String,
      required: true,
      validator: (value) => ['full', 'compact'].includes(value),
    },
    idPrefix: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const options = [
      { value: 'full', label: 'Full' },
      { value: 'compact', label: 'Compact' },
    ]
    function updateSize(value) {
      emit('update:modelValue', value)
    }
    return { options, updateSize }
  },
}
