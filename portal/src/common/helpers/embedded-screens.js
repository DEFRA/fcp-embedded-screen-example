// Embedded screen API client.
//
// This module handles the backend-to-backend HTTP call from the portal
// to the Siti Agri facade API. In the real system, this would call
// capd-externaldb-facade's GET /embedded-screens/params/{frn} endpoint,
// which queries the SitiAgri Oracle database for the identifiers needed
// to construct the SSO bridge URL.
//
// WHY BACKEND-TO-BACKEND?
// The portal server makes this call (not the browser) because:
// 1. The facade API may require authentication (OAuth2 Bearer token)
// 2. The response contains sensitive internal identifiers
// 3. The portal needs the data to construct the iframe src URL
//    before rendering the page
//
// In Docker Compose, the portal reaches the stub via Docker's internal
// DNS: http://siti-agri-stub:3002. This is NOT the same as the nginx
// gateway URL (localhost:3000) that users access.

import Wreck from '@hapi/wreck'
import { config } from '../../config/config.js'

/**
 * Fetch embedded screen parameters for a given FRN from the facade API.
 *
 * @param {string} frn - Firm Reference Number (10-digit identifier)
 * @returns {Promise<{soggettoId: number, dossierId: number, applicationModelId: number, profileModelId: number}>}
 */
export async function getEmbeddedScreenParams (frn) {
  const baseUrl = config.get('sitiAgriApiHost')
  const url = `${baseUrl}/api/v1/embedded-screens/params/${frn}`

  // @hapi/wreck is the HTTP client used throughout the Hapi ecosystem.
  // It's a lightweight alternative to node-fetch or axios.
  const { payload } = await Wreck.get(url, {
    json: true,
    timeout: 10000 // 10 second timeout for the backend-to-backend call
  })

  return payload.data
}
