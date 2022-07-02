import { ApolloServer } from 'apollo-server-micro';
import { PageConfig } from 'next';
import { schema } from '../../api/schema';
import { createContext } from '../../api/context';

const apolloServer = new ApolloServer({
  context: createContext,
  schema
});

const startServer = apolloServer.start();

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }
  await startServer;
  console.log('Apollo server has started');
  await apolloServer.createHandler({
    path: '/api/graphql'
  })(req, res);
};
console.log('Apollo server handler set');

// // Apollo Server Micro takes care of body parsing
export const config: PageConfig = {
  api: {
    bodyParser: false
  }
};
