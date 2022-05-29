import { objectType, extendType, nonNull, list } from 'nexus'

export const Post = objectType({
  name: 'Post',          
  definition(t) {
    t.int('id')           
    t.string('title')      
    t.string('body')      
    t.boolean('published')
  },
})

export const PostQuery = extendType({
  type: 'Query',                        
  definition(t) {
    t.field('drafts', {
      type: nonNull(list('Post')),
      resolve() {
        return [{ id: 1, title: "Nexus", body: "...", published: false }]
      }
    })
  },
})