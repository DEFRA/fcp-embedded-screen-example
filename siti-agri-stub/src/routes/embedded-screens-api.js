// Embedded Screens Facade API — GET /api/v1/embedded-screens/params/{frn}
//
// This route simulates the capd-externaldb-facade service endpoint.
//
// WHAT THE REAL ENDPOINT DOES:
// The real endpoint (EmbeddedScreensResource.java) receives a Firm Reference
// Number (FRN), queries the SitiAgri Oracle database, and returns four
// SitiAgri-internal identifiers needed to construct the SSO bridge URL.
//
// CONTRACT:
// Request:  GET /api/v1/embedded-screens/params/{frn}
// Response: 200 OK
//   {
//     "data": {
//       "soggettoId": 100234,
//       "dossierId": 200567,
//       "applicationModelId": 300891,
//       "profileModelId": 400123
//     }
//   }
//
// Error: 404 Not Found (if FRN not found in database)
//   { "error": "Organisation not found for FRN: {frn}" }
//
// SECURITY NOTE:
// The real endpoint currently has NO authorization annotation
// (@CapdOrganisationAuthorisation is absent). Any authenticated caller
// can retrieve SitiAgri identifiers for any FRN. SFD MUST add proper
// access control — verify the authenticated user has a relationship
// with the requested organisation before returning SitiAgri IDs.

import { organisations } from '../data/organisations.js'

export const embeddedScreensApi = {
  method: 'GET',
  path: '/api/v1/embedded-screens/params/{frn}',
  handler: (request, h) => {
    const { frn } = request.params

    // Look up the FRN in our mock data (simulates Oracle DB query)
    const organisation = organisations[frn]

    if (!organisation) {
      return h.response({
        error: `Organisation not found for FRN: ${frn}`
      }).code(404)
    }

    // Return the SitiAgri identifiers in the same structure as the real API.
    // The portal uses these to construct the SSO bridge URL parameters.
    return h.response({
      data: {
        soggettoId: organisation.soggettoId,
        dossierId: organisation.dossierId,
        applicationModelId: organisation.applicationModelId,
        profileModelId: organisation.profileModelId
      }
    }).code(200)
  }
}
