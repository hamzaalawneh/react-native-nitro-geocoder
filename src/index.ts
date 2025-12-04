import { NitroModules } from 'react-native-nitro-modules'
import type {
  NitroGeocoder,
  GeocodeResult,
  ReverseGeocodeResult,
  GeocodingConfidence,
} from './specs/Geocoder.nitro'

export function createGeocoder(): NitroGeocoder {
  return NitroModules.createHybridObject<NitroGeocoder>('NitroGeocoder')
}

export const Geocoder: NitroGeocoder = createGeocoder()

export type { NitroGeocoder, GeocodeResult, ReverseGeocodeResult, GeocodingConfidence }

export default Geocoder
