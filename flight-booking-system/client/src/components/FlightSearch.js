import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const FlightSearch = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState(new Date());
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formattedDate = departureDate.toISOString().split('T')[0];
      
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/flights/search`,
        {
          params: { origin, destination, departureDate: formattedDate }
        }
      );
      
      setFlights(data.data);
    } catch (err) {
      setError('Failed to search flights. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flight-search">
      <h2>Find Flights</h2>
      
      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="origin">Origin</label>
          <input
            type="text"
            id="origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter city or airport"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <input
            type="text"
            id="destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter city or airport"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="departureDate">Departure Date</label>
          <DatePicker
            selected={departureDate}
            onChange={(date) => setDepartureDate(date)}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            className="form-control"
            id="departureDate"
            required
          />
        </div>
        
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? 'Searching...' : 'Search Flights'}
        </button>
      </form>
      
      {error && <div className="error">{error}</div>}
      
      <div className="search-results">
        {flights.length > 0 ? (
          <div className="flights-list">
            <h3>Available Flights</h3>
            {flights.map((flight) => (
              <div key={flight._id} className="flight-card">
                <div className="flight-header">
                  <h4>{flight.airline}</h4>
                  <span className="flight-number">{flight.flightNumber}</span>
                </div>
                
                <div className="flight-details">
                  <div className="flight-route">
                    <div className="origin">
                      <span className="time">
                        {new Date(flight.departureTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="city">{flight.origin}</span>
                    </div>
                    
                    <div className="flight-duration">
                      <span className="line">——————</span>
                      <span className="duration">
                        {Math.round(
                          (new Date(flight.arrivalTime) - new Date(flight.departureTime)) /
                            (1000 * 60)
                        )}{' '}
                        min
                      </span>
                    </div>
                    
                    <div className="destination">
                      <span className="time">
                        {new Date(flight.arrivalTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="city">{flight.destination}</span>
                    </div>
                  </div>
                  
                  <div className="flight-info">
                    <div className="price">${flight.price}</div>
                    <div className="seats">
                      {flight.availableSeats} seats available
                    </div>
                    <button className="book-btn">Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && <div className="no-flights">No flights found. Try different search criteria.</div>
        )}
      </div>
    </div>
  );
};

export default FlightSearch;
