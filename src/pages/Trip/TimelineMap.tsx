import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { GoogleMap, Marker, useLoadScript, OverlayView } from '@react-google-maps/api';
import { Play, Pause, ChevronUp } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getTripMapData } from '@/api/trip';
import Loading from '@/components/common/Loading';
import Header from '@/components/layout/Header';
import { ENV } from '@/constants/auth';
import { PATH } from '@/constants/path';
import theme from '@/styles/theme';
import { PinPoint, TripInfo } from '@/types/trip';
import { formatDateToKorean, getDayNumber } from '@/utils/date';

const MOVE_DURATION = 3000;
const WAIT_DURATION = 2000;

const PHOTO_CARD_WIDTH = 150;
const PHOTO_CARD_HEIGHT = 150;

const TimelineMap: React.FC = () => {
    const [tripInfo, setTripInfo] = useState<TripInfo | null>(null);
    const [pinPoints, setPinPoints] = useState<PinPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [characterPosition, setCharacterPosition] = useState<google.maps.LatLngLiteral | null>(null);
    const [currentPinIndex, setCurrentPinIndex] = useState(0);
    const [showPhotoCard, setShowPhotoCard] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [isAtPin, setIsAtPin] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [currentDate, setCurrentDate] = useState<string | undefined>();
    const [currentDay, setCurrentDay] = useState<string | undefined>();
    const [photoCardPosition, setPhotoCardPosition] = useState<google.maps.LatLngLiteral | null>(null);

    const mapRef = useRef<google.maps.Map | null>(null);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    const tripId = localStorage.getItem('tripId');
    const tripTitle = localStorage.getItem('tripTitle');

    useEffect(() => {
        if (!tripId || tripId === 'undefined') {
            const newTripId = location.state?.tripId;
            if (newTripId) {
                localStorage.setItem('tripId', newTripId);
            } else {
                navigate(PATH.TRIP_LIST);
                return;
            }
        }

        if (!tripTitle || tripTitle === 'undefined') {
            const newTripTitle = location.state?.tripTitle;
            if (newTripTitle) {
                localStorage.setItem('tripTitle', newTripTitle);
            }
        }
    }, [location.state, navigate]);

    const fetchTripMapData = useCallback(async () => {
        if (!tripId) return;

        try {
            setIsLoading(true);
            const data = await getTripMapData(tripId);
            setTripInfo(data.tripInfo);

            if (data.pinPoints.length === 0) {
                navigate(PATH.TRIP_LIST);
                return;
            }

            const sortedDataByDate = data.pinPoints.sort(
                (a: PinPoint, b: PinPoint) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime(),
            );

            setPinPoints(sortedDataByDate);
            setCharacterPosition({ lat: sortedDataByDate[0].latitude, lng: sortedDataByDate[0].longitude });
            setIsPlaying(false);
            setIsAtPin(true);
        } catch (error) {
            console.error('Error fetching trip data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [tripId, navigate]);

    useEffect(() => {
        fetchTripMapData();

        return () => {
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [fetchTripMapData]);

    const moveCharacter = useCallback(() => {
        if (currentPinIndex >= pinPoints.length - 1) {
            setIsPlaying(false);
            setIsMoving(false);
            setIsAtPin(true);
            return;
        }

        const start = pinPoints[currentPinIndex];
        const end = pinPoints[currentPinIndex + 1];
        setShowPhotoCard(false);
        setIsMoving(true);
        setIsAtPin(false);

        const animate = (time: number) => {
            if (!startTimeRef.current) startTimeRef.current = time;
            const progress = Math.min((time - startTimeRef.current) / MOVE_DURATION, 1);

            const newLat = start.latitude + (end.latitude - start.latitude) * progress;
            const newLng = start.longitude + (end.longitude - start.longitude) * progress;
            const newPosition = { lat: newLat, lng: newLng };
            setCharacterPosition(newPosition);
            setPhotoCardPosition(newPosition); // 즉시 photoCardPosition 업데이트

            if (mapRef.current) {
                mapRef.current.panTo(newPosition);
            }

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                startTimeRef.current = null;
                setCurrentPinIndex((prev) => prev + 1);
                setShowPhotoCard(true);
                setIsMoving(false);
                setIsAtPin(true);

                // 항상 WAIT_DURATION 동안 대기
                autoPlayTimeoutRef.current = setTimeout(() => {
                    if (isPlaying) {
                        moveCharacter();
                    }
                }, WAIT_DURATION);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [currentPinIndex, pinPoints, isPlaying]);

    useEffect(() => {
        if (isPlaying && !isMoving && isAtPin) {
            autoPlayTimeoutRef.current = setTimeout(() => {
                moveCharacter();
            }, WAIT_DURATION);
        }

        return () => {
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
            }
        };
    }, [isPlaying, isMoving, isAtPin, moveCharacter]);

    useEffect(() => {
        if (pinPoints.length > 0 && tripInfo) {
            const currentPinPoint = pinPoints[currentPinIndex];
            setCurrentDate(currentPinPoint.recordDate);
            setCurrentDay(getDayNumber(currentPinPoint.recordDate, tripInfo.startDate));
        }
    }, [currentPinIndex, pinPoints, tripInfo]);

    useEffect(() => {
        if (characterPosition) {
            setPhotoCardPosition(characterPosition);
        }
    }, [characterPosition]);

    const handleDayClick = useCallback(() => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate('/days-images', { state: { tripId, currentDate } });
        }, 300);
    }, [navigate, tripId, currentDate]);

    const togglePlayPause = useCallback(() => {
        if (currentPinIndex === pinPoints.length - 1) {
            // 마지막 핀포인트에서 처음으로 돌아가기
            setCurrentPinIndex(0);
            setCharacterPosition({ lat: pinPoints[0].latitude, lng: pinPoints[0].longitude });
            if (mapRef.current) {
                mapRef.current.panTo({ lat: pinPoints[0].latitude, lng: pinPoints[0].longitude });
            }
            setShowPhotoCard(true);
            setIsPlaying(true);
            setIsMoving(false);
            setIsAtPin(true);
        } else {
            setIsPlaying(!isPlaying);
            if (!isPlaying) {
                // 재생 버튼을 눌렀을 때 즉시 이동 시작
                if (autoPlayTimeoutRef.current) {
                    clearTimeout(autoPlayTimeoutRef.current);
                }
                moveCharacter();
            }
        }
    }, [currentPinIndex, pinPoints, isPlaying, moveCharacter]);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: ENV.GOOGLE_MAPS_API_KEY || '',
    });

    const characterIcon = useMemo(() => {
        if (isLoaded) {
            return {
                url: '/src/assets/images/ogami_1.png',
                scaledSize: new window.google.maps.Size(50, 65),
                anchor: new window.google.maps.Point(25, 65),
            };
        }
        return null;
    }, [isLoaded]);

    const markerIcon = useMemo(() => {
        if (isLoaded) {
            return {
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#0073bb',
                fillOpacity: 1,
                strokeWeight: 0,
                rotation: 0,
                scale: 2,
                anchor: new google.maps.Point(12, 23),
            };
        }
        return null;
    }, [isLoaded]);

    const mapOptions: google.maps.MapOptions = {
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: false,
        streetViewControl: false,
        rotateControl: false,
        clickableIcons: false,
        minZoom: 12,
    };

    if (loadError) {
        return <div>Error loading maps</div>;
    }

    if (!isLoaded) {
        return <div>Loading maps</div>;
    }

    return (
        <PageContainer isTransitioning={isTransitioning}>
            <Header title={tripTitle || ''} isBackButton onBack={() => navigate(PATH.TRIP_LIST)} />
            <MapWrapper>
                {isLoading ? (
                    <LoadingWrapper>
                        <Loading />
                    </LoadingWrapper>
                ) : (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={characterPosition || undefined}
                        zoom={14}
                        options={mapOptions}
                        onLoad={(map) => {
                            mapRef.current = map;
                        }}
                    >
                        {pinPoints.map((point) => (
                            <Marker
                                key={point.pinPointId}
                                position={{ lat: point.latitude, lng: point.longitude }}
                                icon={markerIcon || undefined}
                            />
                        ))}
                        {characterPosition && (
                            <Marker position={characterPosition} icon={characterIcon || undefined} zIndex={1000} />
                        )}
                        {isAtPin && (
                            <ControlButton onClick={togglePlayPause}>{isPlaying ? <Pause /> : <Play />}</ControlButton>
                        )}
                        {showPhotoCard && photoCardPosition && currentPinIndex < pinPoints.length && (
                            <OverlayView
                                position={photoCardPosition}
                                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                                getPixelPositionOffset={(width, height) => ({
                                    x: -(PHOTO_CARD_WIDTH / 2),
                                    y: -(PHOTO_CARD_HEIGHT + 65 + 40), // 65는 characterIcon의 높이, 40은 추가 간격
                                })}
                            >
                                <div
                                    css={photoCardStyle}
                                    onClick={() =>
                                        navigate(`/music-video/${tripId}/${pinPoints[currentPinIndex].pinPointId}`)
                                    }
                                >
                                    <p>{formatDateToKorean(pinPoints[currentPinIndex].recordDate)}</p>
                                    <img css={imageStyle} src={pinPoints[currentPinIndex].mediaLink} alt='photo-card' />
                                </div>
                            </OverlayView>
                        )}
                        <DaySection onClick={handleDayClick}>
                            <div css={dayInfoTextStyle}>
                                <h2>{currentDay}</h2>
                                <p>{currentDate && formatDateToKorean(currentDate)}</p>
                            </div>
                            <ChevronUp size={20} />
                        </DaySection>
                    </GoogleMap>
                )}
            </MapWrapper>
        </PageContainer>
    );
};
const DaySection = styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    cursor: pointer;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    height: ${theme.heights.xtall_60};
    background-color: ${theme.colors.white};
`;

const dayInfoTextStyle = css`
    display: flex;
    flex-direction: column;
    gap: 8px;

    h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
    }

    p {
        font-size: 14px;
        color: ${theme.colors.darkGray};
        margin: 0;
    }
`;

const MapWrapper = styled.div`
    flex-grow: 1;
    position: relative;
    z-index: 0;
    min-height: 400px;
`;

const ControlButton = styled.button`
    position: absolute;
    bottom: 64px;
    right: 10px;
    background-color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    &:hover {
        background-color: #f0f0f0;
    }
`;

const PageContainer = styled.div<{ isTransitioning: boolean }>`
    height: 100vh;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease-in-out;
    transform: ${(props) => (props.isTransitioning ? 'translateY(-100%)' : 'translateY(0)')};
`;

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 54px);
`;

const mapContainerStyle = {
    height: '100%',
    width: '100%',
};

const photoCardStyle = css`
    background-color: ${theme.colors.white};
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 150px;
    height: auto;
    padding: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow:
        rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
        rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
    cursor: pointer;
    transition: transform 0.2s ease;
    position: relative;

    p {
        font-size: 18px;
        color: #333;
        /* color: ${theme.colors.primary}; */
        font-weight: 600;
        align-self: start;
        padding: 4px;
    }

    &:hover {
        transform: scale(1.05);
    }

    &::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        border: 1px solid #ccc;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid white;
        box-shadow:
            rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
            rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
    }
`;

const imageStyle = css`
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    border-radius: 4px;
`;

export default TimelineMap;
