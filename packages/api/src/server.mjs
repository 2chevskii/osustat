import { App } from './app/app.mjs'
import { AppConfiguration } from './app/configuration/index.mjs'

const configuration = new AppConfiguration(
  AppConfiguration.getEnvironment(process.env),
)
await configuration.load(process.env)

const app = new App(configuration)

await app.run()
