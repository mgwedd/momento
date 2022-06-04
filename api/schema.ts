import { connectionPlugin, makeSchema } from 'nexus'
import { join } from 'path'
import * as types from './graphql'

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(__dirname, '../nexus-typegen.ts'),
    schema: join(__dirname, '../schema.graphql'),
  },
  contextType: {                                  
    module: join(__dirname, "./context.ts"),       
    export: "Context",                             
  },
  plugins: [
    // relay-spec-compliant pagination
    connectionPlugin({
      extendConnection: {
        totalCount: { type: 'Int' },
      },
    }) 
  ]
})