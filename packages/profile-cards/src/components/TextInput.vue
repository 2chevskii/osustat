<script setup>
defineProps(['id'])
</script>

<template>
  <label for="">
    <span>
      <slot />
    </span>
    <input type="text" />
  </label>
</template>

<style scoped>
label {
  span {
    color: darkmagenta;
    font-weight: 600;
  }

  input {
  }
}
</style>
