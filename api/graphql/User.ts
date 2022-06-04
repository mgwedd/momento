import { objectType } from "nexus"

export const User = objectType({
    name: 'User',
    definition(t) {
      t.string('id')
      t.string('email')
      t.string('firstName')
      t.string('lastName')
      // WIP other fields, to mirror auth0 user
    }
  })