import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import { Loader2 } from "lucide-react";

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const GetPlacePhoto = async () => {
      const data = {
        textQuery: hotel.hotelName,
      };

      try {
        setLoading(true);
        const result = await GetPlaceDetails(data.textQuery);
        if (result.data.results[0]?.photos?.length > 0) {
          const photoName = result.data.results[0].photos[0].photo_reference;
          const url = PHOTO_REF_URL.replace("{PHOTO_REF}", photoName);
          setPhotoUrl(url);
          setLoading(false);
        } else {
          setLoading(false);
          console.warn("No photo found at index 8");
          setPhotoUrl("/fallback-image.jpg"); // Optional: Set a fallback image if available
        }
      } catch (error) {
        setLoading(false);
        console.error("Error fetching photo details:", error);
        setPhotoUrl("/fallback-image.jpg"); // Optional: Set a fallback image if available
      }
    };

    if (hotel) {
      GetPlacePhoto();
    }
  }, [hotel]);

  return (
    <Link
      to={
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(hotel.hotelName) +
        "," +
        encodeURIComponent(hotel?.hotelAddress)
      }
      target="_blank"
      className="transform hover:scale-105 transition-transform duration-300"
    >
      {loading ? (
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden w-80 h-96 flex flex-col">
          <img
            src={photoUrl}
            alt={hotel.hotelName}
            className="w-full h-48 object-cover"
          />
          <div className="p-4 flex flex-col flex-grow justify-between">
            <div>
              <h3 className="font-semibold text-lg mb-1">{hotel.hotelName}</h3>
              <p className="font-light text-sm text-gray-600 mb-2 truncate">
                {hotel.hotelAddress}
              </p>
            </div>
            <div>
              <p className="font-medium text-xl text-indigo-600 mb-2">
                {hotel?.price}
              </p>
              <div className="flex items-center">
                <Star className="h-5 text-yellow-400 mr-1" />
                <p className="font-medium">{hotel.rating}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Link>
  );
}

export default HotelCardItem;
