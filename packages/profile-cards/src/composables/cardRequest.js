const REQUEST_ERROR_LIMIT = 200

function formatRequestError(response) {
  return response
    .text()
    .then((detail) => detail.slice(0, REQUEST_ERROR_LIMIT))
    .catch(() => '')
    .then((detail) => {
      const suffix = detail ? `: ${detail}` : ''
      return `Request failed (${response.status})${suffix}`
    })
}

export async function requestCardResource(url, acceptHeader) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: acceptHeader },
  })

  if (!response.ok) {
    const detail = await formatRequestError(response)
    throw new Error(detail)
  }

  return response
}
