export const Edge = objectType({ 
    name: 'Edge',
    definition(t) {
      t.string('cursor'),
      t.field('node', { 
        type: Memory
      })
    }
  })