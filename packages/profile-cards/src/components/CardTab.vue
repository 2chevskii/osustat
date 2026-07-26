<script setup>
import { inject } from 'vue'

const props = defineProps(['id', 'displayName'])

const tabsContext = inject('tabs_context')

tabsContext.register(props.id, props.displayName)
</script>

<template>
  <div v-if="tabsContext.activeTabId === id" class="container">
    <slot />
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
  width: 100%;
  min-height: 136px;
  box-sizing: border-box;
}
</style>
