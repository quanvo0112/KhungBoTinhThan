import { useState } from 'react';
import Link from 'next/link';
import FlightSearch from '../components/FlightSearch';
import FeaturedDestinations from '../components/FeaturedDestinations';

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <div className="hero-section py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg mb-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Next Adventure</h1>
          <p className="text-xl mb-8">Discover affordable flights to hundreds of destinations worldwide</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <FlightSearch />
        </div>
      </div>
      
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Destinations</h2>
        <FeaturedDestinations />
      </section>
      
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose SkyBooker?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3">Best Prices</h3>
            <p>We compare prices across hundreds of airlines to ensure you get the best deal.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3">Easy Booking</h3>
            <p>Book your flights in minutes with our simple, user-friendly booking system.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
            <p>Our customer support team is available 24/7 to assist with any questions or issues.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
