import { IconButton, useToast } from "@chakra-ui/react";
import { Share2 } from "lucide-react";

const ShareButton = ({ url }) => {
  const toast = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link disalin!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <IconButton
      icon={<Share2 />}
      aria-label="Share"
      onClick={handleShare}
      variant="ghost"
    />
  );
};

export default ShareButton;