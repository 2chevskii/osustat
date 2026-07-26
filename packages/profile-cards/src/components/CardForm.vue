<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import CardTabs from './CardTabs.vue'
import UsernameTab from '@/parts/UsernameTab.vue'
import UserIdTab from '@/parts/UserIdTab.vue'
import { Download, Loader2 } from 'lucide-vue-next'
import { useMouseInElement } from '@vueuse/core'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'

const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001').replace(/\/$/, '')
const DEFAULT_TAB = 'username'
const DEFAULT_SIZE = 'full'
const VALID_TABS = new Set(['username', 'userid'])
const VALID_SIZES = new Set(['compact', 'full'])

const activeTab = ref(DEFAULT_TAB)
const username = ref('')
const userId = ref('')
const selectedSize = ref(DEFAULT_SIZE)
const cardSvgUrl = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
let previousBlobUrl = ''

const activeIdentifier = computed(() =>
  activeTab.value === 'username' ? username.value.trim() : userId.value.trim(),
)
const requestIdentifierFallback = computed(() => (activeTab.value === 'username' ? 'peppy' : '2'))
const activeIdentifierType = computed(() => (activeTab.value === 'username' ? 'username' : 'id'))
const requestUrl = computed(() => {
  const identifier = encodeURIComponent(activeIdentifier.value || requestIdentifierFallback.value)
  return `${apiBase}/api/players/${activeIdentifierType.value}/${identifier}/cards/${selectedSize.value}.svg`
})
const previewSlotHeight = computed(() => (selectedSize.value === 'compact' ? 260 : 360))
const hasRenderAttempt = ref(false)
let renderDebounceTimer = null

const requestUrlRef = ref(null)
const requestUrlTooltipRef = ref(null)
const requestUrlTooltipReference = ref(null)
const isRequestUrlTooltipVisible = ref(false)
const requestUrlTooltipText = ref('Click to copy URL')
const requestUrlTooltipOriginX = ref('50%')
const requestUrlTooltipOriginY = ref('50%')
const requestUrlMouse = useMouseInElement(requestUrlRef)
let requestUrlTooltipTimeout = null
let isSyncingFromHistory = false

const { floatingStyles: requestUrlTooltipStyles, update: updateRequestUrlTooltip } = useFloating(
  requestUrlTooltipReference,
  requestUrlTooltipRef,
  {
    placement: 'top',
    strategy: 'fixed',
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  },
)

function readFormSettingsFromQuery() {
  if (typeof window === 'undefined') {
    return {
      activeTab: DEFAULT_TAB,
      username: '',
      userId: '',
      selectedSize: DEFAULT_SIZE,
    }
  }

  const query = new URLSearchParams(window.location.search)

  const tab = query.get('tab')
  const size = query.get('size')
  const usernameFromQuery = query.get('username')
  const userIdFromQuery = query.get('userId')

  return {
    activeTab: tab && VALID_TABS.has(tab) ? tab : DEFAULT_TAB,
    username: usernameFromQuery ?? '',
    userId: userIdFromQuery ?? '',
    selectedSize: size && VALID_SIZES.has(size) ? size : DEFAULT_SIZE,
  }
}

const initialFormSettings = readFormSettingsFromQuery()

activeTab.value = initialFormSettings.activeTab
username.value = initialFormSettings.username
userId.value = initialFormSettings.userId
selectedSize.value = initialFormSettings.selectedSize

function writeFormSettingsToQuery() {
  if (typeof window === 'undefined') return

  const query = new URLSearchParams(window.location.search)

  if (activeTab.value === DEFAULT_TAB) {
    query.delete('tab')
  } else {
    query.set('tab', activeTab.value)
  }

  if (!username.value) {
    query.delete('username')
  } else {
    query.set('username', username.value)
  }

  if (!userId.value) {
    query.delete('userId')
  } else {
    query.set('userId', userId.value)
  }

  if (selectedSize.value === DEFAULT_SIZE) {
    query.delete('size')
  } else {
    query.set('size', selectedSize.value)
  }

  const queryString = query.toString()
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`
  window.history.replaceState(window.history.state, '', nextUrl)
}

function applyFormSettingsFromQuery() {
  const settings = readFormSettingsFromQuery()
  isSyncingFromHistory = true

  activeTab.value = settings.activeTab
  username.value = settings.username
  userId.value = settings.userId
  selectedSize.value = settings.selectedSize

  isSyncingFromHistory = false
}

function onHistoryNavigate() {
  applyFormSettingsFromQuery()
}

function clearRenderedCard() {
  if (previousBlobUrl) URL.revokeObjectURL(previousBlobUrl)
  cardSvgUrl.value = ''
  previousBlobUrl = ''
}

function handleError(message) {
  errorMessage.value = message
  clearRenderedCard()
}

async function renderCard() {
  handleError('')
  hasRenderAttempt.value = true
  isLoading.value = true

  try {
    const endpoint = requestUrl.value
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'image/svg+xml' },
    })

    if (!response.ok) {
      let detail = ''
      try {
        detail = (await response.text()).slice(0, 200)
      } catch {
        detail = ''
      }
      throw new Error(detail || `Request failed (${response.status})`)
    }

    const svg = await response.text()
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    clearRenderedCard()
    previousBlobUrl = URL.createObjectURL(blob)
    cardSvgUrl.value = previousBlobUrl
  } catch (error) {
    handleError(error?.message || 'Failed to render card')
  } finally {
    isLoading.value = false
  }
}

async function copyRequestUrl() {
  try {
    await navigator.clipboard.writeText(requestUrl.value)
    requestUrlTooltipText.value = 'Copied!'
    isRequestUrlTooltipVisible.value = true
    requestUrlTooltipReference.value = requestUrlRef.value
    if (requestUrlRef.value) {
      const requestUrlRect = requestUrlRef.value.getBoundingClientRect()
      requestUrlTooltipOriginY.value = `${requestUrlRect.height / 2}px`
    }

    if (requestUrlTooltipTimeout) clearTimeout(requestUrlTooltipTimeout)
    requestUrlTooltipTimeout = setTimeout(() => {
      requestUrlTooltipText.value = 'Click to copy URL'
    }, 1600)
    updateRequestUrlTooltip()
  } catch {
    errorMessage.value = 'Unable to copy URL. Select it and copy it manually.'
  }
}

async function downloadCard(format) {
  const endpoint = requestUrl.value.replace(/\.svg$/, `.${format}`)

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: format === 'png' ? 'image/png' : 'image/svg+xml',
      },
    })

    if (!response.ok) {
      let detail = ''
      try {
        detail = (await response.text()).slice(0, 200)
      } catch {
        detail = ''
      }
      throw new Error(detail || `Download failed (${response.status})`)
    }

    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    const fileName = `osu-card-${activeIdentifierType.value}-${activeIdentifier.value || 'user'}-${
      selectedSize.value
    }.${format}`
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = fileName
    anchor.rel = 'noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(blobUrl)
  } catch (error) {
    errorMessage.value = error?.message || 'Unable to download card'
  }
}

function showRequestUrlTooltip() {
  if (requestUrlTooltipTimeout) clearTimeout(requestUrlTooltipTimeout)
  requestUrlTooltipReference.value = requestUrlRef.value
  requestUrlTooltipOriginX.value = '50%'
  requestUrlTooltipOriginY.value = '50%'

  if (requestUrlRef.value) {
    const requestUrlRect = requestUrlRef.value.getBoundingClientRect()
    requestUrlTooltipOriginY.value = `${requestUrlRect.height / 2}px`
  }

  isRequestUrlTooltipVisible.value = true
  updateRequestUrlTooltip()
}

function syncMouseTooltipPosition() {
  if (!requestUrlRef.value) return

  const requestUrlRect = requestUrlRef.value.getBoundingClientRect()
  const clientX = requestUrlMouse.x.value ?? requestUrlRect.left
  const clientY = requestUrlMouse.y.value ?? requestUrlRect.top
  const boundedElementX = Math.min(
    Math.max(0, (requestUrlMouse.elementX.value ?? 0)),
    Math.max(0, requestUrlRect.width - 1),
  )
  requestUrlTooltipReference.value = {
    getBoundingClientRect: () => ({
      width: 0,
      height: 0,
      x: clientX,
      y: clientY,
      top: clientY,
      right: clientX,
      bottom: clientY,
      left: clientX,
    }),
    contextElement: requestUrlRef.value,
  }

  requestUrlTooltipOriginX.value = `${boundedElementX}px`
  requestUrlTooltipOriginY.value = `${requestUrlRect.height / 2}px`

  if (isRequestUrlTooltipVisible.value) {
    updateRequestUrlTooltip()
  }
}

function showRequestUrlTooltipFromMouse() {
  isRequestUrlTooltipVisible.value = true
  syncMouseTooltipPosition()
  updateRequestUrlTooltip()
}

function hideRequestUrlTooltip() {
  isRequestUrlTooltipVisible.value = false
}

function scheduleCardRender() {
  hasRenderAttempt.value = true

  if (renderDebounceTimer) clearTimeout(renderDebounceTimer)
  renderDebounceTimer = setTimeout(() => {
    renderCard()
  }, 250)
}

watch(
  [requestUrlMouse.x, requestUrlMouse.y],
  () => {
    syncMouseTooltipPosition()
  },
  { flush: 'post' },
)

watch(
  [activeTab, username, userId, selectedSize],
  () => {
    scheduleCardRender()
    if (!isSyncingFromHistory) writeFormSettingsToQuery()
  },
  { immediate: true },
)

onMounted(() => {
  writeFormSettingsToQuery()
  window.addEventListener('popstate', onHistoryNavigate)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', onHistoryNavigate)
})
</script>

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

<style>
.card-form {
  width: min(640px, 95vw);
  margin: 0 auto;
  box-sizing: border-box;
  background: var(--osu-surface);
  border: 1px solid var(--osu-border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--osu-shadow);
  position: relative;
}

.status {
  margin: 0;
  min-height: 1.2rem;
  font-size: 0.75rem;
  color: var(--osu-text-soft);
  text-align: center;
}

.status.error {
  color: #ff7ca2;
}

.preview-shell {
  margin-top: 12px;
  min-height: var(--preview-slot-height);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--osu-text-soft);
}

.loading-icon {
  color: var(--osu-pink);
  animation: spin 850ms linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.request-url-row {
  position: relative;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--osu-border);
  background: var(--osu-surface-subtle);
  color: var(--osu-text);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.card-url {
  margin: 0;
  font-size: 0.72rem;
  font-family: 'Source Code Pro', 'SFMono-Regular', monospace;
  line-height: 1.3;
  color: #fff;
  max-width: 100%;
  overflow-wrap: anywhere;
  cursor: pointer;
  text-decoration: underline solid rgba(255, 255, 255, 0.45);
  text-underline-offset: 3px;
  user-select: none;
}

.floating-tooltip {
  position: absolute;
  z-index: 20;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(34, 39, 52, 0.95);
  color: #fff;
  font-size: 0.72rem;
  line-height: 1.1;
  border: 1px solid rgba(255, 102, 170, 0.3);
  pointer-events: none;
  white-space: nowrap;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.request-tooltip-enter-active,
.request-tooltip-leave-active {
  transition: opacity 140ms ease;
}

.request-tooltip-enter-active .floating-tooltip-content,
.request-tooltip-leave-active .floating-tooltip-content {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.request-tooltip-enter-from,
.request-tooltip-leave-to {
  opacity: 0;
}

.request-tooltip-enter-from .floating-tooltip-content,
.request-tooltip-leave-to .floating-tooltip-content {
  opacity: 0;
  transform: translateY(6px) scaleX(0.5);
}

.request-tooltip-enter-to,
.request-tooltip-leave-from {
  opacity: 1;
}

.request-tooltip-enter-to .floating-tooltip-content,
.request-tooltip-leave-from .floating-tooltip-content {
  opacity: 1;
  transform: translateY(0) scaleX(1);
}

.floating-tooltip-content {
  display: inline-block;
  color: #eff2ff;
}

.preview-wrapper {
  width: 100%;
  border: 1px solid var(--osu-border);
  border-radius: 12px;
  padding: 12px;
  background: #141923;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.download-toolbar {
  --download-item-size: 34px;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: flex;
  align-items: center;
  width: var(--download-item-size);
  height: var(--download-item-size);
  overflow: hidden;
  border: 1px solid rgba(255, 102, 170, 0.35);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(36, 36, 47, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #fff;
  transition: width 220ms ease-in-out;
}

.download-btn {
  display: grid;
  place-items: center;
  width: var(--download-item-size);
  height: var(--download-item-size);
  border: none;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  padding: 0;
  color: #fff;
  background: transparent;
  transition: background-color 160ms ease;
}

.download-options {
  display: flex;
  opacity: 0;
  pointer-events: none;
  max-width: 0;
  overflow: hidden;
  transition:
    opacity 140ms ease-in-out,
    max-width 220ms ease-in-out;
}

.download-toolbar:hover .download-options,
.download-toolbar:focus-within .download-options {
  opacity: 1;
  pointer-events: auto;
  max-width: calc(var(--download-item-size) * 2);
}

.download-option {
  border: none;
  border-radius: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(36, 36, 47, 0.2);
  color: #fff;
  box-sizing: border-box;
  width: var(--download-item-size);
  height: var(--download-item-size);
  min-width: var(--download-item-size);
  padding: 0 0.4rem;
  transition: background-color 120ms ease;
}

.download-option:hover,
.download-option:focus-visible {
  background: rgba(255, 255, 255, 0.12);
}

.download-toolbar:hover .download-btn,
.download-toolbar:focus-within .download-btn {
  background: transparent;
}

.download-toolbar:hover,
.download-toolbar:focus-within {
  width: calc(var(--download-item-size) * 3);
}

.preview {
  max-width: 100%;
  height: auto;
  background: transparent;
  width: 100%;
  border-radius: 6px;
}
</style>
