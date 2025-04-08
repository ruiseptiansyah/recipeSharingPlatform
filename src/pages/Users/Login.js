import {
    Box,
    Button,
    Input,
    FormControl,
    FormLabel,
    Heading,
    VStack,
    useToast,
    Text,
  } from "@chakra-ui/react";
  import { useState } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  
  const UserLoginPage = () => {
    const toast = useToast();
    const navigate = useNavigate();
  
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  
    const handleLogin = async () => {
      setIsLoading(true);
      try {
        const res = await axios.post("http://localhost:5000/api/users/login", {
          email,
          password,
        });
  
        localStorage.setItem("userToken", res.data.token); // simpan token user
        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
  
        navigate("/home"); // redirect ke halaman home
      } catch (err) {
        toast({
          title: "Login gagal",
          description:
            err.response?.data?.message || "Email atau password salah.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        p={4}
      >
        <Box bg="white" p={8} rounded="lg" shadow="md" width="100%" maxW="400px">
          <Heading size="lg" textAlign="center" mb={6}>
            Login Pengguna
          </Heading>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Button
              colorScheme="blue"
              width="full"
              onClick={handleLogin}
              isLoading={isLoading}
            >
              Login
            </Button>
            <Text fontSize="sm" mt={2}>
                Belum punya akun?{" "}
                <Text
                    as="span"
                    color="blue.500"
                    cursor="pointer"
                    onClick={() => navigate("/register")}
                >
                    Daftar di sini
                </Text>
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  };
  
  export default UserLoginPage;  