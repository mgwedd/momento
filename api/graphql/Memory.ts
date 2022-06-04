import { objectType, extendType, stringArg, intArg, nonNull } from 'nexus'

export const Memory = objectType({
  name: 'Memory',    
  description: "Represents a memory of the subject (origin) of grief",      
  definition(t) {
    t.implements('Node');
    t.string('title', { description: 'The title of the memory'})      
    t.string('story', { description: 'The story attached to the memory'})
    t.string('body', { description: 'The body text of the memory' })
    t.date('createdAt', { description: 'When the memory was created on momento'})
    t.date('deletedAt', { description: 'When the memory was deleted'})                     
    // t.date('archivedAt', { description: 'When the memory was archived'}) 
    // t.string('imageUrl', { description: 'The image URL (cdn) of the primary image of the memory, to be later expanded into multimedia fields'})
    // t.date('memoryOriginatedAt', { description: 'When the memory originated in the creator\'s life'})
    // t.string('authorId', { description: 'The ID of the author'})
    // t.field('author', { type: 'User', description: 'The user that authored the memory'})
    // t.field('reflection', { type: 'Reflection', description: 'The Reflection (if any) that prompted this Memory' })
    // t.field('editor', { type: 'User', description: 'The last user to edit the Memory'})
    // t.date('lastEditedAt', { description: 'When the memory was last edited'})
  },
})

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
        return ctx.db.memory.findUnique({ where: { id: args.id } })
      },
    })
    t.field('memoryConnection', {
      type: 'Response',
      args: { 
        first: nonNull(intArg()),
        after: stringArg()
      },
      async resolve(_, args, ctx) {
        let queryResults = []
        if (args.after) {
          // check if there is a cursor as the argument
          queryResults = await ctx.db.memory.findMany({
            take: args.first, // the number of items to return from the db
            skip: 1, // skip the cursor itself
            cursor: {
              id: args.after // the cursor
            }
          })
        } else {
          // if no cursor, this means that this is the first request
          // we wil return the first items in the db
          queryResults = await ctx.db.memory.findMany({
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
        const secondQueryResults = await ctx.db.memory.findMany({ 
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



export const MemoryMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('editMemory', {
      type: 'Memory',
      args: {  
        id: nonNull(stringArg()),                                    
        title: nonNull(stringArg()),               
        body: nonNull(stringArg()),
        story: nonNull(stringArg()), 
      },
      resolve(_root, args, ctx) {
        const { id, title, body, story } = args;
        const memory = {
          id,
          title,                        
          body,                        
          story, 
          createdAt: new Date(), 
        }

        ctx.db.memory.update({ data: memory, where: { id } })
        return memory
      },
    })
    t.nonNull.field('createMemory', {
      type: 'Memory',
      args: {
        title: nonNull(stringArg()),               
        body: nonNull(stringArg()),
        story: nonNull(stringArg()), 
      },
      async resolve(_root, args, ctx) {
        const memory = args;
        const mem = await ctx.db.memory.create({ data: memory })
        return mem
      }

    })
  }
})