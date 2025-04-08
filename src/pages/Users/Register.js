// src/pages/register.js
import {
    Box,
    Button,
    Heading,
    Input,
    Text,
    VStack,
    useToast,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";
  
  const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const toast = useToast();
    const navigate = useNavigate();
  
    const handleRegister = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/users/register", {
          username: name,
          email,
          password,
        });
        console.log(res.data);
        toast({
          title: "Berhasil mendaftar",
          description: "Silakan login dengan akun baru kamu",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
  
        navigate("/login"); // Arahkan ke login page setelah berhasil daftar
      } catch (error) {
        toast({
          title: "Gagal mendaftar",
          description:
            error.response?.data?.message || "Terjadi kesalahan saat register.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  
    return (
      <Box maxW="md" mx="auto" mt={20} p={6} boxShadow="lg" borderRadius="md">
        <Heading size="lg" mb={6} textAlign="center">
          Register
        </Heading>
        <VStack spacing={4}>
          <Input
            placeholder="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button colorScheme="blue" w="full" onClick={handleRegister}>
            Register
          </Button>
          <Text fontSize="sm">
            Sudah punya akun?{" "}
            <Text
              as="span"
              color="blue.500"
              cursor="pointer"
              onClick={() => navigate("/login")}
            >
              Login di sini
            </Text>
          </Text>
        </VStack>
      </Box>
    );
  };
  
  export default Register;  