import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { z } from "zod"
import truncate from "lodash/truncate"

type ZodErrorShape = {
  username?: {
    _errors: string[]
  }
}

type ProfileFormErrors = ZodErrorShape

export const UserProfileModel = types
  .model("UserProfile")
  .props({
    id: types.identifier,
    email: types.string,
    username: types.maybeNull(types.string),
    avatar_url: types.maybeNull(types.string),
    last_sign_in_at: types.maybeNull(types.string),
    created_at: types.maybeNull(types.string),
    updated_at: types.maybeNull(types.string),
  })
  .actions((store) => ({
    setUsername(username: string) {
      store.username = username
    },
  }))
  .views((store) => ({
    get truncatedUsername() {
      if (!store.username) {
        return ""
      }
      return `@${truncate(store.username, { length: 18 })}`
    },
    get profileFormErrors(): ProfileFormErrors {
      const schema = z.object({
        username: z
          .string()
          .regex(/^[a-zA-Z0-9]*$/, { message: "Username must be alphanumeric" })
          .max(15, { message: "Username must be less than 15 characters" })
          .min(3, { message: "Username must be at least 3 characters" }),
      })

      try {
        schema.parse({
          username: store.username,
        })
        return {}
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.format() as ProfileFormErrors
        }
        return {}
      }
    },
  }))

export interface UserProfile extends Instance<typeof UserProfileModel> {}
export interface UserProfileSnapshot
  extends SnapshotOut<typeof UserProfileModel> {}
