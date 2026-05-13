// Mock organisation data — simulates the SitiAgri Oracle database.
//
// In the real system, capd-externaldb-facade queries the SitiAgri Oracle
// database using the FRN (Firm Reference Number) and returns these four
// identifiers that SitiAgri needs internally:
//
// - soggettoId: SitiAgri's internal ID for the "subject" (organisation/person).
//   This is the primary identifier used in all SitiAgri API calls.
//
// - dossierId: The organisation's "dossier" (administrative file/case) ID.
//   Used for profile and document-related screens.
//
// - applicationModelId: The ID of the BPS application model template.
//   Used when constructing application screens.
//
// - profileModelId: The profile model ID. Used for the profile print screen.
//
// These IDs are opaque to the portal — it simply passes them to the SSO
// bridge URL as query parameters without understanding their meaning.
//
// The response structure matches the real EmbeddedScreenParams Java DTO:
// repos/capd-externaldb-facade/capd-externaldb-facade-api/src/main/java/
//   uk/gov/defra/capd/extdb/api/responses/EmbeddedScreenParams.java

export const organisations = {
  '1234567890': {
    frn: '1234567890',
    businessName: 'Example Farm Ltd',
    soggettoId: 100234,
    dossierId: 200567,
    applicationModelId: 300891,
    profileModelId: 400123
  },
  '9876543210': {
    frn: '9876543210',
    businessName: 'Green Meadows Partnership',
    soggettoId: 100567,
    dossierId: 200891,
    applicationModelId: 300234,
    profileModelId: 400567
  },
  '5555555555': {
    frn: '5555555555',
    businessName: 'Hill Top Estates',
    soggettoId: 100891,
    dossierId: 200234,
    applicationModelId: 300567,
    profileModelId: 400891
  }
}
