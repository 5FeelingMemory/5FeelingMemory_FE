import { css } from '@emotion/react';

import mapImage from '@/assets/images/location-guide.png';
import theme from '@/styles/theme';

interface ModalContentProps {
    noLocationImageCount: number;
}

const ModalContent = ({ noLocationImageCount }: ModalContentProps) => (
    <div css={contentContainer}>
        <h1 css={titleStyle}>
            현재 <span css={countStyle}>{noLocationImageCount} </span>
            장의 사진이 위치 정보가 없습니다 😢
        </h1>
        <img css={imageStyle} src={mapImage} alt='map-image' />
        <p css={descriptionStyle}>위 사진과 같이 직접 위치를 설정할 수 있습니다.</p>
    </div>
);

const contentContainer = css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 12px;
`;

const titleStyle = css`
    font-size: 16px;
    font-weight: 600;
    color: #181818;
`;

const countStyle = css`
    font-size: 18px;
    font-weight: 600;
    color: ${theme.colors.primary};
`;

const descriptionStyle = css`
    font-size: 12px;
    color: ${theme.colors.descriptionText};
    margin-bottom: 20px;
`;

const imageStyle = css`
    width: 75%;
    border: 1px solid ${theme.colors.borderColor};
    border-radius: 12px;
`;

export default ModalContent;
