<script setup>
import CardTab from '@/components/CardTab.vue'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'full',
  },
})

const emit = defineEmits(['update:value', 'update:size'])
</script>

<template>
  <CardTab id="userid" display-name="User ID">
    <label for="userid-input" class="label">
      <span class="label-text">User ID</span>
      <input
        id="userid-input"
        type="number"
        class="input"
        placeholder="2"
        :value="value"
        @input="$emit('update:value', $event.target.value)"
      />
    </label>

    <div class="size-group">
      <span class="size-group-title">Size</span>
      <label class="size-option">
        <input
          id="userid-size-full"
          name="userid-size"
          type="radio"
          value="full"
          :checked="size === 'full'"
          @change="$emit('update:size', 'full')"
        />
        <span>Full</span>
      </label>
      <label class="size-option">
        <input
          id="userid-size-compact"
          name="userid-size"
          type="radio"
          value="compact"
          :checked="size === 'compact'"
          @change="$emit('update:size', 'compact')"
        />
        <span>Compact</span>
      </label>
    </div>
  </CardTab>
</template>

<style scoped>
.label {
  display: flex;
  flex-flow: column nowrap;
  gap: 4px;
}

.label-text {
  display: block;
  color: var(--osu-text-soft);
  font-size: 0.95rem;
  line-height: 1.2;
}

.input {
  display: block;
  width: 100%;
  background-color: var(--osu-bg-1);
  border-radius: 10px;
  border: 1px solid var(--osu-border);
  font-size: 0.95rem;
  appearance: textfield;
  padding: 10px 12px;
  color: var(--osu-text);
  box-sizing: border-box;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease;

  &:focus {
    outline: none;
    border-color: var(--osu-pink);
    background-color: #232a37;
    box-shadow: 0 0 0 3px var(--osu-ring);
  }
}

.size-group {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  align-items: center;
}

.size-group-title {
  grid-column: 1 / -1;
  color: var(--osu-text-soft);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.size-option {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
  border: 1px solid var(--osu-border);
  border-radius: 10px;
  padding: 10px;
  color: var(--osu-text);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  min-height: 42px;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease;
  justify-content: center;
}

.size-option:has(input:checked) {
  background: #ff6fb0;
  border-color: var(--osu-pink);
  color: #fff;
}

.size-option:hover {
  border-color: var(--osu-pink);
  background-color: rgba(255, 102, 170, 0.08);
}

.size-option > input {
  display: none;
}
</style>
