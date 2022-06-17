import { server } from './server';

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  // tslint:disable-next-line: no-console
  console.log(`🚀 Server ready at ${url}`);
});
