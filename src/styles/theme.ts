const colors = {
    primary: '#0073bb',
    primaryHover: '#5F2BCD',
    secondary: '#FDFDFD',
    secondaryHover: '#DCDCDC',
    tertiary: '#333334',
    tertiaryHover: '#4C4C4C',

    disabled: '#CCCCCC', // whiteTextHover도 동일
    disabledText: '#7C7C7C',

    // white: '#F1F1F1',
    // black: '#1E1E1E',

    blue: '#3EA6FF',
    blueHover: '#0073D6',
    whiteText: '#FFFFFF',
    bgBadge: '#616161', // 마이페이지 배지 배경색
    bgSwitchOff: '#E3E5EB', // 스위치 off 배경색
    darkGray: '#8B95A1', // placeholder
    bgMypage: '#353535', // 마이페이지 프로필 배경색
    goldStar: '#FFC700', // 별점 색상

    black: '#181818',
    descriptionText: '#5e5e5e',
    error: '#ff0101',
    white: '#F1F1F1',
    modalBg: '#FFFFFF',
    borderColor: '#DDDDDD',
    boxShadowUp: 'rgba(50, 50, 93, 0.25) 0px 13px 27px -5px',
    boxShadowDown: 'rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;',
};

const fontSizes = {
    xsmall_10: '10px',
    small_12: '12px',
    normal_14: '14px',
    large_16: '16px',
    xlarge_18: '18px',
    xxlarge_20: '20px',
    xxxlarge_24: '24px',
};

// input, button, toast 등의 높이를 정의
const heights = {
    short_32: '32px',
    medium_44: '44px',
    tall_54: '54px',
    xtall_60: '60px',
};

export type ColorsTypes = typeof colors;
export type FontSizeTypes = typeof fontSizes;
export type HeightsTypes = typeof heights;

interface Theme {
    colors: ColorsTypes;
    fontSizes: FontSizeTypes;
    heights: HeightsTypes;
}
// ThemeProvider 적용하기 위해 Theme 타입을 정의
const theme: Theme = {
    colors,
    fontSizes,
    heights,
};

export default theme;
