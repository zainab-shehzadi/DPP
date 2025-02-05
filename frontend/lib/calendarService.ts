import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

export const createEvent = async (eventData: any): Promise<any> => {
  const { data } = await api.post('/api/calendar/create-event', eventData);
  console.log("sdafsd");
  return data;
};
