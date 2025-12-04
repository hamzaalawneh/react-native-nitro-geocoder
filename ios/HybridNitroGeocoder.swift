//
//  HybridNitroGeocoder.swift
//  react-native-nitro-geocoder
//

import Foundation
import CoreLocation
import NitroModules

class HybridNitroGeocoder: HybridNitroGeocoderSpec {

    private static let enLocale = Locale(identifier: "en_US_POSIX")
    private var cache = [String: Any]()

    var isGeocodingAvailable: Bool {
        CLLocationManager.locationServicesEnabled()
    }

    @inline(__always)
    private static func buildAddress(_ p: CLPlacemark) -> String {
        var parts = [String]()
        parts.reserveCapacity(7)
        if let v = p.subThoroughfare { parts.append(v) }
        if let v = p.thoroughfare { parts.append(v) }
        if let v = p.subLocality { parts.append(v) }
        if let v = p.locality { parts.append(v) }
        if let v = p.administrativeArea { parts.append(v) }
        if let v = p.postalCode { parts.append(v) }
        if let v = p.country { parts.append(v) }
        return parts.joined(separator: ", ")
    }

    @inline(__always)
    private static func buildStreet(_ p: CLPlacemark) -> String {
        let sub = p.subThoroughfare
        let main = p.thoroughfare
        if let s = sub, let m = main { return "\(s) \(m)" }
        return main ?? sub ?? ""
    }

    @inline(__always)
    private static func getConfidence(_ p: CLPlacemark) -> GeocodingConfidence {
        if p.subThoroughfare != nil { return .high }
        if p.thoroughfare != nil { return .medium }
        return .low
    }

    @inline(__always)
    private static func makeGeocodeResult(_ p: CLPlacemark, _ loc: CLLocation) -> GeocodeResult {
        GeocodeResult(
            latitude: loc.coordinate.latitude,
            longitude: loc.coordinate.longitude,
            address: buildAddress(p),
            street: buildStreet(p),
            district: p.subLocality ?? "",
            city: p.locality ?? "",
            state: p.administrativeArea ?? "",
            country: p.country ?? "",
            countryCode: p.isoCountryCode ?? "",
            postalCode: p.postalCode ?? "",
            confidence: getConfidence(p)
        )
    }

    @inline(__always)
    private static func makeReverseResult(_ p: CLPlacemark, lat: Double, lon: Double) -> ReverseGeocodeResult {
        ReverseGeocodeResult(
            latitude: lat,
            longitude: lon,
            address: buildAddress(p),
            street: buildStreet(p),
            district: p.subLocality ?? "",
            city: p.locality ?? "",
            state: p.administrativeArea ?? "",
            country: p.country ?? "",
            countryCode: p.isoCountryCode ?? "",
            postalCode: p.postalCode ?? "",
            confidence: getConfidence(p)
        )
    }

    func geocode(address: String, locale: String) throws -> Promise<GeocodeResult> {
        let cacheKey = "g:\(locale):\(address)"

        if let cached = cache[cacheKey] as? GeocodeResult {
            return Promise.resolved(withResult: cached)
        }

        let promise = Promise<GeocodeResult>()
        let loc = Locale(identifier: locale)

        CLGeocoder().geocodeAddressString(address, in: nil, preferredLocale: loc) { [self] placemarks, error in
            if error != nil {
                promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                return
            }

            guard let p = placemarks?.first, let location = p.location else {
                promise.reject(withError: RuntimeError.error(withMessage: "No results found"))
                return
            }

            let result = Self.makeGeocodeResult(p, location)
            cache[cacheKey] = result
            promise.resolve(withResult: result)
        }

        return promise
    }

    func reverseGeocode(latitude: Double, longitude: Double, locale: String) throws -> Promise<ReverseGeocodeResult> {
        let cacheKey = "r:\(locale):\(latitude):\(longitude)"

        if let cached = cache[cacheKey] as? ReverseGeocodeResult {
            return Promise.resolved(withResult: cached)
        }

        let promise = Promise<ReverseGeocodeResult>()
        let loc = Locale(identifier: locale)

        CLGeocoder().reverseGeocodeLocation(
            CLLocation(latitude: latitude, longitude: longitude),
            preferredLocale: loc
        ) { [self] placemarks, error in
            if error != nil {
                promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                return
            }

            guard let p = placemarks?.first else {
                promise.reject(withError: RuntimeError.error(withMessage: "No results found"))
                return
            }

            let result = Self.makeReverseResult(p, lat: latitude, lon: longitude)
            cache[cacheKey] = result
            promise.resolve(withResult: result)
        }

        return promise
    }

    func geocodeMultiple(address: String, maxResults: Double, locale: String) throws -> Promise<[GeocodeResult]> {
        let promise = Promise<[GeocodeResult]>()
        let limit = min(max(Int(maxResults), 1), 10)
        let loc = Locale(identifier: locale)

        CLGeocoder().geocodeAddressString(address, in: nil, preferredLocale: loc) { placemarks, error in
            if error != nil {
                promise.reject(withError: RuntimeError.error(withMessage: "Geocode failed"))
                return
            }

            guard let pms = placemarks else {
                promise.resolve(withResult: [])
                return
            }

            var results = [GeocodeResult]()
            results.reserveCapacity(limit)

            for p in pms.prefix(limit) {
                if let location = p.location {
                    results.append(Self.makeGeocodeResult(p, location))
                }
            }

            promise.resolve(withResult: results)
        }

        return promise
    }

    func calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double) throws -> Double {
        CLLocation(latitude: lat1, longitude: lon1).distance(from: CLLocation(latitude: lat2, longitude: lon2))
    }

    func clearCache() throws {
        cache.removeAll()
    }

    func reverseGeocodeSimple(latitude: Double, longitude: Double) throws -> Promise<String> {
        let promise = Promise<String>()

        CLGeocoder().reverseGeocodeLocation(
            CLLocation(latitude: latitude, longitude: longitude),
            preferredLocale: Self.enLocale
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
            parts.reserveCapacity(4)

            if let v = pm.subThoroughfare, !v.isEmpty { parts.append(v) }
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
