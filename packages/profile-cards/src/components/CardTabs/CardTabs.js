import { onMounted, provide, reactive, watchEffect } from 'vue'

export default {
  props: {
    modelValue: {
      type: String,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const tabs = reactive([])
    const context = reactive({
      activeTabId: null,
      register(id, displayName) {
        if (tabs.some((tab) => tab.id === id)) return
        tabs.push({ id, displayName })
      },
    })

    provide('tabs_context', context)

    function selectTab(tabId) {
      if (context.activeTabId === tabId) return
      context.activeTabId = tabId
      emit('update:modelValue', tabId)
    }

    function isActiveTab(id) {
      return context.activeTabId === id
    }

    watchEffect(() => {
      if (!tabs.length) return

      if (props.modelValue && tabs.some((tab) => tab.id === props.modelValue)) {
        selectTab(props.modelValue)
        return
      }

      if (!context.activeTabId || !tabs.some((tab) => tab.id === context.activeTabId)) {
        selectTab(tabs[0].id)
      }
    })

    onMounted(() => {
      if (!tabs.length) return

      if (props.modelValue && tabs.some((tab) => tab.id === props.modelValue)) {
        selectTab(props.modelValue)
        return
      }

      selectTab(tabs[0].id)
    })

    return {
      isActiveTab,
      selectTab,
      tabs,
    }
  },
}
