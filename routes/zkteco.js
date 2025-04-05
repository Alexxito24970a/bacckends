import express from "express";
import { getAttendance } from "../controllers/zktecoController.js";

const router = express.Router();

router.get("/attendance/:deviceId", getAttendance);

export default router;
