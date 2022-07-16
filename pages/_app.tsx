import * as React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { UserProvider } from '@auth0/nextjs-auth0';
import { ApolloProvider } from "@apollo/client";

import { theme } from '../utils'
import { client } from "../lib/apolloClient"

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <ApolloProvider client={client}>
        <ChakraProvider theme={theme}>
            <Component {...pageProps} />
        </ChakraProvider>
      </ApolloProvider>
    </UserProvider>
  )
}
