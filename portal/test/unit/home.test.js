// Unit tests for the home route.

import { describe, it, expect } from 'vitest'
import { home } from '../../src/routes/home.js'

describe('Home Route', () => {
  it('should have the correct method and path', () => {
    expect(home.method).toBe('GET')
    expect(home.path).toBe('/')
  })

  it('should render the home view', () => {
    const mockH = {
      view: (template, context) => ({ template, context })
    }

    const result = home.handler({}, mockH)

    expect(result.template).toBe('home')
    expect(result.context.pageTitle).toBe('Farming Service Portal')
  })
})
