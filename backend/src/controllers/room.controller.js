import Room from "../models/room.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const createRoom = async (req, res) => {
  try {
    const { name, memberIds = [] } = req.body;
    const creatorId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const uniqueMembers = Array.from(new Set([creatorId.toString(), ...memberIds.map(String)]));

    const room = await Room.create({ name, members: uniqueMembers, createdBy: creatorId });
    res.status(201).json(room);
  } catch (error) {
    console.error("Error in createRoom:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const myId = req.user._id;
    const rooms = await Room.find({ members: myId }).sort({ updatedAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getMyRooms:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { id: roomId } = req.params;
    const myId = req.user._id;
    // basic membership check
    const room = await Room.findById(roomId);
    if (!room || !room.members.map(String).includes(myId.toString())) {
      return res.status(403).json({ message: "Not a member of this room" });
    }

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getRoomMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendRoomMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: roomId } = req.params;
    const senderId = req.user._id;

    // membership check
    const room = await Room.findById(roomId);
    if (!room || !room.members.map(String).includes(senderId.toString())) {
      return res.status(403).json({ message: "Not a member of this room" });
    }

    const newMessage = new Message({ senderId, roomId, text, image });
    await newMessage.save();

    // emit to all room members who are online
    for (const memberId of room.members) {
      const sid = getReceiverSocketId(memberId.toString());
      if (sid) io.to(sid).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendRoomMessage:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};