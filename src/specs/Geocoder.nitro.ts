import { type HybridObject } from 'react-native-nitro-modules'

/**
 * Confidence level for geocoding results
 */
export type GeocodingConfidence = 'HIGH' | 'MEDIUM' | 'LOW'

/**
 * Result from forward geocoding (address to coordinates)
 */
export interface GeocodeResult {
  /** Latitude coordinate */
  latitude: number
  /** Longitude coordinate */
  longitude: number
  /** Full formatted address (single line) */
  address: string
  /** Street name with number */
  street: string
  /** District or sub-locality */
  district: string
  /** City or locality name */
  city: string
  /** State, province, or administrative area */
  state: string
  /** Country name */
  country: string
  /** ISO country code */
  countryCode: string
  /** Postal or ZIP code */
  postalCode: string
  /** Confidence level based on address precision */
  confidence: GeocodingConfidence
}

/**
 * Result from reverse geocoding (coordinates to address)
 */
export interface ReverseGeocodeResult {
  /** Latitude coordinate used for lookup */
  latitude: number
  /** Longitude coordinate used for lookup */
  longitude: number
  /** Full formatted address string (single line) */
  address: string
  /** Street name with number */
  street: string
  /** District or sub-locality */
  district: string
  /** City or locality name */
  city: string
  /** State, province, or administrative area */
  state: string
  /** Country name */
  country: string
  /** ISO country code */
  countryCode: string
  /** Postal or ZIP code */
  postalCode: string
  /** Confidence level based on address precision */
  confidence: GeocodingConfidence
}

/**
 * Main Geocoder HybridObject providing native geocoding functionality
 *
 * Uses native platform geocoding:
 * - iOS: CLGeocoder (CoreLocation framework)
 * - Android: android.location.Geocoder
 *
 * @example
 * ```typescript
 * import { NitroGeocoder } from 'react-native-nitro-geocoder'
 *
 * // Forward geocoding (address to coordinates)
 * const result = await NitroGeocoder.geocode("Riyadh, Saudi Arabia")
 * console.log(result.latitude, result.longitude)
 *
 * // Reverse geocoding (coordinates to address)
 * const address = await NitroGeocoder.reverseGeocode(24.7136, 46.6753)
 * console.log(address.address)
 * ```
 */
export interface NitroGeocoder
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /**
   * Check if geocoding services are available on this device
   *
   * On Android, some devices/emulators may not have geocoding support.
   * On iOS, this typically returns true unless location services are restricted.
   *
   * @returns true if geocoding is available
   */
  readonly isGeocodingAvailable: boolean

  /**
   * Convert an address string to geographic coordinates (forward geocoding)
   *
   * @param address - The address string to geocode
   * @param locale - ISO 639-1 language code (e.g., "en", "ar"). Defaults to "en"
   * @returns Promise resolving to GeocodeResult with coordinates and parsed address
   * @throws Error if no results found or geocoding fails
   */
  geocode(address: string, locale: string): Promise<GeocodeResult>

  /**
   * Convert geographic coordinates to a human-readable address (reverse geocoding)
   *
   * @param latitude - Latitude in decimal degrees (-90 to 90)
   * @param longitude - Longitude in decimal degrees (-180 to 180)
   * @param locale - ISO 639-1 language code (e.g., "en", "ar"). Defaults to "en"
   * @returns Promise resolving to ReverseGeocodeResult with full address details
   * @throws Error if no results found or geocoding fails
   */
  reverseGeocode(
    latitude: number,
    longitude: number,
    locale: string
  ): Promise<ReverseGeocodeResult>

  /**
   * Get multiple geocoding results for an address
   *
   * @param address - The address string to geocode
   * @param maxResults - Maximum number of results to return (1-10)
   * @param locale - ISO 639-1 language code (e.g., "en", "ar"). Defaults to "en"
   * @returns Promise resolving to array of GeocodeResult
   */
  geocodeMultiple(address: string, maxResults: number, locale: string): Promise<GeocodeResult[]>

  /**
   * Calculate the distance between two coordinates in meters
   * Uses the Haversine formula for accurate great-circle distance calculation.
   *
   * @param lat1 - Latitude of first point
   * @param lon1 - Longitude of first point
   * @param lat2 - Latitude of second point
   * @param lon2 - Longitude of second point
   * @returns Distance in meters
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number

  /**
   * Clear the internal geocoding cache
   */
  clearCache(): void

  /**
   * Simple reverse geocode - returns formatted address string
   */
  reverseGeocodeSimple(latitude: number, longitude: number): Promise<string>
}
