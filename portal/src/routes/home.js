// Home route — GOV.UK start page pattern.
//
// This is the landing page users see when they visit the service.
// It uses the standard GOV.UK "Start now" button pattern to guide
// the user into the service.

export const home = {
  method: 'GET',
  path: '/',
  handler: (_request, h) => {
    return h.view('home', {
      pageTitle: 'Farming Service Portal'
    })
  }
}
