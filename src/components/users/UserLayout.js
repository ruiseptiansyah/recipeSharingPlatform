import React from "react";
import { Box, Flex, Input, Avatar, Menu, MenuButton, MenuList, MenuItem, Spacer, Text } from "@chakra-ui/react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const UserLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <Box>
      {/* Navbar */}
      <Flex
        as="nav"
        bg="teal.500"
        color="white"
        p={4}
        align="center"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Text fontSize="xl" fontWeight="bold">
          <Link to="/home">ResepKu</Link>
        </Text>

        <Spacer />

        <Box maxW="300px" mr={4}>
          <Input
            placeholder="Cari resep..."
            bg="white"
            color="black"
            _placeholder={{ color: "gray.500" }}
          />
        </Box>

        <Menu>
          <MenuButton>
            <Avatar name="User" size="sm" />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
            <MenuItem onClick={() => navigate("/my-recipes")}>Resep Saya</MenuItem>
            <MenuItem onClick={() => navigate("/favorite")}>Favorit</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      {/* Main Content */}
      <Box p={4}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;