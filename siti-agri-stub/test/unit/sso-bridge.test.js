// Unit tests for the Siti Agri stub SSO bridge route.

import { describe, it, expect, vi } from 'vitest'

// Mock config so frame-ancestors origin is predictable in tests
vi.mock('../../src/config/config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'portalOrigin') return 'http://localhost:3000'
      return undefined
    })
  }
}))

import { ssoBridge } from '../../src/routes/sso-bridge.js'

describe('SSO Bridge Route', () => {
  it('should have the correct method and path', () => {
    expect(ssoBridge.method).toBe('GET')
    expect(ssoBridge.path).toBe('/sso-bridge/actions/sso-bridge/ssoBridge')
  })

  it('should return 400 when required parameters are missing', () => {
    const request = { query: { application: 'ent_view' } }
    const mockResponse = { code: vi.fn().mockReturnThis() }
    const mockH = { response: vi.fn().mockReturnValue(mockResponse) }

    ssoBridge.handler(request, mockH)

    expect(mockResponse.code).toHaveBeenCalledWith(400)
  })

  it('should return 400 for an unknown application type', () => {
    const request = {
      query: {
        application: 'unknown_app',
        callerid: '12345',
        organisationid: '67890',
        subj_entity_id: '100234'
      }
    }
    const mockResponse = { code: vi.fn().mockReturnThis() }
    const mockH = { response: vi.fn().mockReturnValue(mockResponse) }

    ssoBridge.handler(request, mockH)

    expect(mockH.response).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Unknown application type')
    }))
    expect(mockResponse.code).toHaveBeenCalledWith(400)
  })

  it('should render the entitlements view for ent_view application', () => {
    const request = {
      query: {
        application: 'ent_view',
        callerid: '12345',
        organisationid: '67890',
        subj_entity_id: '100234'
      }
    }
    const mockResponse = { header: vi.fn().mockReturnThis() }
    const mockH = { view: vi.fn().mockReturnValue(mockResponse) }

    ssoBridge.handler(request, mockH)

    expect(mockH.view).toHaveBeenCalledWith('screens/entitlements', {
      application: 'ent_view',
      callerid: '12345',
      organisationid: '67890',
      soggettoId: '100234'
    })
    // Verify frame-ancestors header includes the configured SFD portal origin
    expect(mockResponse.header).toHaveBeenCalledWith(
      'Content-Security-Policy',
      "frame-ancestors 'self' http://localhost:3000"
    )
  })

  it('should render the applications view for apps_list', () => {
    const request = {
      query: {
        application: 'apps_list',
        callerid: '12345',
        organisationid: '67890',
        subj_entity_id: '100234'
      }
    }
    const mockResponse = { header: vi.fn().mockReturnThis() }
    const mockH = { view: vi.fn().mockReturnValue(mockResponse) }

    ssoBridge.handler(request, mockH)

    expect(mockH.view).toHaveBeenCalledWith('screens/applications', expect.any(Object))
  })

  it('should render the land-use view for landuse_edit', () => {
    const request = {
      query: {
        application: 'landuse_edit',
        callerid: '12345',
        organisationid: '67890',
        subj_entity_id: '100234'
      }
    }
    const mockResponse = { header: vi.fn().mockReturnThis() }
    const mockH = { view: vi.fn().mockReturnValue(mockResponse) }

    ssoBridge.handler(request, mockH)

    expect(mockH.view).toHaveBeenCalledWith('screens/land-use', expect.any(Object))
  })
})
