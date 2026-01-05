import express from "express";
import { getAllApartments } from "../controllers/apartment.controller.js";

const router = express.Router();

// This allows you to visit /apartments to see the saved data
router.get("/", getAllApartments);

export default router;