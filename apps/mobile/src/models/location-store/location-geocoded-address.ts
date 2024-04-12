import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * A record type for devices.
 *
 * The `mobx-state-tree` model used to create `Device` instances
 * as well as including as props in other `mobx-state-tree` models.
 */
export const LocationGeocodedAddressModel = types
  .model("LocationGeocodedAddress")
  .props({
    city: types.maybeNull(types.string),
    country: types.maybeNull(types.string),
    district: types.maybeNull(types.string),
    isoCountryCode: types.maybeNull(types.string),
    name: types.maybeNull(types.string),
    postalCode: types.maybeNull(types.string),
    region: types.maybeNull(types.string),
    street: types.maybeNull(types.string),
    streetNumber: types.maybeNull(types.string),
    subregion: types.maybeNull(types.string),
    /**
     * ios only
     **/
    timezone: types.maybeNull(types.string),
  })

export interface LocationGeocodedAddress
  extends Instance<typeof LocationGeocodedAddressModel> {}
export interface LocationGeocodedAddressSnapshot
  extends SnapshotOut<typeof LocationGeocodedAddressModel> {}
