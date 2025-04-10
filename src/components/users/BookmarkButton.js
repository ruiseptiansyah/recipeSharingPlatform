import { IconButton } from "@chakra-ui/react";
import { Star, StarOff } from "lucide-react";

const BookmarkButton = ({ isBookmarked, onToggle }) => {
  return (
    <IconButton
      icon={isBookmarked ? <Star color="gold" /> : <StarOff />}
      aria-label="Bookmark"
      onClick={onToggle}
      variant="ghost"
    />
  );
};

export default BookmarkButton;