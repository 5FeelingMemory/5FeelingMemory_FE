import { useNavigate } from 'react-router-dom';
import useIsLoginStore from '../store/loginStore';
import { LoginState } from '../types/loginStore';
import '../styles/Login.css';
import KakaoButton from '../components/common/Button/KakaoButton';
import SmallButton from '../components/common/Button/SmallButton';
import LargeButton from '../components/common/Button/LargeButton';
import Button from '../components/common/Button/Button';

export default function Login() {
  const setIsLogin = useIsLoginStore((state: LoginState) => state.setIsLogin);
  setIsLogin(false);

  const navigate = useNavigate();

  // const REST_API_KEY = '111111111';
  // const REDIRECT_URI = '/kakao/callback';
  // const link: string = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const handleLogin = (): void => {
    // window.location.href = link;
    navigate('/home');
  };

  return (
    <div className='container'>
      <div className='svg-container'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 30 30'
          fill='none'
        >
          <g clip-path='url(#clip0_4_3262)'>
            <path
              d='M27.8419 12.0525C28.8919 12.5775 30 13.5244 30 15C30 16.4756 28.89 17.4225 27.8419 17.9475C26.7562 18.4894 25.4419 18.75 24.375 18.75L17.4544 18.75L12.6075 28.4438C12.3741 28.9113 12.015 29.3046 11.5705 29.5795C11.1261 29.8544 10.6138 30 10.0913 30L7.5 30C7.36391 29.9999 7.22947 29.9702 7.10601 29.913C6.98256 29.8557 6.87304 29.7723 6.78508 29.6685C6.69712 29.5646 6.63282 29.4429 6.59665 29.3117C6.56048 29.1805 6.55331 29.043 6.57563 28.9088L8.29688 18.5831L4.0725 17.88L1.60125 20.3513C1.47013 20.4827 1.30294 20.5723 1.12086 20.6086C0.938781 20.6449 0.75002 20.6263 0.578507 20.5552C0.406995 20.4841 0.260453 20.3637 0.157462 20.2092C0.0544711 20.0547 -0.00033084 19.8732 1.04678e-06 19.6875L1.45657e-06 10.3125C-0.000330414 10.1268 0.0544715 9.94525 0.157463 9.79077C0.260454 9.63629 0.406995 9.51587 0.578508 9.44478C0.750021 9.37368 0.938781 9.35512 1.12086 9.39143C1.30294 9.42774 1.47013 9.5173 1.60125 9.64875L4.0725 12.1219L8.29688 11.4169L6.57563 1.09125C6.55331 0.957005 6.56048 0.819511 6.59665 0.688319C6.63283 0.557127 6.69712 0.435382 6.78509 0.331542C6.87304 0.227703 6.98256 0.144258 7.10602 0.0870044C7.22947 0.029751 7.36391 6.16543e-05 7.5 -9.83506e-07L10.0913 -8.70239e-07C10.6138 1.68058e-05 11.1261 0.145635 11.5705 0.420521C12.015 0.695407 12.3741 1.08869 12.6075 1.55625L17.4544 11.25L24.375 11.25C25.44 11.25 26.7581 11.5125 27.8419 12.0525Z'
              fill='black'
            />
          </g>
        </svg>
      </div>
      <p className='title'>Easily Manage and Relive Your Travel Memories</p>
      <p className='title-sec'>Discover the world and share your adventures</p>
      <p className='title-sec'>with our travel journal app.</p>
      <div className='img-container'>
        <img src='../../public/character.png' alt='character' className='character' />
        <img src='../../public/earth.png' alt='earth' className='earth' />
      </div>
      <div className='button-container'>
        {/* <LargeButton text='로그아웃' theme='pri' /> */}
        {/* <LargeButton text='최소' theme='sec' /> */}
        <Button confirmText='로그아웃' cancelText='취소' size='lg' />
        <Button confirmText='로그아웃' cancelText='취소' size='sm' />
        <KakaoButton handleLogin={handleLogin} />
      </div>
    </div>
  );
}
