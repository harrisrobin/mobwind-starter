import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { UserProfile, UserProfileModel } from "./user-profile"
import { supabase } from "@/services/supabase"
import { Tables } from "@/services/supabase/supabase-constants"
import { getRootStore } from "../helpers/get-root-store"
import { reportError } from "@/utils/exceptions"

export const UserStoreModel = types
  .model("UserStore")
  .props({
    currentUserProfile: types.maybeNull(UserProfileModel),
  })
  .actions((store) => ({
    setCurrentUserProfile(user: UserProfile) {
      store.currentUserProfile = user
    },
  }))
  .actions((store) => ({
    async apiCheckIfUsernameExists(username: string) {
      try {
        const { data, error } = await supabase
          .from(Tables.users_profiles)
          .select("username")
          .eq("username", username)

        if (error) {
          console.error("Error checking username", error)
          // handle error appropriately
          throw error
        }

        return data.length > 0
      } catch (error) {
        if (error instanceof Error) {
          reportError(error)
        } else {
          // handle non-Error objects if necessary
          console.log("unknown error", error)
        }
      }
    },
    async apiSaveCurrentUserProfile(fieldsToUpdate: Partial<UserProfile>) {
      try {
        if (!store.currentUserProfile?.id) {
          throw new Error("No current user profile")
        }

        const { error } = await supabase
          .from(Tables.users_profiles)
          .update({
            ...fieldsToUpdate,
          })
          .eq("id", store.currentUserProfile.id)

        if (error) {
          throw error
        }
      } catch (error) {
        if (error instanceof Error) {
          reportError(error)
        } else {
          // handle non-Error objects if necessary
          console.log("unknown error", error)
        }
      }
    },
    async apiGetCurrentUserProfile() {
      const rootStore = getRootStore(store)
      const { authenticationStore, userStore } = rootStore
      const authUserId = authenticationStore.authUser?.id

      if (!authUserId) {
        return
      }

      try {
        const { data: userProfile, error } = await supabase
          .from(Tables.users_profiles)
          .select("*")
          .eq("id", authUserId)
          .single()

        if (error) {
          throw error
        }

        if (userProfile) {
          userStore.setCurrentUserProfile(
            UserProfileModel.create({
              id: userProfile.id,
              email: userProfile.email,
              username: userProfile.username,
              avatar_url: userProfile.avatar_url,
              last_sign_in_at: userProfile.last_sign_in_at,
              created_at: userProfile.created_at,
              updated_at: userProfile.updated_at,
            }),
          )
        }
      } catch (error) {
        if (error instanceof Error) {
          reportError(error)
        } else {
          // handle non-Error objects if necessary
          console.log("unknown error", error)
        }
      }
    },
  }))
  .actions((store) => ({
    reset() {
      store.currentUserProfile = null
    },
  }))

export interface AuthStore extends Instance<typeof UserStoreModel> {}
export interface DeviceStoreSnapshot
  extends SnapshotOut<typeof UserStoreModel> {}
