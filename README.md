# react-native-nitro-geocoder

[![npm version](https://img.shields.io/npm/v/react-native-nitro-geocoder.svg)](https://www.npmjs.com/package/react-native-nitro-geocoder)
[![license](https://img.shields.io/npm/l/react-native-nitro-geocoder.svg)](https://github.com/saadelsabahy/react-native-nitro-geocoder/blob/main/LICENSE)
[![platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android-lightgrey.svg)](https://reactnative.dev/)

A high-performance native geocoding library for React Native using [Nitro Modules](https://github.com/mrousavy/nitro) JSI bindings.

## Features

- **JSI-powered**: Direct native calls without async bridge overhead
- **Forward Geocoding**: Convert addresses to coordinates
- **Reverse Geocoding**: Convert coordinates to addresses
- **Multiple Results**: Get multiple geocoding suggestions
- **Locale Support**: Configurable language for results
- **Distance Calculation**: Native distance calculation (synchronous)
- **Zero Dependencies**: Uses native platform APIs only
  - iOS: `CLGeocoder` (CoreLocation)
  - Android: `android.location.Geocoder`

## Performance

- Geocoding calls are **network-bound** (~160ms to Apple/Google servers)
- Synchronous operations like `calculateDistance` are extremely fast (~0.6μs per call)

## Installation

```bash
yarn add react-native-nitro-geocoder react-native-nitro-modules
```

### iOS

```bash
cd ios && pod install
```

### Android

No additional setup required.

## Usage

### Basic Import

```typescript
import { Geocoder } from 'react-native-nitro-geocoder'
```

### Check Availability

```typescript
if (Geocoder.isGeocodingAvailable) {
  console.log('Geocoding is available')
}
```

### Forward Geocoding (Address to Coordinates)

```typescript
const result = await Geocoder.geocode('Riyadh, Saudi Arabia', 'en')
// {
//   position: { latitude: 24.7136, longitude: 46.6753 },
//   formattedAddress: "Riyadh, Riyadh Province, Saudi Arabia",
//   city: "Riyadh",
//   country: "Saudi Arabia",
//   countryCode: "SA",
//   ...
// }
```

### Reverse Geocoding (Coordinates to Address)

```typescript
const result = await Geocoder.reverseGeocode(24.7136, 46.6753, 'en')
console.log(result.formattedAddress) // "King Fahd Road, Riyadh, Saudi Arabia"
console.log(result.city)             // "Riyadh"
console.log(result.country)          // "Saudi Arabia"
```

### Multiple Results

```typescript
const results = await Geocoder.geocodeMultiple('Springfield', 5, 'en')
// Returns up to 5 matching locations
```

### Distance Calculation (Synchronous - Ultra Fast)

```typescript
// ~0.64μs per call - can do 1.5 million calls/second!
const distance = Geocoder.calculateDistance(
  24.7136, 46.6753,  // Riyadh
  21.4225, 39.8262   // Mecca
)
console.log(`Distance: ${(distance / 1000).toFixed(2)} km`) // ~850 km
```

### Locale Support

```typescript
// English
const en = await Geocoder.reverseGeocode(35.6762, 139.6503, 'en')
console.log(en.country) // "Japan"

// Arabic
const ar = await Geocoder.reverseGeocode(24.7136, 46.6753, 'ar')
console.log(ar.country) // "المملكة العربية السعودية"

// Japanese
const ja = await Geocoder.reverseGeocode(35.6762, 139.6503, 'ja')
console.log(ja.country) // "日本"
```

## API Reference

### Methods

| Method | Description |
|--------|-------------|
| `geocode(address, locale)` | Address to coordinates |
| `reverseGeocode(lat, lon, locale)` | Coordinates to address |
| `geocodeMultiple(address, maxResults, locale)` | Get multiple results |
| `calculateDistance(lat1, lon1, lat2, lon2)` | Distance in meters (sync) |

### Properties

| Property | Description |
|----------|-------------|
| `isGeocodingAvailable` | Check if geocoding is available |

### Types

```typescript
interface Position {
  latitude: number
  longitude: number
}

interface Region {
  center: Position
  radius: number
}

interface GeocoderResult {
  position: Position
  formattedAddress: string
  street: string
  city: string
  state: string
  subAdminArea: string
  subLocality: string
  country: string
  countryCode: string
  postalCode: string
  region: Region | null  // iOS only, null on Android
}
```

## Platform Notes

### iOS
- Uses `CLGeocoder` (CoreLocation)
- iOS 14.0+
- No API key required
- Rate limited (~50 req/min)
- **Important**: iOS does not allow multiple geocoding requests simultaneously. If you send a second request while one is in progress, the first one will be cancelled.

### Android
- Uses `android.location.Geocoder`
- API level 21+
- No API key required
- Check `isGeocodingAvailable` (some emulators don't support it)

## React Hooks

The library includes ready-to-use React hooks:

```typescript
import {
  useGeocode,
  useReverseGeocode,
  useGeocodeMultiple,
  useDistance,
  useGeocoder,
} from 'react-native-nitro-geocoder'
```

### useReverseGeocode

```typescript
function MyComponent() {
  const { result, error, loading, reverseGeocode, reset } = useReverseGeocode()

  const handleLookup = async () => {
    await reverseGeocode(24.7136, 46.6753, 'en')
  }

  return (
    <View>
      {loading && <ActivityIndicator />}
      {error && <Text>Error: {error}</Text>}
      {result && <Text>{result.formattedAddress}</Text>}
    </View>
  )
}
```

### useGeocode

```typescript
const { result, error, loading, geocode, reset } = useGeocode()

await geocode('Riyadh, Saudi Arabia', 'en')
```

### useGeocodeMultiple

```typescript
const { results, error, loading, geocodeMultiple, reset } = useGeocodeMultiple()

await geocodeMultiple('Springfield', 5, 'en')
// results: GeocoderResult[]
```

### useDistance

```typescript
const { calculateDistance, calculateDistanceKm } = useDistance()

const meters = calculateDistance(24.7136, 46.6753, 21.4225, 39.8262)
const km = calculateDistanceKm(24.7136, 46.6753, 21.4225, 39.8262)
```

### useGeocoder (Combined)

```typescript
const {
  isAvailable,
  geocode,
  reverseGeocode,
  geocodeMultiple,
  calculateDistance,
} = useGeocoder()
```

## License

MIT

## Credits

Built with [Nitro Modules](https://github.com/mrousavy/nitro) by Marc Rousavy.
