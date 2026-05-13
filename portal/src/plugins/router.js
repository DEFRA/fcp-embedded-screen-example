// Route registration and static file serving plugin.
//
// This plugin registers @hapi/inert (static file serving) and then
// auto-registers all route handler files from src/routes/.
//
// The static file route serves Webpack-compiled assets (CSS, JS, fonts,
// images) from the .public/ directory at the /public/* URL path.

import path from 'node:path'
import Inert from '@hapi/inert'
import { config } from '../config/config.js'
import { health } from '../routes/health.js'
import { home } from '../routes/home.js'
import { business } from '../routes/business.js'
import { embeddedScreen } from '../routes/embedded-screen.js'

export const router = {
  plugin: {
    name: 'router',
    register: async (server) => {
      await server.register(Inert)

      // Serve Webpack-compiled static assets (CSS, JS, fonts, images)
      server.route({
        method: 'GET',
        path: '/public/{param*}',
        options: {
          auth: false
        },
        handler: {
          directory: {
            path: path.resolve(config.get('root'), '.public'),
            redirectToSlash: true
          }
        }
      })

      // Register application routes
      server.route([
        health,
        home,
        business,
        embeddedScreen
      ])
    }
  }
}
