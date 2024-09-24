import axios from 'axios';

import { TripInfo, Trips } from '@/types/trip';
import { getToken } from '@/utils/auth';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const getTripList = async () => {
    try {
        const token = getToken();
        const response = await axios.get<Trips>(`${apiBaseUrl}/api/trips`, {
            headers: {
                accept: '*/*',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching trip data:', error);
    }
};

export const postTripInfo = async ({ tripTitle, country, startDate, endDate, hashtags }: TripInfo) => {
    try {
        const token = getToken();
        const response = await axios.post(
            `${apiBaseUrl}/api/trips`,
            {
                tripTitle,
                country,
                startDate,
                endDate,
                hashtags,
            },
            {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error post trip-info:', error);
    }
};

export const postTripImages = async (tripId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    try {
        const token = getToken();
        const response = await axios.post(`${apiBaseUrl}/api/trips/${tripId}/upload`, formData, {
            headers: {
                accept: '*/*',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error post trip-images:', error);
    }
};

export const updateTripInfo = async (
    tripId: string,
    { tripTitle, country, startDate, endDate, hashtags }: TripInfo,
) => {
    try {
        const token = getToken();
        const response = await axios.put(
            `${apiBaseUrl}/api/trips/${tripId}`,
            {
                tripTitle,
                country,
                startDate,
                endDate,
                hashtags,
            },
            {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error update trip-info:', error);
    }
};

export const deleteTripInfo = async (tripId: string) => {
    try {
        const token = getToken();
        const response = await axios.delete(`${apiBaseUrl}/api/trips/${tripId}`, {
            headers: {
                accept: '*/*',
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error delete trip-info:', error);
    }
};

export const fetchTripMapData = async (tripId: string) => {
    try {
        const token = getToken();
        const response = await axios.get(`${apiBaseUrl}/api/trips/${tripId}/info`, {
            headers: {
                accept: '*/*',
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching trip-map-data:', error);
    }
};
