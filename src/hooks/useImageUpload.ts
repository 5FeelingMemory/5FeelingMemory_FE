import { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { postTripImages } from '@/api/trip';
import { PATH } from '@/constants/path';
import { useModalStore } from '@/stores/useModalStore';
import { ImageWithLocationAndDate } from '@/types/image';
import { formatDateToYYYYMMDD } from '@/utils/date';
import { getImageLocation, extractDateFromImage } from '@/utils/piexif';

interface ImageWithDate {
    file: File;
    formattedDate: string; // YYYY-MM-DD 형식
}

export const useImageUpload = () => {
    const [imageCount, setImagesCount] = useState(0);
    const [imagesWithLocation, setImagesWithLocation] = useState<ImageWithLocationAndDate[]>([]);
    const [imagesNoLocation, setImagesNoLocation] = useState<ImageWithDate[]>([]);
    // const [imagesNoLocation, setImagesNoLocation] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { openModal, closeModal } = useModalStore();

    const navigate = useNavigate();
    const location = useLocation();

    const tripId = location.state;

    // 이미지 메타데이터의 위치 정보 유무 확인
    const handleFileUpload = async (files: FileList | null) => {
        if (!files) {
            return;
        }

        try {
            const processedImages = await Promise.all(
                Array.from(files).map(async (file) => {
                    const location = await getImageLocation(file);
                    const date = await extractDateFromImage(file);

                    let formattedDate = '';
                    if (date) {
                        formattedDate = formatDateToYYYYMMDD(date);
                    }
                    return { file, formattedDate, location };
                }),
            );

            // 위치 정보가 없는 이미지
            // const noLocationImages = processedImages.filter((image) => !image.location).map((image) => image.file);
            // const noLocationImages = processedImages.filter((image) => !image.location).map((image) => image.file);
            const noLocationImages = processedImages
                .filter((image) => !image.location)
                .map(({ file, formattedDate }) => ({ file, formattedDate }));
            setImagesNoLocation(noLocationImages);
            console.log('위치 ⛔️:', noLocationImages);
            setImagesNoLocation(noLocationImages);

            // 위치 정보가 있는 이미지
            const filteredImages = processedImages.filter((image) => image.location);
            setImagesWithLocation(filteredImages);
            console.log('위치 ✅:', filteredImages);
        } catch (error) {
            console.error('Error processing files:', error);
        }
        setImagesCount(files.length);
    };

    const uploadTripImages = async () => {
        try {
            setIsLoading(true);
            const images = imagesWithLocation.map((image) => image.file);
            if (images.length) {
                await postTripImages(tripId, images);
            }
            if (imagesNoLocation.length) {
                openModal();
                return;
            }
            closeModal();
            navigate(PATH.TRIP_LIST);
        } catch (error) {
            console.error('Error post trip-images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        imageCount,
        imagesWithLocation,
        imagesNoLocation,
        openModal,
        isLoading,
        handleFileUpload,
        uploadTripImages,
    };
};
