import { gql, useQuery } from '@apollo/client';
import { useUser } from '@auth0/nextjs-auth0';
// import Link from 'next/link';

import { Layout, Memory } from "../components";


// const FETCH_MEMORY_QUERY = gql`
//   query memoryQuery( $id: String! ) {
//       memory( id: $id ) {
//         id
//         title
//         story
//         createdAt
//         updatedAt
//         owner { firstName, lastName, email }
//       }
//   }
// `;

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

  const {
    data,
    loading,
    error,
    fetchMore
  } = useQuery(MEMORY_CONNECTION_QUERY, {
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
    pageInfo
  } = data?.memoryConnection ?? {};

  const { endCursor, hasNextPage } = pageInfo ?? {};

  return (
    <Layout>
      {edges?.map( ({ node }) => {
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
      {hasNextPage ? (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded my-10"
            onClick={() => {
              fetchMore({
                variables: { after: endCursor },
              });
            }}
          >
            More Memories
          </button>
        ) : (
          <p className="my-10 text-center font-medium">
            You've reached the end!
          </p>
        )}
    </Layout>
  )
}