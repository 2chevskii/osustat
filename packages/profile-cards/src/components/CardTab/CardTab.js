import { defineComponent, inject } from 'vue'

export default defineComponent({
  props: {
    id: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const tabsContext =
      /** @type {{ activeTabId: string | null, register: (id: string, displayName: string) => void }} */ (
        inject('tabs_context')
      )

    tabsContext.register(props.id, props.displayName)

    return {
      tabsContext,
    }
  },
})
