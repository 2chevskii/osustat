import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
import { Download, Loader2 } from 'lucide-vue-next'
import { useClipboard, useDebounceFn, useEventListener, useMouseInElement } from '@vueuse/core'
import CardTabs from '@/components/CardTabs/CardTabs.vue'
import UsernameTab from '@/parts/UsernameTab/UsernameTab.vue'
import UserIdTab from '@/parts/UserIdTab/UserIdTab.vue'
import { buildCardRequestUrl, getApiBase, IDENTIFIER_FALLBACK } from '@/composables/cardUrl'
import {
  createFormQueryString,
  DEFAULT_FORM_SETTINGS,
  parseFormStateFromSearch,
} from '@/composables/cardFormQuery'
import { requestCardResource } from '@/composables/cardRequest'

const apiBase = getApiBase(import.meta.env.VITE_API_URL)

/**
 * @param {unknown} error
 * @param {string} fallback
 */
function getErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback
}

export default {
  components: {
    CardTabs,
    UsernameTab,
    UserIdTab,
    Download,
    Loader2,
  },
  setup() {
    const activeTab = ref(DEFAULT_FORM_SETTINGS.tab)
    const username = ref(DEFAULT_FORM_SETTINGS.username)
    const userId = ref(DEFAULT_FORM_SETTINGS.userId)
    const selectedSize = ref(DEFAULT_FORM_SETTINGS.size)
    const cardSvgUrl = ref('')
    const isLoading = ref(false)
    const errorMessage = ref('')
    let previousBlobUrl = ''

    const initialFormSettings = parseFormStateFromSearch(
      typeof window === 'undefined' ? '' : window.location.search,
    )
    activeTab.value = initialFormSettings.tab
    username.value = initialFormSettings.username
    userId.value = initialFormSettings.userId
    selectedSize.value = initialFormSettings.size
    const activeIdentifier = computed(() =>
      activeTab.value === 'username' ? username.value.trim() : userId.value.trim(),
    )
    const requestIdentifierFallback = computed(
      () => IDENTIFIER_FALLBACK[activeTab.value === 'username' ? 'username' : 'id'],
    )
    const activeIdentifierType = computed(() =>
      activeTab.value === 'username' ? 'username' : 'id',
    )
    const requestUrl = computed(() => {
      const identifier = activeIdentifier.value || requestIdentifierFallback.value
      return buildCardRequestUrl(apiBase, {
        tab: activeTab.value,
        identifier,
        size: selectedSize.value,
      })
    })
    const previewSlotHeight = computed(() => (selectedSize.value === 'compact' ? 260 : 360))
    const hasRenderAttempt = ref(false)
    /** @type {import('vue').Ref<HTMLElement | null>} */
    const requestUrlRef = ref(null)
    /** @type {import('vue').Ref<HTMLElement | null>} */
    const requestUrlTooltipRef = ref(null)
    /** @type {import('vue').Ref<import('@floating-ui/vue').ReferenceElement | null>} */
    const requestUrlTooltipReference = ref(null)
    const isRequestUrlTooltipVisible = ref(false)
    const requestUrlTooltipText = ref('Click to copy URL')
    const requestUrlTooltipOriginX = ref('50%')
    const requestUrlTooltipOriginY = ref('50%')
    const requestUrlMouse = useMouseInElement(requestUrlRef)
    /** @type {ReturnType<typeof setTimeout> | null} */
    let requestUrlTooltipTimeout = null
    const isSyncingFromHistory = ref(false)
    let stopHistorySync = () => {}
    const { copy: copyToClipboard, isSupported: isClipboardSupported } = useClipboard()
    const { floatingStyles: requestUrlTooltipStyles, update: updateRequestUrlTooltip } =
      useFloating(requestUrlTooltipReference, requestUrlTooltipRef, {
        placement: 'top',
        strategy: 'fixed',
        middleware: [offset(6), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
      })
    function writeFormSettingsToQuery() {
      if (typeof window === 'undefined') return

      const queryString = createFormQueryString(
        {
          tab: activeTab.value,
          username: username.value,
          userId: userId.value,
          size: selectedSize.value,
        },
        window.location.search,
      )
      const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`
      window.history.replaceState(window.history.state, '', nextUrl)
    }
    function applyFormSettingsFromQuery() {
      const settings = parseFormStateFromSearch(window.location.search)
      isSyncingFromHistory.value = true
      activeTab.value = settings.tab
      username.value = settings.username
      userId.value = settings.userId
      selectedSize.value = settings.size
      isSyncingFromHistory.value = false
    }
    function onHistoryNavigate() {
      applyFormSettingsFromQuery()
    }
    function clearRenderedCard() {
      if (previousBlobUrl) URL.revokeObjectURL(previousBlobUrl)
      cardSvgUrl.value = ''
      previousBlobUrl = ''
    }
    /** @param {string} message */
    function handleError(message) {
      errorMessage.value = message
      clearRenderedCard()
    }
    async function renderCard() {
      handleError('')
      hasRenderAttempt.value = true
      isLoading.value = true
      try {
        const response = await requestCardResource(requestUrl.value, 'image/svg+xml')
        const svg = await response.text()
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        clearRenderedCard()
        previousBlobUrl = URL.createObjectURL(blob)
        cardSvgUrl.value = previousBlobUrl
      } catch (error) {
        handleError(getErrorMessage(error, 'Failed to render card'))
      } finally {
        isLoading.value = false
      }
    }
    async function copyRequestUrl() {
      try {
        if (!isClipboardSupported.value) throw new Error('Clipboard API is not supported')
        await copyToClipboard(requestUrl.value)
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
    /** @param {'png' | 'svg'} format */
    async function downloadCard(format) {
      const endpoint = requestUrl.value.replace(/\.svg$/, `.${format}`)

      try {
        const response = await requestCardResource(
          endpoint,
          format === 'png' ? 'image/png' : 'image/svg+xml',
        )
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const fileName = `osu-card-${activeIdentifierType.value}-${activeIdentifier.value || 'user'}-${selectedSize.value}.${format}`
        const anchor = document.createElement('a')
        anchor.href = blobUrl
        anchor.download = fileName
        anchor.rel = 'noreferrer'
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        URL.revokeObjectURL(blobUrl)
      } catch (error) {
        errorMessage.value = getErrorMessage(error, 'Unable to download card')
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
        Math.max(0, requestUrlMouse.elementX.value ?? 0),
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
    const scheduleCardRender = useDebounceFn(() => {
      hasRenderAttempt.value = true
      renderCard()
    }, 250)
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
        if (!isSyncingFromHistory.value) writeFormSettingsToQuery()
      },
      { immediate: true },
    )
    onMounted(() => {
      writeFormSettingsToQuery()
      if (typeof window === 'undefined') return
      stopHistorySync = useEventListener(window, 'popstate', onHistoryNavigate)
    })
    onBeforeUnmount(() => {
      if (requestUrlTooltipTimeout) clearTimeout(requestUrlTooltipTimeout)
      stopHistorySync()
    })
    return {
      activeTab,
      username,
      userId,
      selectedSize,
      cardSvgUrl,
      isLoading,
      errorMessage,
      requestUrl,
      previewSlotHeight,
      hasRenderAttempt,
      requestUrlRef,
      requestUrlTooltipRef,
      requestUrlTooltipStyles,
      isRequestUrlTooltipVisible,
      requestUrlTooltipText,
      requestUrlTooltipOriginX,
      requestUrlTooltipOriginY,
      copyRequestUrl,
      downloadCard,
      showRequestUrlTooltip,
      showRequestUrlTooltipFromMouse,
      hideRequestUrlTooltip,
      Loader2,
      Download,
    }
  },
}
