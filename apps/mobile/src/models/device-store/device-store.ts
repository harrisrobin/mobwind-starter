import { Dimensions, Platform } from "react-native"
import * as ExpoDevice from "expo-device"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { Device, DeviceModel } from "./device"

export const DeviceStoreModel = types
  .model("DeviceStore")
  .props({
    currentDevice: types.optional(DeviceModel, {} as Device),
  })
  .actions((self) => ({
    refreshCurrentDeviceInfo() {
      const window = Dimensions.get("window")
      self.currentDevice.screenWidth = window.width
      self.currentDevice.screenHeight = window.height
      self.currentDevice.brand = ExpoDevice.brand
      self.currentDevice.deviceName = ExpoDevice.deviceName
      self.currentDevice.isDevice = ExpoDevice.isDevice
      self.currentDevice.modelName = ExpoDevice.modelName
      self.currentDevice.modelId = ExpoDevice.modelId
      self.currentDevice.osName = ExpoDevice.osName
      self.currentDevice.osversion = ExpoDevice.osVersion
      self.currentDevice.platform = Platform.OS
    },
  }))
  .actions((self) => ({
    reset() {
      self.currentDevice = {} as Device
    },
  }))

export interface DeviceStore extends Instance<typeof DeviceStoreModel> {}
export interface DeviceStoreSnapshot
  extends SnapshotOut<typeof DeviceStoreModel> {}
