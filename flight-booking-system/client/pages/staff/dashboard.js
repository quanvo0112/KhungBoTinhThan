import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import StaffSidebar from '../../components/StaffSidebar';
import DashboardCard from '../../components/DashboardCard';

// Server-side rendering to protect route and fetch initial data
export async function getServerSideProps(context) {
  try {
    // Get auth cookie from the request
    const { req } = context;
    const token = req.cookies.token;
    
    if (!token) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    
    // Fetch user data from API
    const userRes = await axios.get(`${process.env.API_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // Check if user is staff
    const user = userRes.data.data;
    if (user.role !== 'staff' && user.role !== 'admin') {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }
    
    // Fetch stats for dashboard
    const statsRes = await axios.get(`${process.env.API_URL}/api/v1/bookings/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return {
      props: {
        initialStats: statsRes.data.data,
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

const StaffDashboard = ({ initialStats }) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState(initialStats);
  
  // Protect client-side as well
  useEffect(() => {
    if (!loading && (!user || (user.role !== 'staff' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <StaffSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Staff Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon="ticket"
            change={stats.bookingChange}
          />
          
          <DashboardCard
            title="Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon="money"
            change={stats.revenueChange}
          />
          
          <DashboardCard
            title="Flights Today"
            value={stats.flightsToday}
            icon="plane"
          />
          
          <DashboardCard
            title="Customer Satisfaction"
            value={`${stats.customerSatisfaction}%`}
            icon="star"
            change={stats.satisfactionChange}
          />
        </div>
        
        {activeSection === 'overview' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            
            {/* Dashboard content based on active section */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Booking ID</th>
                    <th className="py-3 px-4 text-left">Customer</th>
                    <th className="py-3 px-4 text-left">Flight</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Amount</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings && stats.recentBookings.map(booking => (
                    <tr key={booking._id} className="border-b">
                      <td className="py-3 px-4">{booking.bookingReference}</td>
                      <td className="py-3 px-4">{booking.customerName}</td>
                      <td className="py-3 px-4">{booking.flightNumber}</td>
                      <td className="py-3 px-4">{new Date(booking.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">${booking.totalAmount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs 
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
