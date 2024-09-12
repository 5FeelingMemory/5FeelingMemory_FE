import axios from 'axios';

import { getToken, getUserId } from '@/utils/auth';

interface Trip {
    tripId: number;
    country: string;
}

interface PinPoint {
    tripId: number;
    pinPointId: number;
    latitude: number;
    longitude: number;
}

interface UserInfo {
    userId: number;
    userNickname: string;
    trips: Trip[];
    pinPoints: PinPoint[];
}

const token = getToken();
const userId = getUserId();

export const fetchUserInfo = async (): Promise<UserInfo> => {
    try {
        const response = await axios.get<UserInfo>(
            `http://ec2-3-34-22-216.ap-northeast-2.compute.amazonaws.com/api/user/tripInfo?userId=${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            },
        );
        const { data } = response;
        const message = response.data;

        return {
            userId: data.userId,
            userNickname: data.userNickname,
            trips: data.trips,
            pinPoints: data.pinPoints,
        };
    } catch (error) {
        console.error('==> ', error);
        throw error;
    }
};

export const postUserNickName = async (userNickname: string) => {
    try {
        const response = await axios.post(
            `http://ec2-3-34-22-216.ap-northeast-2.compute.amazonaws.com/api/user/updateUserNickName`,
            userNickname,
            {
                headers: {
                    accept: '*/*',
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'text/plain',
                },
            },
        );
        return response.data;
    } catch (error) {
        console.error('==> ', error);
        return error;
    }
};

// const deleteUserInfo = async (): Promise<void> => {
//     try {
//         const response = await axios.delete(
//             `http://ec2-3-34-22-216.ap-northeast-2.compute.amazonaws.com/api/trips/2`,
//             {
//                 headers: {
//                     accept: '*/*',
//                     Authorization:
//                         'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyZWRoZXJvODgzMEBnbWFpbC5jb20iLCJyb2xlcyI6WyJST0xFX1VTRVIiXSwiaWF0IjoxNzI1NTUyODEzLCJleHAiOjE3MjU1NTY0MTN9.mfOuHVakJMu8wTbx_oPKp5OxvnzxNqQ87HGc_OYKG6o',
//                     'Content-Type': 'application/json',
//                 },
//             },
//         );

//         // formatCountryName(response.data.trips);
//         // setUserInfo(response.data);
//         console.log(response.data);
//     } catch (error) {
//         console.error('==> ', error);
//     }
// };

// const putUserInfo = async (): Promise<void> => {
//     try {
//         const response = await axios.put(
//             `http://ec2-3-34-22-216.ap-northeast-2.compute.amazonaws.com/api/trips/1`,
//             {
//                 tripTitle: '아아아아앙',
//                 country: '대한민국',
//                 startDate: '2024-09-05',
//                 endDate: '2024-09-05',
//                 hashtags: ['야호'],
//             },
//             {
//                 headers: {
//                     accept: '*/*',
//                     Authorization:
//                         'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyZWRoZXJvODgzMEBnbWFpbC5jb20iLCJyb2xlcyI6WyJST0xFX1VTRVIiXSwiaWF0IjoxNzI1NTUyODEzLCJleHAiOjE3MjU1NTY0MTN9.mfOuHVakJMu8wTbx_oPKp5OxvnzxNqQ87HGc_OYKG6o',
//                     'Content-Type': 'application/json',
//                 },
//             },
//         );

//         // formatCountryName(response.data.trips);
//         // setUserInfo(response.data);
//         console.log(response.data);
//     } catch (error) {
//         console.error('==> ', error);
//     }
// };
