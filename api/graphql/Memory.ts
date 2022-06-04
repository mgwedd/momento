import {  objectType, extendType, stringArg, intArg, nonNull } from 'nexus'

export const Memory = objectType({
  name: 'Memory',    
  description: "Represents a memory of the subject (origin) of grief",      
  definition(t) {
    // TODO extend base Node type for all objects
    t.implements('Node');
    t.field('creator', { type: 'User', description: 'The user that created and owns the Memory'})
    t.field('reflection', { type: 'Reflection', description: 'The Reflection (if any) that prompted this Memory' })
    t.field('editor', { type: 'User', description: 'The last user to edit the Memory'})
    t.string('title', { description: 'The title of the memory'})      
    t.string('story', { description: 'The story attached to the memory'})
    t.string('body', { description: 'The body text of the memory' })
    t.string('imageUrl', { description: 'The image URL (cdn) of the primary image of the memory, to be later expanded into multimedia fields'})
    t.date('memoryOriginatedAt', { description: 'When the memory originated in the creator\'s life'})
    t.date('createdAt', { description: 'When the memory was created on momento'})
    t.date('lastEditedAt', { description: 'When the memory was last edited'})
    t.date('archivedAt', { description: 'When the memory was archived'}) 
    t.date('deletedAt', { description: 'When the memory was deleted'})                     
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

    t.connectionField('memoryConnection', {
      type: 'Memory',
      nodes(_, args, ctx) {
        return ctx.db.memory.findMany()
      },
      // totalCount(_, args, ctx) {
      //   return ctx.db.memory.count()
      // },
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

        ctx.db.memory.update({ select: memory })
        return memory
      },
    })
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
  }
})