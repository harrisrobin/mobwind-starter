import { AppState, NativeEventSubscription } from "react-native"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./authentication-store"
import { PermissionsStoreModel } from "./permissions-store"
import { DeviceStoreModel } from "./device-store"
import { UserStoreModel } from "./user-store/user-store"
import { LocationStoreModel } from "./location-store"

/**
 * A RootStore model.
 */
export const RootStoreModel = types
  .model("RootStore")
  .volatile(() => ({
    appStateListener: null as NativeEventSubscription | null,
  }))
  .props({
    authenticationStore: types.optional(AuthenticationStoreModel, {}),
    permissionsStore: types.optional(PermissionsStoreModel, {}),
    deviceStore: types.optional(DeviceStoreModel, {}),
    userStore: types.optional(UserStoreModel, {}),
    locationStore: types.optional(LocationStoreModel, {}),
  })
  .actions((self) => ({
    onAppForeground(state = "active") {
      if (state === "active") {
        if (__DEV__) {
          console.log("App Is foregrounded")
        }
        self.permissionsStore.onAppForeground()
        self.locationStore.onAppForeground()
      }
    },
    reset() {
      self.authenticationStore.reset()
      self.userStore.reset()
      self.locationStore.reset()
      self.deviceStore.reset()
    },
  }))
  .actions((self) => ({
    afterCreate() {
      self.appStateListener = AppState.addEventListener(
        "change",
        self.onAppForeground,
      )
    },
    beforeDestroy() {
      self.appStateListener?.remove()
    },
  }))

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
