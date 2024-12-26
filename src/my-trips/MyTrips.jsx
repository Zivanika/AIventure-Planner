import { db } from '@/service/firebase';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTripCard from './components/UserTripCard';

function MyTrips() {
  const navigate = useNavigate();
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetUserTrips();
  }, []);

  const GetUserTrips = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/");
      return;
    }
    try {
      const q = query(
        collection(db, "AITrips"),
        where("userEmail", "==", user?.email)
      );

      const querySnapshot = await getDocs(q);
      const trips = [];
      querySnapshot.forEach((doc) => {
       
        trips.push(doc.data());
      });

      setUserTrips(trips); // Reset the state with the fetched trips
     setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching user trips:", error);
    }
  };

  const deleteTrip = async (tripId) => {
    try {
      const tripDocRef = doc(db, "AITrips", tripId);
      await deleteDoc(tripDocRef);
      console.log("Trip deleted successfully:", tripId);

      // Update state to remove the deleted trip
      setUserTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };
  return (
    <div className="px-5 min-h-[450px] sm:px-10 md:px-32 lg:px-56 xl:px-10 mt-20 mx-5 sm:mx-10 md:mx-32 lg:mx-56 xl:mx-10">
      <h2 className='mt-10 font-bold text-3xl'>My Trips</h2>

      <div className='mt-10 grid grid-cols-1 md:grid-cols-3 gap-5'>
        {userTrips.length > 0 ? (
          userTrips.map((trip, index) => (
            <UserTripCard key={index} trip={trip} deleteTrip={deleteTrip}/>
          ))
        ) : (
          <p>No trips found </p>
        )}
      </div>
    </div>
  );
}

export default MyTrips;
