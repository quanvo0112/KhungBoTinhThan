import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import AuthContext from '../../../context/AuthContext';
import StaffSidebar from '../../../components/StaffSidebar';
import FlightFilters from '../../../components/FlightFilters';

// Server-side rendering with authentication
export async function getServerSideProps(context) {
  try {
    // Get auth cookie from the request
    const { req, query } = context;
    const token = req.cookies.token;
    
    if (!token) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    
    // Build query parameters for API request
    const queryParams = new URLSearchParams();
    if (query.origin) queryParams.append('origin', query.origin);
    if (query.destination) queryParams.append('destination', query.destination);
    if (query.departureDate) queryParams.append('departureDate', query.departureDate);
    
    // Fetch flights data from API
    const flightsRes = await axios.get(
      `${process.env.API_URL}/api/v1/flights?${queryParams.toString()}`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return {
      props: {
        initialFlights: flightsRes.data.data,
        filters: {
          origin: query.origin || '',
          destination: query.destination || '',
          departureDate: query.departureDate || ''
        }
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}

const FlightsManagement = ({ initialFlights, filters }) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [flights, setFlights] = useState(initialFlights);
  const [currentFilters, setCurrentFilters] = useState(filters);
  
  // Protect client-side as well
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'staff' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  // Apply filters and refresh flights list
  const applyFilters = async (newFilters) => {
    try {
      setCurrentFilters(newFilters);
      
      const queryParams = new URLSearchParams();
      if (newFilters.origin) queryParams.append('origin', newFilters.origin);
      if (newFilters.destination) queryParams.append('destination', newFilters.destination);
      if (newFilters.departureDate) queryParams.append('departureDate', newFilters.departureDate);
      
      const res = await axios.get(`/api/v1/flights?${queryParams.toString()}`);
      setFlights(res.data.data);
      
      // Update URL with filters
      router.push({
        pathname: router.pathname,
        query: newFilters
      }, undefined, { shallow: true });
      
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };
  
  // Delete flight
  const handleDeleteFlight = async (flightId) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await axios.delete(`/api/v1/flights/${flightId}`);
        setFlights(flights.filter(flight => flight._id !== flightId));
      } catch (error) {
        console.error('Error deleting flight:', error);
      }
    }
  };
  
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <StaffSidebar activeSection="flights" />
      
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Flights Management</h1>
          <Link href="/staff/flights/add">
            <a className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Add New Flight
            </a>
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filter Flights</h2>
          <FlightFilters 
            initialFilters={currentFilters}
            onApplyFilters={applyFilters}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left">Flight Number</th>
                  <th className="py-3 px-4 text-left">Origin</th>
                  <th className="py-3 px-4 text-left">Destination</th>
                  <th className="py-3 px-4 text-left">Departure</th>
                  <th className="py-3 px-4 text-left">Arrival</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Seats</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flights.map(flight => (
                  <tr key={flight._id} className="border-b">
                    <td className="py-3 px-4">{flight.flightNumber}</td>
                    <td className="py-3 px-4">{flight.origin}</td>
                    <td className="py-3 px-4">{flight.destination}</td>
                    <td className="py-3 px-4">
                      {new Date(flight.departureTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(flight.arrivalTime).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">${flight.price}</td>
                    <td className="py-3 px-4">
                      {flight.availableSeats}/{flight.capacity}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Link href={`/staff/flights/edit/${flight._id}`}>
                          <a className="text-blue-600 hover:text-blue-800">
                            Edit
                          </a>
                        </Link>
                        <button
                          onClick={() => handleDeleteFlight(flight._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {flights.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-4 text-center">
                      No flights found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightsManagement;
