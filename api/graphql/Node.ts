import { objectType, extendType, stringArg, intArg } from 'nexus'

export const Node = objectType({
    name: 'Node',
    definition(t) {
        t.string('id')
    }
})
  