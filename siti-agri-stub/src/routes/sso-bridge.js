// SSO Bridge route — GET /sso-bridge/actions/sso-bridge/ssoBridge
//
// This route simulates the SitiAgri SSO Bridge — the authentication
// gateway that sits between the portal and the Agrigate embedded screens.
//
// WHAT THE REAL SSO BRIDGE DOES:
// 1. Receives query parameters identifying the user, organisation, and
//    target screen (application type)
// 2. Performs a server-side SSO handshake with SitiAgri:
//    - Validates the caller's session/token
//    - Creates or retrieves a SitiAgri session for the user
//    - Sets authentication cookies for the Agrigate UI
// 3. Redirects the browser to the appropriate Agrigate screen URL
//
// In this stub, we skip the actual SSO handshake (there's no real SitiAgri
// to authenticate against) and directly render the embedded screen content.
//
// QUERY PARAMETERS (matching the real SSO bridge contract):
// - application: SitiAgri screen type (e.g. 'ent_view', 'apps_list')
// - callerid: the user's CAPD caller ID
// - organisationid: the selected organisation's ID
// - subj_entity_id: the SitiAgri soggettoId for the organisation
//
// CROSS-ORIGIN frame-ancestors:
// This content is served from the CAPD gateway (port 3019) and embedded
// in the SFD portal (CDP gateway, port 3000) — a different origin.
// The frame-ancestors CSP header tells the browser which origins are
// permitted to frame this content. It must include the CDP gateway origin.
//
// Configured dynamically from SFD_PORTAL_ORIGIN env var (default: http://localhost:3000)
// so it can be set correctly in each environment without code changes.
//
// The resulting header:
//   Content-Security-Policy: frame-ancestors 'self' http://localhost:3000
//
// This is the SERVER-SIDE counterpart to the portal's frame-src:
//   frame-src (on portal) — controls what origins the portal CAN frame
//   frame-ancestors (here) — controls what origins CAN frame this content
// BOTH must be configured for the cross-origin iframe to load.

import { config } from '../config/config.js';

// Map SitiAgri application IDs to view templates
const APPLICATION_VIEWS = {
  ent_view: 'screens/entitlements',
  apps_list: 'screens/applications',
  landuse_edit: 'screens/land-use'
}

export const ssoBridge = {
  method: 'GET',
  path: '/sso-bridge/actions/sso-bridge/ssoBridge',
  handler: (request, h) => {
    const { application, callerid, organisationid, subj_entity_id: soggettoId } = request.query

    // Validate required parameters
    if (!application || !callerid || !organisationid || !soggettoId) {
      return h.response({
        error: 'Missing required SSO bridge parameters',
        required: ['application', 'callerid', 'organisationid', 'subj_entity_id']
      }).code(400)
    }

    // Determine which screen to render based on the application identifier
    const viewTemplate = APPLICATION_VIEWS[application]
    if (!viewTemplate) {
      return h.response({
        error: `Unknown application type: ${application}`,
        supportedTypes: Object.keys(APPLICATION_VIEWS)
      }).code(400)
    }

    // In the real SSO bridge, this is where the server-side authentication
    // handshake would occur:
    // 1. Validate callerid against the session store
    // 2. Create/retrieve a SitiAgri session for the user
    // 3. Set session cookies for the Agrigate UI
    // 4. Redirect (302) to the Agrigate screen URL
    //
    // In this stub, we skip the redirect and render the screen directly,
    // simulating what the Agrigate UI would show after the SSO handshake.

    console.log(
      `SSO Bridge: application=${application}, ` +
      `callerid=${callerid}, org=${organisationid}, soggettoId=${soggettoId}`
    )

    // Render the embedded screen with frame-ancestors CSP header.
    //
    // This header grants the SFD portal (CDP gateway) permission to frame
    // this content. The portal origin is read from config (SFD_PORTAL_ORIGIN)
    // rather than hardcoded, so it works correctly in every environment.
    //
    // frame-ancestors 'self' allows the CAPD gateway itself to load this
    // in an iframe (useful for testing); the portal origin allows the SFD
    // CDP gateway to embed it cross-origin.
    const portalOrigin = config.get('portalOrigin')
    const response = h.view(viewTemplate, {
      application,
      callerid,
      organisationid,
      soggettoId
    })

    // Set Content-Security-Policy header with frame-ancestors directive.
    // This is the SERVER-SIDE counterpart to the portal's CSP frame-src.
    // frame-src (on portal) controls what origins the portal CAN frame.
    // frame-ancestors (here) controls what origins CAN frame this content.
    // BOTH must be configured correctly for the cross-origin iframe to load.
    response.header(
      'Content-Security-Policy',
      `frame-ancestors 'self' ${portalOrigin}`
    )

    // X-Frame-Options is a legacy header (superseded by frame-ancestors)
    // but still respected by older browsers.
    // ALLOW-FROM is not universally supported — use frame-ancestors instead.
    response.header('X-Frame-Options', 'ALLOWALL')

    return response
  }
}
