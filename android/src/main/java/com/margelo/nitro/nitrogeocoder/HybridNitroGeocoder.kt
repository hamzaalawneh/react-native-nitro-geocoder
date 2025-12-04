package com.margelo.nitro.nitrogeocoder

import android.location.Address
import android.location.Geocoder
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import java.util.Locale
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

@DoNotStrip
class HybridNitroGeocoder : HybridNitroGeocoderSpec() {

    private val context
        get() = NitroModules.applicationContext
            ?: throw RuntimeException("Application context not available")

    private val geocoderCache = mutableMapOf<String, Geocoder>()
    private val resultCache = mutableMapOf<String, Any>()

    private fun getGeocoder(locale: String): Geocoder {
        return geocoderCache.getOrPut(locale) {
            Geocoder(context, Locale(locale))
        }
    }

    override val isGeocodingAvailable: Boolean
        get() = Geocoder.isPresent()

    @Suppress("DEPRECATION")
    override fun geocode(address: String, locale: String): Promise<GeocodeResult> {
        return Promise.async {
            val cacheKey = "f:$locale:$address"
            resultCache[cacheKey]?.let {
                @Suppress("UNCHECKED_CAST")
                return@async it as GeocodeResult
            }

            val addr = getGeocoder(locale).getFromLocationName(address, 1)?.firstOrNull()
                ?: throw Exception("No results found for address: $address")

            val sub = addr.subThoroughfare
            val main = addr.thoroughfare
            val result = GeocodeResult(
                latitude = addr.latitude,
                longitude = addr.longitude,
                address = addr.getAddressLine(0) ?: "",
                street = if (sub != null && main != null) "$sub $main" else main ?: sub ?: "",
                district = addr.subLocality ?: "",
                city = addr.locality ?: "",
                state = addr.adminArea ?: "",
                country = addr.countryName ?: "",
                countryCode = addr.countryCode ?: "",
                postalCode = addr.postalCode ?: "",
                confidence = if (sub != null) GeocodingConfidence.HIGH else if (main != null) GeocodingConfidence.MEDIUM else GeocodingConfidence.LOW
            )
            resultCache[cacheKey] = result
            result
        }
    }

    @Suppress("DEPRECATION")
    override fun reverseGeocode(latitude: Double, longitude: Double, locale: String): Promise<ReverseGeocodeResult> {
        return Promise.async {
            val cacheKey = "r:$locale:$latitude,$longitude"
            resultCache[cacheKey]?.let {
                @Suppress("UNCHECKED_CAST")
                return@async it as ReverseGeocodeResult
            }

            val addr = getGeocoder(locale).getFromLocation(latitude, longitude, 1)?.firstOrNull()
                ?: throw Exception("No results found for coordinates: $latitude, $longitude")

            val sub = addr.subThoroughfare
            val main = addr.thoroughfare
            val result = ReverseGeocodeResult(
                latitude = latitude,
                longitude = longitude,
                address = addr.getAddressLine(0) ?: "",
                street = if (sub != null && main != null) "$sub $main" else main ?: sub ?: "",
                district = addr.subLocality ?: "",
                city = addr.locality ?: "",
                state = addr.adminArea ?: "",
                country = addr.countryName ?: "",
                countryCode = addr.countryCode ?: "",
                postalCode = addr.postalCode ?: "",
                confidence = if (sub != null) GeocodingConfidence.HIGH else if (main != null) GeocodingConfidence.MEDIUM else GeocodingConfidence.LOW
            )
            resultCache[cacheKey] = result
            result
        }
    }

    @Suppress("DEPRECATION")
    override fun geocodeMultiple(address: String, maxResults: Double, locale: String): Promise<Array<GeocodeResult>> {
        return Promise.async {
            val limit = maxResults.toInt().coerceIn(1, 10)
            val results = getGeocoder(locale).getFromLocationName(address, limit) ?: emptyList()

            results.map { addr ->
                val sub = addr.subThoroughfare
                val main = addr.thoroughfare
                GeocodeResult(
                    latitude = addr.latitude,
                    longitude = addr.longitude,
                    address = addr.getAddressLine(0) ?: "",
                    street = if (sub != null && main != null) "$sub $main" else main ?: sub ?: "",
                    district = addr.subLocality ?: "",
                    city = addr.locality ?: "",
                    state = addr.adminArea ?: "",
                    country = addr.countryName ?: "",
                    countryCode = addr.countryCode ?: "",
                    postalCode = addr.postalCode ?: "",
                    confidence = if (sub != null) GeocodingConfidence.HIGH else if (main != null) GeocodingConfidence.MEDIUM else GeocodingConfidence.LOW
                )
            }.toTypedArray()
        }
    }

    override fun calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2) * sin(dLon / 2)
        return 6371000.0 * 2 * atan2(sqrt(a), sqrt(1 - a))
    }

    override fun clearCache() {
        resultCache.clear()
    }

    @Suppress("DEPRECATION")
    override fun reverseGeocodeSimple(latitude: Double, longitude: Double): Promise<String> {
        return Promise.async {
            val geocoder = Geocoder(context)
            val addr = geocoder.getFromLocation(latitude, longitude, 1)?.firstOrNull()
                ?: throw Exception("No result found")

            listOfNotNull(
                addr.subThoroughfare,
                addr.thoroughfare,
                addr.subLocality,
                addr.locality,
                addr.countryName
            ).joinToString(", ")
        }
    }
}
