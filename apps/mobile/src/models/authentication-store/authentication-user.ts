import { Instance, SnapshotOut, types } from "mobx-state-tree";

const RoleModel = types.enumeration("Role", ["admin", "editor"]);

export const AuthUserModel = types
  .model("AuthUser")
  .props({
    id: types.identifier,
    email: types.string,
    emailConfirmedAt: types.maybe(types.string),
    phone: types.maybe(types.string),
    lastSignInAt: types.maybe(types.string),
    providers: types.optional(types.array(types.string), []),
    createdAt: types.maybe(types.string),
    updatedAt: types.maybe(types.string),
    roles: types.optional(types.array(RoleModel), []),
  })
  .views((store) => ({
    get isAdmin() {
      return store.roles.includes("admin");
    },
    get isEditor() {
      return store.roles.includes("editor");
    },
  }));

export interface AuthUser extends Instance<typeof AuthUserModel> {}
export interface AuthUserSnapshot extends SnapshotOut<typeof AuthUserModel> {}
