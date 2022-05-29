import { objectType, extendType, stringArg, intArg } from 'nexus'

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
        return {
          edges: [
            { 
              cursor: '', 
              node: {
                id: '1asd',
                title: 'Origin Memory',
                body: '...', 
                isPublished: false,
                userId: 'abc123',
                story: 'my story',
                memoryOriginatedAt: new Date(), 
                createdAt: new Date()
              }
            }
          ],
          pageInfo: { 
            endCursor: '',
            hasNextPage: false
          }
        }
      }
    })
  }
})



// export const MemoryMutation = extendType({
//   type: 'Mutation',
//   definition(t) {
//     t.nonNull.field('createDraftMemory', {
//       type: 'Memory',
//       args: {                                      
//         title: nonNull(stringArg()),               
//         body: nonNull(stringArg()),                  
//       },
//       resolve(_root, args, ctx) {
//         const draft = {
//           id: ctx.db.memories.length + 1,
//           title: args.title,                        
//           body: args.body,                        
//           published: false,
//         }
//         ctx.db.memories.push(draft)
//         return draft
//       },
//     })
//   },
// })