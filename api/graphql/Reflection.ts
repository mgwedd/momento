import { objectType } from "nexus"

export const Reflection = objectType({ 
    name: 'Reflection',
    definition(t) {
      t.implements('Node');
      t.string('prompt')
      t.date('createdAt')
      t.string('editorId')
      t.date('lastEditedAt')
      t.date('archivedAt') 
      t.date('deletedAt') 
    }
  })