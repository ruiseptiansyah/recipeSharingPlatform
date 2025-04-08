import React from "react";
import {
  Box,
  Image,
  Text,
  Heading,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { FaBookmark, FaRegComment, FaStar } from "react-icons/fa";

const RecipeCard = ({ recipe }) => {
  return (
    <Box borderWidth="1px" borderRadius="xl" overflow="hidden" p={4} boxShadow="md">
      <Image
        src={recipe.image_url || "https://via.placeholder.com/400x200?text=No+Image"}
        alt={recipe.title}
        borderRadius="md"
        mb={3}
      />
      <Heading size="md" mb={2}>
        {recipe.title}
      </Heading>
      <Text noOfLines={3}>{recipe.description}</Text>

      <HStack spacing={4} mt={3}>
        <IconButton icon={<FaStar />} aria-label="Rating" />
        <IconButton icon={<FaRegComment />} aria-label="Comment" />
        <IconButton icon={<FaBookmark />} aria-label="Bookmark" />
      </HStack>
    </Box>
  );
};

export default RecipeCard;