import { useEffect, useState } from 'react';

import piexif from 'piexifjs';
import { useLocation, useNavigate } from 'react-router-dom';

import { postTripImages } from '@/api/trip';
import { PATH } from '@/constants/path';
import { GpsData, ImageModel, LocationType } from '@/types/image';
import { createGpsExif, insertExifIntoJpeg, readFileAsDataURL } from '@/utils/piexif';

export const useAddLocation = () => {
    const [displayedImages, setDisplayedImages] = useState<ImageModel[]>([]);
    const [selectedImages, setSelectedImages] = useState<ImageModel[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationType>(null);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const { imagesNoLocationWithDate } = location.state;
        setDisplayedImages(imagesNoLocationWithDate);
    }, []);

    const toggleImageSelect = (image: ImageModel) => {
        setSelectedImages((prev) => {
            const isSelected = prev.some((item) => item.image.name === image.image.name);

            if (isSelected) {
                return prev.filter((item) => item.image.name !== image.image.name);
            } else {
                return [...prev, image];
            }
        });
    };

    const handleLocationSelect = (latitude: number, longitude: number) => {
        setSelectedLocation({ latitude, longitude });
    };

    const handleImageUploadWithLocation = async () => {
        if (!selectedLocation) {
            return;
        }

        if (selectedImages.length === 0) {
            setIsMapVisible(false);
            return;
        }

        const updatedImages = await updateImageGpsMetadata(selectedImages, selectedLocation);
        await uploadImages(updatedImages);

        const updatedDisplayedImages = displayedImages.filter(
            (displayedImage) =>
                !selectedImages.some((selectedImage) => selectedImage.image.name === displayedImage.image.name),
        );

        if (updatedDisplayedImages.length === 0) {
            navigate(PATH.TRIP_NEW);
            return;
        }

        setDisplayedImages(updatedDisplayedImages);
        setSelectedImages([]);
        setIsMapVisible(false);

        console.log('선택한 이미지:', selectedImages);
        console.log('선택한 위치:', selectedLocation);
        console.log('이미지에 위치가 등록되었습니다.', updatedImages);
    };

    const updateImageGpsMetadata = async (images: ImageModel[], location: GpsData) =>
        await Promise.all(
            images.map(async (image) => {
                const imageExifObj = piexif.load(await readFileAsDataURL(image.image));
                const gpsExif = createGpsExif(location.latitude, location.longitude);

                const newImageExif = { ...imageExifObj, ...gpsExif };
                const exifStr = piexif.dump(newImageExif);

                const newImageBlob = await insertExifIntoJpeg(image.image, exifStr);
                return {
                    image: new File([newImageBlob], image.image.name, { type: image.image.type }),
                    formattedDate: image.formattedDate,
                };
            }),
        );

    const uploadImages = async (images: Omit<ImageModel, 'location'>[]) => {
        try {
            const tripId = localStorage.getItem('tripId');
            if (!tripId) {
                return;
            }

            setIsUploading(true);
            await postTripImages(
                tripId,
                images.map((image) => image.image),
            );
        } catch (error) {
            console.error('이미지 업로드 중 오류 발생', error);
            setIsUploading(false);
        } finally {
            setIsUploading(false);
        }
    };

    return {
        displayedImages,
        selectedImages,
        selectedLocation,
        isMapVisible,
        isUploading,
        toggleImageSelect,
        handleLocationSelect,
        handleImageUploadWithLocation,
        setIsMapVisible,
    };
};
