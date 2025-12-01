import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createRoom, getMyRooms, getRoomMessages, sendRoomMessage } from "../controllers/room.controller.js";

const router = express.Router();

router.post("/", protectRoute, createRoom);
router.get("/", protectRoute, getMyRooms);
router.get("/:id", protectRoute, getRoomMessages);
router.post("/send/:id", protectRoute, sendRoomMessage);

export default router;
