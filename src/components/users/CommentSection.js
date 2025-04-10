import { Box, Heading, Textarea, Button, VStack, Text } from "@chakra-ui/react";
import { useState } from "react";

const CommentSection = ({ comments, onSubmitComment }) => {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmitComment(comment);
    setComment("");
  };

  return (
    <Box mt={8}>
      <Heading size="md" mb={2}>Komentar</Heading>

      <Textarea
        placeholder="Tulis komentarmu..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        mb={2}
      />
      <Button onClick={handleSubmit}>Kirim</Button>

      <VStack align="start" mt={4} spacing={3}>
        {comments.map((cmt, index) => (
          <Box key={index} p={3} bg="gray.50" borderRadius="md" w="100%">
            <Text fontWeight="bold">{cmt.user}</Text>
            <Text>{cmt.text}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default CommentSection;