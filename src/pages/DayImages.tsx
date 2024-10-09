import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';

import styled from '@emotion/styled';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { ChevronDown, ImageOff, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getImagesByDay } from '@/api/image';
import { getTripMapData } from '@/api/trip';
import Loading from '@/components/common/Loading';
import { ENV } from '@/constants/auth';
import { PATH } from '@/constants/path';
import theme from '@/styles/theme';
import { getDayNumber } from '@/utils/date';

interface MediaFiles {
    latitude: number;
    longitude: number;
    mediaFileId: number;
    mediaLink: string;
}

const INITIAL_ZOOM_LEVEL = 16;

const mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    fullscreenControl: false,
    zoomControl: false,
    streetViewControl: false,
    rotateControl: false,
    clickableIcons: false,
    minZoom: 12,
};

const DaysImages: React.FC = () => {
    const [imagesByDay, setImagesByDay] = useState<MediaFiles[]>([]);
    const [currentDate, setCurrentDate] = useState<string>();
    const [currentDay, setCurrentDay] = useState<string>();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalDays, setTotalDays] = useState<number>(0);
    const [currentImageLocation, setCurrentImageLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [isImagesLoaded, setIsImagesLoaded] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const imageListRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const tripId = localStorage.getItem('tripId');

    const isFullyLoaded = isMapLoaded && isImagesLoaded && !isLoading;

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: ENV.GOOGLE_MAPS_API_KEY || '',
        language: 'ko',
    });

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

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleDayClick = (day: number) => {
        if (!startDate) return;
        const clickedDate = new Date(startDate);
        clickedDate.setDate(clickedDate.getDate() + day - 1);
        const formattedDate = clickedDate.toISOString().split('T')[0];
        setCurrentDate(formattedDate);
        setIsInitialLoad(false); // Day 변경 시 isInitialLoad를 false로 설정

        setTimeout(() => {
            const container = scrollContainerRef.current;
            const button = container?.querySelector(`button:nth-child(${day})`) as HTMLElement;
            if (container && button) {
                const containerWidth = container.offsetWidth;
                const buttonWidth = button.offsetWidth;
                const scrollLeft = button.offsetLeft - containerWidth / 2 + buttonWidth / 2;

                container.scrollTo({
                    left: Math.max(0, Math.min(scrollLeft, container.scrollWidth - containerWidth)),
                    behavior: 'smooth',
                });
            }
        }, 0);
    };

    const smoothScroll = (element: HTMLElement, target: number, duration: number) => {
        const start = element.scrollTop;
        const change = target - start;
        const startTime = performance.now();

        const animateScroll = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeInOutCubic =
                progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            element.scrollTop = start + change * easeInOutCubic;

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };

        requestAnimationFrame(animateScroll);
    };

    useEffect(() => {
        if (isFullyLoaded && imageListRef.current && isInitialLoad) {
            setShowScrollHint(true);

            const element = imageListRef.current;
            const scrollDown = () => smoothScroll(element, 80, 1000);
            const scrollUp = () => smoothScroll(element, 0, 1000);

            const hideHint = () => {
                setShowScrollHint(false);
                setIsInitialLoad(false);
            };

            const timeoutIds = [setTimeout(scrollDown, 100), setTimeout(scrollUp, 1500), setTimeout(hideHint, 2500)];

            return () => {
                timeoutIds.forEach(clearTimeout);
            };
        }
    }, [isFullyLoaded, isInitialLoad]);

    useEffect(() => {
        const currentDate = localStorage.getItem('current-date');
        if (!currentDate) {
            navigate(-1);
            return;
        }
        setCurrentDate(currentDate);
    }, []);

    useEffect(() => {
        const fetchTripInfo = async () => {
            if (!tripId) return;
            const data = await getTripMapData(tripId);
            const { tripInfo } = data;
            setStartDate(tripInfo.startDate);
            setEndDate(tripInfo.endDate);
        };

        fetchTripInfo();
    }, [tripId]);

    useEffect(() => {
        const fetchImagesByDay = async () => {
            if (!(tripId && currentDate)) return;
            setIsLoading(true);
            try {
                const data = await getImagesByDay(tripId, currentDate);
                setImagesByDay(data.images || []);
                setCurrentDay(getDayNumber(currentDate as string, startDate));
                if (data.images && data.images.length > 0) {
                    setCurrentImageLocation({ lat: data.images[0].latitude, lng: data.images[0].longitude });
                }
            } catch (error) {
                console.error('Error fetching images:', error);
                setImagesByDay([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchImagesByDay();
    }, [tripId, currentDate, startDate]);

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
            setTotalDays(dayDiff);
        }
    }, [startDate, endDate]);

    const generateDayList = () => Array.from({ length: totalDays }, (_, i) => i + 1);

    const observerCallback = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                    const image = imagesByDay[index];
                    if (image) {
                        setCurrentImageLocation({ lat: image.latitude, lng: image.longitude });
                    }
                }
            });
        },
        [imagesByDay],
    );

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        });

        imageRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            imageRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [observerCallback, imagesByDay]);

    useEffect(() => {
        if (isLoaded) {
            setIsMapLoaded(true);
        }
    }, [isLoaded]);

    useEffect(() => {
        const fetchImagesByDay = async () => {
            if (!(tripId && currentDate)) return;
            setIsLoading(true);
            try {
                const data = await getImagesByDay(tripId, currentDate);
                setImagesByDay(data.images || []);
                setCurrentDay(getDayNumber(currentDate as string, startDate));
                if (data.images && data.images.length > 0) {
                    setCurrentImageLocation({ lat: data.images[0].latitude, lng: data.images[0].longitude });
                }
                setIsImagesLoaded(true);
            } catch (error) {
                console.error('Error fetching images:', error);
                setImagesByDay([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchImagesByDay();
    }, [tripId, currentDate, startDate]);

    return (
        <PageContainer isTransitioning={isTransitioning}>
            {!isFullyLoaded ? (
                <LoadingContainer>
                    <Loading type='bgBlack' />
                </LoadingContainer>
            ) : (
                <>
                    {isLoaded && currentImageLocation && imagesByDay.length > 0 && (
                        <MapContainer>
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={currentImageLocation}
                                zoom={INITIAL_ZOOM_LEVEL}
                                options={mapOptions}
                            >
                                <Marker position={currentImageLocation} icon={markerIcon || undefined} />
                            </GoogleMap>
                        </MapContainer>
                    )}
                    <DateSelectionDiv>
                        <DayScrollContainer ref={scrollContainerRef}>
                            {generateDayList().map((day) => (
                                <DayButton
                                    key={day}
                                    onClick={() => handleDayClick(day)}
                                    isSelected={currentDay === `Day ${day}`}
                                >
                                    Day {day}
                                </DayButton>
                            ))}
                        </DayScrollContainer>
                        <ArrowButton
                            onClick={() => {
                                setIsTransitioning(true);
                                navigate(`${PATH.TIMELINE_MAP}/${tripId}`);
                            }}
                        >
                            <ChevronDown size={20} />
                        </ArrowButton>
                    </DateSelectionDiv>
                    <ImageList ref={imageListRef}>
                        {imagesByDay.length > 0 ? (
                            imagesByDay.map((image, index) => (
                                <ImageItem
                                    key={image.mediaFileId}
                                    ref={(el) => (imageRefs.current[index] = el)}
                                    data-index={index}
                                >
                                    <img src={image.mediaLink} alt={`Image-${image.mediaFileId}`} />
                                </ImageItem>
                            ))
                        ) : (
                            <NoImagesContainer>
                                <ImageOff size={40} color='#FDFDFD' />
                                <p>이 날은 사진이 없어요 😢</p>
                            </NoImagesContainer>
                        )}
                    </ImageList>
                    {isInitialLoad && (
                        <ScrollHintOverlay show={showScrollHint}>
                            <ScrollHintContent>
                                <ScrollHintText>아래로 스크롤하세요</ScrollHintText>
                                <ArrowDown size={24} color='white' />
                            </ScrollHintContent>
                        </ScrollHintOverlay>
                    )}
                </>
            )}
        </PageContainer>
    );
};

// const PageContainer = styled.div<{ isTransitioning: boolean }>`
//     height: 100vh;
//     display: flex;
//     flex-direction: column;
//     transition: transform 0.3s ease-in-out;
//     transform: ${(props) => (props.isTransitioning ? 'translateY(100%)' : 'translateY(0)')};
//     overflow-y: auto;
//     background-color: #090909;
//     position: relative;
// `;

const PageContainer = styled.div<{ isTransitioning: boolean }>`
    height: 100vh;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease-in-out;
    transform: ${(props) => (props.isTransitioning ? 'translateY(100%)' : 'translateY(0)')};
    overflow-y: auto;
    background-color: #090909;
    position: relative;
`;

const ScrollHintOverlay = styled.div<{ show: boolean }>`
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: end;
    opacity: ${(props) => (props.show ? 1 : 0)};
    visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
    transition:
        opacity 0.3s ease-in-out,
        visibility 0.3s ease-in-out;
    z-index: 1000;
    pointer-events: ${(props) => (props.show ? 'auto' : 'none')};
    padding: 16px;
`;

const ScrollHintContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
`;

const ScrollHintText = styled.p`
    color: white;
    font-size: 16px;
    text-align: center;
    margin: 0;
`;

const DateSelectionDiv = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${theme.colors.white};
    height: ${theme.heights.tall_54};
    border-bottom: 1px solid #dddddd;
    padding: 8px 20px 8px 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const DayScrollContainer = styled.div`
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
        display: none;
    }
    flex-grow: 1;
    padding: 0 10px;
`;

const DayButton = styled.button<{ isSelected: boolean }>`
    background: none;
    border: none;
    padding: 8px 16px;
    margin-right: 8px;
    cursor: pointer;
    font-weight: ${(props) => (props.isSelected ? 'bold' : 'normal')};
    font-size: ${(props) => (props.isSelected ? '18px' : '14px')};
    color: ${(props) => (props.isSelected ? theme.colors.primary : theme.colors.darkGray)};
    flex-shrink: 0;
`;

const MapContainer = styled.div`
    height: 170px;
    overflow: hidden;
`;

const ImageList = styled.div`
    flex: 1;
    overflow-y: auto;
    position: relative;
`;
const ImageItem = styled.div`
    margin-bottom: 20px;
    img {
        width: 100%;
        border-radius: 4px;
    }
`;

const LoadingContainer = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const NoImagesContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 54px);
    gap: 20px;

    p {
        color: ${theme.colors.secondary};
        font-size: 14px;
        margin-bottom: 6px;
    }
`;

const mapContainerStyle = {
    height: 'calc(100% + 20px)',
    width: '100%',
    paddingTop: '20px',
};

const ArrowButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export default DaysImages;