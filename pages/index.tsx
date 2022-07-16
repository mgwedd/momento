import { gql, useQuery } from '@apollo/client';
import { useUser } from '@auth0/nextjs-auth0';
// import Link from 'next/link';

import { Layout, Memory } from "../components";


const FETCH_MEMORY_QUERY = gql`
  query memoryQuery( $id: String! ) {
      memory( id: $id ) {
        id
        title
        story
        createdAt
        updatedAt
        owner { firstName, lastName, email }
      }
  }
`;

const MEMORY_CONNECTION_QUERY = gql`
  query memoryConnectionQuery($first: Int, $after: String) {
    memoryConnection(first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          title
          story
          createdAt
          updatedAt
          deletedAt
        }
      }
    }
  }
`;

export default function HomeLayout() {

  const { user } = useUser();
  console.log('user', user )
  const { data, loading, error } = useQuery(MEMORY_CONNECTION_QUERY, {
    // TODO this is a static memory fetch example
    // that wouldn't work if the mem were deleted
    // for testing apollo integration
    variables: { first: 10 },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center">
        To view the Momento you need to{' '}
          <a href="api/auth/login" className=" block bg-gray-100 border-0 py-1 px-3 focus:outline-none hover:bg-gray-200 rounded text-base mt-4 md:mt-0">
            Login
          </a>
      </div>
    );
  }


  if (error) return <p>Oh no... {error.message}</p>;

  const {
    edges,
    pageInfo: { endCursor, hasNextPage}
  } = data?.memoryConnection ?? {};

  return (
    <Layout>
      {edges.map( ({ node }) => {
        return (
          <Memory
            key={node.id}
            title={node.title}
            id={node.id}
            story={node.story}
            createdAt={node.createdAt}
            updatedAt={node.updatedAt}
            owner={node.owner}
          />
        )
      } )}
      {hasNextPage && <div>Load more memories? pagination WIP</div>}
    </Layout>
  )
}