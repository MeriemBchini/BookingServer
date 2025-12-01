import { fetchApartments } from "../services/apartment.service.js";

export async function getApartments(req, res) {
  try {
    const apartments = await fetchApartments();
    res.json(apartments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch apartments" });
  }
}
