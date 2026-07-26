import CardTab from '@/components/CardTab/CardTab.vue'
import SizeSelector from '@/components/SizeSelector/SizeSelector.vue'

export default {
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
}
