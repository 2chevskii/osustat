<script src="./UsernameTab.js"></script>

<template>
  <CardTab id="username" display-name="Username">
    <label for="username-input" class="label">
      <span class="label-text">Username</span>
      <input
        id="username-input"
        type="text"
        class="input"
        placeholder="peppy"
        :value="value"
        @input="$emit('update:value', $event.target.value)"
      />
    </label>

    <SizeSelector id-prefix="username" :model-value="size" @update:model-value="$emit('update:size', $event)" />
  </CardTab>
</template>

<style scoped src="./UsernameTab.css"></style>
