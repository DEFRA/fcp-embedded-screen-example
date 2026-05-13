// CSRF protection using @hapi/crumb.
//
// Crumb generates a unique token per request and validates it on POST
// submissions. This prevents cross-site request forgery attacks.
//
// In this demo there are no form submissions (the embedded screens are
// read-only iframes), but including CSRF protection is standard practice
// for any SFD service and demonstrates a complete security setup.

import Crumb from '@hapi/crumb'

export const crumb = {
  plugin: Crumb,
  options: {
    cookieOptions: {
      isSecure: process.env.NODE_ENV === 'production',
      path: '/'
    }
  }
}
