// src/pages/Users/RecipeDetail.js
import { StarIcon } from "lucide-react";
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
  Textarea,
  Button,
  HStack,
  IconButton,
  Divider,
} from "@chakra-ui/react";

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const toast = useToast();

  const token = localStorage.getItem("userToken"); // case sensitive, harus 'userToken'

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

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/recipes/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error("Gagal ambil komentar:", err);
    }
  };

  const fetchRating = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/recipes/${id}/rating`);
      setAvgRating(res.data.average_rating);
    } catch (err) {
      console.error("Gagal ambil rating:", err);
    }
  };

  const submitComment = async () => {
    if (!newComment.trim()) return ;

    try {
      await axios.post(
        `http://localhost:5000/api/recipes/${id}/comment`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      fetchComments();
    } catch (err) {
      toast({
        title: "Gagal kirim komentar",
        description: err.response?.data?.message || err.message,
        status: "error",
      });
    }
  };

  const rateRecipe = async (rating) => {
    setUserRating(rating);
    try {
      await axios.post(
        `http://localhost:5000/api/recipes/${id}/rate`,
        { rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRating(); // update avg rating
    } catch (err) {
      toast({
        title: "Gagal memberi rating",
        description: err.response?.data?.message || err.message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchRecipe();
    fetchComments();
    fetchRating();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  

  if (loading) return <Spinner size="xl" mt={10} />;
  if (!recipe) return <Text mt={10}>Resep tidak ditemukan.</Text>;

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

        <Divider my={4} />

        {/* Average Rating */}
        <Text>
          <strong>Rating Rata-rata:</strong> {parseFloat(avgRating).toFixed(1)} / 5
        </Text>

        {/* Give Rating */}
        <HStack>
          <Text>Beri Rating:</Text>
          {[1, 2, 3, 4, 5].map((star) => (
            <IconButton
              key={star}
              icon={<StarIcon fill={userRating >= star ? "gold" : "none"} />}
              size="sm"
              variant="ghost"
              onClick={() => rateRecipe(star)}
              aria-label={`Rating ${star}`}
            />
          ))}
        </HStack>

        <Divider my={4} />

        {/* 💬 Comment Form */}
        <Text><strong>Komentar:</strong></Text>
        <Textarea
          placeholder="Tulis komentarmu..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button colorScheme="teal" mt={2} onClick={submitComment}>
          Kirim
        </Button>

        {/* 💭 Comment List */}
        {comments.length > 0 ? (
          <VStack align="start" spacing={2} mt={4}>
            {comments.map((c) => (
              <Box key={c.id} p={2} borderWidth="1px" borderRadius="md" w="100%">
                <Text fontWeight="bold">{c.username}</Text>
                <Text fontSize="sm" color="gray.600">{new Date(c.created_at).toLocaleString()}</Text>
                <Text mt={1}>{c.comment}</Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text mt={4}>Belum ada komentar.</Text>
        )}
      </VStack>
    </Box>
  );
};

export default RecipeDetail;