import { objectType } from 'nexus';

export const PageInfo = objectType({
  name: 'PageInfo',
  definition(t) {
    t.string('endCursor');
    t.boolean('hasNextPage');
  }
});
