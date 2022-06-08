import { interfaceType } from 'nexus';

export const Node = interfaceType({
  name: 'Node',
  description: 'The GUID of the node',
  definition(t) {
    t.string('id');
  },
  resolveType: (_) => null
});
