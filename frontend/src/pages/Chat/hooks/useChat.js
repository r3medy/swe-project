import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/useSession";
import { get, post } from "@/utils/request";

/**
 * Lightweight comparison of two chat arrays.
 * Compares length, chatId ordering, and updatedAt timestamps
 * to avoid expensive JSON.stringify on every poll.
 */
const chatsEqual = (a, b) => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ca = a[i];
    const cb = b[i];
    if (ca.chatId !== cb.chatId) return false;
    if (ca.updatedAt !== cb.updatedAt) return false;
    if (ca.lastMessageAt !== cb.lastMessageAt) return false;
  }
  return true;
};

export const useChat = () => {
  const { user, isFetchingSession } = useSession();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedChat = chats.find((c) => c.chatId === selectedChatId) || null;

  const fetchChats = useCallback(async () => {
    try {
      const data = await get("/chats");

      setChats((prevChats) => {
        if (chatsEqual(prevChats, data)) {
          return prevChats;
        }
        return data;
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling effect
  useEffect(() => {
    if (!user) return;

    fetchChats();

    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [fetchChats, user]);

  const sendMessage = useCallback(
    async (messageContent) => {
      if (!messageContent.trim() || !selectedChatId) return false;

      try {
        await post(`/chats/${selectedChatId}`, {
          messageContent: messageContent.trim(),
        });
        await fetchChats();
        return true;
      } catch (err) {
        console.error("Error sending message:", err);
        return false;
      }
    },
    [selectedChatId, fetchChats],
  );

  return {
    chats,
    selectedChat,
    selectedChatId,
    setSelectedChatId,
    loading,
    error,
    fetchChats,
    sendMessage,
    user,
    isFetchingSession,
  };
};
