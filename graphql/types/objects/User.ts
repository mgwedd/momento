import { objectType, extendType, stringArg, nonNull, intArg } from 'nexus';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';

const MAX_PAGE_SIZE = 1000;

export const User = objectType({
  name: 'User',
  definition(t) {
    t.implements('Node');
    t.string('email');
    t.string('firstName');
    t.string('lastName');
    t.date('createdAt');
    t.date('updatedAt');
    t.date('deletedAt');
    // WIP other fields, to mirror auth0 user
  }
});

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('user', {
      type: 'User',
      description: 'A single user',
      args: {
        id: nonNull(stringArg())
      },
      resolve(_, args, ctx) {
        return ctx.prisma.user.findUnique({ where: { id: args.id } });
      }
    });
    t.field('userConnection', {
      type: 'UserConnectionResponse',
      description: 'A relay-style connection to paginated users',
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
          ctx.prisma.site.count(),
          ctx.prisma.site.findMany({
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

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createUser', {
      type: 'User',
      args: {
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
        email: nonNull(stringArg())
      },
      async resolve(_root, args, ctx) {
        const { firstName, lastName, email } = args;
        const user = await ctx.prisma.user.create({
          data: { firstName, lastName, email }
        });
        return user;
      }
    });
    t.field('editUser', {
      type: 'User',
      args: {
        // TODO in reality, not all of these fields should be required
        // but need to resolve TS issues with optionality
        id: nonNull(stringArg()),
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
        email: nonNull(stringArg())
      },
      async resolve(_root, args, ctx) {
        const { id, firstName, lastName, email } = args;
        const user = await ctx.prisma.user.update({
          data: { firstName, lastName, email },
          where: { id }
        });
        return user;
      }
    });
    t.field('deleteUser', {
      type: 'User',
      args: {
        id: nonNull(stringArg())
      },
      async resolve(_root, args, ctx) {
        const { id } = args;
        const user = await ctx.prisma.user.delete({ where: { id } });
        return user;
      }
    });
  }
});

export const UserConnectionEdge = objectType({
  name: 'UserConnectionEdge',
  definition(t) {
    t.implements('Edge');
    t.field('node', {
      type: User
    });
  }
});

export const UserConnectionResponse = objectType({
  name: 'UserConnectionResponse',
  definition(t) {
    t.field('pageInfo', { type: 'PageInfo' });
    t.list.field('edges', {
      type: UserConnectionEdge
    });
  }
});
