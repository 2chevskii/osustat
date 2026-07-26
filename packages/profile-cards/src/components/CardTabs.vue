<script src="./CardTabs.js"></script>

<template>
  <div class="card-tabs">
    <div class="tab-selector-group">
      <template v-for="tab in tabs" :key="tab.id">
        <label :for="tab.id" class="tab-selector">
          <input type="radio" :id="tab.id" :name="'card-tab'" :checked="isActiveTab(tab.id)" @change="selectTab(tab.id)" />
          {{ tab.displayName }}
        </label>
      </template>
    </div>
    <div class="tab-content">
      <slot />
    </div>
  </div>
</template>

<style scoped src="./CardTabs.css"></style>
