import express from "express";
import { getApartments } from "../controllers/apartment.controller.js";

const router = express.Router();
router.get("/", getApartments);

export default router;
