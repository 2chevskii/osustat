<script setup>
import { onMounted, provide, reactive, watch } from 'vue'

const tabs = reactive([])
const props = defineProps({ modelValue: { type: String, default: null } })
const emit = defineEmits(['update:modelValue'])

const context = reactive({
  register(id, displayName) {
    if (tabs.find((x) => x.id === id) !== undefined) throw new Error(`Duplicate tab with id ${id}`)

    tabs.push({ id, displayName })
    console.log('Registered tab:', { id, displayName })
  },
  activeTabId: null,
})

provide('tabs_context', context)

function selectTab(id) {
  context.activeTabId = id
  emit('update:modelValue', id)
}

function isActiveTab(id) {
  return context.activeTabId === id
}

onMounted(() => {
  if (props.modelValue && tabs.some((tab) => tab.id === props.modelValue)) {
    selectTab(props.modelValue)
    return
  }
  if (tabs.length !== 0) selectTab(tabs[0].id)
})

watch(
  () => props.modelValue,
  (nextTabId) => {
    if (nextTabId === null || nextTabId === undefined) return
    if (tabs.some((tab) => tab.id === nextTabId)) context.activeTabId = nextTabId
  },
)
</script>

<template>
  <div class="card-tabs">
    <div class="tab-selector-group">
      <template v-for="{ id, displayName } in tabs" :key="id">
        <label :for="id" class="tab-selector" :class="isActiveTab(id) ? ['active'] : []">
          <input type="radio" :id="id" :checked="isActiveTab(id)" @click="selectTab(id)" />
          {{ displayName }}
        </label>
      </template>
    </div>
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card-tabs {
  width: 100%;
  box-sizing: border-box;
}

.tab-selector-group {
  background-color: #141824;
  width: 100%;
  border-radius: 10px 10px 0 0;
  display: grid;
  grid-template-rows: 1;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border: 1px solid var(--osu-border);
  box-sizing: border-box;
  margin: 0;
}

.tab-selector {
  background: #1a202c;
  padding: 11px 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
  font-weight: 700;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 3px solid transparent;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  text-align: center;
  color: var(--osu-text-soft);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    color 160ms ease;

  &:hover {
    background-color: #202736;
    color: var(--osu-text);
  }

  &:not(:last-child) {
    border-top-left-radius: 10px;
  }

  &:not(:first-child) {
    border-top-right-radius: 10px;
  }
}

.tab-selector > input {
  display: none;
}

.tab-selector:has(input[type='radio']:checked) {
  border-top-color: var(--osu-pink);
  border-bottom-color: transparent;
  background-color: #242a35;
  color: var(--osu-text);
}

.tab-content {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  background-color: var(--osu-surface);
  border: 1px solid var(--osu-border);
  border-top: none;
  border-radius: 0 0 10px 10px;
}
</style>
