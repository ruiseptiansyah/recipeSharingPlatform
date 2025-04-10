import { Box, Image, Text, Heading, Tag } from "@chakra-ui/react";

const RecipeInfo = ({ recipe }) => {
  return (
    <Box>
      <Image src={recipe.image} alt={recipe.title} borderRadius="md" />
      <Heading mt={4}>{recipe.title}</Heading>
      <Tag colorScheme="teal" mt={2}>{recipe.category}</Tag>
      <Text mt={4}>{recipe.description}</Text>

      <Box mt={4}>
        <Heading size="md">Bahan</Heading>
        <ul>
          {recipe.ingredients.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </Box>

      <Box mt={4}>
        <Heading size="md">Langkah</Heading>
        <ol>
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </Box>
    </Box>
  );
};

export default RecipeInfo;