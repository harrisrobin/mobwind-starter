import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { supabase } from "@/services/supabase"
import { AuthUser, AuthUserModel } from "./authentication-user"
import { reportError } from "../../utils/exceptions"
import { getRootStore } from "../helpers/get-root-store"

interface ApiSignInWithIdTokenParams {
  identityToken: string
  provider: "apple" | "google"
}

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .volatile(() => ({
    onAuthStateChangedUnsubscribe: null as null | (() => void),
  }))
  .props({
    authUser: types.maybeNull(AuthUserModel),
  })
  .actions((store) => ({
    setAuthUser(user: AuthUser) {
      store.authUser = user
    },
    reset() {
      store.authUser = null
    },
  }))

  .actions((store) => ({
    async apiGetAuthUser() {
      try {
        const { data } = await supabase.auth.getUser()
        const user = data.user

        if (user && user.email) {
          store.setAuthUser(
            AuthUserModel.create({
              id: user.id,
              email: user.email,
              emailConfirmedAt: user.confirmed_at,
              createdAt: user.created_at,
              updatedAt: user.updated_at,
              lastSignInAt: user.last_sign_in_at,
              phone: user.phone,
              providers: user.app_metadata.providers,
              roles: user.app_metadata.roles,
            }),
          )
        }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message)
          reportError(error)
        } else {
          // handle non-Error objects if necessary
          console.log("unknown error", error)
        }
      }
    },
    async apiSignOut() {
      await supabase.auth.signOut()
    },
    async onSignInSuccess() {
      const rootStore = getRootStore(store)
      await rootStore.userStore.apiGetCurrentUserProfile()
    },
  }))
  .actions((store) => ({
    async apiSignInWithIdToken({
      identityToken,
      provider,
    }: ApiSignInWithIdTokenParams) {
      if (!identityToken) {
        throw new Error("No identityToken.")
      }
      // Sign in via Supabase Auth.
      const {
        error,
        data: { user },
      } = await supabase.auth.signInWithIdToken({
        provider: provider,
        token: identityToken,
      })

      console.log(JSON.stringify({ error, user }, null, 2))

      if (!error) {
        // User is signed in.
        store.onSignInSuccess()
      }
    },
  }))
  .views((store) => ({
    get isSignedIn(): boolean {
      return !!store.authUser?.id
    },
    get isAdmin(): boolean {
      return store.authUser?.isAdmin ?? false
    },
    get isEditor(): boolean {
      return store.authUser?.isEditor ?? false
    },
  }))
  .actions((store) => ({
    afterCreate() {
      const rootStore = getRootStore(store)

      store.apiGetAuthUser()
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(JSON.stringify({ session, event }, null, 2))

        if (event === "SIGNED_OUT") {
          rootStore.reset()
        }

        if (session?.user && session?.user?.email) {
          store.setAuthUser(
            AuthUserModel.create({
              id: session.user.id,
              createdAt: session.user.created_at,
              updatedAt: session.user.updated_at,
              lastSignInAt: session.user.last_sign_in_at,
              email: session.user.email,
              emailConfirmedAt: session.user.email_confirmed_at,
              phone: session.user.phone,
              providers: session.user.app_metadata.providers,
              roles: session.user.app_metadata.roles,
            }),
          )
        }
      })
      if (data.subscription) {
        store.onAuthStateChangedUnsubscribe = data.subscription.unsubscribe
      }
    },
    beforeDestroy() {
      if (store.onAuthStateChangedUnsubscribe) {
        store.onAuthStateChangedUnsubscribe()
      }
    },
  }))

export interface AuthenticationStore
  extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot
  extends SnapshotOut<typeof AuthenticationStoreModel> {}
