import dotenv from 'dotenv'
import Fastify from 'fastify'
import { App } from './app/index.mjs'

dotenv.config({ path: '.env.local' });

const app = new App({ osuClientId: process.env.OSU_CLIENTID, osuClientSecret: process.env.OSU_CLIENTSECRET })

await app.run()
