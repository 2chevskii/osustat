export {}

declare global {
  namespace NodeJS {
    type MODE = 'production' | 'development'
  }
}
