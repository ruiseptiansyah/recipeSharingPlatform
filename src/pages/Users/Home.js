import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Box,
  Text,
  VStack,
  Spinner,
  useToast,
  Heading,
} from "@chakra-ui/react";

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/recipes/");
        setRecipes(res.data);
        console.log("DATA RESEP RAW:", res.data);

        setRecipes(res.data.data || []);
      } catch (error) {
        toast({
          title: "Gagal mengambil data resep",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [toast]);

  if (loading) {
    return (
      <Box textAlign="center" mt="10">
        <Spinner size="xl" />
        <Text mt={4}>Memuat resep...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" p={4}>
      {recipes.length === 0 ? (
        <Text textAlign="center">Belum ada resep yang tersedia</Text>
      ) : (
        recipes.map((recipe) => (
            <Box key={recipe.id} p={4} shadow="md" borderWidth="1px" borderRadius="md">
                <Link to={`/recipes/${recipe.id}`}>
                    <Heading fontSize="xl" mb={2}>{recipe.title}</Heading>
                    <Text noOfLines={2}>{recipe.ingredients}</Text>
                </Link>
            </Box>
        ))
      )}
    </VStack>
  );
};

export default Home;