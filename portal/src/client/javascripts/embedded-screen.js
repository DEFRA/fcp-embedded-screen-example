// Embedded screen iframe management.
//
// This module handles communication between the portal (parent page) and
// the Siti Agri embedded screen (iframe content) using the postMessage API.
//
// WHY postMessage?
// The iframe content (Siti Agri screen) needs to communicate its content
// height to the parent page so the iframe can be resized to fit without
// scrollbars. This creates a seamless visual experience where the embedded
// content appears as part of the portal page.
//
// CROSS-ORIGIN ORIGIN VALIDATION:
// The iframe loads from the CAPD gateway (e.g. http://localhost:3019), which
// is a DIFFERENT origin from the portal page (http://localhost:3000).
// The expected origin is therefore NOT window.location.origin — we must
// read it from the data-origin attribute set by the server, which is
// populated from the SITI_AGRI_GATEWAY_URL configuration value.
//
// postMessage can be sent from ANY origin. Without validation, a malicious
// page could send fake resize messages. We MUST check event.origin matches
// the CAPD gateway origin before processing any message.
//
// NEVER use:
//   if (event.origin !== window.location.origin) return  // WRONG: same-origin assumption
//   window.addEventListener('message', (event) => { /* no origin check */ })
//
// ALWAYS use:
//   if (event.origin !== this.expectedOrigin) return  // where expectedOrigin = CAPD gateway

export class EmbeddedScreen {
  constructor (container) {
    this.container = container
    this.iframe = container.querySelector('.embedded-screen-frame')
    this.loading = container.querySelector('.embedded-screen-loading')
    // Read the expected postMessage origin from the data-origin attribute.
    // This is the CAPD gateway origin (e.g. http://localhost:3019) —
    // NOT window.location.origin (the CDP gateway / portal origin).
    // Set server-side from SITI_AGRI_GATEWAY_URL config.
    this.expectedOrigin = container.dataset.origin
  }

  init () {
    if (!this.iframe) return

    // Hide loading indicator when iframe content loads
    this.iframe.addEventListener('load', () => {
      if (this.loading) {
        this.loading.style.display = 'none'
      }
    })

    // Listen for postMessage events from the iframe content.
    // The embedded screen sends its content height so we can resize
    // the iframe to eliminate scrollbars.
    window.addEventListener('message', (event) => {
      // CRITICAL SECURITY CHECK: Validate the message origin.
      // The iframe content is on the CAPD gateway (a different origin),
      // so we check against this.expectedOrigin (read from data-origin),
      // NOT window.location.origin (which is the portal's CDP gateway).
      if (event.origin !== this.expectedOrigin) {
        console.warn(
          `Rejected postMessage from unexpected origin: ${event.origin}. ` +
          `Expected CAPD gateway origin: ${this.expectedOrigin}`
        )
        return
      }

      // Process resize messages from the embedded screen
      if (event.data?.type === 'embedded-screen-resize') {
        const height = parseInt(event.data.height, 10)
        if (height > 0) {
          this.iframe.style.height = `${height}px`
        }
      }
    })
  }
}
