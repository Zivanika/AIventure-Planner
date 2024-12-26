import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AI_PROMPT,
  SelectBudgetOptions,
  SelectTravelesList,
} from "@/constants/options";
import { chatSession } from "@/service/AIModal";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading } from "react-icons/ai";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/service/firebase";
import { useNavigate } from "react-router-dom";

function Create() {
  const [formData, setFormData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [sourceInputValue, setSourceInputValue] = useState("");
  const [destinationInputValue, setDestinationInputValue] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [sourceHighlightedIndex, setSourceHighlightedIndex] = useState(-1);
  const [destinationHighlightedIndex, setDestinationHighlightedIndex] =
    useState(-1);
  const [isLoadingSource, setIsLoadingSource] = useState(false);
  const [isLoadingDestination, setIsLoadingDestination] = useState(false);

  const handleKeyDown = (e, type) => {
    if (type === "source") {
      if (e.key === "ArrowDown") {
        setSourceHighlightedIndex((prev) =>
          prev < sourceSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        setSourceHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && sourceHighlightedIndex >= 0) {
        handleSelectSuggestion(
          sourceSuggestions[sourceHighlightedIndex],
          "source"
        );
      }
    } else if (type === "destination") {
      if (e.key === "ArrowDown") {
        setDestinationHighlightedIndex((prev) =>
          prev < destinationSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        setDestinationHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === "Enter" && destinationHighlightedIndex >= 0) {
        handleSelectSuggestion(
          destinationSuggestions[destinationHighlightedIndex],
          "destination"
        );
      }
    }
  };

  const handlePlacesChange = async (value, type) => {
    if (type === "source") {
      setSourceInputValue(value);
    } else if (type === "destination") {
      setDestinationInputValue(value);
    }

    handleInputChange(type === "source" ? "source" : "location", value);

    if (value.trim().length === 0) {
      if (type === "source") setSourceSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }

    const setLoading =
      type === "source" ? setIsLoadingSource : setIsLoadingDestination;
    const setSuggestions =
      type === "source" ? setSourceSuggestions : setDestinationSuggestions;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/autocomplete/json`,
        {
          params: {
            input: value,
            key: import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
          },
        }
      );

      if (response.data.status === "OK") {
        setSuggestions(
          response.data.predictions.map((item) => item.description)
        );
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion, type) => {
    if (type === "source") {
      setSourceInputValue(suggestion);
      setSourceSuggestions([]);
      setSourceHighlightedIndex(-1);
    } else if (type === "destination") {
      setDestinationInputValue(suggestion);
      setDestinationSuggestions([]);
      setDestinationHighlightedIndex(-1);
    }
    handleInputChange(type === "source" ? "source" : "location", suggestion);
  };

  const navigate = useNavigate(); //navigating to next page

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const login = useGoogleLogin({
    onSuccess: (tokenInfo) => getUserProfile(tokenInfo),
    onError: (error) => console.log(error),
  });

  const onGenerateTrip = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setOpenDialog(true);
      return;
    }

    if (
      !formData.noOfDays ||
      !formData.source ||
      !formData.location ||
      !formData.budget ||
      !formData.traveler
    ) {
      toast.error("Please fill all the details");
      return;
    }

    setLoading(true);
    try {
      const FINAL_PROMPT = AI_PROMPT.replace("{location}", formData.location)
        .replace("{totalDays}", formData.noOfDays)
        .replace("{traveler}", formData.traveler)
        .replace("{budget}", formData.budget)
        .replace("{totalDays}", formData.noOfDays);

      toast.info("Generating trip...");
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      toast.success("Trip generated successfully!");
      toast.success("Saving trip to database...");
      await saveAiTrip(result.response.text());
    } catch (error) {
      console.error("Error generating trip:", error);
      toast.error("Failed to generate trip. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const saveAiTrip = async (tripData) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const docId = Date.now().toString();

    await setDoc(doc(db, "AITrips", docId), {
      userSelection: formData,
      tripData: JSON.parse(tripData),
      userEmail: user.email,
      id: docId,
    });
    toast.success("Trip saved successfully!");
    navigate("/view-trip/" + docId);
  };

  const getUserProfile = (tokenInfo) => {
    try {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${tokenInfo.access_token}`,
              Accept: "Application/json",
            },
          }
        )
        .then((resp) => {
          console.log(resp);
          localStorage.setItem("user", JSON.stringify(resp.data));
          setOpenDialog(false);
          onGenerateTrip();
        });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to fetch user profile. Please try again");
    }
  };
  return (
    <div className="px-5 sm:px-10 md:px-32 lg:px-56 xl:px-10 mt-20 mx-5 sm:mx-10 md:mx-32 lg:mx-56 xl:mx-10">
      <ToastContainer />
      <h2 className="font-extrabold text-3xl">
        Where do you want to Travel next?
      </h2>
      <p className="mt-3 text-gray-700">
        What's your next travel destination? Provide your desired location,
        preferred activities, <br className="hidden md:inline" /> and specific
        dates for a personalized itinerary.
      </p>
      <div className="mt-10 flex flex-col gap-10">
        {/* Source Input */}
        <h2 className="text-xl my-3 font-bold">
          Where are you starting your journey from?
        </h2>
        <div className="relative w-full ">
          <input
            type="text"
            value={sourceInputValue}
            onKeyDown={(e) => handleKeyDown(e, "source")}
            onChange={(e) => handlePlacesChange(e.target.value, "source")}
            placeholder="Search for a place"
            className="w-full p-2 border border-gray-300 rounded shadow"
          />
          {isLoadingSource && (
            <div className="absolute my-2 text-gray-500">Loading...</div>
          )}
          {sourceSuggestions.length > 0 && (
            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {sourceSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer ${
                    index === sourceHighlightedIndex
                      ? "bg-gray-200"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handleSelectSuggestion(suggestion, "source")}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <h2 className="text-xl my-3 font-bold">
          What's your destination for this journey?
        </h2>

        <div className="relative w-full ">
          <input
            type="text"
            value={destinationInputValue}
            onKeyDown={(e) => handleKeyDown(e, "destination")}
            onChange={(e) => handlePlacesChange(e.target.value, "destination")}
            placeholder="Search for a place"
            className="w-full p-2 border border-gray-300 rounded shadow"
          />
          {isLoadingDestination && (
            <div className="absolute my-2 text-gray-500">Loading...</div>
          )}
          {destinationSuggestions.length > 0 && (
            <ul className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {destinationSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer ${
                    index === destinationHighlightedIndex
                      ? "bg-gray-200"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() =>
                    handleSelectSuggestion(suggestion, "destination")
                  }
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl my-3 font-bold">
            How many days are you planning?
          </h2>
          <Input
            placeholder="Eg. 3"
            className="placeholder-gray-500 placeholder-italic"
            type="text"
            onChange={(e) => handleInputChange("noOfDays", e.target.value)}
          />
        </div>
        <div>
          <h2 className="text-xl my-3 font-bold">What is your Budget?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            {SelectBudgetOptions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleInputChange("budget", item.title)}
                className={`p-4 cursor-pointer border rounded-lg transition ease-in-out 
                  delay-100 hover:shadow-md ${
                    formData.budget === item.title && "bg-gray-200"
                  }`}
              >
                <h2 className="text-4xl">{item.icon}</h2>
                <h2 className="font-bold">{item.title}</h2>
                <h2 className="font-light text-gray-500">{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl my-3 font-bold">How many Travelers?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {SelectTravelesList.map((item, index) => (
            <div
              key={index}
              onClick={() => handleInputChange("traveler", item.people)}
              className={`p-4 cursor-pointer border rounded-lg transition ease-in-out delay-100 hover:shadow-md ${
                formData.traveler === item.people && "bg-gray-200"
              }`}
            >
              <h2 className="text-4xl">{item.icon}</h2>
              <h2 className="font-bold">{item.title}</h2>
              <h2 className="font-light text-gray-500">{item.desc}</h2>
              <h2 className="font-light text-gray-500">
                Travelers: {item.people}
              </h2>
            </div>
          ))}
        </div>
      </div>
      <div className="my-10 justify-center flex">
        <Button disabled={loading} onClick={onGenerateTrip}>
          {loading ? (
            <AiOutlineLoading className="h-7 w-7 animate-spin" />
          ) : (
            "Generate Trip!"
          )}
        </Button>
      </div>
      <Dialog open={openDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription>
              <img src="/logo.svg" alt="logo" />
              <h2 className="font-bold text-black text-2xl mt-6">
                Sign In with Google!
              </h2>
              <p className="font-medium mt-3">
                Sign in with Google authentication security
              </p>
              <Button
                onClick={login}
                className="w-full mt-6 flex justify-center"
              >
                <FcGoogle className="m-2 h-7 w-7" />
                Sign In with Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Create;
