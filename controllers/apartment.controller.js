import Apartment from "../models/apartment.model.js";

export const getAllApartments = async (req, res) => {
  try {
    const apartments = await Apartment.find().sort({ lastSynced: -1 });
    res.status(200).json({
      count: apartments.length,
      data: apartments
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving apartments", error: error.message });
  }
};