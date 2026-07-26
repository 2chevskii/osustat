<script setup>
import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue'
import CardForm from './components/CardForm.vue'

const scaleHost = ref(null)
const scaleShell = ref(null)
const formScale = ref(1)
const MAX_FORM_HEIGHT = 900
const FORM_SCALE_BIAS = 0.9
let resizeObserver
let rafId = null

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

function scheduleScaleRecalculation() {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    recalculateScale()
    rafId = null
  })
}

onMounted(async () => {
  await nextTick()
  recalculateScale()
  resizeObserver = new ResizeObserver(() => scheduleScaleRecalculation())
  if (scaleHost.value) resizeObserver.observe(scaleHost.value)
  window.addEventListener('resize', scheduleScaleRecalculation)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  window.removeEventListener('resize', scheduleScaleRecalculation)
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div ref="scaleShell" class="profile-cards-shell">
    <div ref="scaleHost" class="card-form-scale" :style="{ '--form-scale': formScale }">
      <CardForm />
    </div>
  </div>
</template>

<style>
.profile-cards-shell {
  height: 100vh;
  width: 100%;
  display: grid;
  place-items: start center;
  padding: clamp(16px, 6vh, 52px) 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.card-form-scale {
  transform: scale(var(--form-scale));
  transform-origin: top center;
  width: fit-content;
  transition: transform 150ms ease;
  will-change: transform;
}
</style>
