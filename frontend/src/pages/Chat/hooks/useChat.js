import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { API_BASE_URL } from "@/config";

export const useChat = () => {
  const { user, isFetchingSession } = useSession();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized selected chat derived from chats array
  const selectedChat = chats.find((c) => c.chatId === selectedChatId) || null;

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/chats`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();

      setChats((prevChats) => {
        // Simple optimization to avoid re-renders if data matches
        if (JSON.stringify(prevChats) === JSON.stringify(data)) {
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

    // Initial fetch
    fetchChats();

    // Poll every 3 seconds
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [fetchChats, user]);

  const sendMessage = useCallback(
    async (messageContent) => {
      if (!messageContent.trim() || !selectedChatId) return false;

      try {
        const res = await fetch(`${API_BASE_URL}/chats/${selectedChatId}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageContent: messageContent.trim() }),
        });

        if (!res.ok) throw new Error("Failed to send message");
        await fetchChats(); // Refresh chat immediately
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
