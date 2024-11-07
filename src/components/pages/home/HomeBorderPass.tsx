import React, { useState, useEffect } from 'react';

import { css } from '@emotion/react';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { IoAirplaneSharp } from 'react-icons/io5';

import characterImg from '/public/ogami_1.png';

import theme from '@/styles/theme';
import { FormattedTripDate } from '@/types/trip';

interface BorderPassProps {
    trip: FormattedTripDate;
    userNickname: string;
}

const HomeBorderPass = ({ trip, userNickname }: BorderPassProps): JSX.Element => {
    const { tripTitle, country, startDate, endDate, hashtags } = trip;
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isTouching, setIsTouching] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);

    const handleMove = (x: number, y: number, element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const relativeX = x - rect.left;
        const relativeY = y - rect.top;

        const rotateX = ((relativeY - centerY) / centerY) * -20;
        const rotateY = ((relativeX - centerX) / centerX) * 20;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isTouching) {
            setIsInteracting(true);
            handleMove(e.clientX, e.clientY, e.currentTarget);
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsInteracting(true);
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY, e.currentTarget);
    };

    const handleTouchStart = () => {
        setIsTouching(true);
        setIsInteracting(true);
    };

    const handleTouchEnd = () => {
        setIsTouching(false);
        setIsInteracting(false);
        // 터치 종료시 rotation 유지
    };

    const handleMouseLeave = () => {
        if (!isTouching) {
            setIsInteracting(false);
            // 마우스 이탈시 원래 위치로 복귀
            setRotation({ x: 0, y: 0 });
        }
    };

    useEffect(
        () => () => {
            setIsTouching(false);
            setIsInteracting(false);
            setRotation({ x: 0, y: 0 });
        },
        [],
    );

    // 마우스 호버시에만 광택 효과 적용
    const glossStyle = {
        background: isTouching
            ? 'none' // 터치시에는 광택 효과 없음
            : `
                linear-gradient(
                    105deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.08) 15%,
                    rgba(255, 255, 255, 0.15) 30%,
                    rgba(255, 255, 255, 0.08) 45%,
                    transparent 60%
                )
            `,
    };

    const cardStyle = {
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: isInteracting ? 'none' : 'transform 0.5s ease',
    };

    return (
        <div
            css={[
                borderPassContainer,
                css`
                    touch-action: none;
                `,
            ]}
            style={cardStyle}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div css={[glossOverlay]} style={glossStyle} />

            <div css={mainContent}>
                <div css={leftContent}>
                    <div css={topSection}>
                        <div css={leftTopSection}>
                            <div>
                                <div css={label}>PASSENGER</div>
                                <div css={value}>{userNickname}</div>
                            </div>
                            <div>
                                <div css={label}>DATE</div>
                                <div css={value}>{startDate}</div>
                            </div>
                            <div>
                                <div css={label}>DATE</div>
                                <div css={value}>{endDate}</div>
                            </div>
                        </div>
                    </div>
                    <div css={contentContainer}>
                        <div css={citiesStyle}>
                            <div>INCHEON</div>
                            <IoAirplaneSharp />
                            <div>{country.substring(4)}</div>
                        </div>
                        <div css={titleStyle}>{tripTitle}</div>
                        <div css={hashtagContainer}>
                            {hashtags.map((tag, index) => (
                                <span key={index} css={hashtag}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div css={buttonContainer}>
                        <button css={buttonStyle}>
                            <FiPlus /> Upload
                        </button>
                        <button css={buttonStyle}>
                            <FaPencilAlt /> Edit
                        </button>
                        <button css={buttonStyle}>
                            <FaTrashAlt /> Delete
                        </button>
                    </div>
                </div>
                <div css={rightSection}>
                    <div css={rightTopSection}>
                        <div css={label}>FLIGHT</div>
                        <div css={value}>TYCHE AIR</div>
                    </div>
                    <div css={rightContent}>
                        <img src={characterImg} alt='Character' css={characterImageStyle} />
                        <div css={textStyle}>Click Here!</div>
                    </div>
                </div>
            </div>
            <div
                css={[borderPassContainer, shadowStyle]}
                style={{
                    ...cardStyle,
                    background: `rgba(0, 0, 0, ${isTouching ? 0.08 : 0.15})`,
                }}
            />
        </div>
    );
};

const glossOverlay = css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    border-radius: 10px;
    z-index: 2;
`;

const shadowStyle = css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    filter: blur(20px);
    z-index: -1;
    pointer-events: none;
`;

const borderPassContainer = css`
    width: 100%;
    max-width: 428px;
    border-radius: 10px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    background: white;
    box-shadow:
        0 6px 8px rgba(0, 0, 0, 0.1),
        0 1px 3px rgba(0, 0, 0, 0.08);
`;

const mainContent = css`
    display: flex;
    background: transparent;
`;

const topSection = css`
    background-color: ${theme.colors.primary};
    color: white;
`;

const leftTopSection = css`
    display: flex;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    padding: 10px 15px;
`;

const leftContent = css`
    width: 75%;
    background: white;
    border-right: 1px solid #e0e0e0;
`;

const rightSection = css`
    width: 25%;
    background: white;
    transition: transform 0.5s ease;
`;

const rightTopSection = css`
    padding: 10px 15px;
    background-color: ${theme.colors.primary};
    color: white;
`;

const rightContent = css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100% - 50px); // 상단 섹션 높이를 뺀 나머지
    background: white;
`;

const label = css`
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 2px;
`;

const value = css`
    font-size: 12px;
    font-weight: bold;
`;

const contentContainer = css`
    padding: 15px 15px 10px 15px;
`;

const citiesStyle = css`
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 20px;
`;

const titleStyle = css`
    margin-bottom: 24px;
    font-weight: bold;
`;

const hashtagContainer = css`
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
`;

const hashtag = css`
    background-color: #f0f0f0;
    color: #333;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
`;

const characterImageStyle = css`
    width: 60px;
    margin-bottom: 18px;
`;

const textStyle = css`
    font-size: 14px;
    font-weight: 600;
    color: ${theme.colors.descriptionText};
`;

const buttonContainer = css`
    display: flex;
    justify-content: space-between;
    padding: 10px 15px;
    border-top: 1px solid ${theme.colors.borderColor};
`;

const buttonStyle = css`
    padding: 6px 8px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 0 5px;
    background-color: ${theme.colors.darkGray};
    color: ${theme.colors.white};
`;

export default HomeBorderPass;