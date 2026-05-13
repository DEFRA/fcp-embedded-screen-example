// Health check route.
//
// Used by Docker Compose healthcheck to verify the service is running.
// Returns 200 OK with no body — the simplest possible health endpoint.

export const health = {
  method: 'GET',
  path: '/health',
  handler: (_request, h) => {
    return h.response('ok').code(200)
  }
}
