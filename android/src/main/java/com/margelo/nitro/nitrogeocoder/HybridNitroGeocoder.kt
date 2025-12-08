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

    @Suppress("DEPRECATION")
    private fun getGeocoder(locale: String): Geocoder {
        val loc = if (locale.isNotEmpty()) Locale(locale) else context.resources.configuration.locale
        return Geocoder(context, loc)
    }

    override val isGeocodingAvailable: Boolean
        get() = Geocoder.isPresent()

    // Plus Code pattern (e.g., "PM7G+C4M", "8FVC9G8F+5W")
    private val plusCodeRegex = Regex("""[A-Z0-9]{4,8}\+[A-Z0-9]{2,4}""")

    private fun buildGeocoderResult(addr: Address, lat: Double? = null, lon: Double? = null): GeocoderResult {
        val sb = StringBuilder()
        for (i in 0..addr.maxAddressLineIndex) {
            if (i > 0) sb.append(", ")
            sb.append(addr.getAddressLine(i))
        }

        // Remove Plus Codes from formatted address
        val formattedAddress = sb.toString()
            .replace(plusCodeRegex, "")
            .replace(Regex(""",\s*,"""), ",")  // Clean up double commas
            .replace(Regex("""^\s*,\s*"""), "") // Clean up leading comma
            .replace(Regex("""\s*,\s*$"""), "") // Clean up trailing comma
            .trim()

        // Combine street number and name
        val street = listOfNotNull(addr.subThoroughfare, addr.thoroughfare)
            .filter { it.isNotEmpty() }
            .joinToString(" ")

        return GeocoderResult(
            position = Position(latitude = lat ?: addr.latitude, longitude = lon ?: addr.longitude),
            formattedAddress = formattedAddress,
            street = street,
            city = addr.locality ?: "",
            state = addr.adminArea ?: "",
            subAdminArea = addr.subAdminArea ?: "",
            subLocality = addr.subLocality ?: "",
            country = addr.countryName ?: "",
            countryCode = addr.countryCode ?: "",
            postalCode = addr.postalCode ?: "",
            region = null
        )
    }

    @Suppress("DEPRECATION")
    override fun geocode(address: String, locale: String): Promise<GeocoderResult> {
        return Promise.async {
            if (!Geocoder.isPresent()) {
                throw Exception("Geocoder not available")
            }

            val addr = getGeocoder(locale).getFromLocationName(address, 1)?.firstOrNull()
                ?: throw Exception("No results found for address: $address")

            buildGeocoderResult(addr)
        }
    }

    @Suppress("DEPRECATION")
    override fun reverseGeocode(latitude: Double, longitude: Double, locale: String): Promise<GeocoderResult> {
        return Promise.async {
            if (!Geocoder.isPresent()) {
                throw Exception("Geocoder not available")
            }

            val addr = getGeocoder(locale).getFromLocation(latitude, longitude, 1)?.firstOrNull()
                ?: throw Exception("No results found for coordinates: $latitude, $longitude")

            buildGeocoderResult(addr, latitude, longitude)
        }
    }

    @Suppress("DEPRECATION")
    override fun geocodeMultiple(address: String, maxResults: Double, locale: String): Promise<Array<GeocoderResult>> {
        return Promise.async {
            if (!Geocoder.isPresent()) {
                throw Exception("Geocoder not available")
            }

            val limit = maxResults.toInt().coerceIn(1, 20)
            val addresses = getGeocoder(locale).getFromLocationName(address, limit) ?: emptyList()
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

            val addr = getGeocoder("").getFromLocation(latitude, longitude, 1)?.firstOrNull()
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
