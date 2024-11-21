import ImageListByDate from '@/components/features/image/ImageListByDate';
import LocationAddMap from '@/components/features/trip/LocationAddMap';
import { useLocationAdd } from '@/hooks/useLocationAdd';

const TripLocationAddPage = () => {
    const {
        tripId,
        imageGroupByDate,
        selectedImages,
        isMapVisible,
        setIsMapVisible,
        isUploading,
        handleHashtagSelect,
        handleMapLocationSelect,
        uploadImagesWithLocation,
    } = useLocationAdd();

    return !isMapVisible ? (
        <ImageListByDate
            imageGroupByDate={imageGroupByDate}
            selectedImages={selectedImages}
            onHashtagSelect={handleHashtagSelect}
            setIsMapVisible={setIsMapVisible}
            tripId={tripId}
        />
    ) : (
        <LocationAddMap
            onLocationSelect={handleMapLocationSelect}
            setIsMapVisible={setIsMapVisible}
            isUploading={isUploading}
            uploadImagesWithLocation={uploadImagesWithLocation}
        />
    );
};

export default TripLocationAddPage;
