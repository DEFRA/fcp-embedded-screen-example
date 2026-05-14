// Unit tests for the embedded screen route handler.
//
// These tests verify that the route:
// 1. Calls the facade API with the correct FRN
// 2. Constructs the SSO bridge URL as an absolute URL pointing to the CAPD gateway
// 3. Passes the URL and origin to the template for cross-origin iframe rendering
// 4. Handles unknown screen types with 404
// 5. Handles facade API errors gracefully

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the embedded-screens helper before importing the route
vi.mock('../../src/common/helpers/embedded-screens.js', () => ({
  getEmbeddedScreenParams: vi.fn()
}))

// Mock the auth helper — returns demo values matching the hardcoded defaults
vi.mock('../../src/common/helpers/auth.js', () => ({
  getAuthenticatedUser: vi.fn(() => ({
    callerId: '12345',
    organisationId: '67890',
    frn: '1234567890',
    businessName: 'Example Farm Ltd',
    sbi: '123456789'
  }))
}))

// Mock config so tests are not environment-dependent
vi.mock('../../src/config/config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'sitiAgriGatewayUrl') return 'http://localhost:3019'
      return undefined
    })
  }
}))

import { embeddedScreen } from '../../src/routes/embedded-screen.js'
import { getEmbeddedScreenParams } from '../../src/common/helpers/embedded-screens.js'

describe('Embedded Screen Route', () => {
  let mockH

  beforeEach(() => {
    mockH = {
      view: vi.fn().mockReturnThis(),
      response: vi.fn().mockReturnValue({
        code: vi.fn().mockReturnThis()
      })
    }
  })

  it('should have the correct method and path', () => {
    expect(embeddedScreen.method).toBe('GET')
    expect(embeddedScreen.path).toBe('/embedded-screen/{screenType}')
  })

  it('should return 404 for unknown screen types', async () => {
    const request = { params: { screenType: 'unknownScreen' } }
    const mockResponse = { code: vi.fn().mockReturnThis() }
    mockH.response.mockReturnValue(mockResponse)

    await embeddedScreen.handler(request, mockH)

    expect(mockH.response).toHaveBeenCalledWith('Unknown screen type')
    expect(mockResponse.code).toHaveBeenCalledWith(404)
  })

  it('should call facade API and construct absolute SSO bridge URL for viewEntitlements', async () => {
    getEmbeddedScreenParams.mockResolvedValue({
      soggettoId: 100234,
      dossierId: 200567,
      applicationModelId: 300891,
      profileModelId: 400123
    })

    const request = { params: { screenType: 'viewEntitlements' } }

    await embeddedScreen.handler(request, mockH)

    // Verify the facade API was called with the demo FRN
    expect(getEmbeddedScreenParams).toHaveBeenCalledWith('1234567890')

    // Verify the view was called with an absolute SSO bridge URL (CAPD gateway)
    expect(mockH.view).toHaveBeenCalledWith('embedded-screen', expect.objectContaining({
      screenTitle: 'View entitlements',
      ssoBridgeUrl: expect.stringContaining('http://localhost:3019/sso-bridge/actions/sso-bridge/ssoBridge'),
      ssoBridgeOrigin: 'http://localhost:3019',
      backLink: '/business'
    }))

    // Verify the URL contains the correct application type and soggettoId
    const viewCall = mockH.view.mock.calls[0][1]
    expect(viewCall.ssoBridgeUrl).toContain('application=ent_view')
    expect(viewCall.ssoBridgeUrl).toContain('subj_entity_id=100234')
  })

  it('should construct correct URL for applyNewBpsApplication', async () => {
    getEmbeddedScreenParams.mockResolvedValue({
      soggettoId: 100234,
      dossierId: 200567,
      applicationModelId: 300891,
      profileModelId: 400123
    })

    const request = { params: { screenType: 'applyNewBpsApplication' } }

    await embeddedScreen.handler(request, mockH)

    const viewCall = mockH.view.mock.calls[0][1]
    expect(viewCall.ssoBridgeUrl).toContain('application=apps_list')
    expect(viewCall.screenTitle).toBe('BPS applications')
  })

  it('should construct correct URL for viewLandUse', async () => {
    getEmbeddedScreenParams.mockResolvedValue({
      soggettoId: 100234,
      dossierId: 200567,
      applicationModelId: 300891,
      profileModelId: 400123
    })

    const request = { params: { screenType: 'viewLandUse' } }

    await embeddedScreen.handler(request, mockH)

    const viewCall = mockH.view.mock.calls[0][1]
    expect(viewCall.ssoBridgeUrl).toContain('application=landuse_edit')
    expect(viewCall.screenTitle).toBe('Land use')
  })

  it('should render error view when facade API fails', async () => {
    getEmbeddedScreenParams.mockRejectedValue(new Error('Connection refused'))

    const request = { params: { screenType: 'viewEntitlements' } }

    await embeddedScreen.handler(request, mockH)

    expect(mockH.view).toHaveBeenCalledWith('error', expect.objectContaining({
      pageTitle: 'Error',
      message: expect.stringContaining('Unable to load the embedded screen')
    }))
  })
})
