//
//  HybridNitroGeocoder.swift
//  react-native-nitro-geocoder
//

import Foundation
import CoreLocation
import NitroModules

class HybridNitroGeocoder: HybridNitroGeocoderSpec {

    private var _geocoder: CLGeocoder?
    private var geocoder: CLGeocoder {
        if _geocoder == nil {
            _geocoder = CLGeocoder()
        }
        return _geocoder!
    }

    var isGeocodingAvailable: Bool {
        CLLocationManager.locationServicesEnabled()
    }

    private func buildGeocoderResult(from p: CLPlacemark, lat: Double? = nil, lng: Double? = nil) -> GeocoderResult? {
        let latitude = lat ?? p.location?.coordinate.latitude
        let longitude = lng ?? p.location?.coordinate.longitude

        guard let lat = latitude, let lng = longitude else { return nil }

        var featureName: String? = nil
        if let name = p.name,
           name != p.locality,
           name != p.thoroughfare,
           name != p.subThoroughfare {
            featureName = name
        }

        return GeocoderResult(
            position: Position(lat: lat, lng: lng),
            formattedAddress: (p.addressDictionary?["FormattedAddressLines"] as? [String])?.joined(separator: ", ") ?? "",
            featureName: featureName ?? "",
            streetNumber: p.subThoroughfare ?? "",
            streetName: p.thoroughfare ?? "",
            postalCode: p.postalCode ?? "",
            city: p.locality ?? "",
            country: p.country ?? "",
            countryCode: p.isoCountryCode ?? "",
            state: p.administrativeArea ?? "",
            subAdminArea: p.subAdministrativeArea ?? "",
            subLocality: p.subLocality ?? "",
            region: (p.region as? CLCircularRegion).map { region in
                .second(Region(
                    center: Position(lat: region.center.latitude, lng: region.center.longitude),
                    radius: region.radius
                ))
            },
            inlandWater: p.inlandWater ?? "",
            ocean: p.ocean ?? ""
        )
    }

    func geocode(address: String, locale: String) throws -> Promise<[GeocoderResult]> {
        let promise = Promise<[GeocoderResult]>()

        if geocoder.isGeocoding {
            geocoder.cancelGeocode()
        }

        geocoder.geocodeAddressString(address) { placemarks, error in
            if error != nil {
                if placemarks?.count == 0 {
                    promise.reject(withError: RuntimeError.error(withMessage: "No results found"))
                } else {
                    promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                }
                return
            }

            guard let pms = placemarks, !pms.isEmpty else {
                promise.reject(withError: RuntimeError.error(withMessage: "No results found"))
                return
            }

            var results = [GeocoderResult]()
            for p in pms {
                if let result = self.buildGeocoderResult(from: p) {
                    results.append(result)
                }
            }
            promise.resolve(withResult: results)
        }

        return promise
    }

    func reverseGeocode(latitude: Double, longitude: Double, locale: String) throws -> Promise<[GeocoderResult]> {
        let promise = Promise<[GeocoderResult]>()

        if geocoder.isGeocoding {
            geocoder.cancelGeocode()
        }

        let location = CLLocation(latitude: latitude, longitude: longitude)

        geocoder.reverseGeocodeLocation(location, preferredLocale: NSLocale.current) { placemarks, error in
            if error != nil {
                if placemarks?.count == 0 {
                    promise.reject(withError: RuntimeError.error(withMessage: "No results found"))
                } else {
                    promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                }
                return
            }

            guard let pms = placemarks, !pms.isEmpty else {
                promise.reject(withError: RuntimeError.error(withMessage: "No results found"))
                return
            }

            var results = [GeocoderResult]()
            for p in pms {
                if let result = self.buildGeocoderResult(from: p, lat: latitude, lng: longitude) {
                    results.append(result)
                }
            }
            promise.resolve(withResult: results)
        }

        return promise
    }

    func geocodeMultiple(address: String, maxResults: Double, locale: String) throws -> Promise<[GeocoderResult]> {
        let promise = Promise<[GeocoderResult]>()
        let limit = min(max(Int(maxResults), 1), 10)

        if geocoder.isGeocoding {
            geocoder.cancelGeocode()
        }

        geocoder.geocodeAddressString(address) { placemarks, error in
            if error != nil {
                promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                return
            }

            guard let pms = placemarks else {
                promise.resolve(withResult: [])
                return
            }

            var results = [GeocoderResult]()
            for p in pms.prefix(limit) {
                if let result = self.buildGeocoderResult(from: p) {
                    results.append(result)
                }
            }
            promise.resolve(withResult: results)
        }

        return promise
    }

    func calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double) throws -> Double {
        CLLocation(latitude: lat1, longitude: lon1).distance(from: CLLocation(latitude: lat2, longitude: lon2))
    }

    func reverseGeocodeSimple(latitude: Double, longitude: Double) throws -> Promise<String> {
        let promise = Promise<String>()

        if geocoder.isGeocoding {
            geocoder.cancelGeocode()
        }

        geocoder.reverseGeocodeLocation(
            CLLocation(latitude: latitude, longitude: longitude),
            preferredLocale: NSLocale.current
        ) { placemarks, error in
            if error != nil {
                promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                return
            }

            guard let pm = placemarks?.first else {
                promise.reject(withError: RuntimeError.error(withMessage: "No address found"))
                return
            }

            var parts = [String]()
            if let v = pm.subThoroughfare, !v.isEmpty { parts.append(v) }
            if let v = pm.thoroughfare, !v.isEmpty { parts.append(v) }
            if let v = pm.subLocality, !v.isEmpty { parts.append(v) }
            if let v = pm.locality, !v.isEmpty { parts.append(v) }
            if let v = pm.country, !v.isEmpty { parts.append(v) }

            guard !parts.isEmpty else {
                promise.reject(withError: RuntimeError.error(withMessage: "No address found"))
                return
            }

            promise.resolve(withResult: parts.joined(separator: ", "))
        }

        return promise
    }
}
