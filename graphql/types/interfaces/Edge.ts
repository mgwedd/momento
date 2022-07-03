import { interfaceType } from 'nexus';

export const Edge = interfaceType({
  name: 'Edge',
  description: 'The base definition of a relay-style edge',
  definition(t) {
    t.string('cursor');
  },
  resolveType: (_) => null
});
