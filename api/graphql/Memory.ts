import {  objectType, extendType, stringArg, intArg, nonNull } from 'nexus'

export const Memory = objectType({
  name: 'Memory',    
  description: "Represents a memory of the subject (origin) of grief",      
  definition(t) {
    t.implements('Node');
    t.string('title', { description: 'The title of the memory'})      
    t.string('story', { description: 'The story attached to the memory'})
    t.string('body', { description: 'The body text of the memory' })
    t.string('imageUrl', { description: 'The image URL (cdn) of the primary image of the memory, to be later expanded into multimedia fields'})
    t.date('createdAt', { description: 'When the memory was created on momento'})
    t.date('archivedAt', { description: 'When the memory was archived'}) 
    t.date('deletedAt', { description: 'When the memory was deleted'})                     
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

    t.connectionField('memoryConnection', {
      type: 'Memory',
      nodes(_, args, ctx) {
        return ctx.db.memory.findMany()
      },
      totalCount(_, args, ctx) {
        return ctx.db.memory.count()
      },
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
        // authorId: nonNull(stringArg()), 
        // memoryOriginatedAt: nonNull(intArg()), 
      },
      resolve(_root, args, ctx) {
        const { id, title, body, story } = args;
        const memory = {
          id,
          title,                        
          body,                        
          story, 
          createdAt: new Date(), 
          // memoryOriginatedAt,
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
        // memoryOriginatedAt: nonNull(intArg()), 
      },
      async resolve(_root, args, ctx) {
        const memory = args;
        const mem = await ctx.db.memory.create({ data: memory })
        return mem
      }

    })
  }
})