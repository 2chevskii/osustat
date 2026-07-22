import { execFileSync } from 'node:child_process'

const tags = process.env.IMAGE_TAGS?.split(/\s+/).filter(Boolean) ?? []

if (tags.length === 0) {
  throw new Error('IMAGE_TAGS must include at least one Docker image tag')
}

const buildArgs = ['build']
for (const tag of tags) buildArgs.push('--tag', tag)
buildArgs.push('--file', 'packages/api/Dockerfile', '.')
execFileSync('docker', buildArgs, { stdio: 'inherit' })

for (const tag of tags) {
  execFileSync('docker', ['push', tag], { stdio: 'inherit' })
}
