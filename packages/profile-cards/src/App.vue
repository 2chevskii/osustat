<script src="./App.js"></script>

<template>
  <div ref="scaleShell" class="profile-cards-shell">
    <div ref="scaleHost" class="card-form-scale" :style="{ '--form-scale': formScale }">
      <CardForm />
    </div>
  </div>
</template>

<style src="./App.css"></style>
