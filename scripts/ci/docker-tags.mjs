import { appendFileSync } from 'node:fs'

const imageName = process.env.IMAGE_NAME
const shortSha = process.env.GITHUB_SHA?.slice(0, 7)
const eventName = process.env.GITHUB_EVENT_NAME

if (!imageName || !shortSha || !eventName) {
  throw new Error('IMAGE_NAME, GITHUB_SHA, and GITHUB_EVENT_NAME must be set')
}

const tags = [`${imageName}:${shortSha}`]

const prNumber = process.env.PR_NUMBER

if (prNumber) {
  tags.push(`${imageName}:${prNumber}-${shortSha}`)
} else if (eventName === 'push') {
  const branchName = process.env.GITHUB_REF_NAME
  if (branchName === 'master' || branchName === 'develop') {
    tags.push(`${imageName}:${branchName}`)
  }
}

const output = process.env.GITHUB_OUTPUT
if (output) {
  appendFileSync(output, `tags<<EOF\n${tags.join('\n')}\nEOF\n`)
}

console.log(tags.join('\n'))
