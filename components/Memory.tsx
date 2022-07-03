import React from 'react';
import { Box, Flex, Image, Link, chakra } from '@chakra-ui/react';

export const Memory = (props: any) => {
  const {
    id, title, story, createdAt, updatedAt, owner = {}
  } = props;

  return (
    <Flex
      bg="#edf3f8"
      _dark={{ bg: '#3e3e3e' }}
      p={50}
      w="full"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        mx="auto"
        rounded="lg"
        shadow="md"
        bg="white"
        _dark={{ bg: 'gray.800' }}
        maxW="2xl"
      >
        {/* <Image
          roundedTop="lg"
          w="full"
          h={64}
          fit="cover"
          src={imageUrl}
          alt="Article"
        /> */}

        <Box p={6}>
          <Box>
            <chakra.span
              fontSize="xs"
              textTransform="uppercase"
              color="brand.600"
              _dark={{ color: 'brand.400' }}
            >
              Memory
            </chakra.span>
            <Link
              display="block"
              color="gray.800"
              _dark={{ color: 'white' }}
              fontWeight="bold"
              fontSize="2xl"
              mt={2}
              _hover={{ color: 'gray.600', textDecor: 'underline' }}
            >
              {title}
            </Link>
            <chakra.p
              mt={2}
              fontSize="sm"
              color="gray.600"
              _dark={{ color: 'gray.400' }}
            >
              {story}
            </chakra.p>
          </Box>

          <Box mt={4}>
            <Flex alignItems="center">
              <Flex alignItems="center">
                <Image
                  h={10}
                  fit="cover"
                  rounded="full"
                  // src={avatarUrl}
                  alt="Avatar"
                />
                <Link
                  mx={2}
                  fontWeight="bold"
                  color="gray.700"
                  _dark={{ color: 'gray.200' }}
                >
                  {owner.email}
                </Link>
              </Flex>
              <chakra.span
                mx={1}
                fontSize="sm"
                color="gray.600"
                _dark={{ color: 'gray.300' }}
              >
                {createdAt}
              </chakra.span>
            </Flex>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
