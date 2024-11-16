import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { tripAPI } from '@/api';
import { PATH } from '@/constants/path';
import { useToastStore } from '@/stores/useToastStore';
import { useUploadStore } from '@/stores/useUploadingStore';

export const useTripForm = () => {
    const imageDates = JSON.parse(localStorage.getItem('image-date') || '');

    const [tripTitle, setTripTitle] = useState('');
    const [country, setCountry] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const { showToast } = useToastStore();

    const navigate = useNavigate();
    const { tripId } = useParams();

    const { waitForCompletion, resetUpload } = useUploadStore();

    const handleSubmit = async () => {
        try {
            if (!tripId) {
                return;
            }
            await tripAPI.createTripInfo({ tripId, tripTitle, country, startDate, endDate, hashtags });
            setIsUploading(true);

            try {
                await waitForCompletion(); // 업로드 완료될 때까지 대기
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                return;
            }

            resetUpload();
            navigate(PATH.TRIPS.ROOT);
            showToast('새로운 여행이 등록되었습니다.');
            // localStorage.removeItem('image-date');
        } catch (error) {
            console.error('여행정보 등록 중 오류 발생', error);
        } finally {
            setIsUploading(false);
        }
    };

    // 디폴트 시작 종료일이 파랑이 안된다면 처음에는 그냥 색 안 줘도 될 듯
    // 다시 기간 선택할 때 기존 호버 남아있음

    // ----------------------------------------------------
    // 해시태그는 문구 버튼 사이 조금 더 늘리기
    // 기간 국가 제목
    // 에어메세지 왼쪽 마진 살짝 주기
    // 달력은 넓이 백인데 안에 내용은 왼쪽 (안됨) 그냥 가운데 위치시킬 수는 있음
    // 위치 지도 구글맵 로딩스피너 지금 왼쪽 위

    return {
        imageDates,
        tripId,
        tripTitle,
        country,
        startDate,
        endDate,
        hashtags,
        isUploading,
        setTripTitle,
        setCountry,
        setStartDate,
        setEndDate,
        setHashtags,
        handleSubmit,
    };
};
