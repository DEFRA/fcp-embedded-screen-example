// Content Security Policy (CSP) using Blankie.
//
// CSP is a browser security mechanism that restricts which resources
// (scripts, styles, images, etc.) the page can load.
//
// CRITICAL FOR EMBEDDED SCREENS — CROSS-ORIGIN:
//
// The `frameSrc` directive controls which origins can be loaded in iframes.
// In the two-gateway architecture, the SFD portal (CDP gateway) embeds
// iframes from the Siti Agri CAPD gateway — a different origin.
// The CAPD gateway origin MUST be in frame-src or the browser blocks the
// iframe entirely.
//
// Configuration (set via FRAME_SRC environment variable):
//   Development: FRAME_SRC=http://localhost:3019
//   Production:  FRAME_SRC=https://api.ruralpayments.service.gov.uk
//
// The resulting CSP header on portal responses:
//   Content-Security-Policy: frame-src 'self' http://localhost:3019;
//
// The `frameAncestors` directive is the INVERSE — it controls which
// origins can embed THIS page in an iframe. We set it to 'self' to
// prevent clickjacking (no external site can iframe our portal pages).
//
// generateNonces: true
//   Blankie generates a unique nonce (random value) for every response.
//   Only <script> tags with a matching nonce attribute will execute.
//   This is more secure than 'unsafe-inline'.

import Blankie from 'blankie'
import { config } from '../config/config.js'

// Parse additional frame-src origins from config.
// In the two-gateway setup, FRAME_SRC must contain the CAPD gateway origin
// (e.g. http://localhost:3019) to allow cross-origin iframe loading.
const additionalFrameSrc = config.get('frameSrc')
  ? config.get('frameSrc').split(',').map(s => s.trim())
  : []

export const contentSecurityPolicy = {
  plugin: Blankie,
  options: {
    fontSrc: ['self'],
    imgSrc: ['self'],
    scriptSrc: [
      'self',
      // Hash for GOV.UK Frontend inline progressive enhancement script.
      // This is a known hash published by the Design System team.
      "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='"
    ],
    styleSrc: ['self'],
    connectSrc: ['self'],
    // frameSrc controls which origins can be loaded in <iframe> elements.
    // This is THE critical directive for embedded screens.
    frameSrc: ['self', ...additionalFrameSrc],
    // frameAncestors prevents OTHER sites from embedding our portal in iframes.
    frameAncestors: ['self'],
    formAction: ['self'],
    manifestSrc: ['self'],
    generateNonces: true
  }
}
