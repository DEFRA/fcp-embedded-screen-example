// Convict configuration schema for the portal.
//
// Convict validates environment variables against a schema at startup,
// catching misconfiguration early rather than at runtime.
//
// KEY CONFIGURATION:
//
// - sitiAgriApiHost: the base URL for the Siti Agri facade API, used for
//   BACKEND-TO-BACKEND calls. In Docker Compose this resolves via Docker DNS
//   (http://siti-agri-stub:3002). The portal server fetches screen parameters
//   from this API before rendering the page.
//
// - sitiAgriGatewayUrl: the CAPD gateway URL that the USER'S BROWSER uses to
//   reach Siti Agri content. This is a different network path from the Docker
//   DNS route above — it's the origin the browser sees for the iframe content.
//   In production, this would be the CAPD gateway domain (e.g.
//   https://api.ruralpayments.service.gov.uk). In this demo it's
//   http://localhost:3019.
//
//   This URL is used to:
//   1. Construct the absolute iframe src URL (cross-origin to the portal)
//   2. Pass to the template so client-side JS knows which origin to expect
//      for postMessage events from the Siti Agri iframe
//
// - frameSrc: additional origins for the CSP frame-src directive. In the
//   two-gateway setup, this MUST include the CAPD gateway origin so the
//   browser allows iframes to load content from a different origin.

import convict from 'convict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isProduction = process.env.NODE_ENV === 'production'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const config = convict({
  host: {
    doc: 'The host to bind to',
    format: String,
    default: '0.0.0.0',
    env: 'HOST'
  },
  port: {
    doc: 'The port to bind to',
    format: 'port',
    default: 3001,
    env: 'PORT'
  },
  serviceName: {
    doc: 'Name of the service shown in the GOV.UK header',
    format: String,
    default: 'Farming Service Portal',
    env: 'SERVICE_NAME'
  },
  root: {
    doc: 'Project root directory',
    format: String,
    default: path.resolve(dirname, '../..')
  },
  assetPath: {
    doc: 'URL prefix for static assets served by Hapi/Inert',
    format: String,
    default: '/public'
  },
  isProduction: {
    doc: 'Whether running in production mode',
    format: Boolean,
    default: isProduction
  },
  staticCacheTimeout: {
    doc: 'Cache timeout for static assets (ms)',
    format: 'nat',
    default: isProduction ? 15 * 60 * 1000 : 0
  },
  nunjucks: {
    watch: {
      doc: 'Reload templates when they change (development only)',
      format: Boolean,
      default: !isProduction
    },
    noCache: {
      doc: 'Disable template caching (development only)',
      format: Boolean,
      default: !isProduction
    }
  },
  sitiAgriApiHost: {
    doc: 'Base URL for the Siti Agri facade API (backend-to-backend via Docker DNS)',
    format: String,
    default: 'http://siti-agri-stub:3002',
    env: 'SITI_AGRI_API_HOST'
  },
  sitiAgriGatewayUrl: {
    doc: 'CAPD gateway URL the browser uses to reach Siti Agri content (cross-origin iframe src)',
    format: String,
    default: 'http://localhost:3019',
    env: 'SITI_AGRI_GATEWAY_URL'
  },
  frameSrc: {
    doc: 'Additional origins allowed in CSP frame-src (comma-separated). Must include the CAPD gateway origin.',
    format: String,
    default: '',
    env: 'FRAME_SRC'
  }
})

config.validate({ allowed: 'warn' })

export { config }
