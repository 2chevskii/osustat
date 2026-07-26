<script src="./CardForm.js"></script>

<template>
  <form class="card-form" @submit.prevent>
    <CardTabs v-model="activeTab">
      <UsernameTab v-model:value="username" v-model:size="selectedSize" />
      <UserIdTab v-model:value="userId" v-model:size="selectedSize" />
    </CardTabs>

    <div class="request-url-row">
      <p
        ref="requestUrlRef"
        class="card-url"
        tabindex="0"
        aria-label="Copy request URL"
        @click="copyRequestUrl"
        @mouseenter="showRequestUrlTooltipFromMouse"
        @mouseleave="hideRequestUrlTooltip"
        @focus="showRequestUrlTooltip"
        @blur="hideRequestUrlTooltip"
      >
        {{ requestUrl }}
      </p>

      <Transition name="request-tooltip">
        <div
          v-if="isRequestUrlTooltipVisible"
          ref="requestUrlTooltipRef"
          class="floating-tooltip"
          :style="{
            ...requestUrlTooltipStyles,
          }"
        >
          <span
            class="floating-tooltip-content"
            :style="{
              transformOrigin: `${requestUrlTooltipOriginX} ${requestUrlTooltipOriginY}`,
            }"
          >
            {{ requestUrlTooltipText }}
          </span>
        </div>
      </Transition>
    </div>

    <div v-if="hasRenderAttempt" class="preview-shell" :style="{ '--preview-slot-height': `${previewSlotHeight}px` }">
      <div v-if="isLoading" class="loading-state">
        <Loader2 class="loading-icon" :size="28" stroke-width="2.1" />
        <p class="status">Rendering card…</p>
      </div>
      <p v-else-if="errorMessage" class="status error">{{ errorMessage }}</p>
      <div v-else-if="cardSvgUrl" class="preview-wrapper">
        <div class="download-toolbar">
          <button class="download-btn" type="button" aria-label="Download card">
            <Download :size="16" stroke-width="2.1" />
          </button>
          <div class="download-options">
            <button type="button" class="download-option" @click="downloadCard('png')">PNG</button>
            <button type="button" class="download-option" @click="downloadCard('svg')">SVG</button>
          </div>
        </div>
        <img :src="cardSvgUrl" alt="Rendered card preview" class="preview" />
      </div>
      <div v-else class="preview-placeholder" />
    </div>
  </form>
</template>

<style src="./CardForm.css"></style>
