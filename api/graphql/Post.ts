import { objectType } from 'nexus'

export const Post = objectType({
  name: 'Post',          
  definition(t) {
    t.int('id')           
    t.string('title')      
    t.string('body')      
    t.boolean('published')
  },
})