import { objectType, extendType, stringArg, intArg, nonNull } from 'nexus'

export const Memory = objectType({
  name: 'Memory',          
  definition(t) {
    t.string('id')
    t.string('userId')
    t.string('reflectionId')
    t.string('editorId')
    t.string('story')
    t.string('title')      
    t.string('body')
    t.string('imageUrl')
    t.boolean('isPublished')
    t.date('memoryOriginatedAt')
    t.date('createdAt')
    t.date('publishedAt')
    t.date('lastEditedAt')
    t.date('archivedAt') 
    t.date('deletedAt')                     
  },
})

export const Edge = objectType({ 
  name: 'Edge',
  definition(t) {
    t.string('cursor'),
    t.field('node', { 
      type: Memory
    })
  }
})

export const PageInfo = objectType({ 
  name: 'PageInfo', 
  definition(t) {
    t.string('endCursor')
    t.boolean('hasNextPage')
  }
})

export const Response = objectType({
  name: 'Response',
  definition(t) {
    t.field('pageInfo', { type: PageInfo }),
    t.list.field('edges', { 
      type: Edge
    })
  }
})

// client sends a request. 
// This be either be the first req, send another req, which will contain a cursor

export const MemoryQuery = extendType({
  type: 'Query',                        
  definition(t) {
    t.field('memories', {
      type: 'Response', 
      args: {
        first: intArg(),
        after: stringArg()
      },
      async resolve(_, args, ctx) {
        let queryResults = null
        if (args.after) {
          // check if there is a cursor as the argument
          queryResults = ctx.db.memories.findMany({
            take: args.first, // the number of items to return from the db
            skip: 1, // skip the cursor itself
            cursor: {
              id: args.after // the cursor
            }
          })
        } else {
          // if no cursor, this means that this is the first request
          // we wil return the first items in the db
          queryResults = await ctx.db.memories.findMany({
            take: args.first,
          })
        }

        if (queryResults.length < 1) {
          // no results found
          return {
            pageInfo: { 
              endCursor: null, 
              hasNextPage: false, 
              edges: []
            }
          }
        }

        // the query has returned memories, so figure out the page info (more pages?) and return results

        // get the last element in the previous result set
        const lastMemoriesInResults = queryResults[queryResults.length - 1]
        // cursor we'll return in subsequent requests
        const { id : newCursor } = lastMemoriesInResults
        // query after the cursor to check if we have a next page of results
        const secondQueryResults = await ctx.db.memories.findMany({ 
          take: args.first, 
          cursor: { 
            id: newCursor
          }
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


        // return {
        //   edges: [
        //     { 
        //       cursor: '', 
        //       node: {
        //         id: '1asd',
        //         title: 'Origin Memory',
        //         body: '...', 
        //         isPublished: false,
        //         userId: 'abc123',
        //         story: 'my story',
        //         memoryOriginatedAt: new Date(), 
        //         createdAt: new Date()
        //       }
        //     }
        //   ],
        //   pageInfo: { 
        //     endCursor: '',
        //     hasNextPage: false
        //   }
        // }
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
        userId: nonNull(stringArg()), 
        memoryOriginatedAt: nonNull(intArg()), 
      },
      resolve(_root, args, ctx) {
        const { id, title, body, userId, story, memoryOriginatedAt } = args;
        const memory = {
          id,
          title,                        
          body,                        
          userId, 
          story, 
          memoryOriginatedAt,
          createdAt: Date.now(), 
        }

        ctx.db.memories[id] = memory
        return memory
      },
    }),
    // t.nonNull.field('publishMemory', {
    //   type: 'Memory',
    //   args: {
    //     draftId: nonNull(stringArg())
    //   },
    //   resolve(_root, args, ctx) {
    //     let draftToPublish = ctx.db.memories.find(memory => memory.id === args.draftId)
    //     if (!draftToPublish) {
    //       throw new Error(`Could not find draft with id ${args.draftId}`)
    //     }

    //     draftToPublish.isPublished = true

    //     return draftToPublish
    //   }

    // })
  },
})