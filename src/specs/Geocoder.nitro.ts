import { type HybridObject } from 'react-native-nitro-modules'

export interface Position {
  latitude: number
  longitude: number
}

export interface Region {
  center: Position
  radius: number
}

export interface GeocoderResult {
  /** Geographic coordinates */
  position: Position
  /** Full formatted address (single line) */
  formattedAddress: string
  /** Street name with number */
  street: string
  /** City or locality name */
  city: string
  /** State, province, or administrative area */
  state: string
  /** Sub-administrative area (county, district) */
  subAdminArea: string
  /** Sub-locality (neighborhood, district) */
  subLocality: string
  /** Country name */
  country: string
  /** ISO country code */
  countryCode: string
  /** Postal or ZIP code */
  postalCode: string
  /** Geographic region (iOS only) */
  region: Region | null
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
 * import { Geocoder } from 'react-native-nitro-geocoder'
 *
 * // Forward geocoding (address to coordinates)
 * const result = await Geocoder.geocode("Riyadh, Saudi Arabia", "en")
 * console.log(result.position.latitude, result.position.longitude)
 *
 * // Reverse geocoding (coordinates to address)
 * const result = await Geocoder.reverseGeocode(24.7136, 46.6753, "en")
 * console.log(result.address)
 * ```
 */
export interface NitroGeocoder extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
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
   * @param locale - ISO 639-1 language code (e.g., "en", "ar")
   * @returns Promise resolving to GeocoderResult
   * @throws Error if no results found or geocoding fails
   */
  geocode(address: string, locale: string): Promise<GeocoderResult>

  /**
   * Convert geographic coordinates to a human-readable address (reverse geocoding)
   *
   * @param latitude - Latitude in decimal degrees (-90 to 90)
   * @param longitude - Longitude in decimal degrees (-180 to 180)
   * @param locale - ISO 639-1 language code (e.g., "en", "ar")
   * @returns Promise resolving to GeocoderResult
   * @throws Error if no results found or geocoding fails
   */
  reverseGeocode(latitude: number, longitude: number, locale: string): Promise<GeocoderResult>

  /**
   * Get multiple geocoding results for an address
   *
   * @param address - The address string to geocode
   * @param maxResults - Maximum number of results to return (1-10)
   * @param locale - ISO 639-1 language code (e.g., "en", "ar")
   * @returns Promise resolving to array of GeocoderResult
   */
  geocodeMultiple(address: string, maxResults: number, locale: string): Promise<GeocoderResult[]>

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
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number

  /**
   * Simple reverse geocode - returns formatted address string
   */
  reverseGeocodeSimple(latitude: number, longitude: number): Promise<string>
}
