// Simulated authenticated user context for this demo.
//
// IMPORTANT: This demo assumes SFD has access to the user's callerId.
// In practice, callerId is a CAPD-internal identifier that is NOT
// currently accessible to services on CDP.
//
// How callerId works today:
// - callerId is a numeric identifier used within the CAPD system to
//   represent an authenticated user.
// - For backend API calls, the KITS gateway in Crown Hosting resolves
//   callerId transparently: SFD → DAL → KITS gateway → [injects
//   callerId header] → CAPD API. SFD never sees it.
// - For embedded screens, the SSO bridge URL requires callerId as a
//   query parameter in the iframe src, which is loaded by the user's
//   browser. No server-side intermediary can inject it.
//
// Before SFD can use embedded screens in production, a callerId
// resolution mechanism must be implemented (e.g. the SSO bridge
// accepting a Defra Identity token instead of callerId, or a new
// service that maps Defra Identity → callerId).
//
// In production, this function would read from request.auth.credentials
// or the session after Defra Identity authentication and callerId
// resolution.

/**
 * Returns the authenticated user's identity and organisation context.
 *
 * @param {object} _request - Hapi request object (unused in demo;
 *   in production would read from request.auth.credentials or session)
 * @returns {{ callerId: string, organisationId: string, frn: string, businessName: string, sbi: string }}
 */
export function getAuthenticatedUser (_request) {
  return {
    callerId: '12345',
    organisationId: '67890',
    frn: '1234567890',
    businessName: 'Example Farm Ltd',
    sbi: '123456789'
  }
}
