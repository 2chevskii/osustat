import { defineConfig } from 'vite'

console.log('Process env', process.env)

export default defineConfig({
  server: {
    port: 3000,
    // proxy: {
    //   '/api': 'http://localhost:3000/api',
    // },
  },
})
