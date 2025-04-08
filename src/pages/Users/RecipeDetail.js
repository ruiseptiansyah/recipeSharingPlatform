// src/pages/Users/RecipeDetail.js

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Image,
  VStack,
  useToast,
} from "@chakra-ui/react";

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        toast({
          title: "Gagal mengambil data resep",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, toast]);

  if (loading) {
    return <Spinner size="xl" mt={10} />;
  }

  if (!recipe) {
    return <Text mt={10}>Resep tidak ditemukan.</Text>;
  }

  return (
    <Box maxW="600px" mx="auto" mt={10} p={4} shadow="md" borderWidth="1px">
      <Heading mb={4}>{recipe.title}</Heading>
      {recipe.image_url && (
        <Image src={recipe.image_url} alt={recipe.title} borderRadius="md" mb={4} />
      )}
      <VStack align="start" spacing={3}>
        <Text><strong>Kategori:</strong> {recipe.category}</Text>
        <Text><strong>Bahan:</strong> {recipe.ingredients}</Text>
        <Text><strong>Instruksi:</strong> {recipe.instructions}</Text>
      </VStack>
    </Box>
  );
};

export default RecipeDetail;