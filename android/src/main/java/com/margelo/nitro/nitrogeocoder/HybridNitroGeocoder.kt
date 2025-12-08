package com.margelo.nitro.nitrogeocoder

import android.location.Address
import android.location.Geocoder
import com.facebook.proguard.annotations.DoNotStrip
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

@DoNotStrip
class HybridNitroGeocoder : HybridNitroGeocoderSpec() {

    private val context
        get() = NitroModules.applicationContext
            ?: throw RuntimeException("Application context not available")

    private var _geocoder: Geocoder? = null
    @Suppress("DEPRECATION")
    private val geocoder: Geocoder
        get() {
            if (_geocoder == null) {
                val locale = context.resources.configuration.locale
                _geocoder = Geocoder(context, locale)
            }
            return _geocoder!!
        }

    override val isGeocodingAvailable: Boolean
        get() = Geocoder.isPresent()

    private fun buildGeocoderResult(addr: Address, lat: Double? = null, lon: Double? = null): GeocoderResult {
        val sb = StringBuilder()
        for (i in 0..addr.maxAddressLineIndex) {
            if (i > 0) sb.append(", ")
            sb.append(addr.getAddressLine(i))
        }

        val name = addr.featureName
        val featureName = if (name != null &&
            name != addr.subThoroughfare &&
            name != addr.thoroughfare &&
            name != addr.locality) {
            name
        } else {
            ""
        }

        return GeocoderResult(
            position = Position(lat = lat ?: addr.latitude, lng = lon ?: addr.longitude),
            formattedAddress = sb.toString(),
            featureName = featureName,
            streetNumber = addr.subThoroughfare ?: "",
            streetName = addr.thoroughfare ?: "",
            postalCode = addr.postalCode ?: "",
            city = addr.locality ?: "",
            country = addr.countryName ?: "",
            countryCode = addr.countryCode ?: "",
            state = addr.adminArea ?: "",
            subAdminArea = addr.subAdminArea ?: "",
            subLocality = addr.subLocality ?: "",
            region = null,
            inlandWater = "",
            ocean = ""
        )
    }

    @Suppress("DEPRECATION")
    override fun geocode(address: String, locale: String): Promise<Array<GeocoderResult>> {
        return Promise.async {
            if (!Geocoder.isPresent()) {
                throw Exception("Geocoder not available")
            }

            val addresses = geocoder.getFromLocationName(address, 20)
            if (addresses.isNullOrEmpty()) {
                throw Exception("No results found for address: $address")
            }

            addresses.map { buildGeocoderResult(it) }.toTypedArray()
        }
    }

    @Suppress("DEPRECATION")
    override fun reverseGeocode(latitude: Double, longitude: Double, locale: String): Promise<Array<GeocoderResult>> {
        return Promise.async {
            if (!Geocoder.isPresent()) {
                throw Exception("Geocoder not available")
            }

            val addresses = geocoder.getFromLocation(latitude, longitude, 20)
            if (addresses.isNullOrEmpty()) {
                throw Exception("No results found for coordinates: $latitude, $longitude")
            }

            addresses.map { buildGeocoderResult(it, latitude, longitude) }.toTypedArray()
        }
    }

    @Suppress("DEPRECATION")
    override fun geocodeMultiple(address: String, maxResults: Double, locale: String): Promise<Array<GeocoderResult>> {
        return Promise.async {
            if (!Geocoder.isPresent()) {
                throw Exception("Geocoder not available")
            }

            val limit = maxResults.toInt().coerceIn(1, 20)
            val addresses = geocoder.getFromLocationName(address, limit) ?: emptyList()
            addresses.map { buildGeocoderResult(it) }.toTypedArray()
        }
    }

    override fun calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2) * sin(dLat / 2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2) * sin(dLon / 2)
        return 6371000.0 * 2 * atan2(kotlin.math.sqrt(a), kotlin.math.sqrt(1 - a))
    }

    @Suppress("DEPRECATION")
    override fun reverseGeocodeSimple(latitude: Double, longitude: Double): Promise<String> {
        return Promise.async {
            if (!Geocoder.isPresent()) {
                throw Exception("Geocoder not available")
            }

            val addr = geocoder.getFromLocation(latitude, longitude, 20)?.firstOrNull()
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
