import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDebounceFn, useEventListener, useResizeObserver } from '@vueuse/core'
import CardForm from '../components/CardForm/CardForm.vue'

const MAX_FORM_HEIGHT = 900
const FORM_SCALE_BIAS = 0.9

export default {
  components: {
    CardForm,
  },
  setup() {
    const scaleHost = ref(null)
    const scaleShell = ref(null)
    const formScale = ref(1)
    let stopHostResize = () => {}
    let stopShellResize = () => {}
    let stopWindowResize = () => {}
    function recalculateScale() {
      if (!scaleHost.value) return
      const shellHeight = scaleShell.value?.clientHeight ?? window.innerHeight
      const availableHeight = Math.min(shellHeight, MAX_FORM_HEIGHT)
      const measuredHeight = scaleHost.value.offsetHeight
      if (measuredHeight <= 0 || availableHeight <= 0) {
        formScale.value = 1
        return
      }
      const nextScale = Math.min(1, (availableHeight / measuredHeight) * FORM_SCALE_BIAS, FORM_SCALE_BIAS)
      formScale.value = nextScale
    }
    const scheduleScaleRecalculation = useDebounceFn(recalculateScale, 45)
    onMounted(async () => {
      await nextTick()
      recalculateScale()

      stopHostResize = useResizeObserver(scaleHost, scheduleScaleRecalculation)
      stopShellResize = useResizeObserver(scaleShell, scheduleScaleRecalculation)
      if (typeof window !== 'undefined') {
        stopWindowResize = useEventListener(window, 'resize', scheduleScaleRecalculation)
      }
    })
    onBeforeUnmount(() => {
      stopHostResize()
      stopShellResize()
      stopWindowResize()
    })
    return {
      scaleHost,
      scaleShell,
      formScale,
    }
  },
}
