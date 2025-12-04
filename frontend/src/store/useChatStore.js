import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  rooms: [],
  selectedUser: null,
  selectedRoom: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isRoomsLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getRooms: async () => {
    set({ isRoomsLoading: true });
    try {
      const res = await axiosInstance.get("/rooms");
      set({ rooms: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch rooms");
    } finally {
      set({ isRoomsLoading: false });
    }
  },

  createRoom: async ({ name, memberIds }) => {
    try {
      const res = await axiosInstance.post("/rooms", { name, memberIds });
      set({ rooms: [res.data, ...get().rooms] });
      toast.success("Room created");
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create room");
      throw error;
    }
  },

  getMessages: async (id) => {
    // Fetch direct messages with a user
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${id}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getRoomMessages: async (roomId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/rooms/${roomId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch room messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, selectedRoom, messages } = get();
    try {
      let res;
      if (selectedRoom?._id) {
        res = await axiosInstance.post(`/rooms/send/${selectedRoom._id}`, messageData);
      } else if (selectedUser?._id) {
        res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      } else {
        throw new Error("No chat selected");
      }
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, selectedRoom } = get();
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage"); // prevent duplicate handlers
    socket.on("newMessage", (newMessage) => {
      const isForSelectedRoom = !!selectedRoom?._id && newMessage.roomId === selectedRoom._id;
      const isDirectFromSelectedUser =
        !!selectedUser?._id && newMessage.senderId === selectedUser._id && !newMessage.roomId;

      if (!isForSelectedRoom && !isDirectFromSelectedUser) return;

      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, selectedRoom: null, messages: [] }),
  setSelectedRoom: (selectedRoom) => set({ selectedRoom, selectedUser: null, messages: [] }),
}));
