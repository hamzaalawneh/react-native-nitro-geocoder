# Nitro Geocoder Example

This is an example app demonstrating the usage of `react-native-nitro-geocoder`.

## Getting Started

### 1. Install dependencies

```bash
# From the example directory
yarn install

# Install pods for iOS
cd ios && pod install && cd ..
```

### 2. Run the app

```bash
# iOS
yarn ios

# Android
yarn android
```

## Features Demonstrated

- **Forward Geocoding**: Convert addresses to coordinates
- **Reverse Geocoding**: Convert coordinates to addresses
- **Distance Calculation**: Calculate distance between two points (synchronous)
- **Locale Support**: Switch between different languages (EN, AR, JA, FR, DE)
- **Quick Location Selection**: Pre-defined locations for testing

## Screenshots

The example app shows:

1. **Status Card**: Displays if geocoding is available on the device
2. **Locale Selector**: Switch between supported languages
3. **Forward Geocode**: Enter an address and get coordinates
4. **Reverse Geocode**: Enter coordinates or select a quick location
5. **Distance Calculation**: Calculate distance between Riyadh and Mecca
6. **Results Display**: Shows full geocoding response with confidence level
