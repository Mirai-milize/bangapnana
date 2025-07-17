// 요소 호출
const button = document.getElementById('soundButton');
const localCountSpan = document.getElementById('cnt-value'); // 로컬 카운트 표시
const globalCountSpan = document.getElementById('global-click-count'); // 전역 카운트 표시
const sounds = document.querySelectorAll('.sound-clip');
const apiEndpoint = '/.netlify/functions/supabase-counter';

// 로컬 카운트 변수
let localCount = 0;

// 1. 페이지 로드 시 초기 전역 카운트를 가져오는 함수
const fetchInitialCount = async () => {
    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        globalCountSpan.textContent = data.count;
    } catch (error) {
        console.error('Error fetching initial count:', error);
        globalCountSpan.textContent = 'N/A'; // 에러 발생 시
    }
};

// 2. 버튼 클릭 이벤트 리스너
button.addEventListener('click', async () => {
    // --- 기존 사운드 재생 로직 (변경 없음) ---
    sounds.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
    const randomIndex = Math.floor(Math.random() * sounds.length);
    const randomSound = sounds[randomIndex];
    randomSound.play();
    // --- 기존 사운드 재생 로직 끝 ---

    // 로컬 카운트 증가 및 화면 업데이트
    localCount++;
    localCountSpan.innerText = localCount;

    // --- 전역 카운트 업데이트 로직 (새로 추가) ---
    try {
        // Netlify Function에 POST 요청을 보내 카운트 증가
        const response = await fetch(apiEndpoint, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        // 서버에서 받은 최신 전역 카운트로 화면 업데이트
        globalCountSpan.textContent = data.count;
    } catch (error) {
        console.error('Error incrementing global count:', error);
    }
    // --- 전역 카운트 업데이트 로직 끝 ---
});

// 3. 페이지가 처음 로드될 때 전역 카운트를 가져옵니다.
document.addEventListener('DOMContentLoaded', fetchInitialCount);

// 4. 5초마다 최신 전역 카운트를 가져옵니다.
setInterval(fetchInitialCount, 3000);