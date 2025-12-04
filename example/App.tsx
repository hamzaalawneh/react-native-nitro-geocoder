import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native'
import {
  Geocoder,
  type GeocodeResult,
  type ReverseGeocodeResult,
} from 'react-native-nitro-geocoder'

const SAMPLE_LOCATIONS = [
  { name: 'Riyadh', lat: 24.7136, lon: 46.6753 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
]

export default function App() {
  const [address, setAddress] = useState('Riyadh, Saudi Arabia')
  const [latitude, setLatitude] = useState('24.7136')
  const [longitude, setLongitude] = useState('46.6753')
  const [locale, setLocale] = useState('en')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeocodeResult | ReverseGeocodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  const isAvailable = Geocoder.isGeocodingAvailable

  const handleGeocode = useCallback(async () => {
    if (!address.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await Geocoder.geocode(address, locale)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [address, locale])

  const handleReverseGeocode = useCallback(async () => {
    const lat = parseFloat(latitude)
    const lon = parseFloat(longitude)
    if (isNaN(lat) || isNaN(lon)) {
      setError('Invalid coordinates')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await Geocoder.reverseGeocode(lat, lon, locale)
      setResult(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, locale])

  const handleCalculateDistance = useCallback(() => {
    const dist = Geocoder.calculateDistance(
      24.7136, 46.6753,
      21.4225, 39.8262
    )
    setDistance(dist)
  }, [])

  const selectLocation = (lat: number, lon: number) => {
    setLatitude(lat.toString())
    setLongitude(lon.toString())
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Nitro Geocoder</Text>

        {/* Availability Check */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          <Text style={[styles.status, { color: isAvailable ? '#4CAF50' : '#F44336' }]}>
            {isAvailable ? '✓ Geocoding Available' : '✗ Geocoding Not Available'}
          </Text>
        </View>

        {/* Locale Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Locale</Text>
          <View style={styles.localeRow}>
            {['en', 'ar', 'ja', 'fr', 'de'].map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[styles.localeBtn, locale === loc && styles.localeBtnActive]}
                onPress={() => setLocale(loc)}>
                <Text style={[styles.localeBtnText, locale === loc && styles.localeBtnTextActive]}>
                  {loc.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Forward Geocoding */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Forward Geocode</Text>
          <Text style={styles.cardSubtitle}>Address → Coordinates</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter address..."
          />
          <TouchableOpacity style={styles.button} onPress={handleGeocode} disabled={loading}>
            <Text style={styles.buttonText}>Geocode Address</Text>
          </TouchableOpacity>
        </View>

        {/* Reverse Geocoding */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reverse Geocode</Text>
          <Text style={styles.cardSubtitle}>Coordinates → Address</Text>

          <View style={styles.quickLocations}>
            {SAMPLE_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.name}
                style={styles.quickLocationBtn}
                onPress={() => selectLocation(loc.lat, loc.lon)}>
                <Text style={styles.quickLocationText}>{loc.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.coordRow}>
            <TextInput
              style={[styles.input, styles.coordInput]}
              value={latitude}
              onChangeText={setLatitude}
              placeholder="Latitude"
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.coordInput]}
              value={longitude}
              onChangeText={setLongitude}
              placeholder="Longitude"
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleReverseGeocode} disabled={loading}>
            <Text style={styles.buttonText}>Reverse Geocode</Text>
          </TouchableOpacity>
        </View>

        {/* Distance Calculation */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distance Calculation</Text>
          <Text style={styles.cardSubtitle}>Riyadh ↔ Mecca (synchronous)</Text>
          <TouchableOpacity style={[styles.button, styles.distanceButton]} onPress={handleCalculateDistance}>
            <Text style={styles.buttonText}>Calculate Distance</Text>
          </TouchableOpacity>
          {distance !== null && (
            <Text style={styles.distanceResult}>
              {(distance / 1000).toFixed(2)} km ({distance.toFixed(0)} meters)
            </Text>
          )}
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.cardTitle}>Result</Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Address:</Text>
              <Text style={styles.resultValue}>{result.address}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Coordinates:</Text>
              <Text style={styles.resultValue}>
                {result.latitude.toFixed(6)}, {result.longitude.toFixed(6)}
              </Text>
            </View>

            {result.city && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>City:</Text>
                <Text style={styles.resultValue}>{result.city}</Text>
              </View>
            )}

            {result.country && (
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Country:</Text>
                <Text style={styles.resultValue}>
                  {result.country} ({result.countryCode})
                </Text>
              </View>
            )}

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Confidence:</Text>
              <Text style={[styles.resultValue, styles.confidenceBadge]}>
                {result.confidence}
              </Text>
            </View>

            <Text style={styles.rawTitle}>Raw Response:</Text>
            <Text style={styles.rawJson}>{JSON.stringify(result, null, 2)}</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  localeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  localeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  localeBtnActive: {
    backgroundColor: '#007AFF',
  },
  localeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  localeBtnTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordInput: {
    flex: 1,
  },
  quickLocations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quickLocationBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  quickLocationText: {
    fontSize: 11,
    color: '#1976D2',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  distanceButton: {
    backgroundColor: '#9C27B0',
  },
  distanceResult: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#9C27B0',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorCard: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  resultCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultLabel: {
    width: 100,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  resultValue: {
    flex: 1,
    fontSize: 12,
    color: '#333',
  },
  confidenceBadge: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  rawTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  rawJson: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    color: '#333',
  },
})
