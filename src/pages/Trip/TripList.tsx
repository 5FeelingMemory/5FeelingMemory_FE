import { useState, useEffect } from 'react';

import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

import { getTripList } from '@/api/trip';
import Button from '@/components/common/button/Button';
import Toast from '@/components/common/Toast';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import BorderPass from '@/components/pages/trip-list/BorderPass';
import { TRIP } from '@/constants/message';
import { PATH } from '@/constants/path';
import { BUTTON, PAGE } from '@/constants/title';
import { useToastStore } from '@/stores/useToastStore';
import theme from '@/styles/theme';
import { Trip } from '@/types/trip';
import { formatTripDate } from '@/utils/date';

const TripList = (): JSX.Element => {
    const [userNickname, setUserNickname] = useState<string>('');
    const [tripList, setTripList] = useState<Trip[]>([]);
    const [tripCount, setTripCount] = useState(0);
    const [isDelete, setIsDelete] = useState(false);

    const { showToast } = useToastStore();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTripList = async () => {
            try {
                const tripList = await getTripList();
                console.log(tripList);

                if (typeof tripList !== 'object') {
                    showToast('일시적인 서버 문제로 로그아웃 되었습니다.');
                    navigate(PATH.LOGIN);
                    localStorage.clear();
                    return;
                }

                if (!tripList) {
                    return;
                }

                setUserNickname(tripList.userNickName);
                setTripList(tripList.trips);
                setTripCount(tripList.trips?.length);
                setIsDelete(false);
            } catch (error) {
                console.error('Error fetching trip-list data:', error);
            }
        };

        localStorage.removeItem('tripId');
        localStorage.removeItem('tripTitle');

        fetchTripList();
    }, [isDelete]);

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
                                setIsDelete={setIsDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <p css={pStyle}>{TRIP.NO_TRIP}</p>
                )}
            </main>
            <Navbar />
            <Toast />
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
    z-index: 100;
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

    margin-top: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
`;

const tripListStyle = css`
    display: flex;
    flex-direction: column;
    padding: 10px;
`;

const pStyle = css`
    display: flex;
    justify-content: center;
`;

export default TripList;
