// Unit tests for the embedded screens API client helper.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @hapi/wreck
vi.mock('@hapi/wreck', () => ({
  default: {
    get: vi.fn()
  }
}))

// Mock config
vi.mock('../../src/config/config.js', () => ({
  config: {
    get: vi.fn((key) => {
      if (key === 'sitiAgriApiHost') return 'http://siti-agri-stub:3002'
      return ''
    })
  }
}))

import Wreck from '@hapi/wreck'
import { getEmbeddedScreenParams } from '../../src/common/helpers/embedded-screens.js'

describe('getEmbeddedScreenParams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call the facade API with the correct URL', async () => {
    Wreck.get.mockResolvedValue({
      payload: {
        data: {
          soggettoId: 100234,
          dossierId: 200567,
          applicationModelId: 300891,
          profileModelId: 400123
        }
      }
    })

    await getEmbeddedScreenParams('1234567890')

    expect(Wreck.get).toHaveBeenCalledWith(
      'http://siti-agri-stub:3002/api/v1/embedded-screens/params/1234567890',
      expect.objectContaining({ json: true, timeout: 10000 })
    )
  })

  it('should return the data from the API response', async () => {
    const mockData = {
      soggettoId: 100234,
      dossierId: 200567,
      applicationModelId: 300891,
      profileModelId: 400123
    }

    Wreck.get.mockResolvedValue({
      payload: { data: mockData }
    })

    const result = await getEmbeddedScreenParams('1234567890')

    expect(result).toEqual(mockData)
  })

  it('should throw when the API call fails', async () => {
    Wreck.get.mockRejectedValue(new Error('ECONNREFUSED'))

    await expect(getEmbeddedScreenParams('1234567890'))
      .rejects.toThrow('ECONNREFUSED')
  })
})
