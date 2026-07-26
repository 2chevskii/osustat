import CardTab from '@/components/CardTab/CardTab.vue'
import SizeSelector from '@/components/SizeSelector/SizeSelector.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  components: {
    CardTab,
    SizeSelector,
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      default: 'full',
    },
  },
  emits: ['update:value', 'update:size'],
  setup(_props, { emit }) {
    /** @param {Event} event */
    function updateValue(event) {
      const target = event.target
      if (!(target instanceof HTMLInputElement)) return
      emit('update:value', target.value)
    }

    return { updateValue }
  },
})
