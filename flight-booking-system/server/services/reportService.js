const Report = require('../models/Report');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// Generate monthly report
exports.generateMonthlyReport = async (month, year, userId) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Check if report already exists
    const existingReport = await Report.findOne({
      'period.startDate': startDate,
      'period.endDate': endDate,
      type: 'monthly'
    });
    
    if (existingReport) {
      return existingReport;
    }
    
    // Get all bookings in this period
    const bookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'confirmed'
    }).populate('tickets payment');
    
    // Calculate metrics
    const totalBookings = bookings.length;
    let totalRevenue = 0;
    
    // Map to track popular routes
    const routeMap = new Map();
    
    for (const booking of bookings) {
      // Add revenue
      totalRevenue += booking.totalAmount;
      
      // Get flight info for each ticket to track routes
      for (const ticketId of booking.tickets) {
        const ticket = await Ticket.findById(ticketId).populate('flight');
        if (ticket && ticket.flight) {
          const route = `${ticket.flight.origin}-${ticket.flight.destination}`;
          routeMap.set(route, (routeMap.get(route) || 0) + 1);
        }
      }
    }
    
    // Convert map to array and sort by count
    const popularRoutes = Array.from(routeMap.entries())
      .map(([route, count]) => {
        const [origin, destination] = route.split('-');
        return { origin, destination, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);  // Top 5 routes
    
    // Create and save report
    const report = await Report.create({
      name: `Monthly Report - ${startDate.toLocaleString('default', { month: 'long' })} ${year}`,
      type: 'monthly',
      period: { startDate, endDate },
      data: {
        totalRevenue,
        totalBookings,
        popularRoutes,
        additionalMetrics: {
          averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0
        }
      },
      createdBy: userId
    });
    
    return report;
  } catch (error) {
    throw new Error(`Error generating monthly report: ${error.message}`);
  }
};

// Generate yearly report
exports.generateYearlyReport = async (year, userId) => {
  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    // Check if report already exists
    const existingReport = await Report.findOne({
      'period.startDate': startDate,
      'period.endDate': endDate,
      type: 'yearly'
    });
    
    if (existingReport) {
      return existingReport;
    }
    
    // Get monthly reports for this year to aggregate data
    const monthlyReports = await Report.find({
      type: 'monthly',
      'period.startDate': { $gte: startDate },
      'period.endDate': { $lte: endDate }
    });
    
    let totalRevenue = 0;
    let totalBookings = 0;
    const routeMap = new Map();
    
    // If we have monthly reports, use their data
    if (monthlyReports.length > 0) {
      for (const report of monthlyReports) {
        totalRevenue += report.data.totalRevenue;
        totalBookings += report.data.totalBookings;
        
        // Aggregate route data
        for (const route of report.data.popularRoutes) {
          const routeKey = `${route.origin}-${route.destination}`;
          routeMap.set(routeKey, (routeMap.get(routeKey) || 0) + route.count);
        }
      }
    } else {
      // If no monthly reports, calculate directly from bookings
      const bookings = await Booking.find({
        createdAt: { $gte: startDate, $lte: endDate },
        status: 'confirmed'
      }).populate('tickets payment');
      
      totalBookings = bookings.length;
      
      for (const booking of bookings) {
        totalRevenue += booking.totalAmount;
        
        // Get flight info for each ticket to track routes
        for (const ticketId of booking.tickets) {
          const ticket = await Ticket.findById(ticketId).populate('flight');
          if (ticket && ticket.flight) {
            const route = `${ticket.flight.origin}-${ticket.flight.destination}`;
            routeMap.set(route, (routeMap.get(route) || 0) + 1);
          }
        }
      }
    }
    
    // Convert map to array and sort by count
    const popularRoutes = Array.from(routeMap.entries())
      .map(([route, count]) => {
        const [origin, destination] = route.split('-');
        return { origin, destination, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);  // Top 10 routes for yearly report
    
    // Create and save report
    const report = await Report.create({
      name: `Yearly Report - ${year}`,
      type: 'yearly',
      period: { startDate, endDate },
      data: {
        totalRevenue,
        totalBookings,
        popularRoutes,
        additionalMetrics: {
          averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
          monthlyAverageBookings: totalBookings / 12,
          monthlyAverageRevenue: totalRevenue / 12
        }
      },
      createdBy: userId
    });
    
    return report;
  } catch (error) {
    throw new Error(`Error generating yearly report: ${error.message}`);
  }
};

// Get reports by type and date range
exports.getReports = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.type) {
      query.type = filters.type;
    }
    
    if (filters.startDate) {
      query['period.startDate'] = { $gte: new Date(filters.startDate) };
    }
    
    if (filters.endDate) {
      query['period.endDate'] = { $lte: new Date(filters.endDate) };
    }
    
    return await Report.find(query).sort({ 'period.startDate': -1 });
  } catch (error) {
    throw new Error(`Error fetching reports: ${error.message}`);
  }
};
