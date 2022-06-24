import { ApolloClient, InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';

export const client = new ApolloClient({
  uri: process.env.GRAPHQL_SERVER_URI,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          links: relayStylePagination()
        }
      }
    }
  })
});
