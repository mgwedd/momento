import { Kind } from 'graphql';
import { scalarType } from 'nexus'

export const DateScalar = scalarType({
    name: 'DateScalar',
    asNexusMethod: 'date',
    description: 'Date custom scalar type',
    parseValue(datetime) {
      return new Date(datetime as string)
    },
    serialize(datetime) {
      if (datetime instanceof Date) {
        return datetime.getTime()
      }

      throw new Error('Cannot serialize datetime since the DateScalar object received a value that is not an instance of Date"')
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(ast.value)
      }
      return null
    },
  })
