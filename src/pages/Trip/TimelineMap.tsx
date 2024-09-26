import { useEffect, useState } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { GoogleMap, Marker, InfoWindow, LoadScript } from '@react-google-maps/api';
import { useLocation, useNavigate } from 'react-router-dom';

import { fetchTripMapData } from '@/api/trip';
import Loading from '@/components/common/Loading';
import Header from '@/components/layout/Header';
import { ENV } from '@/constants/auth';

interface TripMapData {
    pinPointId: number;
    latitude: number;
    longitude: number;
    mediaLink: string;
    recordDate: string;
}

const svgMarker = {
    path: 'M10.453 14.016l6.563-6.609-1.406-1.406-5.156 5.203-2.063-2.109-1.406 1.406zM12 2.016q2.906 0 4.945 2.039t2.039 4.945q0 1.453-0.727 3.328t-1.758 3.516-2.039 3.070-1.711 2.273l-0.75 0.797q-0.281-0.328-0.75-0.867t-1.688-2.156-2.133-3.141-1.664-3.445-0.75-3.375q0-2.906 2.039-4.945t4.945-2.039z',
    fillColor: 'blue',
    fillOpacity: 1,
    strokeWeight: 1,
    rotation: 0,
    scale: 1.5,
    anchor: new window.google.maps.Point(15, 30),
};

const TimelineMap = () => {
    const [tripMapData, setTripMapData] = useState<TripMapData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPoint, setSelectedPoint] = useState<TripMapData | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const trip = location.state;

    useEffect(() => {
        const getTripMapData = async () => {
            try {
                const data = await fetchTripMapData(trip.tripId);
                console.log('Fetched data:', data);
                setTripMapData(data.pinPoints);
            } catch (error) {
                console.error('Error fetching trip data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        getTripMapData();
    }, [trip.tripId]);

    const center =
        tripMapData.length > 0
            ? { lat: tripMapData[0].latitude, lng: tripMapData[0].longitude }
            : { lat: 37.5665, lng: 126.978 }; // 서울의 좌표 또는 다른 기본값

    const mapOptions: google.maps.MapOptions = {
        mapTypeControl: false, // 지도 타입 컨트롤 (지도, 위성 등) 숨기기
        fullscreenControl: false, // 전체화면 컨트롤 숨기기
        zoomControl: false, // 줌 컨트롤 (+, -) 숨기기
        streetViewControl: false, // 거리뷰 (페그맨) 컨트롤 숨기기
        rotateControl: false, // 나침반 숨기기 (지도 회전 시 나타나는 나침반)

        // maxZoom: 12, // 최대 줌 레벨
        minZoom: 12, // 최소 줌 레벨
    };

    if (isLoading) <Loading />;

    return (
        <PageContainer>
            <Header title={`${trip.tripTitle}`} isBackButton onBack={() => navigate('/trips')} />
            <MapWrapper>
                <LoadScript googleMapsApiKey={ENV.GOOGLE_MAPS_API_KEY || ''}>
                    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={13} options={mapOptions}>
                        {tripMapData.map((point) => (
                            <Marker
                                key={point.pinPointId}
                                position={{ lat: point.latitude, lng: point.longitude }}
                                onClick={() => setSelectedPoint(point)}
                                animation={window.google.maps.Animation.DROP}
                                icon={svgMarker}
                            />
                        ))}
                        {selectedPoint && (
                            // <InfoWindow
                            //     position={{ lat: selectedPoint.latitude, lng: selectedPoint.longitude }}
                            //     onCloseClick={() => setSelectedPoint(null)}
                            // >
                            //     <div>
                            //         <img css={popupImageStyle} src={selectedPoint.mediaLink} alt='Trip location' />
                            //         <p>{selectedPoint.recordDate}</p>
                            //     </div>
                            // </InfoWindow>
                            <div css={divStyle}>
                                <img css={imageStyle} src={selectedPoint.mediaLink} alt='photo-card' />
                            </div>
                        )}
                    </GoogleMap>
                </LoadScript>
            </MapWrapper>
        </PageContainer>
    );
};

const PageContainer = styled.div`
    height: 100vh;
    display: flex;
    flex-direction: column;
`;

const MapWrapper = styled.div`
    flex-grow: 1;
    position: relative;
    z-index: 0;
    min-height: 400px;
`;

const mapContainerStyle = {
    height: '100%',
    width: '100%',
};

const divStyle = css`
    position: absolute;
    right: 10px;
    top: 10px;
    background-color: white;
    border-radius: 8px;
    width: 100px;
    height: 180px;
    object-fit: cover;
    padding: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const imageStyle = css`
    width: 100%;
    border-radius: 8px;
    /* margin: 0 auto; */
`;

export default TimelineMap;
