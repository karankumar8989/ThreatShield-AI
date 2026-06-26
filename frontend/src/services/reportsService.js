import api from './api';

export const reportsService = {
  generatePdf: (startDate, endDate, scanType = null) =>
    api.post(
      '/reports/pdf',
      {
        start_date: startDate,
        end_date: endDate,
        scan_type: scanType || null,
      },
      { responseType: 'blob' }
    ),

  generateCsv: (startDate, endDate, scanType = null) =>
    api.post(
      '/reports/csv',
      {
        start_date: startDate,
        end_date: endDate,
        scan_type: scanType || null,
      },
      { responseType: 'blob' }
    ),
};
