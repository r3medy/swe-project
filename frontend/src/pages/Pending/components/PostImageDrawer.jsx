import { Drawer } from "@/components";
import { assetUrl } from "@/config";

function PostImageDrawer({ isOpen, currentPost, onClose }) {
  return (
    <Drawer title="View Image" isOpen={isOpen} onClose={onClose}>
      <img
        src={assetUrl(currentPost?.jobThumbnail)}
        alt="Job Thumbnail"
        style={{
          maxWidth: "100%",
          maxHeight: "70vh",
          objectFit: "contain",
          borderRadius: "8px",
        }}
      />
    </Drawer>
  );
}

export default PostImageDrawer;
