const form = document.querySelector('#card-form')
const identifier = document.querySelector('#identifier')
const identifierLabel = document.querySelector('label[for="identifier"]')
const preview = document.querySelector('#card-preview')
const emptyState = document.querySelector('#empty-state')
const urlDisplay = document.querySelector('#card-url')
const copyButton = document.querySelector('#copy-url')
const errorMessage = document.querySelector('#error-message')

function selectedIdentifierType() {
  return document.querySelector('input[name="identifier-type"]:checked').value
}

function cardUrl() {
  const value = identifier.value.trim()
  const type = selectedIdentifierType()
  const size = document.querySelector('#size').value
  const format = document.querySelector('#format').value
  const base = document.querySelector('#api-base').value.trim().replace(/\/+$/, '')

  if (!value || !base) return null
  return `${base}/players/${type}/${encodeURIComponent(value)}/cards/${size}.${format}`
}

function updateIdentifierField() {
  const isId = selectedIdentifierType() === 'id'
  identifierLabel.textContent = isId ? 'User ID' : 'Username'
  identifier.placeholder = isId ? '2' : 'peppy'
  identifier.inputMode = isId ? 'numeric' : 'text'
}

document.querySelectorAll('input[name="identifier-type"]').forEach(input => {
  input.addEventListener('change', updateIdentifierField)
})

form.addEventListener('submit', event => {
  event.preventDefault()
  errorMessage.hidden = true

  const url = cardUrl()
  if (!url) return

  urlDisplay.textContent = url
  copyButton.disabled = false
  emptyState.hidden = true
  preview.hidden = false
  preview.src = url
})

preview.addEventListener('error', () => {
  errorMessage.textContent = 'The card could not be rendered. Check the player and API address, then try again.'
  errorMessage.hidden = false
})

preview.addEventListener('load', () => {
  errorMessage.hidden = true
})

copyButton.addEventListener('click', async () => {
  const url = cardUrl()
  if (!url) return

  try {
    await navigator.clipboard.writeText(url)
    copyButton.textContent = 'Copied'
    setTimeout(() => { copyButton.textContent = 'Copy URL' }, 1600)
  } catch {
    errorMessage.textContent = 'Unable to copy the URL. Select it above and copy it manually.'
    errorMessage.hidden = false
  }
})
