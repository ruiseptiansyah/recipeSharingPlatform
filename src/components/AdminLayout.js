import { Box, Flex, Text, VStack, Button, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <Flex height="100vh">
      {/* Sidebar */}
      <Box w="250px" bg="gray.800" color="white" p={5}>
        <VStack spacing={5} align="start">
          <Text fontSize="2xl" fontWeight="bold">Admin Panel</Text>
          <Button variant="link" color="white" onClick={() => navigate("/admin/dashboard")}>
            Dashboard
          </Button>
          <Button variant="link" color="white" onClick={() => navigate("/admin/users")}>
            Data Pengguna
          </Button>
          <Button variant="link" color="white" onClick={() => navigate("/admin/recipes")}>
            Data Resep
          </Button>
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </VStack>
      </Box>

      {/* Main content */}
      <Box flex="1" p={5} bg="lightgray">
        {/* Navbar */}
        <HStack justify="space-between" mb={5}>
          <Text fontSize="xl" fontWeight="bold">Dashboard Admin</Text>
        </HStack>
        {children}
      </Box>
    </Flex>
  );
};

export default AdminLayout;
