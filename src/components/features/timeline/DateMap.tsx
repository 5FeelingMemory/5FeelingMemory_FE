import { css } from '@emotion/react';
import { GoogleMap, Marker } from '@react-google-maps/api';

import { GOOGLE_MAPS_IMAGE_BY_DATE_ZOOM, GOOGLE_MAPS_OPTIONS } from '@/constants/googleMaps';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { LatLngLiteralType } from '@/types/googleMaps';

interface DateMapProps {
    imageLocation: LatLngLiteralType;
}

const DateMap = ({ imageLocation }: DateMapProps) => {
    const { markerIcon } = useGoogleMaps();

    return (
        <div css={mapWrapper}>
            <GoogleMap
                zoom={GOOGLE_MAPS_IMAGE_BY_DATE_ZOOM}
                center={imageLocation}
                options={GOOGLE_MAPS_OPTIONS}
                mapContainerStyle={{ height: 'calc(100% + 30px)' }}
            >
                <Marker position={imageLocation} icon={markerIcon || undefined} />
            </GoogleMap>
        </div>
    );
};

const mapWrapper = css`
    height: 180px;
    overflow: hidden;
`;

export default DateMap;