import { NitroModules } from 'react-native-nitro-modules'
import type { NitroGeocoder, GeocoderResult, Position, Region } from './specs/Geocoder.nitro'

export function createGeocoder(): NitroGeocoder {
  return NitroModules.createHybridObject<NitroGeocoder>('NitroGeocoder')
}

export const Geocoder: NitroGeocoder = createGeocoder()

export type { NitroGeocoder, GeocoderResult, Position, Region }

export {
  useReverseGeocode,
  useGeocode,
  useGeocodeMultiple,
  useDistance,
  useGeocoder,
} from './hooks'

export default Geocoder
