import axios from "axios";

const BASE_URL = "https://maps.gomaps.pro/maps/api/place/textsearch/json";

const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const GetPlaceDetails = (data) => {
  // Construct the full URL with query parameters from the data object
  const url = `${BASE_URL}?query=${encodeURIComponent(data)}&key=${import.meta.env.VITE_GOOGLE_PLACE_API_KEY}`;

  // Make a GET request to the constructed URL
  return axios.get(url, config);
};

export const PHOTO_REF_URL =
  "https://maps.gomaps.pro/maps/api/place/photo?photo_reference={PHOTO_REF}&maxwidth=400&key=" +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;
