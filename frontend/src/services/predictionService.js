import api from './api';

export const predictionService = {
  predictUrl: (url) => api.post('/predict/url', { url }),

  predictSms: (message) => api.post('/predict/sms', { message }),

  predictEmail: (data) =>
    api.post('/predict/email', {
      subject: data.subject,
      body: data.body,
      sender: data.sender,
      recipient: data.recipient,
    }),
};
