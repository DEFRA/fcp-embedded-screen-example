// Global template context — variables available in every Nunjucks template.
//
// This function is called by @hapi/vision for every view response.
// It merges global variables with route-specific context.
//
// KEY VARIABLES:
//
// - serviceName: shown in the GOV.UK header and page titles
// - getAssetPath(): resolves Webpack asset names to their cache-busted
//   filenames. In production, Webpack outputs files like
//   application.a1b2c3d.min.js — the manifest maps the original name
//   to the hashed name so templates don't need to know the hash.

import path from 'node:path'
import { readFileSync } from 'node:fs'
import { config } from '../config.js'

const assetPath = config.get('assetPath')
const manifestPath = path.join(
  config.get('root'),
  '.public/assets-manifest.json'
)

let webpackManifest

export function context (request) {
  const ctx = request.response.source?.context || {}

  if (!webpackManifest) {
    try {
      webpackManifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    } catch {
      // Manifest may not exist during tests or before first build
    }
  }

  return {
    ...ctx,
    assetPath: `${assetPath}/assets`,
    serviceName: config.get('serviceName'),
    serviceUrl: '/',
    getAssetPath (asset) {
      const webpackAssetPath = webpackManifest?.[asset]
      return `${assetPath}/${webpackAssetPath ?? asset}`
    }
  }
}
