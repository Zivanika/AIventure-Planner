import { Button } from "@/components/ui/button";
import { GetPlaceDetails } from "@/service/GlobalApi";
import { Map, MapPin, UsersRoundIcon, Wallet2, Send, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const GetPlacePhoto = async () => {
      const data = {
        textQuery: trip?.userSelection?.location,
      };

      try {
        console.log("Fetching place details for:", data.textQuery);

        const result = await GetPlaceDetails(data.textQuery);
        console.log("Place details:", result);

        // Check if photos exist and extract the photo reference
        if (result.data.results[0]?.photos?.length > 0) {
          const photoReference =
            result.data.results[0].photos[0].photo_reference;
          const constructedPhotoUrl = `https://maps.gomaps.pro/maps/api/place/photo?photo_reference=${photoReference}&maxwidth=400&key=AlzaSyeo8PM2mH1WAhHG0xU6behJJ2BxgekpnWD`;
          setPhotoUrl(constructedPhotoUrl);
        } else {
          console.warn("No photo found in the API response");
          setPhotoUrl("/fallback-image.png"); // Optional: Set a fallback image
        }
      } catch (error) {
        console.error("Error fetching photo details:", error);
        setPhotoUrl("/fallback-image.png"); // Optional: Set a fallback image
      }
    };

    if (trip?.userSelection?.location) {
      GetPlacePhoto();
    }
  }, [trip]);

  return (
    <div>
      {photoUrl ? (
        <img
          src={photoUrl}
          className="h-[400px] w-full object-cover rounded-lg"
          alt="Trip Hero"
        />
      ) : (
        <Loader2 className="mx-auto h-10 w-10 animate-spin" />
      )}
      <div className="flex flex-col lg:flex-row justify-between items-center mt-5 space-y-5 lg:space-y-0 lg:space-x-5">
        <div className="flex flex-col gap-2 sm:text-sm md:text-base lg:text-lg">
          <h2 className="font-bold text-2xl flex items-center gap-1">
            <MapPin className="h-6 w-6 md:h-8 md:w-8" />
            Location: {trip?.userSelection?.location}
          </h2>
          <div className="flex flex-wrap gap-3">
            <h2 className="px-3 flex items-center gap-1 bg-gray-200 rounded-md p-1 text-gray-500">
              <Map className="h-5 w-5 md:h-6 md:w-6" />
              Travelling days: {trip?.userSelection?.noOfDays}
            </h2>
            <h2 className="px-3 flex items-center gap-1 bg-gray-200 rounded-md p-1 text-gray-500">
              <UsersRoundIcon className="h-5 w-5 md:h-6 md:w-6" />
              Travelers: {trip?.userSelection?.traveler}
            </h2>
            <h2 className="px-3 flex items-center gap-1 bg-gray-200 rounded-md p-1 text-gray-500">
              <Wallet2 className="h-5 w-5 md:h-6 md:w-6" />
              Budget category: {trip?.userSelection?.budget}
            </h2>
          </div>
        </div>
        <Button className="flex items-center justify-center">
          <Send className="h-6 w-6 md:h-8 md:w-8" />
        </Button>
      </div>
    </div>
  );
}

export default InfoSection;
