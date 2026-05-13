// Client-side JavaScript entry point.
//
// Initialises GOV.UK Frontend components and the embedded screen module.
// Webpack bundles this into .public/javascripts/application.js.

import { initAll } from 'govuk-frontend'
import { EmbeddedScreen } from './embedded-screen.js'

// Initialise GOV.UK Frontend components (accordion, tabs, etc.)
initAll()

// Initialise embedded screen iframe resize handling
const embeddedScreenContainers = document.querySelectorAll('[data-module="embedded-screen"]')
embeddedScreenContainers.forEach(container => {
  new EmbeddedScreen(container).init()
})
