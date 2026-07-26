<script src="./CardTab.js"></script>

<template>
  <div v-if="tabsContext.activeTabId === id" class="container">
    <slot />
  </div>
</template>

<style scoped src="./CardTab.css"></style>
