import { objectType, extendType, stringArg, nonNull, intArg } from 'nexus'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.implements('Node')
    t.string('email')
    t.string('firstName')
    t.string('lastName')
    // WIP other fields, to mirror auth0 user
  }
})

export const UserQuery = extendType({
  type: 'Query',                        
  definition(t) {
    t.field('user', { 
      type: 'User',
      description: 'A single user',
      args: {
        id: nonNull(stringArg())
      },
      async resolve (_, args, ctx) {
        const user = await ctx.db.user.findUnique({ where: { id: args.id } })
        return user
      },
    }),
    t.field('userConnection', {
      type: 'Response',
      args: { 
        first: nonNull(intArg()),
        after: stringArg()
      },
      async resolve(_, args, ctx) {
        let queryResults = []
        if (args.after) {
          // check if there is a cursor as the argument
          queryResults = await ctx.db.user.findMany({
            take: args.first, // the number of items to return from the db
            skip: 1, // skip the cursor itself
            cursor: {
              id: args.after // the cursor
            }
          })
        } else {
          // if no cursor, this means that this is the first request
          // we wil return the first items in the db
          queryResults = await ctx.db.user.findMany({
            take: args.first,
          })
        }

        if (queryResults.length < 1) {
          // no results found
          return {
            edges: [],
            pageInfo: { 
              endCursor: null, 
              hasNextPage: false, 
            }
          }
        }

        // the query has returned memories, so figure out the page info (more pages?) and return results

        // get the last element in the previous result set
        const lastUserResults = queryResults[queryResults.length - 1]
        // cursor we'll return in subsequent requests
        const { id : newCursor } = lastUserResults || {}
        // query after the cursor to check if we have a next page of results
        const secondQueryResults = await ctx.db.user.findMany({ 
          take: args.first, 
          cursor: { 
            id: newCursor
          },
        })

        // return the response of the initial query
        const result =  {
          pageInfo: { 
            endCursor: newCursor, 
            // we have a next page if the number of items is greater than the response of the second query
            hasNextPage: secondQueryResults.length > args.first
          },
          edges: queryResults.map( (memory: { id: string }) => ({
            cursor: memory.id, 
            node: memory
          }))
        }
        
        return result
      }
    })
  }
})

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createUser', {
      type: 'User',
      args: {  
        firstName: nonNull(stringArg()),               
        lastName: nonNull(stringArg()), 
        email: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const { firstName, lastName, email } = args;
        const user = await ctx.db.user.create({ data: { firstName, lastName, email } })
        return user
      },
    }),
    t.field('editUser', {
      type: 'User',
      args: { 
        id: nonNull(stringArg()), 
        firstName: stringArg(),               
        lastName: stringArg(), 
        email: stringArg(),
      },
      async resolve(_root, args, ctx) {
        const { id, firstName, lastName, email } = args;
        const user = await ctx.db.user.update({ data: { firstName, lastName, email }, where: { id } })
        return user
      },
    }),
    t.field('deleteUser', {
      type: 'User',
      args: { 
        id: nonNull(stringArg()), 
      },
      async resolve(_root, args, ctx) {
        const { id } = args;
        const user = await ctx.db.user.delete({ where: { id } })
        return user
      },
    })
  }
})

export const Edge = objectType({ 
  name: 'Edge',
  definition(t) {
    t.string('cursor'),
    t.field('node', { 
      type: User
    })
  }
})

export const Response = objectType({
  name: 'Response',
  definition(t) {
    t.field('pageInfo', { type: 'PageInfo' }),
    t.list.field('edges', { 
      type: Edge
    })
  }
})