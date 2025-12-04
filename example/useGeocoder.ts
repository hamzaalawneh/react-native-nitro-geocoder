import { useState, useCallback } from 'react'
import {
  Geocoder,
  GeocodeResult,
  ReverseGeocodeResult,
} from 'react-native-nitro-geocoder'

/**
 * Hook for reverse geocoding (coordinates → address)
 */
export function useReverseGeocode() {
  const [result, setResult] = useState<ReverseGeocodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const reverseGeocode = useCallback(
    async (latitude: number, longitude: number, locale: string = 'en') => {
      setLoading(true)
      setError(null)
      try {
        const data = await Geocoder.reverseGeocode(latitude, longitude, locale)
        setResult(data)
        return data
      } catch (e: any) {
        setError(e.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, error, loading, reverseGeocode, reset }
}

/**
 * Hook for forward geocoding (address → coordinates)
 */
export function useGeocode() {
  const [result, setResult] = useState<GeocodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const geocode = useCallback(async (address: string, locale: string = 'en') => {
    setLoading(true)
    setError(null)
    try {
      const data = await Geocoder.geocode(address, locale)
      setResult(data)
      return data
    } catch (e: any) {
      setError(e.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, error, loading, geocode, reset }
}

/**
 * Hook for multiple geocoding results
 */
export function useGeocodeMultiple() {
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const geocodeMultiple = useCallback(
    async (address: string, maxResults: number = 5, locale: string = 'en') => {
      setLoading(true)
      setError(null)
      try {
        const data = await Geocoder.geocodeMultiple(address, maxResults, locale)
        setResults(data)
        return data
      } catch (e: any) {
        setError(e.message)
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { results, error, loading, geocodeMultiple, reset }
}

/**
 * Hook for distance calculation (synchronous - no loading state needed)
 */
export function useDistance() {
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      return Geocoder.calculateDistance(lat1, lon1, lat2, lon2)
    },
    []
  )

  const calculateDistanceKm = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      return Geocoder.calculateDistance(lat1, lon1, lat2, lon2) / 1000
    },
    []
  )

  return { calculateDistance, calculateDistanceKm }
}

/**
 * Combined hook with all geocoder functionality
 */
export function useGeocoder() {
  const isAvailable = Geocoder.isGeocodingAvailable

  const reverseGeocode = useCallback(
    (lat: number, lon: number, locale = 'en') =>
      Geocoder.reverseGeocode(lat, lon, locale),
    []
  )

  const geocode = useCallback(
    (address: string, locale = 'en') => Geocoder.geocode(address, locale),
    []
  )

  const geocodeMultiple = useCallback(
    (address: string, maxResults = 5, locale = 'en') =>
      Geocoder.geocodeMultiple(address, maxResults, locale),
    []
  )

  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) =>
      Geocoder.calculateDistance(lat1, lon1, lat2, lon2),
    []
  )

  const clearCache = useCallback(() => Geocoder.clearCache(), [])

  return {
    isAvailable,
    reverseGeocode,
    geocode,
    geocodeMultiple,
    calculateDistance,
    clearCache,
  }
}
