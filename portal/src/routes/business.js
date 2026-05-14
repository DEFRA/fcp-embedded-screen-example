// Business overview route.
//
// In the real Rural Payments portal, a user selects their business
// (organisation) and then sees a summary page with links to various
// features — some of which are embedded screens from Siti Agri.
//
// This route uses the authenticated user context to display business
// details and links to embedded screens. See
// portal/src/common/helpers/auth.js for the callerId assumption.
//
// The page displays links to three embedded screen types:
// - View Entitlements (ent_view)
// - BPS Applications (apps_list)
// - View/Edit Land Use (landuse_edit)

import { getAuthenticatedUser } from '../common/helpers/auth.js'

export const business = {
  method: 'GET',
  path: '/business',
  handler: (request, h) => {
    // Get the authenticated user's identity and organisation context.
    const { businessName, frn, sbi } = getAuthenticatedUser(request)

    const businessContext = {
      businessName,
      frn,
      sbi
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
