import { objectType } from 'nexus';

export const Reflection = objectType({
  name: 'Reflection',
  definition(t) {
    t.implements('Node');
    t.string('prompt');
    t.date('createdAt');
    t.date('deletedAt');
    // t.field('memory', { type: 'Memory', description: 'The memory that this reflection spawned'})
    // t.string('editorId')
    // t.date('lastEditedAt')
    // t.date('archivedAt')
  }
});
