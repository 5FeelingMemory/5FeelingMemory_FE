import { useState, useEffect } from 'react';

import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

import { getTripList } from '@/api/trip';
import Button from '@/components/common/Button/Button';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import BorderPass from '@/components/pages/BorderPass';
import { TRIP } from '@/constants/message';
import { PATH } from '@/constants/path';
import { BUTTON, PAGE } from '@/constants/title';
import theme from '@/styles/theme';
import { Trip } from '@/types/trip';
import { getToken } from '@/utils/auth';
import { formatTripDate } from '@/utils/date';

const TripList = (): JSX.Element => {
    const [userNickname, setUserNickname] = useState<string>('');
    const [tripList, setTripList] = useState<Trip[]>([]);
    const [tripCount, setTripCount] = useState(0);

    const navigate = useNavigate();

    console.log(tripList);

    useEffect(() => {
        const fetchTripList = async () => {
            try {
                const token = getToken();
                const tripList = await getTripList(token);
                if (!tripList) {
                    return;
                }

                setUserNickname(tripList.userNickName);
                setTripList(tripList.trips);
                setTripCount(tripList.trips?.length);
            } catch (error) {
                console.error('Error fetching trip-list data:', error);
            }
        };

        fetchTripList();
    }, []);

    return (
        <div css={containerStyle}>
            <div css={fixedStyle}>
                <Header title={PAGE.TRIP_LIST} />
                <div css={buttonWrapperStyle}>
                    <Button text={BUTTON.NEW_TRIP} theme='sec' size='sm' onClick={() => navigate(PATH.TRIP_NEW)} />
                </div>
            </div>

            <main css={mainStyle}>
                {tripCount > 0 ? (
                    <div css={tripListStyle}>
                        {formatTripDate(tripList)?.map((trip) => (
                            <BorderPass
                                key={trip.tripId}
                                trip={trip}
                                userNickname={userNickname}
                                setTripCount={setTripCount}
                            />
                        ))}
                    </div>
                ) : (
                    <p css={pStyle}>{TRIP.NO_TRIP}</p>
                )}
            </main>
            <Navbar />
        </div>
    );
};

const containerStyle = css`
    display: flex;
    flex-direction: column;
    min-height: 100vh;
`;

const fixedStyle = css`
    position: fixed;
    width: 100%;
    max-width: 428px;
    background-color: ${theme.colors.white};
    z-index: 1000;
`;

const buttonWrapperStyle = css`
    display: flex;
    justify-content: end;
    padding: 0.5rem;
    padding-right: 1rem;
`;

const mainStyle = css`
    flex: 1;
    padding-bottom: 90px;

    margin-top: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
`;

const tripListStyle = css`
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 10px;
`;

const pStyle = css`
    display: flex;
    justify-content: center;
`;

export default TripList;