import { Box, Flex, Button, Text } from "@chakra-ui/react";
import { useAuth } from "../../context/AuthContext";

const NavbarUser = () => {
  const { user, logout } = useAuth();

  return (
    <Box bg="teal.500" p={4}>
      <Flex justify="space-between" align="center">
        <Text fontWeight="bold" color="white">MyRecipe</Text>
        <Flex gap={3}>
          {user ? (
            <>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button as="a" href="/login">Login</Button>
              <Button as="a" href="/register">Register</Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default NavbarUser;