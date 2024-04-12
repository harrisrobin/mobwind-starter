import * as Location from "expo-location";
import { Instance, SnapshotOut, types } from "mobx-state-tree";

type AndroidLocationAccuracy = "fine" | "coarse" | "none";
export const PermissionsStoreModel = types
  .model("PermissionsStore")
  .props({
    location: types.optional(
      types.enumeration([
        Location.PermissionStatus.GRANTED,
        Location.PermissionStatus.DENIED,
        Location.PermissionStatus.UNDETERMINED,
      ]),
      Location.PermissionStatus.UNDETERMINED
    ),
    locationCanAskAgain: types.optional(types.boolean, true),
    locationAndroidAccuracy: types.optional(
      types.enumeration(["fine", "coarse", "none"]),
      "none"
    ),
    locationIosScope: types.optional(
      types.enumeration(["whenInUse", "always", "none"]),
      "none"
    ),
  })
  .views((self) => ({
    get isLocationPermissionGranted() {
      return self.location === Location.PermissionStatus.GRANTED;
    },
  }))
  .actions((store) => ({
    setLocationPermission(
      permission: Location.PermissionStatus,
      canAskAgain = true,
      locationAndroidAccuracy: AndroidLocationAccuracy = "none",
      iosScope: Location.PermissionDetailsLocationIOS["scope"] = "none"
    ) {
      store.location = permission;
      store.locationCanAskAgain = canAskAgain;
      store.locationAndroidAccuracy = locationAndroidAccuracy;
      store.locationIosScope = iosScope;
    },
  }))
  .actions((store) => ({
    requestLocationPermission: async () => {
      const locationPermission =
        await Location.requestForegroundPermissionsAsync();
      store.setLocationPermission(
        locationPermission.status,
        locationPermission.canAskAgain,
        locationPermission.android?.accuracy,
        locationPermission.ios?.scope
      );
    },
  }))
  .actions((store) => ({
    checkLocationPermission: async () => {
      const locationPermission = await Location.getForegroundPermissionsAsync();
      store.setLocationPermission(
        locationPermission.status,
        locationPermission.canAskAgain,
        locationPermission.android?.accuracy,
        locationPermission.ios?.scope
      );
    },
  }))
  .actions((store) => ({
    onAppForeground() {
      void store.checkLocationPermission();
    },
  }));

export interface PermissionsStore
  extends Instance<typeof PermissionsStoreModel> {}
export interface PermissionsStoreSnapshot
  extends SnapshotOut<typeof PermissionsStoreModel> {}
