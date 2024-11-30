# 사진 메타데이터를 활용한 여행 기록 서비스, 트립티케 (TripTyche)

> 사진만 올리면 자동으로 그려지는 여행 경로,

> 위치, 날짜별 사진을 따라 다시 여행을 추억하세요

[서비스 메인 스크린샷/GIF] (가장 먼저 시선을 끌 수 있는 위치)

🔗 [트립티케 바로가기](https://triptyche.world)

## 📸 About 트립티케

-   트립티케는 여행 사진 속 메타데이터를 활용해 자동으로 여행 경로를 만들어주는 서비스입니다.
-   사진을 업로드하면 위치/날짜 정보가 자동으로 추출되어 구글 맵에 원하는 방식으로 표시됩니다.
-   이미지에 위치 정보가 없다면, 간단히 지도에서 위치를 직접 선택할 수도 있습니다.

### 주요 기능

-   📍 사진 메타데이터 자동 추출로 간편한 여행 기록
-   🗺️ 구글 맵(Google Map) 기반 타임라인 시각화
-   🚶 캐릭터와 함께 따라가는 여행 경로
-   📱 위치별, 날짜별 여행 사진 슬라이드 쇼

[주요 기능 스크린샷/GIF] (기능 설명을 뒷받침하는 시각자료)

---

## 🛠️ 기술 스택

### 프론트엔드

React, TypeScript, Yarn, Zustand, Tanstack-Query, Emotion

### 백엔드

Spring Boot Spring Data JPA, JUnit5, MySQL, JWT, OAuth2

### 인프라

Nginx, Docker, AWS EC2, AWS S3, Github Actions

### 외부 API

Google Maps

---

## 💻 주요 기술적 구현

### 이미지 메타데이터 처리

-   EXIF 데이터에서 위치 정보(GPS) 및 시간 정보 추출
-   위치 정보가 없는 이미지는 구글 맵에서 수동 선택 지원
-   이미지 리사이징 및 최적화 처리

### 위치 기반 클러스터링

-   1km 반경 내 사진들을 하나의 포인트로 군집화
-   구글 맵 API를 활용한 마커 클러스터링 구현
-   시간순 정렬로 여행 경로 시각화
