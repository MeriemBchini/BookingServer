import fetch from "node-fetch";

export async function fetchApartments() {
  const response = await fetch("https://example.com/api/apartments");
  return response.json();
}
