// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- 데이터베이스 정보 (캐릭터 추가용) ---
const DB = {
    jobs: {
        "힘": { "기사": {}, "랜서": {}, "다크나이트": {}, "팔라딘": {}, "광전사": {}, "성전사": {}, "행상인": {}, "격투가": {}, "라이트시커": {}, "블래스터": {}, "마검사": {} },
        "민첩": { "보우마스터": {}, "어쌔신": {}, "검사": {}, "검호": {}, "썬더러": {}, "무도가": {}, "스나이퍼": {}, "슈터": {}, "거너": {}, "소드 인챈터": {}, "트릭스터": {}, "리퍼": {}, "허밋": {} },
        "지능": { "연금술사": {}, "마법사(마도)": {}, "마법사(불)": {}, "마법사(번개)": {}, "마법사(물)": {}, "마법사(바람)": {}, "프리스트": {}, "블러드위버": {}, "흑마법사": {}, "위치": {}, "정령사": {}, "무녀": {}, "소울위버": {} }
    }
};

// --- DOM 요소 선택 ---
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const pendingApprovalView = document.getElementById('pending-approval-view');
const loginIdInput = document.getElementById('login-id');
const loginPasswordInput = document.getElementById('login-password');
const loginErrorMsg = document.getElementById('login-error-msg');
const loginBtn = document.getElementById('login-btn');
const goToSignupBtn = document.getElementById('go-to-signup-btn');
const signupErrorMsg = document.getElementById('signup-error-msg');
const signupBtn = document.getElementById('signup-btn');
const goToLoginBtn = document.getElementById('go-to-login-btn');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const signupCharacterList = document.getElementById('signup-character-list');
const addCharacterFieldBtn = document.getElementById('add-character-field-btn');

// --- 뷰 전환 ---
function showView(viewId) {
    loginView.classList.add('hidden');
    signupView.classList.add('hidden');
    pendingApprovalView.classList.add('hidden');
    document.getElementById(viewId).classList.remove('hidden');
}

// --- 인증 함수 ---
function handleSignUp() {
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const passwordConfirmInput = document.getElementById('signup-password-confirm');
    const jnIdInput = document.getElementById('signup-jnid');
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;
    const jnId = jnIdInput.value.trim();

    if (!email || !password || !passwordConfirm || !jnId) { signupErrorMsg.textContent = "모든 필드를 입력해주세요."; return; }
    if (password.length < 6) { signupErrorMsg.textContent = "비밀번호는 6자 이상이어야 합니다."; return; }
    if (password !== passwordConfirm) { signupErrorMsg.textContent = "비밀번호가 일치하지 않습니다."; return; }

    const characterInputs = document.querySelectorAll('.signup-character-stat');
    const jobs = [];
    let hasError = false;
    characterInputs.forEach(statSelect => {
        const jobSelect = statSelect.nextElementSibling;
        if (statSelect.value && jobSelect.value) { jobs.push(jobSelect.value); } 
        else if (statSelect.value || jobSelect.value) { hasError = true; }
    });
    if (hasError) { signupErrorMsg.textContent = "캐릭터의 속성과 직업을 모두 선택해주세요."; return; }
    if (jobs.length === 0) { signupErrorMsg.textContent = "최소 1개 이상의 캐릭터를 등록해야 합니다."; return; }

    signupErrorMsg.textContent = '';
    signupBtn.disabled = true;

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
                jnId, email, approved: false, isAdmin: false, jobs, points: 0, pointLog: []
            }).then(() => showView('pending-approval-view'));
        })
        .catch(error => {
            if (error.code === 'auth/email-already-in-use') { signupErrorMsg.textContent = "이미 사용 중인 이메일입니다."; }
            else if (error.code === 'auth/invalid-email') { signupErrorMsg.textContent = "올바른 이메일 형식이 아닙니다."; }
            else { signupErrorMsg.textContent = `오류: ${error.message}`; }
        })
        .finally(() => { signupBtn.disabled = false; });
}

async function handleLogin() {
    const jnId = loginIdInput.value.trim();
    const password = loginPasswordInput.value;
    if (!jnId || !password) { loginErrorMsg.textContent = "ID와 비밀번호를 입력해주세요."; return; }

    loginErrorMsg.textContent = '';
    loginBtn.disabled = true;

    try {
        const userQuery = await db.collection('users').where('jnId', '==', jnId).limit(1).get();
        if (userQuery.empty) { throw new Error("User not found"); }
        const userData = userQuery.docs[0].data();
        if (!userData.approved) {
             loginErrorMsg.textContent = "아직 승인되지 않은 계정입니다.";
             throw new Error("User not approved");
        }
        const userEmail = userData.email;
        if (!userEmail) { throw new Error("Email not found in user data"); }
        await auth.signInWithEmailAndPassword(userEmail, password);
    } catch (error) {
        console.error("Login Error:", error);
        if (error.message !== "User not approved") {
            loginErrorMsg.textContent = "ID 또는 비밀번호가 올바르지 않습니다.";
        }
    } finally {
        loginBtn.disabled = false;
    }
}

// --- 메인 로직 및 리스너 ---
auth.onAuthStateChanged(user => {
    if (user) {
        // 로그인 성공 시, app.html로 이동
        window.location.replace('main.html');
    }
});

function setupEventListeners() {
    goToSignupBtn.addEventListener('click', () => showView('signup-view'));
    goToLoginBtn.addEventListener('click', () => showView('login-view'));
    backToLoginBtn.addEventListener('click', () => showView('login-view'));
    loginBtn.addEventListener('click', handleLogin);
    signupBtn.addEventListener('click', handleSignUp);
    addCharacterFieldBtn.addEventListener('click', addCharacterField);
}

function addCharacterField() {
    const fieldCount = signupCharacterList.children.length;
    const newField = document.createElement('div');
    newField.className = 'flex items-center gap-2';

    const statSelect = document.createElement('select');
    statSelect.className = 'select-field signup-character-stat';
    statSelect.innerHTML = '<option value="">속성 선택</option><option value="힘">힘</option><option value="민첩">민첩</option><option value="지능">지능</option>';

    const jobSelect = document.createElement('select');
    jobSelect.className = 'select-field signup-character-job flex-grow';
    jobSelect.innerHTML = '<option value="">직업 선택</option>';
    jobSelect.disabled = true;

    statSelect.addEventListener('change', () => {
        const stat = statSelect.value;
        jobSelect.innerHTML = '<option value="">직업 선택</option>';
        if (stat && DB.jobs[stat]) {
            Object.keys(DB.jobs[stat]).forEach(jobName => {
                jobSelect.innerHTML += `<option value="${jobName}">${jobName}</option>`;
            });
            jobSelect.disabled = false;
        } else {
            jobSelect.disabled = true;
        }
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn btn-danger btn-sm p-1 h-8 w-8 flex-shrink-0';
    removeBtn.innerHTML = '<i data-lucide="minus" class="icon-xs pointer-events-none"></i>';
    removeBtn.onclick = () => newField.remove();

    newField.appendChild(statSelect);
    newField.appendChild(jobSelect);
    if (fieldCount > 0) {
        newField.appendChild(removeBtn);
    }
    
    signupCharacterList.appendChild(newField);
    lucide.createIcons();
}

// --- 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    addCharacterField();
    lucide.createIcons();
});
