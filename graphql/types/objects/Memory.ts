import { objectType, extendType, stringArg, intArg, nonNull } from 'nexus';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';

const MAX_PAGE_SIZE = 1000;

export const Memory = objectType({
  name: 'Memory',
  description: 'Represents a memory of the subject (origin) of grief',
  definition(t) {
    t.implements('Node');
    t.string('title', { description: 'The title of the memory' });
    t.string('story', { description: 'The story attached to the memory' });
    t.date('createdAt', {
      description: 'When the memory was created on momento'
    });
    t.date('updatedAt');
    t.date('deletedAt', { description: 'When the memory was deleted' });
    t.field('owner', {
      type: 'User',
      description: 'The owner (generally also the creator) of the memory'
    });
  }
});

export const MemoryQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('memory', {
      type: 'Memory',
      description: 'A single memory',
      args: {
        id: nonNull(stringArg())
      },
      resolve: (_, args, ctx) => {
        return ctx.prisma.memory.findUnique({
          where: { id: args.id },
          include: { owner: true }
        });
      }
    });
    t.field('memoryConnection', {
      type: 'MemoryConnectionResponse',
      description: 'A relay-style connection to paginated memories',
      args: {
        first: intArg(),
        after: stringArg()
      },
      async resolve(_, { first, after }, ctx) {
        if (first > MAX_PAGE_SIZE) {
          throw new Error(
            `"first" argument specifies a page size that exceeds the maximum: ${MAX_PAGE_SIZE}`
          );
        }

        const offset = after ? cursorToOffset(after) + 1 : 0;

        if (isNaN(offset)) throw new Error('cursor is invalid');

        const [totalCount, items] = await Promise.all([
          ctx.prisma.memory.count(),
          ctx.prisma.memory.findMany({
            take: first,
            skip: offset
          })
        ]);

        return connectionFromArraySlice(
          items,
          { first, after },
          { sliceStart: offset, arrayLength: totalCount }
        );
      }
    });
  }
});

export const MemoryMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('editMemory', {
      type: 'Memory',
      args: {
        id: nonNull(stringArg()),
        title: nonNull(stringArg()),
        story: nonNull(stringArg())
      },
      async resolve(_root, args, ctx) {
        const { id, title, story } = args;
        const updatedMemory = await ctx.prisma.memory.update({
          data: { title, story },
          where: { id }
        });
        return updatedMemory;
      }
    });
    t.nonNull.field('createMemory', {
      type: 'Memory',
      args: {
        title: nonNull(stringArg()),
        story: nonNull(stringArg())
      },
      async resolve(_root, args, ctx) {
        const memory = args;
        const userId = '123'; // getAuthUser().id
        const mem = await ctx.prisma.memory.create({
          data: { ...memory, ownerId: userId }
        });
        return mem;
      }
    });
  }
});

export const MemoryConnectionEdge = objectType({
  name: 'MemoryConnectionEdge',
  definition(t) {
    t.implements('Edge');
    t.field('node', {
      type: Memory
    });
  }
});

export const MemoryConnectionResponse = objectType({
  name: 'MemoryConnectionResponse',
  definition(t) {
    t.field('pageInfo', { type: 'PageInfo' });
    t.list.field('edges', {
      type: MemoryConnectionEdge
    });
  }
});
