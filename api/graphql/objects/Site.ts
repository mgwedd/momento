import { objectType, extendType, stringArg, intArg, nonNull } from 'nexus';

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
        return ctx.db.site.findUnique({ where: { id: args.id } });
      }
    });
    t.field('siteConnection', {
      type: 'SiteConnectionResponse',
      description: 'A relay-style connection to paginated sites',
      args: {
        first: nonNull(intArg()),
        after: stringArg()
      },
      async resolve(_, { first, after }, ctx) {
        if (first > MAX_PAGE_SIZE) {
          throw new Error(
            `"first" argument specifies a page size that exceeds the maximum: ${MAX_PAGE_SIZE}`
          );
        }

        let queryResults = [];
        if (after) {
          // check if there is a cursor as the argument
          queryResults = await ctx.db.site.findMany({
            take: first, // the number of items to return from the db
            skip: 1, // skip the cursor itself
            cursor: {
              id: after // the cursor
            }
          });
        } else {
          // if no cursor, this means that this is the first request
          // we wil return the first items in the db
          queryResults = await ctx.db.site.findMany({
            take: first
          });
        }

        if (queryResults.length < 1) {
          // no results found
          return {
            edges: [],
            pageInfo: {
              endCursor: null,
              hasNextPage: false
            }
          };
        }

        // the query has returned memories
        // so figure out the page info (more pages?) and return results

        // get the last element in the previous result set
        const lastUserResults = queryResults[queryResults.length - 1];
        // cursor we'll return in subsequent requests
        const { id: newCursor } = lastUserResults || {};
        // query after the cursor to check if we have a next page of results
        const secondQueryResults = await ctx.db.site.findMany({
          take: first,
          cursor: {
            id: newCursor
          }
        });

        // return the response of the initial query
        const result = {
          pageInfo: {
            endCursor: newCursor,
            // we have a next page if the number of items
            // is greater than the response of the second query
            hasNextPage: secondQueryResults.length > first
          },
          edges: queryResults.map((site: { id: string }) => ({
            cursor: site.id,
            node: site
          }))
        };

        return result;
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
      resolve(_root, args, ctx) {
        const { id, title } = args;
        const site = {
          id,
          title
        };

        ctx.db.site.update({ data: site, where: { id } });
        return site;
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
        const userId = '123'; // getAuthUser().id
        const mem = await ctx.db.site.create({
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
