// Embedded screen route — THE KEY ROUTE in this demo.
//
// This route demonstrates the full embedded screen flow in the TWO-GATEWAY
// architecture where the SFD portal (CDP) and Siti Agri (CAPD) are on
// different gateways, making the iframe relationship genuinely cross-origin.
//
// 1. User navigates to /embedded-screen/{screenType}
// 2. Portal calls the Siti Agri facade API (backend-to-backend) to get
//    the SitiAgri identifiers needed to construct the SSO bridge URL
// 3. Portal constructs the SSO bridge URL as an ABSOLUTE URL pointing to
//    the CAPD gateway — a different origin from the portal itself
// 4. Portal renders a page containing an <iframe> with the CAPD gateway
//    URL as its src attribute
// 5. The browser requests the iframe content cross-origin from the CAPD
//    gateway (localhost:3019), which proxies to siti-agri-stub
// 6. The SSO bridge authenticates and renders the embedded screen
//
// CROSS-ORIGIN CONSEQUENCES:
// Because the iframe src is on a different origin (CAPD gateway) than the
// page (CDP gateway), three security mechanisms must be configured:
//
//   1. Portal CSP frame-src must whitelist the CAPD gateway origin:
//      Content-Security-Policy: frame-src 'self' http://localhost:3019
//      (configured via FRAME_SRC env var)
//
//   2. Siti Agri responses must set frame-ancestors allowing the CDP gateway:
//      Content-Security-Policy: frame-ancestors 'self' http://localhost:3000
//      (configured via SFD_PORTAL_ORIGIN env var in siti-agri-stub)
//
//   3. postMessage events from the iframe come from a different origin,
//      so the portal JS must validate against the CAPD gateway origin
//      (not window.location.origin). Passed to the template as ssoBridgeOrigin.
//
// SECURITY CONSIDERATIONS:
// - The SSO bridge URL is constructed SERVER-SIDE. The browser never
//   sees the raw facade API response or the construction logic.
// - Sensitive identifiers (callerId, soggettoId) are passed as query
//   parameters. In production, consider POST or a token exchange.

import { getAuthenticatedUser } from '../common/helpers/auth.js'
import { getEmbeddedScreenParams } from '../common/helpers/embedded-screens.js'
import { config } from '../config/config.js'

// Map of screen type keys to SitiAgri application identifiers.
// These must match the values configured in SitiAgri's SSO bridge.
const SCREEN_TYPE_MAP = {
  viewEntitlements: {
    application: 'ent_view',
    title: 'View entitlements'
  },
  applyNewBpsApplication: {
    application: 'apps_list',
    title: 'BPS applications'
  },
  viewLandUse: {
    application: 'landuse_edit',
    title: 'Land use'
  }
}

export const embeddedScreen = {
  method: 'GET',
  path: '/embedded-screen/{screenType}',
  handler: async (request, h) => {
    const { screenType } = request.params

    // Validate the screen type is one we know about
    const screenConfig = SCREEN_TYPE_MAP[screenType]
    if (!screenConfig) {
      return h.response('Unknown screen type').code(404)
    }

    // Get the authenticated user's identity and organisation context.
    // See portal/src/common/helpers/auth.js for the callerId assumption.
    const { callerId, organisationId, frn } = getAuthenticatedUser(request)

    // STEP 1: Call the facade API to get SitiAgri identifiers.
    //
    // In the real system, this calls capd-externaldb-facade which queries
    // the SitiAgri Oracle database. The response contains four identifiers
    // that SitiAgri needs to render the correct screen for this organisation:
    // - soggettoId: the SitiAgri internal ID for the organisation
    // - dossierId: the organisation's dossier (file/case) ID
    // - applicationModelId: used for BPS application screens
    // - profileModelId: used for profile-related screens

    let screenParams
    try {
      screenParams = await getEmbeddedScreenParams(frn)
    } catch (error) {
      console.error('Failed to fetch embedded screen params:', error.message)
      return h.view('error', {
        pageTitle: 'Error',
        message: 'Unable to load the embedded screen. The Siti Agri service may be unavailable.'
      })
    }

    // STEP 2: Construct the SSO bridge URL.
    //
    // The SSO bridge URL is a parameterised endpoint that:
    // 1. Authenticates the portal user into SitiAgri (server-side SSO)
    // 2. Redirects the browser to the appropriate Siti Agri screen
    //
    // Parameters:
    // - application: the SitiAgri screen type to load (e.g. 'ent_view')
    // - callerid: the user's ID in the CAPD system (from authenticated user context)
    // - organisationid: the selected organisation's ID
    // - subj_entity_id: the SitiAgri soggettoId for the organisation

    // Build the SSO bridge URL as an ABSOLUTE URL pointing to the CAPD gateway.
    // This is the origin the browser will use to fetch iframe content —
    // a different origin from the portal's CDP gateway (cross-origin iframe).
    //
    // In production:
    //   SITI_AGRI_GATEWAY_URL = https://api.ruralpayments.service.gov.uk (or similar)
    //   ssoBridgeUrl = https://api.ruralpayments.service.gov.uk/sso-bridge/...
    const sitiAgriGatewayUrl = config.get('sitiAgriGatewayUrl')
    const ssoBridgeUrl = `${sitiAgriGatewayUrl}/sso-bridge/actions/sso-bridge/ssoBridge` +
      `?application=${screenConfig.application}` +
      `&callerid=${callerId}` +
      `&organisationid=${organisationId}` +
      `&subj_entity_id=${screenParams.soggettoId}`

    // The origin component of the CAPD gateway URL.
    // Passed to the template so client-side JavaScript knows which origin
    // to expect for postMessage events from the Siti Agri iframe.
    // (Cannot use window.location.origin — that's the CDP gateway origin.)
    const ssoBridgeOrigin = sitiAgriGatewayUrl

    // STEP 3: Render the page with the iframe.
    return h.view('embedded-screen', {
      pageTitle: screenConfig.title,
      screenTitle: screenConfig.title,
      ssoBridgeUrl,
      ssoBridgeOrigin,
      backLink: '/business'
    })
  }
}
