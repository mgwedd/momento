import { ApolloClient, InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';

export const client = new ApolloClient({
  // TODO investigate why using a env var here for the URL
  // doesn't work. Race condition with init iniall liklihood.
  // this causes a silent failure that is very annoying
  //  where the apollo client does nothing
  // FOr now, stick to the hardcoded string
  uri: 'http://localhost:3000/api/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          memories: relayStylePagination()
        }
      }
    }
  })
});
