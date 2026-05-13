// Business overview route.
//
// In the real Rural Payments portal, a user selects their business
// (organisation) and then sees a summary page with links to various
// features — some of which are embedded screens from Siti Agri.
//
// This route simulates that experience using a hardcoded FRN (Firm
// Reference Number) and business name for the demo. In production,
// these would come from the authenticated user's session after they
// select an organisation via Defra Identity.
//
// The page displays links to three embedded screen types:
// - View Entitlements (ent_view)
// - BPS Applications (apps_list)
// - View/Edit Land Use (landuse_edit)

export const business = {
  method: 'GET',
  path: '/business',
  handler: (_request, h) => {
    // In production, these values come from the authenticated session.
    // The FRN is looked up after the user selects their organisation
    // during the Defra Identity sign-in flow.
    const businessContext = {
      businessName: 'Example Farm Ltd',
      frn: '1234567890',
      sbi: '123456789'
    }

    return h.view('business', {
      pageTitle: `${businessContext.businessName} - Business overview`,
      business: businessContext,
      // These are the embedded screen types available for this business.
      // Each maps to a SitiAgri application identifier used in the SSO bridge URL.
      embeddedScreens: [
        {
          title: 'View entitlements',
          description: 'View your Basic Payment Scheme (BPS) entitlements',
          screenType: 'viewEntitlements',
          href: '/embedded-screen/viewEntitlements'
        },
        {
          title: 'BPS applications',
          description: 'View and manage your BPS applications',
          screenType: 'applyNewBpsApplication',
          href: '/embedded-screen/applyNewBpsApplication'
        },
        {
          title: 'Land use',
          description: 'View and edit your land use information',
          screenType: 'viewLandUse',
          href: '/embedded-screen/viewLandUse'
        }
      ]
    })
  }
}
