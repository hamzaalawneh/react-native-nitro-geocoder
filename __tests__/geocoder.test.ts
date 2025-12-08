// Mock react-native-nitro-modules
jest.mock('react-native-nitro-modules', () => ({
  NitroModules: {
    createHybridObject: jest.fn(() => ({
      isGeocodingAvailable: true,
      geocode: jest.fn(),
      reverseGeocode: jest.fn(),
      geocodeMultiple: jest.fn(),
      calculateDistance: jest.fn(),
      reverseGeocodeSimple: jest.fn(),
    })),
  },
}))

describe('Geocoder Module', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export Geocoder', () => {
    const { Geocoder } = require('../src/index')
    expect(Geocoder).toBeDefined()
  })

  it('should export createGeocoder function', () => {
    const { createGeocoder } = require('../src/index')
    expect(typeof createGeocoder).toBe('function')
  })

  it('should have isGeocodingAvailable property', () => {
    const { Geocoder } = require('../src/index')
    expect(typeof Geocoder.isGeocodingAvailable).toBe('boolean')
  })

  it('should have geocode method', () => {
    const { Geocoder } = require('../src/index')
    expect(typeof Geocoder.geocode).toBe('function')
  })

  it('should have reverseGeocode method', () => {
    const { Geocoder } = require('../src/index')
    expect(typeof Geocoder.reverseGeocode).toBe('function')
  })

  it('should have geocodeMultiple method', () => {
    const { Geocoder } = require('../src/index')
    expect(typeof Geocoder.geocodeMultiple).toBe('function')
  })

  it('should have calculateDistance method', () => {
    const { Geocoder } = require('../src/index')
    expect(typeof Geocoder.calculateDistance).toBe('function')
  })

  it('should have reverseGeocodeSimple method', () => {
    const { Geocoder } = require('../src/index')
    expect(typeof Geocoder.reverseGeocodeSimple).toBe('function')
  })
})

describe('Type Exports', () => {
  it('should export types correctly', () => {
    // This test verifies TypeScript compilation works
    const module = require('../src/index')
    expect(module).toBeDefined()
  })
})
