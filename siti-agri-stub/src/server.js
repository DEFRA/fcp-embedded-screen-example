// Hapi server setup for the Siti Agri stub.
//
// This server represents THREE separate pieces of SitiAgri infrastructure:
//
// 1. capd-externaldb-facade — the backend API that returns SitiAgri
//    identifiers for a given FRN. In production, this is a Java Dropwizard
//    service that queries the SitiAgri Oracle database.
//
// 2. SSO Bridge — the authentication gateway that performs server-side SSO
//    into SitiAgri and redirects to the embedded screen. In production,
//    this is a separate component behind the reverse proxy.
//
// 3. Agrigate UI — the actual embedded screen HTML. In production, this
//    is SitiAgri's own Angular-based UI rendered after the SSO handshake.
//
// CORS is enabled because in a development setup without nginx, the portal
// might call this service directly from a different origin. With nginx as
// the gateway (default), CORS is not needed (same-origin), but we keep it
// for flexibility.
//
// FRAME-ANCESTORS HEADER:
// The SSO bridge and Agrigate screen responses must include a CSP
// frame-ancestors header to tell browsers they're allowed to be framed.
// Without this, browsers may block the iframe. In the nginx setup (same-origin),
// the default 'self' would suffice, but in cross-origin deployments the
// portal's origin must be listed explicitly.

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Hapi from '@hapi/hapi'
import Inert from '@hapi/inert'
import Vision from '@hapi/vision'
import nunjucks from 'nunjucks'
import Joi from 'joi'
import { config } from './config/config.js'
import { health } from './routes/health.js'
import { embeddedScreensApi } from './routes/embedded-screens-api.js'
import { ssoBridge } from './routes/sso-bridge.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export async function createServer () {
  const server = Hapi.server({
    host: config.get('host'),
    port: config.get('port'),
    routes: {
      validate: {
        options: {
          abortEarly: false
        }
      },
      // CORS enabled for development flexibility (direct portal → stub calls
      // without nginx). In the default Docker setup, nginx makes this same-origin
      // so CORS headers are not actually needed.
      cors: {
        origin: ['*'],
        credentials: true
      }
    },
    router: {
      stripTrailingSlash: true
    }
  })

  server.validator(Joi)

  await server.register([Inert, Vision])

  // Configure Nunjucks for rendering the embedded screen views.
  // These intentionally DON'T use GOV.UK Frontend — they represent
  // third-party SitiAgri screens with different styling.
  const nunjucksEnvironment = nunjucks.configure(
    path.resolve(dirname, 'views'),
    {
      autoescape: true,
      trimBlocks: true,
      lstripBlocks: true
    }
  )

  server.views({
    engines: {
      njk: {
        compile (src, options) {
          const template = nunjucks.compile(src, options.environment)
          return (ctx) => template.render(ctx)
        }
      }
    },
    compileOptions: {
      environment: nunjucksEnvironment
    },
    relativeTo: dirname,
    path: 'views'
  })

  // Register all routes
  server.route([
    health,
    embeddedScreensApi,
    ssoBridge
  ])

  return server
}
