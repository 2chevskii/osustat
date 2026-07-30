import { defineComponent, onMounted, provide, reactive, watchEffect } from 'vue'

/** @typedef {{ id: string, displayName: string }} Tab */
/** @typedef {{ activeTabId: string | null, register: (id: string, displayName: string) => void }} TabsContext */

export default defineComponent({
  props: {
    modelValue: {
      type: String,
      default: null,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const tabs = reactive(/** @type {Tab[]} */ ([]))
    const context = reactive(
      /** @type {TabsContext} */ ({
        activeTabId: null,
        register(id, displayName) {
          if (tabs.some((tab) => tab.id === id)) return
          tabs.push({ id, displayName })
        },
      }),
    )

    provide('tabs_context', context)

    /** @param {string} tabId */
    function selectTab(tabId) {
      if (context.activeTabId === tabId) return
      context.activeTabId = tabId
      emit('update:modelValue', tabId)
    }

    /** @param {string} id */
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
        const firstTab = tabs[0]
        if (firstTab) selectTab(firstTab.id)
      }
    })

    onMounted(() => {
      if (!tabs.length) return

      if (props.modelValue && tabs.some((tab) => tab.id === props.modelValue)) {
        selectTab(props.modelValue)
        return
      }

      const firstTab = tabs[0]
      if (firstTab) selectTab(firstTab.id)
    })

    return {
      isActiveTab,
      selectTab,
      tabs,
    }
  },
})
