import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Car, Train, Plane, PersonStanding } from "lucide-react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
// Sample data
const transportData = [
  {
    mode: "Walking",
    icon: <PersonStanding className="h-6 w-6" />,
    time: "",
  },
  {
    mode: "Car",
    icon: <Car className="h-6 w-6" />,
    time: "",
  },
  {
    mode: "Train",
    icon: <Train className="h-6 w-6" />,
    time: "",
  },
  {
    mode: "Flight",
    icon: <Plane className="h-6 w-6" />,
    time: "",
  },
];

export default function TransportComparison({ trip }) {
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);

  function getCityName(location) {
    if (location) {
      const parts = location.split(",");
      return parts[0].trim();
    } else {
      return "";
    }
  }

  const formatTime = (timeInHours) => {
    if (timeInHours >= 24) {
      const days = Math.floor(timeInHours / 24);
      const hours = Math.round(timeInHours % 24);
      return `${days} day${days > 1 ? "s" : ""} ${hours} hr${
        hours > 1 ? "s" : ""
      }`;
    } else if (timeInHours < 1) {
      const minutes = Math.round(timeInHours * 60);
      return `${minutes} mins`;
    }
    return `${Math.round(timeInHours)} hr${timeInHours > 1 ? "s" : ""}`;
  };

  useEffect(() => {
    setLoading(true);
    try {
      axios
        .post(
          `https://routes.gomaps.pro/directions/v2:computeRoutes`,
          {
            origin: {
              address: trip?.userSelection?.source,
            },
            destination: {
              address: trip?.userSelection?.location,
            },
          },
          {
            headers: {
              "X-Goog-FieldMask": `routes.distanceMeters,routes.duration`,
              "Content-Type": "application/json",
              "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
            },
          }
        )
        .then((resp) => {
          console.log(
            "duration response",
            resp.data.routes[0].legs[0].duration
          );
          setDistance(resp.data.routes[0].legs[0].distanceMeters);
          setDuration(resp.data.routes[0].legs[0].duration);
        });
    } catch (error) {
      console.error("Error fetching distance matrix:", error);
      toast.error("Error fetching distance matrix");
    }
  }, [trip]);

  useEffect(() => {
    const calculateTimes = () => {
      if (distance && duration) {
        console.log("Distance:", distance);
        console.log("Duration:", duration);
        const carSpeed = (distance / 1000) / (parseInt(duration.replace("s", ""))/ 3600); // km/hr
        const distanceKm = distance / 1000; // Convert meters to kilometers
        console.log("Car speed:", carSpeed);
        // Average speeds (in km/hr)
        const averageSpeeds = {
          Walking: 4,
          Car: carSpeed,
          Train: 45,
          Flight: 800,
        };

        // Update transportData times
        transportData.forEach((mode) => {
          const modeSpeed = averageSpeeds[mode.mode];
          const timeInHours = distanceKm / modeSpeed;
          mode.time = formatTime(timeInHours);
        });
      }
      setLoading(false);
    };
    calculateTimes();
  }, [distance, duration]);

  return (
    <div className="container my-4 mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">
        Transport Comparison: {getCityName(trip?.userSelection?.source)} to{" "}
        {getCityName(trip?.userSelection?.location)} <br />{" "}
        {distance && (
          <span className="text-green-600 font-semibold">
            {distance / 1000} km
          </span>
        )}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {transportData.map((transport, index) => (
          <Card key={index}>
            {loading && (<Loader2 className="mx-auto h-10 w-10 animate-spin" />)}
            {!loading && <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {transport.mode}
              </CardTitle>
              {transport.icon}
            </CardHeader>}
            {!loading && <CardContent>
              <p className="text-2xl font-bold">{transport.time}</p>
            </CardContent>}
          </Card>
        ))}
      </div>
    </div>
  );
}
