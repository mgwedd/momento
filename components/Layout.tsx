import { useDisclosure, Flex,  Text, Button, Icon, IconButton, Box, Input, InputGroup, InputLeftElement, Drawer, Avatar, DrawerContent,  DrawerOverlay, ChakraProps, OmitCommonProps, useToast } from "@chakra-ui/react";
import { FaBell, FaClipboardCheck, FaRss } from "react-icons/fa";
import { AiFillGift } from "react-icons/ai";
import { BsGearFill } from "react-icons/bs";
import { FiMenu, FiSearch } from "react-icons/fi";
import { HiCode, HiCollection } from "react-icons/hi";
import { MdHome } from "react-icons/md";
import { Logo } from "@choc-ui/logo";
import { useUser } from "@auth0/nextjs-auth0";

const NavItem = (props: any) => {
  const { icon, children, ...rest } = props;
  return (
    <Flex
      align="center"
      px="4"
      mx="2"
      rounded="md"
      py="3"
      cursor="pointer"
      color="whiteAlpha.700"
      _hover={{
        bg: "blackAlpha.300",
        color: "whiteAlpha.900",
      }}
      role="group"
      fontWeight="semibold"
      transition=".15s ease"
      {...rest}
    >
      {icon && (
        <Icon
          mr="2"
          boxSize="4"
          _groupHover={{
            color: "gray.300",
          }}
          as={icon}
        />
      )}
      {children}
    </Flex>
  );
};

const SidebarContent = (props: any) => (
  <Box
    as="nav"
    pos="fixed"
    top="0"
    left="0"
    zIndex="sticky"
    h="full"
    pb="10"
    overflowX="hidden"
    overflowY="auto"
    bg="brand.600"
    borderColor="blackAlpha.300"
    borderRightWidth="1px"
    w="60"
    {...props}
  >
    <Flex px="4" py="5" align="center">
      <Logo />
      <Text fontSize="2xl" ml="2" color="white" fontWeight="semibold">
        Momento
      </Text>
    </Flex>
    <Flex
      direction="column"
      as="nav"
      fontSize="sm"
      color="gray.600"
      aria-label="Main Navigation"
    >
      <NavItem icon={MdHome}>Home</NavItem>
      <NavItem icon={HiCode}>Momentos</NavItem>
      <NavItem icon={FaRss}>Memories</NavItem>
      <NavItem icon={HiCollection}>Reflections</NavItem>
      {/* <NavItem icon={FaClipboardCheck}>Checklists</NavItem>
      <NavItem icon={HiCode}>Integrations</NavItem>
      <NavItem icon={AiFillGift}>Changelog</NavItem>
      <NavItem icon={BsGearFill}>Settings</NavItem>  */}
      {/* Fix lazy logout button styles */}
      <Button as="a" marginLeft="20px" marginRight="20px" href="/api/auth/logout">Logout</Button>
    </Flex>
  </Box>
);

export const Layout = (props) => {
  const sidebar = useDisclosure();
  const { user, error } = useUser()

  const toast = useToast();

  if (error) {
    toast({
      title: 'Error getting user profile',
      description: 'Something went wrong getting your profile from Momento',
      status: 'error',
      duration: 9000,
      isClosable: true
    })
  };


  return (
    <Box
      as="section"
      bg="gray.50"
      _dark={{
        bg: "gray.700",
      }}
      minH="100vh"
    >
      <SidebarContent
        display={{
          base: "none",
          md: "unset",
        }}
      />
      <Drawer
        isOpen={sidebar.isOpen}
        onClose={sidebar.onClose}
        placement="left"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent w="full" borderRight="none" />
        </DrawerContent>
      </Drawer>
      <Box
        ml={{
          base: 0,
          md: 60,
        }}
        transition=".3s ease"
      >
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          px="4"
          bg="white"
          _dark={{
            bg: "gray.800",
          }}
          borderBottomWidth="1px"
          borderColor="blackAlpha.300"
          h="14"
        >
          <IconButton
            aria-label="Menu"
            display={{
              base: "inline-flex",
              md: "none",
            }}
            onClick={sidebar.onOpen}
            icon={<FiMenu />}
            size="sm"
          />
          <InputGroup
            w="96"
            display={{
              base: "none",
              md: "flex",
            }}
          >
            <InputLeftElement color="gray.500">
              <FiSearch />
            </InputLeftElement>
            <Input placeholder="Search Momento..." />
          </InputGroup>

          <Flex align="center">
            <Icon color="gray.500" as={FaBell} cursor="pointer" />
            <Avatar
              ml="4"
              size="sm"
              name={user.name}
              src={user.picture}
              cursor="pointer"
            />
          </Flex>
        </Flex>

        <Box as="main" p="4">
          {props.children}
        </Box>
      </Box>
    </Box>
  );
};