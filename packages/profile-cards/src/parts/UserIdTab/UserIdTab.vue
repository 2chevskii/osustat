<script src="./UserIdTab.js"></script>

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
        @input="updateValue"
      />
    </label>

    <SizeSelector
      id-prefix="userid"
      :model-value="size"
      @update:model-value="$emit('update:size', $event)"
    />
  </CardTab>
</template>

<style scoped src="./UserIdTab.css"></style>
