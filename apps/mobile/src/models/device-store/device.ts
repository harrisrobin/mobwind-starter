import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * A record type for devices.
 *
 * The `mobx-state-tree` model used to create `Device` instances
 * as well as including as props in other `mobx-state-tree` models.
 */
export const DeviceModel = types
  .model("Device")
  .props({
    screenWidth: types.optional(types.number, 0),
    screenHeight: types.optional(types.number, 0),
    /**
     * true if the app is running on a real device
     * and false if running in a simulator or emulator.
     * On web, this is always set to true.
     */
    isDevice: types.maybeNull(types.boolean),
    brand: types.maybeNull(types.string),
    modelName: types.maybeNull(types.string),
    modelId: types.maybeNull(types.string),
    osName: types.maybeNull(types.string),
    osversion: types.maybeNull(types.string),
    deviceName: types.maybeNull(types.string),
    platform: types.maybeNull(types.string),
  })
  .views((self) => ({
    get isIos() {
      return self.platform === "ios"
    },
    get isAndroid() {
      return self.platform === "android"
    },
  }))

export interface Device extends Instance<typeof DeviceModel> {}
export interface DeviceSnapshot extends SnapshotOut<typeof DeviceModel> {}
