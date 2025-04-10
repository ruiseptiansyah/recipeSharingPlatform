import { Box, Heading, Text, Button } from "@chakra-ui/react";

const RatingSection = ({ rating, onRate }) => {
  return (
    <Box mt={8}>
      <Heading size="md">Rating</Heading>
      <Text>Rata-rata: {rating.average.toFixed(1)} ⭐</Text>
      {/* Optional: form kasih rating */}
      <Button onClick={onRate} mt={2}>Kasih Rating</Button>
    </Box>
  );
};

export default RatingSection;