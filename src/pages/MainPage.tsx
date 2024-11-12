import { useEffect, useState } from 'react';

import { css } from '@emotion/react';
import { Settings } from 'lucide-react';
import { FaArrowCircleDown } from 'react-icons/fa';
import { MdWavingHand } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

import { tripAPI, userAPI } from '@/api';
import Button from '@/components/common/button/Button';
import Loading from '@/components/common/Loading';
import HomeBorderPass from '@/components/pages/home/HomeBorderPass';
import { PATH } from '@/constants/path';
import useAuthStore from '@/stores/useAuthStore';
import theme from '@/styles/theme';
import { Trip } from '@/types/trip';
import { getToken, getUserId } from '@/utils/auth';

const MainPage = () => {
    const [tripCount, setTripCount] = useState<number>();
    const [trips, setTrips] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isLogin = useAuthStore((state) => state.isLogIn);
    const userNickName = useAuthStore((state) => state.userNickName);
    const setLogout = useAuthStore((state) => state.setLogout);
    const setNickName = useAuthStore((state) => state.setNickName);

    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogin) {
            setLogout();
            navigate(PATH.LOGIN);
            return;
        }
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const token = getToken();
        const userId = getUserId();

        if (!token || !userId) {
            navigate(PATH.LOGIN);
            return;
        }

        setIsLoading(true);
        const { userNickName, trips } = await tripAPI.fetchTripTicketList();
        setIsLoading(false);

        const validTripList = trips?.filter((trip: Trip) => trip.tripTitle !== 'N/A');

        localStorage.setItem('userNickName', userNickName);
        setNickName(userNickName);
        setTrips(validTripList[validTripList.length - 1]);
        setTripCount(validTripList.length);
    };

    const submitUserNickName = async () => {
        try {
            await userAPI.createUserNickName(inputValue);
            fetchUserData();
        } catch (error) {
            console.error('닉네임 등록이 실패하였습니다.', error);
        }
    };

    const handleButtonClick = async () => {
        if (tripCount) {
            navigate(PATH.TRIP_LIST);
            return;
        }

        const tripId = await tripAPI.createTrip();
        navigate(`${PATH.TRIP_UPLOAD}/${tripId}`, { state: 'first-ticket' });
    };

    if (isLoading) {
        return (
            <div css={loadingSpinnerStyle}>
                <Loading />
            </div>
        );
    }

    const exampleTrips = {
        tripId: 'ex',
        tripTitle: '첫 티켓이 발급되었습니다',
        country: '0000TRIP TYCHE',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        hashtags: ['소소한두려움', '도전', '행복한시간'],
    };

    return (
        <div css={containerStyle}>
            {!userNickName ? (
                <div css={nicknameStyle}>
                    <div css={inputContainer}>
                        <h1>당신만의 특별한 닉네임을 지어주세요 😀</h1>
                        <input
                            type='text'
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            maxLength={14}
                            placeholder='닉네임을 입력해주세요 (최대 10자)'
                            css={inputStyle(inputValue)}
                        />
                        {(inputValue.length === 1 || inputValue.length > 10) && <p>닉네임을 2~10자로 입력해주세요.</p>}
                    </div>
                    <div css={buttonContainer}>
                        <Button text='완료' btnTheme='pri' size='lg' onClick={submitUserNickName} />
                    </div>
                </div>
            ) : (
                <>
                    <div css={headerStyle}>
                        <Settings css={settingIconStyle} onClick={() => navigate(PATH.MYPAGE)} />
                    </div>
                    <div css={contentStyle}>
                        <div css={descriptionStyle}>
                            <MdWavingHand />
                            <h3>아래 티켓을 움직여보세요!</h3>
                        </div>
                        {trips ? (
                            <HomeBorderPass trip={trips} userNickname={userNickName} />
                        ) : (
                            <HomeBorderPass trip={exampleTrips} userNickname={userNickName} />
                        )}
                    </div>
                    {tripCount ? (
                        <h3 css={cardStyle}>
                            지금까지 <span>{tripCount}</span>장의 여행 티켓을 만들었어요!
                        </h3>
                    ) : (
                        <h3 css={cardStyle}>
                            <FaArrowCircleDown />
                            아래 버튼을 눌러서 새로운 여행을 등록해주세요
                        </h3>
                    )}
                    <div css={secondButtonContainer}>
                        <Button
                            text={tripCount ? '여행 티켓 보러가기' : '새로운 여행 등록하기'}
                            btnTheme='pri'
                            size='lg'
                            onClick={handleButtonClick}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

const cardStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 8px;
    gap: 4px;
    font-size: ${theme.fontSizes.normal_14};
    color: ${theme.colors.descriptionText};
    font-weight: bold;

    span {
        font-size: ${theme.fontSizes.xlarge_18};
        color: ${theme.colors.primary};
        font-weight: bold;
    }
`;

const nicknameStyle = css`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 48px;
`;

const descriptionStyle = css`
    display: flex;
    justify-content: center;
    gap: 4px;
    font-size: ${theme.fontSizes.small_12};
    color: ${theme.colors.descriptionText};
    font-weight: bold;
    margin-bottom: 24px;
`;

const inputContainer = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90%;
    height: 104px;
    padding: 0 12px;

    h1 {
        text-align: center;
        font-size: 18px;
        font-weight: 600;
        color: ${theme.colors.black};
    }

    p {
        margin-top: 8px;
        margin-left: 4px;
        color: #ff0101;
        font-size: ${theme.fontSizes.normal_14};
    }
`;

const baseInputStyle = css`
    border-radius: 8px;
    padding: 12px;
    font-size: ${theme.fontSizes.large_16};
    width: 100%;
    height: 38px;
    outline: none;
    margin-top: 24px;
`;

const inputStyle = (inputValue: string) => css`
    ${baseInputStyle};
    border: 1px solid ${inputValue.length === 1 || inputValue.length > 10 ? '#ff0101' : '#DDDDDD'};
    font-size: ${theme.fontSizes.large_16};
`;

const buttonContainer = css`
    width: 90%;
    padding: 0 12px;
    margin: 24px 0 12px 0;
`;

const secondButtonContainer = css`
    width: 100%;
    padding: 0 12px;
    margin: 24px 0 12px 0;
`;

const loadingSpinnerStyle = css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100dvh;
`;

const containerStyle = css`
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: 16px;
`;

const headerStyle = css`
    display: flex;
    justify-content: flex-end;
    padding-right: 4px;
`;

const settingIconStyle = css`
    cursor: pointer;
`;

const contentStyle = css`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

export default MainPage;
