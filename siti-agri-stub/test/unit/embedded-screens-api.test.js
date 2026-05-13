// Unit tests for the Siti Agri stub embedded screens API.

import { describe, it, expect, vi } from 'vitest'
import { embeddedScreensApi } from '../../src/routes/embedded-screens-api.js'

describe('Embedded Screens API', () => {
  it('should have the correct method and path', () => {
    expect(embeddedScreensApi.method).toBe('GET')
    expect(embeddedScreensApi.path).toBe('/api/v1/embedded-screens/params/{frn}')
  })

  it('should return SitiAgri identifiers for a known FRN', () => {
    const request = { params: { frn: '1234567890' } }
    const mockResponse = { code: vi.fn().mockReturnThis() }
    const mockH = { response: vi.fn().mockReturnValue(mockResponse) }

    embeddedScreensApi.handler(request, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      data: {
        soggettoId: 100234,
        dossierId: 200567,
        applicationModelId: 300891,
        profileModelId: 400123
      }
    })
    expect(mockResponse.code).toHaveBeenCalledWith(200)
  })

  it('should return 404 for an unknown FRN', () => {
    const request = { params: { frn: '0000000000' } }
    const mockResponse = { code: vi.fn().mockReturnThis() }
    const mockH = { response: vi.fn().mockReturnValue(mockResponse) }

    embeddedScreensApi.handler(request, mockH)

    expect(mockH.response).toHaveBeenCalledWith({
      error: 'Organisation not found for FRN: 0000000000'
    })
    expect(mockResponse.code).toHaveBeenCalledWith(404)
  })
})
