const reportService = require('../services/reportService');

// Generate monthly report
exports.generateMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }
    
    const report = await reportService.generateMonthlyReport(month, year, req.user.id);
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Generate yearly report
exports.generateYearlyReport = async (req, res) => {
  try {
    const { year } = req.body;
    
    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required'
      });
    }
    
    const report = await reportService.generateYearlyReport(year, req.user.id);
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get reports
exports.getReports = async (req, res) => {
  try {
    const reports = await reportService.getReports(req.query);
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
