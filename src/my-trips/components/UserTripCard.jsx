import { Button } from "@/components/ui/button";
import { GetPlaceDetails, PHOTO_REF_URL } from "@/service/GlobalApi";
import { Map, MapPin, Send, UsersRoundIcon, Wallet2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Skeleton from "./Skeleton";

function UserTripCard({ trip, deleteTrip }) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const GetPlacePhoto = async () => {
      const data = {
        textQuery: trip?.userSelection?.location,
      };

      try {
        setLoading(true);
        const result = await GetPlaceDetails(data.textQuery);

        if (result.data.results[0]?.photos?.length > 0) {
          const photoName = result.data.results[0].photos[0].photo_reference;
          const constructedPhotoUrl = PHOTO_REF_URL.replace(
            "{PHOTO_REF}",
            photoName
          );
          setPhotoUrl(constructedPhotoUrl);
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

    if (trip?.userSelection?.location) {
      GetPlacePhoto();
    }
  }, [trip]);

  return (
    <>
      {loading ? (
        <Skeleton />
      ) : (
        <div
          className="hover:scale-105 shadow-xl p-4 h-96 relative mx-8 my-6 rounded-2xl flex flex-col justify-center items-center w-80 transition-all duration-500 ease-out"
          style={{ backgroundColor: "rgb(255 255 255)" }}
        >
          <div className="max-h-64 w-full overflow-hidden rounded-lg">
            <img
              src={
                loading
                  ? "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=740"
                  : photoUrl
              }
              className=" object-contain rounded-lg"
              alt="Trip Hero"
            />
          </div>
          <div className="flex flex-col my-2 w-80 px-6">
            <p className="font-sans flex items-center text-md text-left leading-6 font-semibold paragraph-ellipsis">
              {" "}
              <MapPin className="h-6 w-6 md:h-8 md:w-8 mx-1" />
              Location: {trip?.userSelection?.location}
            </p>
            <p className="font-sans flex items-center text-stone-600 text-xs my-1 w-44 h-8 paragraph-ellipsis-description">
              <Map className="h-5 w-5 md:h-6 md:w-6 mx-1" />
              Travelling days:{" "}
              {trip?.userSelection?.noOfDays
                ? trip?.userSelection?.noOfDays
                : "No Info..."}
            </p>
            <p className="font-sans flex items-center text-stone-600 text-xs my-1 w-44 h-8 paragraph-ellipsis-description">
              <UsersRoundIcon className="h-5 w-5 md:h-6 md:w-6 mx-1" />
              Travelers:{" "}
              {trip?.userSelection?.traveler
                ? trip?.userSelection?.traveler
                : "No Info..."}
            </p>
            <p className="font-sans flex items-center text-stone-600 text-xs my-1 w-44 h-8 paragraph-ellipsis-description">
              <Wallet2 className="h-5 w-5 md:h-6 md:w-6 mx-1" />
              Budget category:{" "}
              <span
                className={`ml-1 ${
                  trip?.userSelection?.budget === "Premium"
                    ? "premium-text"
                    : ""
                }`}
              >
                {trip?.userSelection?.budget
                  ? trip?.userSelection?.budget
                  : "No Info..."}
              </span>
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link to={"/view-trip/" + trip?.id}>
              <button className="bg-purple-700 hover:bg-purple-900 rounded-3xl font-semibold text-white h-8 w-32">
                View
              </button>
            </Link>
            <button
              onClick={() => deleteTrip(trip.id)}
              className="bg-red-600 hover:bg-red-800 rounded-3xl font-semibold text-white h-8 w-32"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default UserTripCard;
