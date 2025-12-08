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

    private func getLocale(_ locale: String) -> Locale {
        if locale.isEmpty {
            return Locale.current
        }
        return Locale(identifier: locale)
    }

    var isGeocodingAvailable: Bool {
        CLLocationManager.locationServicesEnabled()
    }

    private func buildGeocoderResult(from p: CLPlacemark, lat: Double? = nil, lng: Double? = nil) -> GeocoderResult? {
        let latitude = lat ?? p.location?.coordinate.latitude
        let longitude = lng ?? p.location?.coordinate.longitude

        guard let lat = latitude, let lng = longitude else { return nil }

        // Combine street number and name
        var street = ""
        if let num = p.subThoroughfare, let name = p.thoroughfare {
            street = "\(num) \(name)"
        } else if let name = p.thoroughfare {
            street = name
        } else if let num = p.subThoroughfare {
            street = num
        }

        return GeocoderResult(
            position: Position(latitude: lat, longitude: lng),
            formattedAddress: (p.addressDictionary?["FormattedAddressLines"] as? [String])?.joined(separator: ", ") ?? "",
            street: street,
            city: p.locality ?? "",
            state: p.administrativeArea ?? "",
            subAdminArea: p.subAdministrativeArea ?? "",
            subLocality: p.subLocality ?? "",
            country: p.country ?? "",
            countryCode: p.isoCountryCode ?? "",
            postalCode: p.postalCode ?? "",
            region: (p.region as? CLCircularRegion).map { region in
                .second(Region(
                    center: Position(latitude: region.center.latitude, longitude: region.center.longitude),
                    radius: region.radius
                ))
            }
        )
    }

    func geocode(address: String, locale: String) throws -> Promise<GeocoderResult> {
        let promise = Promise<GeocoderResult>()

        if geocoder.isGeocoding {
            geocoder.cancelGeocode()
        }

        geocoder.geocodeAddressString(address, in: nil, preferredLocale: getLocale(locale)) { placemarks, error in
            if error != nil {
                promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                return
            }

            guard let p = placemarks?.first,
                  let result = self.buildGeocoderResult(from: p) else {
                promise.reject(withError: RuntimeError.error(withMessage: "No results found"))
                return
            }

            promise.resolve(withResult: result)
        }

        return promise
    }

    func reverseGeocode(latitude: Double, longitude: Double, locale: String) throws -> Promise<GeocoderResult> {
        let promise = Promise<GeocoderResult>()

        if geocoder.isGeocoding {
            geocoder.cancelGeocode()
        }

        let location = CLLocation(latitude: latitude, longitude: longitude)

        geocoder.reverseGeocodeLocation(location, preferredLocale: getLocale(locale)) { placemarks, error in
            if error != nil {
                promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                return
            }

            guard let p = placemarks?.first,
                  let result = self.buildGeocoderResult(from: p, lat: latitude, lng: longitude) else {
                promise.reject(withError: RuntimeError.error(withMessage: "No results found"))
                return
            }

            promise.resolve(withResult: result)
        }

        return promise
    }

    func geocodeMultiple(address: String, maxResults: Double, locale: String) throws -> Promise<[GeocoderResult]> {
        let promise = Promise<[GeocoderResult]>()
        let limit = min(max(Int(maxResults), 1), 10)

        if geocoder.isGeocoding {
            geocoder.cancelGeocode()
        }

        geocoder.geocodeAddressString(address, in: nil, preferredLocale: getLocale(locale)) { placemarks, error in
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
