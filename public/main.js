// --- Firebase 설정 ---
const firebaseConfig = {
  // 사용자의 실제 키는 보안을 위해 가렸습니다.
  // 이 부분은 기존 코드를 그대로 사용하시면 됩니다.
  apiKey: "AIzaSy...[REDACTED]",
  authDomain: "twrpg-clan-xd.firebaseapp.com",
  projectId: "twrpg-clan-xd",
  storageBucket: "twrpg-clan-xd.appspot.com",
  messagingSenderId: "979681760419",
  appId: "1:979681760419:web:c996acf336669116ad9b16"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- 전역 변수 ---
let currentUser = null; 
let allUsersData = {}; 
let currentTab = 'team-management';
let unsubscribeUsers = null;

// --- 메인 인증 로직 (Auth Guard) ---
auth.onAuthStateChanged(user => {
    if (user) {
        const userDocRef = db.collection('users').doc(user.uid);
        userDocRef.get().then(doc => {
            if (doc.exists && doc.data().approved) {
                currentUser = { uid: user.uid, ...doc.data() };
                initializeAppUI();
            } else {
                alert("접근 권한이 없거나 승인 대기 중입니다. 로그인 페이지로 이동합니다.");
                window.location.replace('index.html');
            }
        });
    } else {
        window.location.replace('index.html');
    }
});

// --- 앱 UI 초기화 ---
function initializeAppUI() {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    const currentUserDisplay = document.getElementById('current-user-display');
    currentUserDisplay.textContent = `${currentUser.jnId}님 환영합니다.`;
    document.body.classList.toggle('admin-mode', currentUser.isAdmin);

    setupEventListeners();
    setupDataListeners(); // 데이터 리스너가 데이터를 받은 후 UI를 그리도록 변경
    lucide.createIcons();
}

// --- 이벤트 리스너 설정 ---
function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
    
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => { 
            currentTab = btn.dataset.tab;
            renderCurrentTab();
        });
    });
}

// --- 데이터 리스너 설정 ---
function setupDataListeners() {
    unsubscribeUsers = db.collection('users').onSnapshot(snapshot => {
        allUsersData = {};
        snapshot.forEach(doc => {
            allUsersData[doc.id] = { uid: doc.id, ...doc.data() };
        });
        // 데이터가 준비된 이 시점에 UI를 렌더링합니다.
        renderCurrentTab();
    });
}

// --- UI 렌더링 ---
function renderCurrentTab() {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    
    const activeTabContent = document.getElementById(currentTab);
    const activeTabButton = document.querySelector(`.tab-btn[data-tab='${currentTab}']`);

    if(activeTabContent) activeTabContent.classList.add("active");
    if(activeTabButton) activeTabButton.classList.add("active");

    // 각 탭에 맞는 UI를 렌더링하는 함수 호출
    if (currentTab === 'team-management') renderTeamManagementTab();
    if (currentTab === 'character-management') renderCharacterManagementTab();
    if (currentTab === 'user-management') renderUserManagementTab();
    if (currentTab === 'point-management') renderPointManagementTab();
    if (currentTab === 'point-search') renderPointSearchTab();
}

// --- 각 탭 상세 기능 구현 (이곳을 채워야 합니다) ---
function renderTeamManagementTab() {
    const container = document.getElementById('team-management');
    container.innerHTML = '<h2>팀 관리</h2><p>팀 관리 상세 기능 구현이 필요합니다.</p>';
}

function renderCharacterManagementTab() {
    const container = document.getElementById('character-management');
    container.innerHTML = '<h2>캐릭터 관리</h2><p>캐릭터 관리 상세 기능 구현이 필요합니다.</p>';
}

function renderUserManagementTab() {
    const container = document.getElementById('user-management');
    if (!container) return;
    
    let userListHtml = '<div class="space-y-2">';
    Object.values(allUsersData).forEach(user => {
        let actionButtonHtml = '';
        if (!user.approved) {
            actionButtonHtml = `<button data-uid="${user.uid}" class="btn btn-primary btn-sm approve-btn">승인</button>`;
        } else {
            actionButtonHtml = `<span class="text-green-400 text-sm font-semibold">승인 완료</span>`;
        }

        userListHtml += `
            <div class="card flex items-center justify-between p-3">
                <div>
                    <span class="font-semibold">${user.jnId}</span>
                    <span class="text-sm text-gray-400 ml-2">${user.email}</span>
                </div>
                <div>${actionButtonHtml}</div>
            </div>
        `;
    });
    userListHtml += '</div>';
    container.innerHTML = userListHtml;
    
    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const uidToApprove = event.target.dataset.uid;
            db.collection('users').doc(uidToApprove).update({ approved: true });
        });
    });
}

function renderPointManagementTab() {
    const container = document.getElementById('point-management');
    container.innerHTML = '<h2>포인트 관리</h2><p>포인트 관리 상세 기능 구현이 필요합니다.</p>';
}

function renderPointSearchTab() {
    const container = document.getElementById('point-search');
    container.innerHTML = '<h2>포인트 검색</h2><p>포인트 검색 상세 기능 구현이 필요합니다.</p>';
}