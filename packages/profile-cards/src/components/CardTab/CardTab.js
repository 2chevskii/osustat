import { inject } from 'vue'

export default {
  props: ['id', 'displayName'],
  setup(props) {
    const tabsContext = inject('tabs_context')

    tabsContext.register(props.id, props.displayName)

    return {
      tabsContext,
    }
  },
}
