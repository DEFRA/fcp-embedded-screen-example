// Convict configuration schema for the Siti Agri stub.
//
// This stub combines three separate SitiAgri infrastructure components
// into one service for local development simplicity:
// - The capd-externaldb-facade API
// - The SSO Bridge
// - The Siti Agri embedded screen UI

import convict from 'convict'

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3002,
    env: 'PORT'
  },
  host: {
    doc: 'The host to bind.',
    format: String,
    default: '0.0.0.0',
    env: 'HOST'
  },
  portalOrigin: {
    doc: 'CDP gateway origin of the SFD portal — used in frame-ancestors CSP header. ' +
         'Must match the origin the user\'s browser sees for the portal (the CDP gateway, ' +
         'not the portal\'s internal port). In production: https://your-sfd-domain.gov.uk',
    format: String,
    default: 'http://localhost:3000',
    env: 'SFD_PORTAL_ORIGIN'
  }
})

config.validate({ allowed: 'strict' })

export { config }
