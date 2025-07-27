// --- Firebase 설정 ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const functions = firebase.functions();

// --- 전역 변수 ---
let DB = { jobs: [], bosses: {} };
let allUsers = []; 
let currentUser = null;
let currentSuggestions = [];
let localTeamPlayers = [];
let editingUser = { uid: null, characters: [] };


// --- DOM 요소 ---
const loadingOverlay = document.getElementById('loading-overlay');
const appContainer = document.getElementById('app');
const userInfoDiv = document.getElementById('user-info');
const logoutBtn = document.getElementById('logout-btn');
const adminModeToggle = document.getElementById('admin-mode-toggle');
const tabButtons=document.querySelectorAll(".tab-btn"),bossSelect=document.getElementById("boss-select"),totalPlayersInput=document.getElementById("total-players"),playTimeInput=document.getElementById("play-time"),togglePartySettingsBtn=document.getElementById("toggle-party-settings-btn"),manualPartySettingsWrapper=document.getElementById("manual-party-settings-wrapper"),partyCountSelect=document.getElementById("party-count"),partySizeInputsContainer=document.getElementById("party-size-inputs"),partySizeValidationSpan=document.getElementById("party-size-validation"),itemPickSection=document.getElementById("item-pick-section"),playerInputTable=document.getElementById("player-input-table"),resetPartyInfoBtn=document.getElementById("reset-party-info-btn"),grantPointsFromTeamBtn=document.getElementById("grant-points-from-team-btn"),distributeBtnWrapper=document.getElementById("distribute-btn-wrapper"),distributeBtn=document.getElementById("distribute-party-btn"),partyResultSection=document.getElementById("party-result-section"),partySuggestionsDiv=document.getElementById("party-suggestions"),transferFromId=document.getElementById("transfer-from-id"),transferToId=document.getElementById("transfer-to-id"),transferAmount=document.getElementById("transfer-amount"),transferPointsBtn=document.getElementById("transfer-points-btn"),manualPointIdInput=document.getElementById("manual-point-id"),manualPointChangeInput=document.getElementById("manual-point-change"),manualPointReasonInput=document.getElementById("manual-point-reason"),manualApplyPointsBtn=document.getElementById("manual-apply-points-btn"),pointChangeInput=document.getElementById("point-change"),pointReasonInput=document.getElementById("point-reason"),applyPointsBtn=document.getElementById("apply-points-btn"),selectAllUsersCheckbox=document.getElementById("select-all-users"),pointTableBody=document.getElementById("point-table-body"),checkedUserCountSpan=document.getElementById("checked-user-count"),searchUserIdInput=document.getElementById("search-user-id"),searchPointsBtn=document.getElementById("search-points-btn"),searchResultCard=document.getElementById("search-result-card"),searchedIdDisplay=document.getElementById("searched-id-display"),currentPointsDisplay=document.getElementById("current-points-display"),pointLogTableBody=document.getElementById("point-log-table-body");
const approvalListDiv = document.getElementById('approval-list');
const userListDiv = document.getElementById('user-list');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('character-editor-modal');
const modalJnId = document.getElementById('editing-jn-id');
const modalCharStat = document.getElementById('modal-char-stat');
const modalCharJob = document.getElementById('modal-char-job');
const modalAddCharBtn = document.getElementById('modal-add-character-btn');
const modalCharList = document.getElementById('modal-registered-characters');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalSaveBtn = document.getElementById('modal-save-btn');


// --- 초기화 및 인증 ---
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (userDoc.exists) {
            currentUser = { uid: user.uid, ...userDoc.data() };
            
            if (currentUser.email === 'oxford1436@gmail.com' && (currentUser.status !== 'approved' || currentUser.role !== 'admin')) {
                 await db.collection('users').doc(user.uid).update({ status: 'approved', role: 'admin' });
                 currentUser.status = 'approved';
                 currentUser.role = 'admin';
                 console.log("최초 관리자 계정을 활성화했습니다.");
            }

            if (currentUser.status !== 'approved') {
                alert('아직 관리자의 가입 승인이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.');
                auth.signOut();
                return;
            }
            await initializeApp();
        } else {
            alert('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
            auth.signOut();
        }
    } else {
        window.location.href = 'index.html';
    }
});

async function initializeApp() {
    await loadGameData();
    setupUserListener();
    
    userInfoDiv.textContent = `환영합니다, ${currentUser.jnId}님!`;
    if (currentUser.role === 'admin') {
        document.body.classList.add('admin-only');
    }
    
    lucide.createIcons();
    setupEventListeners();
    populateBossSelect();
    handleTotalPlayersChange();
    
    loadingOverlay.classList.add('hidden');
    appContainer.classList.remove('hidden');
    
    renderAll();
}

// --- 데이터 로딩 ---
async function loadGameData() {
    const jobsDoc = await db.collection('game_data').doc('jobs').get();
    const bossesDoc = await db.collection('game_data').doc('bosses').get();

    if (jobsDoc.exists && bossesDoc.exists) {
        DB.jobs = jobsDoc.data().jobList || [];
        DB.bosses = bossesDoc.data();
    } else {
        console.error("치명적 오류: 게임 데이터를 찾을 수 없습니다. Firestore에 데이터가 올바르게 등록되었는지 확인하세요.");
        alert("앱 데이터를 불러오는 데 실패했습니다. 관리자에게 문의하세요.");
    }
}

function setupUserListener() {
    db.collection('users').onSnapshot(snapshot => {
        allUsers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        console.log("모든 유저 정보를 실시간으로 업데이트했습니다.");
        renderAll();
    }, error => {
        console.error("유저 정보 수신 실패:", error);
        if (error.code === 'permission-denied') {
            alert("유저 목록을 읽어올 권한이 없습니다. Firestore 보안 규칙을 확인해주세요.");
        }
    });
}

// --- 렌더링 함수 ---
function renderAll() {
    if (!currentUser) return;
    const currentTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'team-management';
    
    if (currentTab === 'team-management') { renderTeamManagementTab(); }
    if (currentTab === 'user-management') { renderUserManagementTab(); }
    if (currentTab === 'point-management') { renderPointTable(); }
}

function renderTeamManagementTab() {
    renderPlayerInputs();
    renderItemPickSection();
}

function renderPlayerInputs() {
    playerInputTable.innerHTML = localTeamPlayers.map((data, i) => `
        <tr class="border-b border-gray-600"><td class="p-2 font-semibold text-center">${i + 1}</td><td class="p-2 text-center"><input type="checkbox" class="form-checkbox h-5 w-5 rounded use-other-char-checkbox" data-idx="${i}" ${data.useOther ? 'checked' : ''}></td><td class="p-2"><div class="autocomplete-container"><input type="text" class="input-field participant-id-input" placeholder="참가자 JN ID" data-idx="${i}" value="${data.participantId || ''}"></div></td><td class="p-2"><div class="autocomplete-container"><input type="text" class="input-field using-user-id-input" placeholder="직업 소유자 JN ID" data-idx="${i}" style="display: ${data.useOther ? 'block' : 'none'}" value="${data.usingUserId || ''}"></div></td><td class="p-2"><select class="select-field job-select" data-idx="${i}"></select></td><td class="p-2 text-center"><img class="table-img mx-auto job-img-display" data-idx="${i}" referrerpolicy="no-referrer"></td><td class="p-2"><select class="select-field job-type-select" data-idx="${i}"><option value="딜러">딜러</option><option value="보조">보조</option></select></td><td class="p-2 item-pick-cell" data-idx="${i}"><div class="flex items-start gap-1"><div class="flex-grow space-y-1 item-pick-list">${(data.itemPicks || []).map(item => createItemPickRowHtml(item)).join('')}</div><button class="btn btn-secondary btn-sm p-1 h-7 w-7 add-item-pick-btn flex-shrink-0"><i data-lucide="plus" class="icon-xs pointer-events-none"></i></button></div></td></tr>
    `).join('');
    
    localTeamPlayers.forEach((data, i) => { 
        populateJobSelect(i, data.job); 
        const jobTypeSelect = document.querySelector(`.job-type-select[data-idx='${i}']`); 
        if (jobTypeSelect) jobTypeSelect.value = data.jobType || '딜러'; 
    });

    updateItemPickVisibility(); 
    validateParticipantIds(); 
    lucide.createIcons();
}

function renderItemPickSection() {
    const bossId = bossSelect.value;
    const bossData = DB.bosses[bossId];
    itemPickSection.innerHTML = '';
    if (!bossData || Object.keys(bossData.items).length === 0) {
        itemPickSection.innerHTML = '<p class="text-sm text-gray-400">선택한 보스는 픽 아이템이 없습니다.</p>';
        updateItemPickVisibility();
        return;
    }
    
    const sortedItems = Object.entries(bossData.items).sort(([, a], [, b]) => {
        const aIsToken = a.imageUrl.includes('token');
        const bIsToken = b.imageUrl.includes('token');
        const aIsSoulstone = a.imageUrl.includes('styrix') || a.imageUrl.includes('arcaneconstruct');
        const bIsSoulstone = b.imageUrl.includes('styrix') || b.imageUrl.includes('arcaneconstruct');

        if (a.required && !b.required) return -1;
        if (!a.required && b.required) return 1;
        if (aIsToken && !bIsToken) return 1;
        if (!aIsToken && bIsToken) return -1;
        if (aIsSoulstone && !bIsSoulstone) return 1;
        if (!aIsSoulstone && bIsSoulstone) return -1;
        return 0;
    });

    const itemsHtml = sortedItems.map(([name, data]) => `
        <div class="flex items-center gap-2">
            <img src="${data.imageUrl}" class="w-8 h-8 rounded-md" alt="${name}" referrerpolicy="no-referrer">
            <span class="font-medium">${name}</span>
            ${data.required ? '<span class="text-xs font-bold text-red-400">(필수)</span>' : ''}
        </div>
    `).join('');
    itemPickSection.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-3 gap-2">${itemsHtml}</div>`;
    updateItemPickVisibility();
}


function renderUserManagementTab() {
    if (currentUser.role === 'admin') {
        renderApprovalList();
    }
    renderUserList();
}

function renderApprovalList() {
    const pendingUsers = allUsers.filter(u => u.status === 'pending_approval');
    approvalListDiv.innerHTML = '';
    if (pendingUsers.length === 0) {
        approvalListDiv.innerHTML = '<p class="text-sm text-gray-400">가입 승인 대기 중인 유저가 없습니다.</p>';
        return;
    }
    
    pendingUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'p-4 border border-gray-700 rounded-lg flex justify-between items-center';
        
        const charactersHtml = user.characters.map(jobName => {
            const jobData = getJobData(jobName);
            return `<div class="inline-flex items-center gap-2 bg-gray-700 p-1.5 rounded-md mr-2 mb-1">
                        <img src="${jobData.imageUrl}" class="w-6 h-6 rounded">
                        <span class="text-sm font-medium pr-1">${jobName}</span>
                    </div>`;
        }).join('');

        userCard.innerHTML = `
            <div>
                <p class="font-bold">${user.jnId} <span class="text-sm text-gray-400">(${user.email})</span></p>
                <div class="mt-2">${charactersHtml}</div>
            </div>
            <div class="flex gap-2">
                <button class="btn btn-primary btn-sm approve-btn" data-uid="${user.uid}">승인</button>
                <button class="btn btn-danger btn-sm reject-btn" data-uid="${user.uid}">거절</button>
            </div>
        `;
        approvalListDiv.appendChild(userCard);
    });
}

function renderUserList() {
    const sortedUsers = [...allUsers].sort((a, b) => {
        if (a.uid === currentUser.uid) return -1;
        if (b.uid === currentUser.uid) return 1;
        return a.jnId.localeCompare(b.jnId);
    });
    userListDiv.innerHTML = '';

    const statusMap = {
        approved: { text: '가입 완료', color: 'text-green-400' },
        pending_approval: { text: '승인 대기중', color: 'text-yellow-400' },
        revoked: { text: '탈퇴/정지', color: 'text-red-400' }
    };

    sortedUsers.forEach(user => {
        const isSelf = user.uid === currentUser.uid;
        const userCard = document.createElement('div');
        userCard.className = `p-4 border rounded-lg ${isSelf ? 'border-primary-color' : 'border-gray-700'}`;
        
        const charactersHtml = user.characters.map(jobName => {
            const jobData = getJobData(jobName);
            return `<div class="inline-flex items-center gap-2 bg-gray-700 p-1.5 rounded-md mr-2 mb-1">
                        <img src="${jobData?.imageUrl || ''}" class="w-6 h-6 rounded">
                        <span class="text-sm font-medium pr-1">${jobName}</span>
                    </div>`;
        }).join('');

        const statusInfo = statusMap[user.status] || { text: user.status, color: '' };

        userCard.innerHTML = `
            <div class="flex justify-between items-start flex-wrap gap-2">
                <div>
                    <p class="font-bold text-lg">${user.jnId} ${isSelf ? '<span class="text-xs text-primary-color">(나)</span>' : ''}</p>
                    <p class="font-bold text-sm ${statusInfo.color} admin-only">${statusInfo.text}</p>
                </div>
                <div class="flex gap-2 items-center">
                    <div class="user-controls" data-uid="${user.uid}">
                         <button class="btn btn-secondary btn-sm edit-chars-btn"><i data-lucide="user-cog" class="icon-xs mr-2"></i>캐릭터 관리</button>
                         ${isSelf ? '<button class="btn btn-danger btn-sm delete-self-btn"><i data-lucide="user-x" class="icon-xs mr-2"></i>계정 탈퇴</button>' : ''}
                    </div>
                    <div class="admin-controls" data-uid="${user.uid}">
                        <select class="select-field select-sm set-role-select" ${isSelf ? 'disabled' : ''}>
                            <option value="user" ${user.role === 'user' ? 'selected' : ''}>일반</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>관리자</option>
                        </select>
                        <button class="btn btn-danger btn-sm delete-user-btn" ${isSelf ? 'disabled' : ''}><i data-lucide="trash-2" class="icon-xs"></i></button>
                    </div>
                </div>
            </div>
            <div class="mt-2">${charactersHtml}</div>
        `;
        userListDiv.appendChild(userCard);
    });
    lucide.createIcons();
}


function renderPointTable() {
    const sortedUsers = [...allUsers].filter(u => u.status === 'approved').sort((a, b) => (b.points || 0) - (a.points || 0));
    pointTableBody.innerHTML = sortedUsers.map((user, index) => {
        const points = user.points || 0;
        const pointColor = points >= 0 ? "text-blue-400" : "text-red-400";
        return `<tr class="border-b border-gray-700 hover:bg-gray-800">
            <td class="p-2 font-semibold text-center">${index + 1}</td>
            <td class="p-2"><input type="checkbox" class="form-checkbox h-5 w-5 rounded user-select-checkbox admin-only" data-uid="${user.uid}"></td>
            <td class="p-2 font-medium">${user.jnId}</td>
            <td class="p-2 font-bold text-lg ${pointColor}">${points.toFixed(1)}</td>
            <td class="p-2 text-sm text-gray-400">N/A</td>
        </tr>`;
    }).join("");
    lucide.createIcons();
}

// --- 이벤트 리스너 설정 ---
function setupEventListeners() {
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });
    
    themeToggle.addEventListener("click", () => document.documentElement.classList.toggle("dark"));

    adminModeToggle.addEventListener('change', (e) => {
        document.body.classList.toggle('admin-mode', e.target.checked);
    });

    tabButtons.forEach(btn => btn.addEventListener("click", (e) => {
        tabButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(e.currentTarget.dataset.tab).classList.add('active');
        renderAll();
    }));

    approvalListDiv.addEventListener('click', e => {
        const uid = e.target.dataset.uid;
        if (!uid) return;

        if (e.target.classList.contains('approve-btn')) {
            db.collection('users').doc(uid).update({ status: 'approved' });
        } else if (e.target.classList.contains('reject-btn')) {
            if (confirm("가입 신청을 거절하고 데이터를 삭제하시겠습니까?")) {
                const deleteUserFunc = functions.httpsCallable('deleteUser');
                deleteUserFunc({ targetUid: uid }).catch(err => alert("삭제 실패: " + err.message));
            }
        }
    });

    userListDiv.addEventListener('click', async (e) => {
        const targetUserUid = e.target.closest('[data-uid]')?.dataset.uid;
        if (!targetUserUid) return;

        const targetUser = allUsers.find(u => u.uid === targetUserUid);

        if (e.target.closest('.edit-chars-btn')) {
            openCharacterEditor(targetUser);
        }
        else if (e.target.closest('.delete-user-btn')) {
            if (confirm(`정말로 '${targetUser.jnId}' 유저를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
                const deleteUserFunc = functions.httpsCallable('deleteUser');
                try {
                    await deleteUserFunc({ targetUid: targetUserUid });
                    alert("사용자가 삭제되었습니다.");
                } catch (error) {
                    alert("사용자 삭제에 실패했습니다: " + error.message);
                }
            }
        }
        else if (e.target.closest('.delete-self-btn')) {
             if (confirm(`정말로 계정을 탈퇴하시겠습니까? 모든 정보가 삭제되며 되돌릴 수 없습니다.`)) {
                const deleteMyAccountFunc = functions.httpsCallable('deleteMyAccount');
                try {
                    await deleteMyAccountFunc();
                    alert("계정이 삭제되었습니다. 자동으로 로그아웃됩니다.");
                    auth.signOut();
                } catch (error) {
                    alert("계정 탈퇴에 실패했습니다: " + error.message);
                }
            }
        }
    });

     userListDiv.addEventListener('change', async (e) => {
        const targetUserUid = e.target.dataset.uid;
        if (!targetUserUid || !e.target.classList.contains('set-role-select')) return;
        
        const newRole = e.target.value;
        const targetUser = allUsers.find(u=>u.uid === targetUserUid);
        if (confirm(`'${targetUser.jnId}' 님의 역할을 '${newRole}'(으)로 변경하시겠습니까?`)) {
            const setUserRoleFunc = functions.httpsCallable('setUserRole');
            try {
                await setUserRoleFunc({ targetUid: targetUserUid, newRole: newRole });
                alert("역할이 변경되었습니다.");
            } catch(error) {
                alert("역할 변경에 실패했습니다: " + error.message);
                e.target.value = targetUser.role;
            }
        } else {
            e.target.value = targetUser.role;
        }
    });


    modalCloseBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modalSaveBtn.addEventListener('click', saveCharacterChanges);
    modalAddCharBtn.addEventListener('click', addCharacterToModal);
    modalCharStat.addEventListener('change', populateModalJobSelect);
    modalCharList.addEventListener('click', (e) => {
        if(e.target.closest('.delete-char-btn')) {
            const jobNameToDelete = e.target.closest('.delete-char-btn').dataset.jobName;
            editingUser.characters = editingUser.characters.filter(j => j !== jobNameToDelete);
            renderModalCharacterList();
        }
    });


    bossSelect.addEventListener('change', () => { renderItemPickSection(); renderPlayerInputs(); });
    totalPlayersInput.addEventListener('change', handleTotalPlayersChange);
    resetPartyInfoBtn.addEventListener('click', handleResetPartyInfo);
    
    togglePartySettingsBtn.addEventListener('click', handleTogglePartySettings);
    
    playerInputTable.addEventListener('change', e => {
        const target = e.target;
        const idx = target.dataset.idx;
        if (!idx) return;

        if (target.classList.contains('participant-id-input') || target.classList.contains('using-user-id-input')) {
            populateJobSelect(idx);
        } else if (target.classList.contains('use-other-char-checkbox')) {
            handleUseOtherCharCheckboxChange(idx);
        } else if (target.classList.contains('job-select')) {
            handleJobSelectChange(idx, target.value);
        } else if (target.classList.contains('item-pick-select')) {
             const img = target.closest('.item-pick-row')?.querySelector('.item-pick-img');
            if (img) {
                const itemData = DB.bosses[bossSelect.value].items[target.value];
                img.src = itemData ? itemData.imageUrl : '';
            }
        }
        savePlayerInputData();
    });
    
    playerInputTable.addEventListener('input', e => { 
        if (e.target.classList.contains('participant-id-input') || e.target.classList.contains('using-user-id-input')) { 
            handleAutocomplete(e.target); 
            validateParticipantIds(); 
        } 
    });

    playerInputTable.addEventListener("click", e => {
        const addBtn = e.target.closest(".add-item-pick-btn");
        const removeBtn = e.target.closest(".remove-item-pick-btn");
        if (addBtn) {
            const idx = addBtn.closest(".item-pick-cell").dataset.idx;
            addItemPickRow(idx);
        } else if (removeBtn) {
            const idx = removeBtn.closest(".item-pick-cell").dataset.idx;
            const itemValue = removeBtn.closest(".item-pick-row").querySelector('.item-pick-select').value;
            
            localTeamPlayers[idx].itemPicks = localTeamPlayers[idx].itemPicks.filter(item => item !== itemValue);
            renderPlayerInputs();
        }
    });
}

// --- 헬퍼 및 기능 함수 ---
function getJobData(jobName) {
    return DB.jobs.find(job => job.name === jobName) || null;
}

function populateBossSelect() {
    bossSelect.innerHTML = "";
    const bossOrder = ["styrix", "machine", "gaia", "lazarus"];
    bossOrder.forEach(bossId => {
        if (DB.bosses[bossId]) {
            const option = document.createElement('option');
            option.value = bossId;
            option.textContent = DB.bosses[bossId].name;
            bossSelect.appendChild(option);
        }
    });
}

function handleTotalPlayersChange() { 
    const newSize = parseInt(totalPlayersInput.value) || 8; 
    localTeamPlayers = Array(newSize).fill(0).map(() => ({ 
        useOther: false, participantId: '', usingUserId: '', job: '', jobType: '딜러', itemPicks: [] 
    }));
    renderPlayerInputs(); 
}

function savePlayerInputData() {
    playerInputTable.querySelectorAll('tr').forEach((row, i) => {
        if (!localTeamPlayers[i]) return;
        const player = localTeamPlayers[i];
        player.useOther = row.querySelector('.use-other-char-checkbox')?.checked || false;
        player.participantId = row.querySelector('.participant-id-input')?.value || '';
        player.usingUserId = row.querySelector('.using-user-id-input')?.value || '';
        player.job = row.querySelector('.job-select')?.value || '';
        player.jobType = row.querySelector('.job-type-select')?.value || '딜러';
        player.itemPicks = Array.from(row.querySelectorAll('.item-pick-select')).map(s => s.value).filter(Boolean);
    });
    validateParticipantIds();
}

function handleUseOtherCharCheckboxChange(idx) {
    const checkbox = document.querySelector(`.use-other-char-checkbox[data-idx='${idx}']`);
    const usingUserInput = document.querySelector(`.using-user-id-input[data-idx='${idx}']`);
    if (usingUserInput) {
        usingUserInput.style.display = checkbox.checked ? 'block' : 'none';
    }
    populateJobSelect(idx);
}

function populateJobSelect(idx, selectedJob = "") {
    const useOther = document.querySelector(`.use-other-char-checkbox[data-idx='${idx}']`).checked;
    const participantId = document.querySelector(`.participant-id-input[data-idx='${idx}']`).value.trim();
    const usingUserId = document.querySelector(`.using-user-id-input[data-idx='${idx}']`).value.trim();
    const jobSelect = document.querySelector(`.job-select[data-idx='${idx}']`);
    
    const targetJnId = useOther ? usingUserId : participantId;
    jobSelect.innerHTML = '<option value="">직업 선택</option>';

    if (targetJnId) {
        const user = allUsers.find(u => u.jnId === targetJnId);
        if (user && user.characters) {
            user.characters.forEach(jobName => {
                const isSelected = jobName === selectedJob ? "selected" : "";
                jobSelect.innerHTML += `<option value="${jobName}" ${isSelected}>${jobName}</option>`;
            });
        }
    }
    jobSelect.value = selectedJob;
    handleJobSelectChange(idx, jobSelect.value);
}

function handleJobSelectChange(idx, jobName) {
    const imgDisplay = document.querySelector(`.job-img-display[data-idx='${idx}']`);
    const typeSelect = document.querySelector(`.job-type-select[data-idx='${idx}']`);
    const jobData = getJobData(jobName);
    if (jobData) {
        imgDisplay.src = jobData.imageUrl;
        typeSelect.value = jobData.type;
    } else {
        imgDisplay.src = '';
        typeSelect.value = "딜러";
    }
}

function validateParticipantIds() {
    const inputs = Array.from(document.querySelectorAll(".participant-id-input"));
    const ids = inputs.map(input => input.value.trim()).filter(Boolean);
    const counts = ids.reduce((acc, value) => ({ ...acc, [value]: (acc[value] || 0) + 1 }), {});
    inputs.forEach(input => {
        const id = input.value.trim();
        input.classList.toggle("error", id && counts[id] > 1);
    });
}

function handleResetPartyInfo() {
    if (confirm('입력된 모든 파티원 정보를 초기화하시겠습니까?')) {
        handleTotalPlayersChange();
    }
}

function handleAutocomplete(inputElement) {
    const value = inputElement.value.toLowerCase();
    const container = inputElement.parentElement;
    
    document.querySelectorAll('.autocomplete-results').forEach(el => el.remove());
    if (!value) return;

    const approvedUsers = allUsers.filter(u => u.status === 'approved');
    const suggestions = approvedUsers.filter(u => u.jnId.toLowerCase().startsWith(value));

    if (suggestions.length > 0) {
        const resultsDiv = document.createElement("div");
        resultsDiv.className = "autocomplete-results";
        suggestions.forEach(user => {
            const item = document.createElement("div");
            item.className = "autocomplete-item";
            item.textContent = user.jnId;
            item.addEventListener("click", () => {
                inputElement.value = user.jnId;
                resultsDiv.remove();
                inputElement.dispatchEvent(new Event('change', { bubbles: true }));
            });
            resultsDiv.appendChild(item);
        });
        container.appendChild(resultsDiv);
    }
}

function updateItemPickVisibility() {
    const bossId = bossSelect.value;
    const hasItems = DB.bosses[bossId] && Object.keys(DB.bosses[bossId].items).length > 0;
    document.querySelectorAll(".item-pick-header, .item-pick-cell").forEach(el => {
        el.style.display = hasItems ? "table-cell" : "none";
    });
}

function createItemPickRowHtml(selectedItem = '') {
    const bossId = bossSelect.value;
    if (!DB.bosses[bossId]) return '';

    let options = '<option value="">아이템 선택</option>';
    const bossItems = DB.bosses[bossId].items;
    for (const itemName in bossItems) {
        const isSelected = itemName === selectedItem ? 'selected' : '';
        options += `<option value="${itemName}" ${isSelected}>${itemName}</option>`;
    }
    const hasImage = selectedItem && bossItems[selectedItem];
    const imgSrcAttr = hasImage ? `src="${bossItems[selectedItem].imageUrl}"` : '';
    return `<div class="flex items-center gap-2 item-pick-row">
                <img ${imgSrcAttr} class="w-6 h-6 rounded item-pick-img" referrerpolicy="no-referrer">
                <select class="select-field item-pick-select flex-grow">${options}</select>
                <button type="button" class="btn btn-danger btn-sm p-1 h-8 w-8 remove-item-pick-btn">
                    <i data-lucide="minus" class="icon-xs pointer-events-none"></i>
                </button>
            </div>`;
}

function addItemPickRow(idx) {
    if (localTeamPlayers[idx]) {
        localTeamPlayers[idx].itemPicks.push('');
        renderPlayerInputs();
    }
}

function handleTogglePartySettings() {
    const currentIsOn = !manualPartySettingsWrapper.classList.contains('hidden');
    const newIsOn = !currentIsOn;
    manualPartySettingsWrapper.classList.toggle('hidden', !newIsOn);
    distributeBtnWrapper.classList.toggle('hidden', !newIsOn);
    togglePartySettingsBtn.textContent = `자동 분배 설정 (${newIsOn ? 'ON' : 'OFF'})`;
    togglePartySettingsBtn.classList.toggle('active', newIsOn);
}

function openCharacterEditor(user) {
    editingUser.uid = user.uid;
    editingUser.characters = [...user.characters];
    modalJnId.textContent = user.jnId;

    modalCharStat.innerHTML = '<option value="">속성 선택</option>';
    const stats = [...new Set(DB.jobs.map(job => job.stat))];
    stats.forEach(stat => {
        modalCharStat.innerHTML += `<option value="${stat}">${stat}</option>`;
    });

    renderModalCharacterList();
    modal.classList.remove('hidden');
}

function populateModalJobSelect() {
    modalCharJob.innerHTML = '<option value="">직업 선택</option>';
    const selectedStat = modalCharStat.value;
    if (selectedStat) {
        const filteredJobs = DB.jobs.filter(job => job.stat === selectedStat);
        filteredJobs.forEach(job => {
            modalCharJob.innerHTML += `<option value="${job.name}">${job.name}</option>`;
        });
        modalCharJob.disabled = false;
    } else {
        modalCharJob.disabled = true;
    }
}

function addCharacterToModal() {
    const jobName = modalCharJob.value;
    if (jobName && !editingUser.characters.includes(jobName)) {
        editingUser.characters.push(jobName);
        renderModalCharacterList();
    }
}

function renderModalCharacterList() {
    modalCharList.innerHTML = '<strong>등록된 캐릭터:</strong>';
    if (editingUser.characters.length === 0) return;

    const list = document.createElement('div');
    list.className = 'flex flex-wrap gap-2 mt-2';
    editingUser.characters.forEach(jobName => {
        const jobData = getJobData(jobName);
        if (jobData) {
            list.innerHTML += `
                <div class="inline-flex items-center gap-2 bg-gray-800 p-1.5 rounded-md">
                    <img src="${jobData.imageUrl}" class="w-6 h-6 rounded">
                    <span class="text-sm font-medium pr-1">${jobName}</span>
                    <button type="button" class="delete-char-btn text-gray-400 hover:text-white" data-job-name="${jobName}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            `;
        }
    });
    modalCharList.appendChild(list);
}

async function saveCharacterChanges() {
    if (!editingUser.uid) return;
    
    try {
        const updateUserCharsFunc = functions.httpsCallable('updateUserCharacters');
        await updateUserCharsFunc({ 
            targetUid: editingUser.uid, 
            characters: editingUser.characters 
        });
        alert('캐릭터 정보가 성공적으로 저장되었습니다.');
        modal.classList.add('hidden');
    } catch (error) {
        console.error("캐릭터 정보 저장 실패:", error);
        alert('캐릭터 정보 저장에 실패했습니다: ' + error.message);
    }
}
