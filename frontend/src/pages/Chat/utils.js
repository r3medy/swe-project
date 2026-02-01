import profileImage1 from "@/assets/profilepictures/1.png";
import profileImage3 from "@/assets/profilepictures/3.png";

export const getOtherParticipant = (chat, user) => {
  if (!user || !chat) return null;
  return chat.freelancer.userId === user.userId ? chat.client : chat.freelancer;
};

export const getAvatarUrl = (participant) => {
  if (participant?.profilePicture) {
    return `http://localhost:8000/${participant.profilePicture}`;
  }
  // Fallback to gender-based image
  if (participant?.gender === "Female") {
    return profileImage3;
  }
  return profileImage1; // Default to male image
};

export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
