import { Instance, SnapshotOut, types } from "mobx-state-tree"

const PER_PAGE = 8

/**
 * Represents a pagination model.
 */
export const PaginationModel = types
  .model("Pagination")
  .props({
    page: types.optional(types.number, 0),
    size: types.optional(types.number, PER_PAGE),
    total: types.optional(types.number, 0),
    isEndReached: types.optional(types.boolean, false),
  })
  .views((store) => ({
    get from() {
      return store.page * store.size
    },
    get to() {
      return this.from + store.size
    },
  }))
  .actions((self) => ({
    incrementPage() {
      if (self.page < Math.floor(self.total / self.size)) {
        self.page = self.page + 1
      } else {
        self.isEndReached = true
      }
    },
    decrementPage() {
      if (self.page > 0) {
        self.page = self.page - 1
      }
    },
    setTotal(value: number) {
      self.total = value
    },
    setIsEndReached(value: boolean) {
      self.isEndReached = value
    },
    reset() {
      self.page = 0
      self.size = PER_PAGE
      self.total = 0
      self.isEndReached = false
    },
  }))

export interface Pagination extends Instance<typeof PaginationModel> {}
export interface PaginationSnapshot
  extends SnapshotOut<typeof PaginationModel> {}
