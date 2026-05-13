// Health check route for the Siti Agri stub.
//
// Used by Docker Compose healthcheck.

export const health = {
  method: 'GET',
  path: '/health',
  handler: (_request, h) => {
    return h.response('ok').code(200)
  }
}
