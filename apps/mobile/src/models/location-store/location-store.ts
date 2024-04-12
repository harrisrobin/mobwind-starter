import { Instance, SnapshotOut, types } from "mobx-state-tree"
import * as Location from "expo-location"
import { getRootStore } from "../helpers/get-root-store"
import { LocationGeocodedAddressModel } from "./location-geocoded-address"
import { reportError } from "../../utils/exceptions"

export const LocationStoreModel = types
  .model("LocationStore")
  .props({
    latitude: types.maybeNull(types.number),
    longitude: types.maybeNull(types.number),
    lastCheckedAt: types.maybeNull(types.number),
    locationGeocodedAddress: types.maybeNull(LocationGeocodedAddressModel),
  })
  .actions((store) => ({
    setLatitude(value: number) {
      store.latitude = value
    },
    setLongitude(value: number) {
      store.longitude = value
    },
    setLastCheckedAt(value: number) {
      store.lastCheckedAt = value
    },
    setLocationGeocodedAddress(value: Location.LocationGeocodedAddress) {
      store.locationGeocodedAddress = value
    },
  }))
  .views((store) => ({
    get isLocationAvailable() {
      return store.latitude !== null && store.longitude !== null
    },
    get isLocationGeocoded() {
      return store.locationGeocodedAddress !== null
    },
    get formattedStateAndCountry() {
      if (!this.isLocationGeocoded) return null
      return [
        store.locationGeocodedAddress?.subregion,
        store.locationGeocodedAddress?.country,
      ]
        .filter(Boolean)
        .join(", ")
    },
  }))
  .actions((store) => ({
    async getCurrentLocationAsync() {
      const rootStore = getRootStore(store)
      const { isLocationPermissionGranted } = rootStore.permissionsStore

      if (!isLocationPermissionGranted) {
        throw new Error("Permission to access location was denied")
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords
      store.setLatitude(latitude)
      store.setLongitude(longitude)
      store.setLastCheckedAt(location.timestamp)
    },
    /**
     * Please note that the reverseGeocodeAsync
     * function requires the ACCESS_FINE_LOCATION permission
     * on Android and the location permission on
     * iOS. Make sure to request these permissions before
     * calling this function.
     **/
    async getLocationAddressAsync() {
      const rootStore = getRootStore(store)
      const { isLocationPermissionGranted } = rootStore.permissionsStore

      if (store.latitude === null || store.longitude === null) {
        throw new Error("Latitude and longitude are not set")
      }
      if (!isLocationPermissionGranted) {
        throw new Error("Permission to access location was denied")
      }

      const addresses = await Location.reverseGeocodeAsync({
        latitude: store.latitude,
        longitude: store.longitude,
      })

      if (addresses.length === 0) {
        throw new Error("No addresses found for the given coordinates")
      }

      const [firstAddress] = addresses
      store.setLocationGeocodedAddress(firstAddress)
    },
  }))
  .actions((store) => ({
    reset() {
      store.latitude = null
      store.longitude = null
      store.lastCheckedAt = null
      store.locationGeocodedAddress = null
    },
  }))
  .actions((store) => ({
    onAppForeground() {
      store.getCurrentLocationAsync().catch(reportError)
      store.getLocationAddressAsync().catch(reportError)
    },
  }))

export interface LocationStore extends Instance<typeof LocationStoreModel> {}
export interface LocationStoreSnapshot
  extends SnapshotOut<typeof LocationStoreModel> {}
