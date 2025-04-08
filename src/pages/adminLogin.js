import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useToast
} from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', {
        username,
        password,
      });
      localStorage.setItem('adminToken', res.data.token);
      navigate("/admin/dashboard");
      toast({
        title: 'Login Successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.response?.data?.message || 'Unknown error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.100">
      <Box p={8} maxWidth="400px" borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
        <Heading mb={6} textAlign="center">Admin Login</Heading>
        <FormControl id="username" mb={4} isRequired>
          <FormLabel>Username</FormLabel>
          <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </FormControl>
        <FormControl id="password" mb={6} isRequired>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <Button colorScheme="teal" width="full" onClick={handleLogin}>Login</Button>
      </Box>
    </Flex>
  );
};

export default AdminLogin;
