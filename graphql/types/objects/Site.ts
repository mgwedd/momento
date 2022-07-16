import { objectType, extendType, stringArg, intArg, nonNull } from 'nexus';
import { connectionFromArraySlice, cursorToOffset } from 'graphql-relay';

const MAX_PAGE_SIZE = 1000;

export const Site = objectType({
  name: 'Site',
  description: 'Represents a momento site for grieving someone or something',
  definition(t) {
    t.implements('Node');
    t.string('title', { description: 'The title of the site' });
    t.date('createdAt', {
      description: 'When the site was created on momento'
    });
    t.date('updatedAt');
    t.date('deletedAt', { description: 'When the site was deleted' });
    t.field('owner', { type: 'User', description: 'The owner of the site' });
    t.list.field('collaborators', {
      type: 'User',
      description: 'The collaborators of the site'
    });
  }
});

export const SiteQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('site', {
      type: 'Site',
      description: 'A single site',
      args: {
        id: nonNull(stringArg())
      },
      resolve: (_, args, ctx) => {
        return ctx.prisma.site.findUnique({ where: { id: args.id } });
      }
    });
    t.field('siteConnection', {
      type: 'SiteConnectionResponse',
      description: 'A relay-style connection to paginated sites',
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

export const SiteMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('editSite', {
      type: 'Site',
      args: {
        id: nonNull(stringArg()),
        title: nonNull(stringArg())
      },
      async resolve(_root, args, ctx) {
        const { id, title } = args;
        const site = {
          id,
          title
        };

        const result = await ctx.prisma.site.update({
          data: { title },
          where: { id }
        });
        return result;
      }
    });
    t.nonNull.field('createSite', {
      type: 'Site',
      args: {
        title: nonNull(stringArg())
      },
      async resolve(_root, args, ctx) {
        const siteData = args;
        // get and append user as owner.
        const userId = '123'; // TODO getAuthUser().id
        const mem = await ctx.prisma.site.create({
          data: { ...siteData, ownerId: userId }
        });
        return mem;
      }
    });
  }
});

export const SiteConnectionEdge = objectType({
  name: 'SiteConnectionEdge',
  definition(t) {
    t.implements('Edge');
    t.field('node', {
      type: Site
    });
  }
});

export const SiteConnectionResponse = objectType({
  name: 'SiteConnectionResponse',
  definition(t) {
    t.field('pageInfo', { type: 'PageInfo' });
    t.list.field('edges', {
      type: SiteConnectionEdge
    });
  }
});
