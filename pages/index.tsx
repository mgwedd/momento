import { gql, useQuery } from '@apollo/client';
import { useUser } from '@auth0/nextjs-auth0';
// import Link from 'next/link';

import { Layout, Memory } from "../components";


const FETCH_MEMORY_QUERY = gql`
  query memory( $id: String! ) {
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

export default function HomeLayout() {

  const { user } = useUser();

  const { data, loading, error } = useQuery(FETCH_MEMORY_QUERY, {
    // TODO this is a static memory fetch example
    // that wouldn't work if the mem were deleted
    // for testing apollo integration
    variables: { id: "62bb499b68ff89cc38305987" },
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

  const { id, title, story, createdAt, updatedAt, owner } = data?.memory ?? {};

  return (
    <Layout>
      <Memory
        key={id}
        title={title}
        id={id}
        story={story}
        createdAt={createdAt}
        updatedAt={updatedAt}
        owner={owner}
      />
    </Layout>
  )
}