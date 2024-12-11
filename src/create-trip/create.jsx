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
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      // Move down the suggestions list
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      // Move up the suggestions list
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      // Select the highlighted suggestion
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    }
  };

  const handlePlacesChange = async (value) => {
    setInputValue(value);

    handleInputChange("location", value);

    if (value.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    handleInputChange("location", suggestion);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  const navigate = useNavigate(); //navigating to next page

  // useEffect(() => {
  //   console.log(formData);
  // }, [formData]);

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
      (formData.noOfDays > 5 && !formData.location) ||
      !formData.budget ||
      !formData.traveler
    ) {
      toast("Please fill all the details");
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
        <h2 className="text-xl my-3 font-bold">
          What is your destination this time?
        </h2>
        <div className="relative w-full ">
          <input
            type="text"
            value={inputValue}
            onKeyDown={handleKeyDown}
            onChange={(e) => handlePlacesChange(e.target.value)}
            placeholder="Search for a place"
            className="w-full p-2 border border-gray-300 rounded shadow"
          />
          {isLoading && (
            <div className="absolute my-2 text-gray-500">Loading...</div>
          )}
          {suggestions.length > 0 && (
            <ul className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`p-2 cursor-pointer ${
                    index === highlightedIndex
                      ? "bg-gray-200"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => handleSelectSuggestion(suggestion)}
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
