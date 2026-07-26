<script src="./SizeSelector.js"></script>

<template>
  <div class="size-group">
    <span class="size-group-title">Size</span>
    <label v-for="option in options" :key="option.value" class="size-option">
      <input
        :id="`${idPrefix}-size-${option.value}`"
        :name="`${idPrefix}-size`"
        type="radio"
        :value="option.value"
        :checked="modelValue === option.value"
        @change="updateSize(option.value)"
      />
      <span>{{ option.label }}</span>
    </label>
  </div>
</template>

<style scoped src="./SizeSelector.css"></style>
