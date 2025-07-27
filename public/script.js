// --- Firebase 설정 ---
// [ 중요 ] 아래 firebaseConfig 내용을 1단계에서 복사한 자신의 키로 교체하세요!
const firebaseConfig = {
  apiKey: "AIzaSyA_tuVB-EIWOIpylyUEdY-d5yhmy9fyML0",
  authDomain: "twrpg-clan-xd.firebaseapp.com",
  projectId: "twrpg-clan-xd",
  storageBucket: "twrpg-clan-xd.firebasestorage.app",
  messagingSenderId: "979681760419",
  appId: "1:979681760419:web:c996acf336669116ad9b16"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const docRef = db.collection("twrpg-manager").doc("shared-state");


// --- DATA STORE (기존과 동일) ---
const DB = {
    jobs: {
        "힘": {
            "기사": { type: "딜러", imageUrl: "images/Knight.png" },
            "랜서": { type: "딜러", imageUrl: "images/Lancer.png" },
            "다크나이트": { type: "딜러", imageUrl: "images/Dark Knight.png" },
            "팔라딘": { type: "보조", imageUrl: "images/Paladin.png" },
            "광전사": { type: "딜러", imageUrl: "images/Berserker.png" },
            "성전사": { type: "딜러", imageUrl: "images/Crusader.png" },
            "행상인": { type: "딜러", imageUrl: "images/Merchant.png" },
            "격투가": { type: "딜러", imageUrl: "images/Fighter.png" },
            "라이트시커": { type: "딜러", imageUrl: "images/Lightseeker.png" },
            "블래스터": { type: "딜러", imageUrl: "images/Blaster.png" },
            "마검사": { type: "딜러", imageUrl: "images/SwordSaint.png" }
        },
        "민첩": {
            "보우마스터": { type: "딜러", imageUrl: "images/Bow Master.png" },
            "어쌔신": { type: "딜러", imageUrl: "images/Assassin.png" },
            "검사": { type: "딜러", imageUrl: "images/Swordsman.png" },
            "검호": { type: "딜러", imageUrl: "images/Phantom Blade.png" },
            "썬더러": { type: "딜러", imageUrl: "images/Thunderer.png" },
            "무도가": { type: "딜러", imageUrl: "images/Martial Artist.png" },
            "스나이퍼": { type: "딜러", imageUrl: "images/Sniper.png" },
            "슈터": { type: "보조", imageUrl: "images/Shooter.png" },
            "거너": { type: "딜러", imageUrl: "images/Gunner.png" },
            "소드 인챈터": { type: "딜러", imageUrl: "images/Sword Enchanter.png" },
            "트릭스터": { type: "딜러", imageUrl: "images/Trickster.png" },
            "리퍼": { type: "딜러", imageUrl: "images/Reaper.png" },
            "허밋": { type: "보조", imageUrl: "images/Hermit.png" }
        },
        "지능": {
            "연금술사": { type: "딜러", imageUrl: "images/Alchemist.png" },
            "마법사(마도)": { type: "딜러", imageUrl: "images/Arcane Mage.png" },
            "마법사(불)": { type: "딜러", imageUrl: "images/Fire Mage.png" },
            "마법사(번개)": { type: "딜러", imageUrl: "images/Lightning Mage.png" },
            "마법사(물)": { type: "딜러", imageUrl: "images/Water Mage.png" },
            "마법사(바람)": { type: "보조", imageUrl: "images/Wind Mage.png" },
            "프리스트": { type: "보조", imageUrl: "images/Priest.png" },
            "블러드위버": { type: "딜러", imageUrl: "images/Blood Weaver.png" },
            "흑마법사": { type: "딜러", imageUrl: "images/Warlock.png" },
            "위치": { type: "딜러", imageUrl: "images/Witch.png" },
            "정령사": { type: "보조", imageUrl: "images/Elementalist.png" },
            "무녀": { type: "딜러", imageUrl: "images/Shrine Priestess.png" },
            "소울위버": { type: "보조", imageUrl: "images/Soul Weaver.png" }
        }
    },
    bosses: {
        "styrix": {
            name: "스티릭스", minPlayers: 4, maxPlayers: 10, pickers: 4,
            items: {
                "저주받은 혼": { required: !0, imageUrl: "images/spiritofdamnation.png" },
                "영혼의 종": { required: !0, imageUrl: "images/lanternofsoul.png" },
                "불길한 해골": { required: !0, imageUrl: "images/sinisiterskull.png" },
                "그림 사이드": { required: !0, imageUrl: "images/grimscythe.png" },
                "수확자의 영혼석": { required: !1, imageUrl: "images/styrix.png" },
                "수확자 토큰": { required: !1, imageUrl: "images/token.png" }
            }
        },
        "machine": {
            name: "고대 마도 기계", minPlayers: 3, maxPlayers: 6, pickers: 3,
            items: {
                "마도 핵": { required: !0, imageUrl: "images/arcanecore.png" },
                "고대의 비서": { required: !0, imageUrl: "images/ancienttome.png" },
                "진실의 가면": { required: !0, imageUrl: "images/maskoftruth.png" },
                "기계의 영혼석": { required: !1, imageUrl: "images/arcaneconstruct.png" },
                "기계 토큰": { required: !1, imageUrl: "images/token.png" }
            }
        },
        "lazarus": { name: "공작 라자루스", minPlayers: 4, maxPlayers: 10, pickers: 0, items: {} },
        "gaia": { name: "지신 가이아", minPlayers: 4, maxPlayers: 10, pickers: 0, items: {} }
    }
};

let state;
let currentSuggestions = [];
const defaultState = {
    users: {}, pointLog: [], currentTab: 'team-management',
    teamManagement: {
        settings: { boss: 'styrix', playTime: 1, totalPlayers: 8, partyCount: 2, partySizes: [], autoDistributeOn: false },
        players: []
    }
};

let saveTimeout;
function saveState() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        if (state) {
            docRef.set(state).catch(error => {
                console.error("Firebase 저장 실패:", error);
            });
        }
    }, 500);
}

function setupFirebaseListener() {
    docRef.onSnapshot((doc) => {
        if (doc.metadata.hasPendingWrites) {
            console.log("로컬 변경사항으로 인한 불필요한 렌더링을 건너뜁니다.");
            return;
        }

        if (doc.exists) {
            state = doc.data();
            console.log("Firebase에서 데이터를 실시간으로 불러왔습니다.");
        } else {
            console.log("데이터가 없어 기본값으로 새로 생성합니다.");
            state = JSON.parse(JSON.stringify(defaultState));
            // [수정] 초기 샘플 유저 데이터를 생성하는 로직을 모두 제거했습니다.
            saveState(); 
        }
        renderAll();
    }, (error) => {
        console.error("Firebase 데이터 수신 실패:", error);
        alert("데이터 연결에 실패했습니다. 인터넷 연결 및 Firebase 설정을 확인하고 페이지를 새로고침 해주세요.");
    });
}


const adminModeToggle=document.getElementById("admin-mode-toggle"),themeToggle=document.getElementById("theme-toggle"),saveDataBtn=document.getElementById("save-data"),loadDataInput=document.getElementById("load-data-input"),tabButtons=document.querySelectorAll(".tab-btn"),bossSelect=document.getElementById("boss-select"),totalPlayersInput=document.getElementById("total-players"),playTimeInput=document.getElementById("play-time"),togglePartySettingsBtn=document.getElementById("toggle-party-settings-btn"),manualPartySettingsWrapper=document.getElementById("manual-party-settings-wrapper"),partyCountSelect=document.getElementById("party-count"),partySizeInputsContainer=document.getElementById("party-size-inputs"),partySizeValidationSpan=document.getElementById("party-size-validation"),itemPickSection=document.getElementById("item-pick-section"),playerInputTable=document.getElementById("player-input-table"),resetPartyInfoBtn=document.getElementById("reset-party-info-btn"),grantPointsFromTeamBtn=document.getElementById("grant-points-from-team-btn"),distributeBtnWrapper=document.getElementById("distribute-btn-wrapper"),distributeBtn=document.getElementById("distribute-party-btn"),partyResultSection=document.getElementById("party-result-section"),partySuggestionsDiv=document.getElementById("party-suggestions"),charMgmtOwnerId=document.getElementById("char-mgmt-owner-id"),charMgmtStat=document.getElementById("char-mgmt-stat"),charMgmtJob=document.getElementById("char-mgmt-job"),addCharacterBtn=document.getElementById("add-character-btn"),characterListDiv=document.getElementById("character-list"),transferFromId=document.getElementById("transfer-from-id"),transferToId=document.getElementById("transfer-to-id"),transferAmount=document.getElementById("transfer-amount"),transferPointsBtn=document.getElementById("transfer-points-btn"),manualPointIdInput=document.getElementById("manual-point-id"),manualPointChangeInput=document.getElementById("manual-point-change"),manualPointReasonInput=document.getElementById("manual-point-reason"),manualApplyPointsBtn=document.getElementById("manual-apply-points-btn"),pointChangeInput=document.getElementById("point-change"),pointReasonInput=document.getElementById("point-reason"),applyPointsBtn=document.getElementById("apply-points-btn"),selectAllUsersCheckbox=document.getElementById("select-all-users"),pointTableBody=document.getElementById("point-table-body"),checkedUserCountSpan=document.getElementById("checked-user-count"),searchUserIdInput=document.getElementById("search-user-id"),searchPointsBtn=document.getElementById("search-points-btn"),searchResultCard=document.getElementById("search-result-card"),searchedIdDisplay=document.getElementById("searched-id-display"),currentPointsDisplay=document.getElementById("current-points-display"),pointLogTableBody=document.getElementById("point-log-table-body");

function init() { 
    lucide.createIcons(); 
    setupEventListeners(); 
    populateBossSelect(); 
    setupFirebaseListener();
}

function renderAll() {
    if (!state) return;
    renderActiveTab();
    if (state.currentTab === 'team-management') { renderTeamManagementTab(); }
    if (state.currentTab === 'character-management') { renderCharacterList(); }
    if (state.currentTab === 'point-management') { renderPointTable(); }
}
function renderActiveTab() {
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove("active")); 
    tabButtons.forEach(b=>b.classList.remove("active")); 
    document.getElementById(state.currentTab)?.classList.add("active"); 
    document.querySelector(`.tab-btn[data-tab='${state.currentTab}']`)?.classList.add("active");
}
function renderTeamManagementTab() {
    const settings = state.teamManagement.settings;
    if (state.teamManagement.players.length !== settings.totalPlayers) {
        handleTotalPlayersChange({ target: { value: settings.totalPlayers } });
    }
    bossSelect.value = settings.boss;
    playTimeInput.value = settings.playTime;
    totalPlayersInput.value = settings.totalPlayers;
    partyCountSelect.value = settings.partyCount;
    updatePartyToggleBtnState(settings.autoDistributeOn);
    renderPlayerInputs();
    renderItemPickSection();
    handlePartyCountChange();
}
function getJobData(jobName) {
    if (!jobName) return null;
    for (const stat in DB.jobs) {
        if (DB.jobs[stat][jobName]) {
            return DB.jobs[stat][jobName];
        }
    }
    return null;
}
function setupEventListeners() {
    adminModeToggle.addEventListener("change", e => toggleAdminMode(e.target.checked));
    themeToggle.addEventListener("click", toggleTheme);
    saveDataBtn.addEventListener("click", () => {
        const dataStr = JSON.stringify(state, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `twrpg_manager_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click(); URL.revokeObjectURL(url);
    });
    loadDataInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const loadedState = JSON.parse(event.target.result);
                    if (loadedState.users && loadedState.pointLog && loadedState.teamManagement) {
                        if (confirm("현재 온라인 데이터를 덮어쓰고 복구하시겠습니까? 이 작업은 모든 사용자가 공유합니다.")) {
                            state = loadedState; 
                            saveState();
                        }
                    } else { alert("유효하지 않거나 오래된 형식의 파일입니다."); }
                } catch (err) { alert("파일을 읽는 중 오류가 발생했습니다."); }
            };
            reader.readAsText(file);
        }
    });
    tabButtons.forEach(btn => btn.addEventListener("click", () => { state.currentTab = btn.dataset.tab; saveState(); renderAll(); }));
    document.body.addEventListener("click", e => { if (!e.target.closest(".autocomplete-container")) document.querySelectorAll('.autocomplete-results').forEach(el => el.remove()); });
    
    setupTeamManagementListeners();
    setupCharacterManagementListeners();
    setupPointManagementListeners();
    setupSearchListeners();
    setupDragDropListeners();
}
function setupTeamManagementListeners() {
    bossSelect.addEventListener('change', e => { state.teamManagement.settings.boss = e.target.value; saveState(); renderItemPickSection(); renderPlayerInputs(); });
    playTimeInput.addEventListener('change', e => { state.teamManagement.settings.playTime = parseFloat(e.target.value) || 1; saveState(); });
    totalPlayersInput.addEventListener('change', handleTotalPlayersChange);
    togglePartySettingsBtn.addEventListener('click', handleTogglePartySettings);
    partyCountSelect.addEventListener('change', handlePartyCountChange);
    partySizeInputsContainer.addEventListener('input', validatePartySizes);
    resetPartyInfoBtn.addEventListener('click', handleResetPartyInfo);
    distributeBtn.addEventListener('click', handlePartyDistribution);
    grantPointsFromTeamBtn.addEventListener('click', handleGrantPointsFromTeam);

    playerInputTable.addEventListener('change', e => {
        const target = e.target;
        const idx = target.dataset.idx;

        if (!idx) return;

        if (target.classList.contains('participant-id-input') || target.classList.contains('using-user-id-input')) {
            populateJobSelect(idx);
        } 
        else if (target.classList.contains('use-other-char-checkbox')) {
            handleUseOtherCharCheckboxChange(idx);
        } 
        else if (target.classList.contains('job-select')) {
            handleJobSelectChange(idx, target.value);
        }
        else if (target.classList.contains('item-pick-select')) {
            const img = target.closest('.item-pick-row')?.querySelector('.item-pick-img');
            if (img) {
                const itemData = DB.bosses[state.teamManagement.settings.boss].items[target.value];
                img.src = itemData ? itemData.imageUrl : '';
            }
        }
        
        savePlayerInputData();
        validateManualItemPicks();
    });
    
    playerInputTable.addEventListener('input', e => { 
        const target = e.target;
        if (target.classList.contains('participant-id-input') || target.classList.contains('using-user-id-input')) { 
            handleAutocomplete(target); 
            validateParticipantIds(); 
        } 
    });

    playerInputTable.addEventListener("click", e => {
        const addBtn = e.target.closest(".add-item-pick-btn");
        const removeBtn = e.target.closest(".remove-item-pick-btn");
        if (addBtn) {
            const cell = addBtn.closest(".item-pick-cell");
            if (cell) addItemPickRow(cell.dataset.idx);
        } else if (removeBtn) {
            removeBtn.closest(".item-pick-row").remove();
            savePlayerInputData();
            validateManualItemPicks();
        }
    });
}
function setupCharacterManagementListeners() {
    charMgmtOwnerId.addEventListener("input",()=>handleAutocomplete(charMgmtOwnerId)); charMgmtStat.addEventListener("change",handleCharMgmtStatChange); addCharacterBtn.addEventListener("click",handleAddJob);
    characterListDiv.addEventListener("click",e=>{const t=e.target.closest(".remove-job-btn"),n=e.target.closest(".delete-user-char-mgmt-btn");t?handleRemoveJob(t.dataset.userId,t.dataset.jobName):n&&handleRemoveUser(n.dataset.userId)});
}
function setupPointManagementListeners() {
    transferFromId.addEventListener('input',()=>handleAutocomplete(transferFromId)); transferToId.addEventListener('input',()=>handleAutocomplete(transferToId)); transferPointsBtn.addEventListener('click',handlePointTransfer);
    manualPointIdInput.addEventListener("input",()=>handleAutocomplete(manualPointIdInput)); manualApplyPointsBtn.addEventListener("click",handleManualApplyPoints); applyPointsBtn.addEventListener("click",handleApplyPoints);
    selectAllUsersCheckbox.addEventListener("change",e=>{document.querySelectorAll(".user-select-checkbox").forEach(t=>t.checked=e.target.checked),updateCheckedUserCount()});
    pointTableBody.addEventListener("change",e=>{e.target.classList.contains("user-select-checkbox")&&updateCheckedUserCount()});
    pointTableBody.addEventListener("click",e=>{e.target.closest(".delete-user-btn")&&handleRemoveUser(e.target.closest(".delete-user-btn").dataset.id)});
}
function setupSearchListeners() {
    searchUserIdInput.addEventListener("input",()=>handleAutocomplete(searchUserIdInput)); searchPointsBtn.addEventListener("click",handleSearchPoints); searchUserIdInput.addEventListener("keydown",e=>{"Enter"===e.key&&handleSearchPoints()});
}
function validatePartySizes() {
    const totalPlayers = parseInt(totalPlayersInput.value, 10) || 0;
    const sizeInputs = Array.from(partySizeInputsContainer.querySelectorAll('.party-size-input'));
    const currentSum = sizeInputs.reduce((sum, input) => sum + (parseInt(input.value, 10) || 0), 0);
    const partySizes = sizeInputs.map(input => parseInt(input.value, 10) || 0);
    state.teamManagement.settings.partySizes = partySizes;
    saveState();
    partySizeValidationSpan.textContent = `${currentSum} / ${totalPlayers} 명`;
    if (currentSum === totalPlayers) {
        partySizeValidationSpan.className = 'text-sm font-semibold text-green-400';
        distributeBtn.disabled = false;
    } else {
        partySizeValidationSpan.className = 'text-sm font-semibold text-red-400';
        distributeBtn.disabled = true;
    }
}
function handlePartyCountChange() {
    state.teamManagement.settings.partyCount = parseInt(partyCountSelect.value, 10);
    partySizeInputsContainer.innerHTML = '';
    const partyCount = state.teamManagement.settings.partyCount;
    if (partyCount > 1) {
        for (let i = 0; i < partyCount; i++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.className = 'input-field party-size-input';
            input.placeholder = `P${i+1} 인원`;
            const value = state.teamManagement.settings.partySizes[i];
            if (value) input.value = value;
            partySizeInputsContainer.appendChild(input);
        }
    }
    validatePartySizes();
    saveState();
}
function renderItemPickSection() {
    const bossId = state.teamManagement.settings.boss;
    const bossData = DB.bosses[bossId];
    itemPickSection.innerHTML = '';
    if (!bossData || Object.keys(bossData.items).length === 0) {
        itemPickSection.innerHTML = '<p class="text-sm text-gray-400">선택한 보스는 픽 아이템이 없습니다.</p>';
        updateItemPickVisibility();
        return;
    }
    const itemsHtml = Object.entries(bossData.items).map(([name, data]) => `
        <div class="flex items-center gap-2">
            <img src="${data.imageUrl}" class="w-8 h-8 rounded-md" alt="${name}" referrerpolicy="no-referrer">
            <span class="font-medium">${name}</span>
            ${data.required ? '<span class="text-xs font-bold text-red-400">(필수)</span>' : ''}
        </div>
    `).join('');
    itemPickSection.innerHTML = `<div class="grid grid-cols-2 md:grid-cols-3 gap-2">${itemsHtml}</div>`;
    updateItemPickVisibility();
}
function handleAddJob(){const e=charMgmtOwnerId.value.trim(),t=charMgmtJob.value;if(!e||!t)return alert("유저 ID와 직업을 모두 선택해주세요.");state.users[e]||(state.users[e]={points:0,jobs:[]}),state.users[e].jobs||(state.users[e].jobs=[]),state.users[e].jobs.includes(t)?alert("이미 해당 유저에게 등록된 직업입니다."):(state.users[e].jobs.push(t),saveState(),renderCharacterList(),charMgmtJob.value="",charMgmtStat.value="",charMgmtOwnerId.value="",alert(`[${e}]님에게 '${t}' 직업이 추가되었습니다.`))}
function handleRemoveJob(e,t){state.users[e]&&state.users[e].jobs&&(state.users[e].jobs=state.users[e].jobs.filter(e=>e!==t),saveState(),renderCharacterList(),alert("직업이 삭제되었습니다."))}
function handleRemoveUser(e){if(confirm(`정말로 '${e}' 유저의 모든 정보(포인트, 직업, 로그)를 완전히 삭제하시겠습니까?`)){delete state.users[e],state.pointLog=state.pointLog.filter(t=>t.userId!==e),saveState(),renderAll(),alert(`'${e}' 유저 정보가 삭제되었습니다.`)}}
function handlePointTransfer(){const e=transferFromId.value.trim(),t=transferToId.value.trim(),n=parseFloat(transferAmount.value);if(!e||!t||isNaN(n))return void alert("모든 필드를 올바르게 입력해주세요.");if(e===t)return void alert("동일한 유저에게 포인트를 이전할 수 없습니다.");if(!state.users[e]||!state.users[t])return void alert("ID가 존재하지 않습니다.");if(n<=0)return void alert("0보다 큰 포인트를 입력해주세요.");const r=state.users[e].points||0;if(r<n)return void alert(`'${e}'님의 포인트가 부족합니다. (보유: ${r.toFixed(1)})`);const a=r-n,o=(state.users[t].points||0)+n;state.users[e].points=a,state.users[t].points=o;const s=(new Date).toISOString();state.pointLog.push({timestamp:s,userId:e,change:-n,reason:`'${t}'에게 포인트 이전`,cumulative:a}),state.pointLog.push({timestamp:s,userId:t,change:n,reason:`'${e}'로부터 포인트 받음`,cumulative:o}),saveState(),renderPointTable(),transferFromId.value="",transferToId.value="",transferAmount.value="",alert("포인트 이전이 완료되었습니다.")}
function handleManualApplyPoints(){const e=manualPointIdInput.value.trim(),t=parseFloat(manualPointChangeInput.value),n=manualPointReasonInput.value.trim();if(!e||isNaN(t)||!n)return void alert("ID, 포인트 변동량, 사유를 모두 입력해주세요.");if(!state.users[e])return void alert("등록되지 않은 ID입니다. 캐릭터 관리 탭에서 먼저 직업을 등록해주세요.");const r=state.users[e].points||0,a=r+t;state.users[e].points=a,state.pointLog.push({timestamp:(new Date).toISOString(),userId:e,change:t,reason:n,cumulative:a}),saveState(),renderPointTable(),manualPointIdInput.value="",manualPointChangeInput.value="",manualPointReasonInput.value="",alert(`'${e}'님에게 포인트가 적용되었습니다.`)}
function handleApplyPoints(){const e=parseFloat(pointChangeInput.value),t=pointReasonInput.value.trim();if(isNaN(e)||!t)return void alert("포인트 변동량과 사유를 모두 입력해주세요.");const n=Array.from(document.querySelectorAll(".user-select-checkbox:checked")).map(e=>e.dataset.id);if(0===n.length)return void alert("포인트를 적용할 유저를 선택해주세요.");n.forEach(n=>{state.users[n]||(state.users[n]={points:0,jobs:[]});const r=state.users[n].points||0,a=r+e;state.users[n].points=a,state.pointLog.push({timestamp:(new Date).toISOString(),userId:n,change:e,reason:t,cumulative:a})}),saveState(),renderPointTable(),pointChangeInput.value="",pointReasonInput.value="",selectAllUsersCheckbox.checked=!1,updateCheckedUserCount(),alert(`${n.length}명의 유저에게 포인트가 적용되었습니다.`)}
function handleGrantPointsFromTeam(){savePlayerInputData();const e=getPlayerDataFromForm(!1);if(!e||0===e.length)return void alert("포인트를 부여할 파티원을 먼저 입력해주세요.");const t=e.map(e=>e.participantId).filter(Boolean);t.forEach(e=>{state.users[e]||(state.users[e]={points:0,jobs:[]})}),saveState(),state.currentTab="point-management",renderAll(),setTimeout(()=>{document.querySelectorAll(".user-select-checkbox").forEach(e=>{e.checked=t.includes(e.dataset.id)}),updateCheckedUserCount();const e=DB.bosses[state.teamManagement.settings.boss].name,n=state.teamManagement.settings.playTime;pointReasonInput.value=`${e} 레이드 ${n}시간 참여`,pointChangeInput.value=n,pointChangeInput.focus()},100)}
function handleSearchPoints(){const e=searchUserIdInput.value.trim();if(!e)return void alert("검색할 ID를 입력하세요.");if(!state.users[e])return void alert("해당 ID의 유저를 찾을 수 없습니다.");searchedIdDisplay.textContent=e,currentPointsDisplay.textContent=(state.users[e].points || 0).toFixed(1);const t=state.pointLog.filter(t=>t.userId===e).sort((e,t)=>new Date(t.timestamp)-new Date(e.timestamp));pointLogTableBody.innerHTML=t.map(e=>`<tr class="border-b border-gray-700"><td class="p-2">${new Date(e.timestamp).toLocaleString("ko-KR")}</td><td class="p-2 ${e.change>0?"text-green-400":"text-red-400"}">${e.change>0?"+":""}${e.change.toFixed(1)}</td><td class="p-2">${e.reason}</td><td class="p-2">${e.cumulative.toFixed(1)}</td></tr>`).join(""),searchResultCard.classList.remove("hidden")}
function handleTotalPlayersChange(e) { 
    const newSize = parseInt(e.target.value) || 0; 
    state.teamManagement.settings.totalPlayers = newSize; 
    const players = state.teamManagement.players; 
    while (players.length < newSize) {
        players.push({ useOther: false, participantId: '', usingUserId: '', job: '', jobType: '딜러', itemPicks: [] });
    }
    players.length = newSize;
    saveState(); 
    renderPlayerInputs(); 
}
function savePlayerInputData() { const players = state.teamManagement.players; playerInputTable.querySelectorAll('tr').forEach((row, i) => { if (!players[i]) return; players[i].useOther = row.querySelector('.use-other-char-checkbox')?.checked || false; players[i].participantId = row.querySelector('.participant-id-input')?.value || ''; players[i].usingUserId = row.querySelector('.using-user-id-input')?.value || ''; players[i].job = row.querySelector('.job-select')?.value || ''; players[i].jobType = row.querySelector('.job-type-select')?.value || '딜러'; players[i].itemPicks = Array.from(row.querySelectorAll('.item-pick-select')).map(s => s.value).filter(Boolean); }); validateParticipantIds(); saveState(); }
function renderPlayerInputs() {
    const players = state.teamManagement.players;
    playerInputTable.innerHTML = players.map((data, i) => `
        <tr class="border-b border-gray-600"><td class="p-2 font-semibold text-center">${i + 1}</td><td class="p-2 text-center"><input type="checkbox" class="form-checkbox h-5 w-5 rounded use-other-char-checkbox" data-idx="${i}" ${data.useOther ? 'checked' : ''}></td><td class="p-2"><div class="autocomplete-container"><input type="text" class="input-field participant-id-input" placeholder="참가자 ID" data-idx="${i}" value="${data.participantId || ''}"></div></td><td class="p-2"><div class="autocomplete-container"><input type="text" class="input-field using-user-id-input" placeholder="직업 소유자 ID" data-idx="${i}" style="display: ${data.useOther ? 'block' : 'none'}" value="${data.usingUserId || ''}"></div></td><td class="p-2"><select class="select-field job-select" data-idx="${i}"></select></td><td class="p-2 text-center"><img class="table-img mx-auto job-img-display" data-idx="${i}" referrerpolicy="no-referrer"></td><td class="p-2"><select class="select-field job-type-select" data-idx="${i}"><option value="딜러">딜러</option><option value="보조">보조</option></select></td><td class="p-2 item-pick-cell" data-idx="${i}"><div class="flex items-start gap-1"><div class="flex-grow space-y-1 item-pick-list">${data.itemPicks.map(item => createItemPickRowHtml(item)).join('')}</div><button class="btn btn-secondary btn-sm p-1 h-7 w-7 add-item-pick-btn flex-shrink-0"><i data-lucide="plus" class="icon-xs pointer-events-none"></i></button></div></td></tr>
    `).join('');
    players.forEach((data, i) => { populateJobSelect(i, data.job); const jobTypeSelect = document.querySelector(`.job-type-select[data-idx='${i}']`); if (jobTypeSelect) jobTypeSelect.value = data.jobType || '딜러'; });
    updateItemPickVisibility(); validateParticipantIds(); lucide.createIcons();
    validateManualItemPicks();
}
function handleTogglePartySettings() { 
    const newVal = !state.teamManagement.settings.autoDistributeOn; 
    state.teamManagement.settings.autoDistributeOn = newVal; 
    updatePartyToggleBtnState(newVal); 
    saveState(); 
    validateManualItemPicks();
}
function updatePartyToggleBtnState(isOn) {
    manualPartySettingsWrapper.classList.toggle('hidden', !isOn); distributeBtnWrapper.classList.toggle('hidden', !isOn);
    togglePartySettingsBtn.textContent = `자동 분배 설정 (${isOn ? 'ON' : 'OFF'})`;
    togglePartySettingsBtn.classList.toggle('btn-primary', isOn); togglePartySettingsBtn.classList.toggle('active', isOn);
    togglePartySettingsBtn.classList.toggle('btn-secondary', !isOn);
}
function handleResetPartyInfo() { if (confirm('입력된 모든 파티원 정보를 초기화하시겠습니까?')) { const playerCount = state.teamManagement.players.length; state.teamManagement.players = Array(playerCount).fill(0).map(() => ({ useOther: false, participantId: '', usingUserId: '', job: '', jobType: '딜러', itemPicks: [] })); saveState(); renderPlayerInputs(); partyResultSection.classList.add('hidden'); validateManualItemPicks();} }
function createItemPickRowHtml(selectedItem = '') {
    let options = '<option value="">아이템 선택</option>'; const bossItems = DB.bosses[state.teamManagement.settings.boss].items;
    for (const itemName in bossItems) { const isSelected = itemName === selectedItem ? 'selected' : ''; options += `<option value="${itemName}" ${isSelected}>${itemName}</option>`; }
    const hasImage = selectedItem && bossItems[selectedItem];
    const imgSrcAttr = hasImage ? `src="${bossItems[selectedItem].imageUrl}"` : '';
    return `<div class="flex items-center gap-2 item-pick-row"><img ${imgSrcAttr} class="w-6 h-6 rounded item-pick-img" referrerpolicy="no-referrer"><select class="select-field item-pick-select flex-grow">${options}</select><button class="btn btn-danger btn-sm p-1 h-8 w-8 remove-item-pick-btn"><i data-lucide="minus" class="icon-xs pointer-events-none"></i></button></div>`;
}
function addItemPickRow(idx) { const listDiv = document.querySelector(`.item-pick-cell[data-idx='${idx}'] .item-pick-list`); if (listDiv) { listDiv.insertAdjacentHTML('beforeend', createItemPickRowHtml()); savePlayerInputData(); lucide.createIcons(); } }
function handlePartyDistribution() { 
    savePlayerInputData(); 
    const players = getPlayerDataFromForm(); 
    if(players) { 
        const result = findPartySuggestions(players, DB.bosses[state.teamManagement.settings.boss]); 
        currentSuggestions = JSON.parse(JSON.stringify(result.suggestions || [])); 
        renderPartySuggestions(result); 
        partyResultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } 
}
function renderPartySuggestions(result) {
    partyResultSection.classList.remove("hidden"); partySuggestionsDiv.innerHTML = "";
    if (!result.suggestions || result.suggestions.length === 0) {
        let failureHtml = '<div class="card text-center"><p class="font-semibold mb-2 text-red-400">조건을 만족하는 파티 구성을 찾지 못했습니다.</p>';
        if (result.failureReason && result.failureReason.length > 0) {
            const errorMessages = new Set();
            result.failureReason.forEach(detail => { if(detail.checks) {Object.values(detail.checks).forEach(check => { if (!check.pass) errorMessages.add(`[파티 ${detail.partyNum}] ${check.msg}`); }); }});
            failureHtml += `<ul class="text-left text-sm list-disc list-inside">${[...errorMessages].map(msg => `<li class="text-gray-400">${msg}</li>`).join('')}</ul>`;
        } else { failureHtml += '<p class="text-sm text-gray-400">입력된 파티원 정보를 다시 확인해주세요.</p>'; }
        failureHtml += '</div>'; partySuggestionsDiv.innerHTML = failureHtml; return;
    }
    result.suggestions.forEach((sug, sugIdx) => {
        const card = document.createElement("div"); card.className = "card space-y-4"; card.innerHTML = `<h3 class="text-lg font-bold text-center">제안 ${sugIdx + 1}</h3>`;
        sug.parties.forEach((party, pIdx) => {
            if (!party || party.length === 0) return;
            const partyValidation = sug.validation.details.find(d => d.partyNum === pIdx + 1) || { isValid: true, checks: {} };
            const partyStatus = partyValidation.isValid ? 'OK' : 'NG'; const statusColor = partyValidation.isValid ? "text-green-400" : "text-red-400";
            const partyDiv = document.createElement("div"); partyDiv.innerHTML = `<h4 class="font-semibold mb-2 flex justify-between items-center"><span>파티 ${pIdx + 1} (${party.length}명)</span><span class="text-sm font-bold ${statusColor}">${partyStatus}</span></h4>`;
            const table = document.createElement("table"); table.className = "w-full text-xs";
            const playerRowsHtml = party.map(p => { const jobData = getJobData(p.job); const itemImages = p.itemPicks.map(i => { const d = DB.bosses[state.teamManagement.settings.boss].items[i]; return d ? `<img src="${d.imageUrl}" class="w-5 h-5 rounded inline-block" title="${i}" referrerpolicy="no-referrer">` : "" }).join(" "); const imgSrcAttr = jobData?.imageUrl ? `src="${jobData.imageUrl}"` : ''; return `<tr class="border-b border-gray-700 draggable-row" draggable="true" data-player-id="${p.id}"><td class="p-1"><img ${imgSrcAttr} class="w-6 h-6 rounded" referrerpolicy="no-referrer"></td><td class="p-1">${p.participantId}</td><td class="p-1 ${p.jobType==="보조"?"text-green-400":""}">${p.job}</td><td class="p-1">${itemImages||"-"}</td></tr>`; }).join("");
            table.innerHTML = `<thead class="bg-gray-800"><tr><th class="p-1 w-8"></th><th class="p-1">ID</th><th class="p-1">직업</th><th class="p-1">아이템</th></tr></thead><tbody class="party-tbody" data-sug-idx="${sugIdx}" data-party-idx="${pIdx}">${playerRowsHtml}</tbody>`;
            partyDiv.appendChild(table);
            const validationDiv = document.createElement("div"); validationDiv.className = "text-xs mt-2 space-y-1";
            if (!partyValidation.isValid) { let errors = []; Object.values(partyValidation.checks).forEach(c => { if(!c.pass) errors.push(c.msg) }); validationDiv.innerHTML = `<p class="text-red-400 font-semibold">NG 사유: ${errors.join(", ")}</p>`; }
            partyDiv.appendChild(validationDiv); card.appendChild(partyDiv);
        });
        partySuggestionsDiv.appendChild(card);
    });
    lucide.createIcons();
}
function findPartySuggestions(e,t){let n=[],r=0;let a={isValid:!1,details:[]};const l=1e3,i=state.teamManagement.settings.autoDistributeOn,o=Array.from(document.querySelectorAll(".party-size-input")).map(e=>parseInt(e.value)||0);if(i&&o.length>1){const s=o.reduce((e,t)=>e+t,0);if(s!==e.length)return{suggestions:[],failureReason:[{partyNum:0,isValid:!1,checks:{config:{pass:!1,msg:"파티 분배 설정의 인원 합계가 총 인원수와 일치하지 않습니다."}}}]}}for(;n.length<2&&r<l;){let c=[...e].sort(()=>.5-Math.random()),d=[];if(i&&o.length>1&&o.reduce((e,t)=>e+t,0)===e.length){let p=0;o.forEach(e=>{d.push(c.slice(p,p+e)),p+=e})}else e.length>=8?(d.push(c.slice(0,Math.ceil(e.length/2))),d.push(c.slice(Math.ceil(e.length/2)))):d.push(c);const u=validateParties(d,t.name),m=n.some(e=>JSON.stringify(e.parties.map(e=>e.map(e=>e.id).sort()))===JSON.stringify(d.map(e=>e.map(e=>e.id).sort())));u.isValid&&!m?n.push({parties:d,validation:u}):a=u,r++}return n.length>0?{suggestions:n,failureReason:null}:{suggestions:[],failureReason:a.details}}
function getPlayerDataFromForm(e=!0){const t=state.teamManagement.players.map((p,i)=>({...p,id:i}));let n=!0;if(e){const a=new Set;for(const o of t){if(!o.participantId||!o.job){alert(`플레이어 ${o.id+1}의 ID와 직업을 정확히 선택해주세요.`);n=!1;break}if(a.has(o.participantId)){alert(`ID '${o.participantId}'가 중복되었습니다.`);n=!1;break}a.add(o.participantId)}}return n?t:null}
function validateParties(parties, bossName) {
    let results = { isValid: true, details: [] };
    parties.forEach((party, i) => {
        if (party.length === 0) return;
        const partyNum = i + 1;
        let partyResult = { partyNum: partyNum, isValid: true, checks: {} };
        const ids = party.map(p => p.participantId);
        const hasIdDupes = new Set(ids).size !== ids.length;
        partyResult.checks.idDupe = { pass: !hasIdDupes, msg: hasIdDupes ? 'ID 중복' : 'ID OK' };
        if (hasIdDupes) partyResult.isValid = false;
        const items = party.flatMap(p => p.itemPicks);
        const hasItemDupes = (new Set(items)).size !== items.length;
        partyResult.checks.itemPick = { pass: !hasItemDupes, msg: hasItemDupes ? '아이템 중복' : '아이템 OK' };
        if (hasItemDupes) partyResult.isValid = false;
        const supportCount = party.filter(p => p.jobType === "보조").length;
        let requiredSupports = 0;
        if (bossName === "스티릭스") requiredSupports = Math.max(1, Math.floor(party.length / 2) - 1);
        else if (bossName === "고대 마도 기계") requiredSupports = Math.max(1, Math.ceil(party.length / 2) - 1);
        else requiredSupports = 1;
        const hasEnoughSupports = supportCount >= requiredSupports;
        partyResult.checks.supportCount = { pass: hasEnoughSupports, msg: hasEnoughSupports ? `보조 ${supportCount}명 OK` : `보조 ${supportCount}명(필요: ${requiredSupports}명)` };
        if (!hasEnoughSupports) partyResult.isValid = false;
        results.details.push(partyResult);
        if (!partyResult.isValid) results.isValid = false;
    });
    return results;
}
function setupDragDropListeners(){let e=null,t={};partySuggestionsDiv.addEventListener("dragstart",n=>{if(n.target.classList.contains("draggable-row"))e=n.target,t={sugIdx:parseInt(e.closest(".party-tbody").dataset.sugIdx),partyIdx:parseInt(e.closest(".party-tbody").dataset.partyIdx),playerId:parseInt(e.dataset.playerId)},setTimeout(()=>n.target.classList.add("dragging"),0)}),partySuggestionsDiv.addEventListener("dragend",()=>{(e?.classList.remove("dragging"),e=null)}),partySuggestionsDiv.addEventListener("dragover",e=>{e.target.closest(".party-tbody")&&e.preventDefault()}),partySuggestionsDiv.addEventListener("drop",n=>{n.preventDefault();const r=n.target.closest(".party-tbody");if(r&&e){const a={sugIdx:parseInt(r.dataset.sugIdx),partyIdx:parseInt(r.dataset.partyIdx)};let o=null,s=-1;currentSuggestions[t.sugIdx].parties[t.partyIdx].forEach((e,n)=>{e.id===t.playerId&&(o=e,s=n)});if(o&&s>-1){currentSuggestions[t.sugIdx].parties[t.partyIdx].splice(s,1);const i=n.target.closest(".draggable-row");if(i){const c=Array.from(r.children).indexOf(i);currentSuggestions[a.sugIdx].parties[a.partyIdx].splice(c,0,o)}else currentSuggestions[a.sugIdx].parties[a.partyIdx].push(o);currentSuggestions.forEach(e=>{e.validation=validateParties(e.parties,DB.bosses[state.teamManagement.settings.boss].name)}),renderPartySuggestions({suggestions:currentSuggestions,failureReason:null})}}})}
function handleCharMgmtStatChange(){const e=charMgmtStat.value,t=charMgmtJob;t.innerHTML='<option value="">직업 선택</option>',t.disabled=!0,e&&DB.jobs[e]&&(Object.keys(DB.jobs[e]).forEach(e=>{t.innerHTML+=`<option value="${e}">${e}</option>`}),t.disabled=!1)}
function handleUseOtherCharCheckboxChange(e){const t=document.querySelector(`.use-other-char-checkbox[data-idx='${e}']`),n=document.querySelector(`.using-user-id-input[data-idx='${e}']`);n&&(n.style.display=t.checked?"block":"none"),populateJobSelect(e)}
function handleJobSelectChange(e,t){const n=document.querySelector(`.job-img-display[data-idx='${e}']`),r=document.querySelector(`.job-type-select[data-idx='${e}']`);const a=getJobData(t);if(a){n.src=a.imageUrl;r.value=a.type;}else{n.removeAttribute('src');r.value="딜러";} savePlayerInputData();}
function populateJobSelect(e,t=""){const n=document.querySelector(`.use-other-char-checkbox[data-idx='${e}']`),r=document.querySelector(`.participant-id-input[data-idx='${e}']`).value.trim(),a=document.querySelector(`.using-user-id-input[data-idx='${e}']`).value.trim(),o=document.querySelector(`.job-select[data-idx='${e}']`),s=n.checked?a:r;o.innerHTML='<option value="">직업 선택</option>';if(s&&state.users[s]&&state.users[s].jobs){state.users[s].jobs.forEach(e=>{const n=e===t?"selected":"";o.innerHTML+=`<option value="${e}" ${n}>${e}</option>`})}o.value=t;handleJobSelectChange(e,o.value)}
function validateParticipantIds(){const e=Array.from(document.querySelectorAll(".participant-id-input")),t=e.map(e=>e.value.trim()).filter(Boolean),n=t.reduce((e,t)=>(e[t]=(e[t]||0)+1,e),{});e.forEach(e=>{const t=e.value.trim();e.classList.toggle("error",t&&n[t]>1)})}
function renderCharacterList() {
    const users = Object.entries(state.users).sort((a, b) => a[0].localeCompare(b[0]));
    let tableHtml = `
    <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
            <thead class="bg-gray-700 text-gray-300">
                <tr>
                    <th class="p-3 w-64">유저 ID</th>
                    <th class="p-3">보유 직업</th>
                    <th class="p-3 w-20 text-center admin-only-placeholder">관리</th>
                </tr>
            </thead>
            <tbody>
    `;
    tableHtml += users.map(([userId, userData]) => {
        const jobs = userData.jobs || [];
        const hasJobs = jobs.length > 0;
        const jobsHtml = hasJobs ? jobs.map(jobName => {
            const jobData = getJobData(jobName);
            const imgSrcAttr = jobData?.imageUrl ? `src="${jobData.imageUrl}"` : '';
            return `
            <div class="inline-flex items-center gap-2 bg-gray-700 p-1.5 rounded-md mr-2 mb-1">
                <img ${imgSrcAttr} class="w-6 h-6 rounded" referrerpolicy="no-referrer">
                <span class="text-sm font-medium pr-1">${jobName}</span>
                <button class="btn btn-danger btn-sm p-1 h-6 w-6 remove-job-btn admin-only" data-user-id="${userId}" data-job-name="${jobName}">
                    <i data-lucide="x" class="icon-xs pointer-events-none"></i>
                </button>
            </div>`;
        }).join('') : `<p class="text-sm text-gray-400">등록된 직업이 없습니다.</p>`;

        return `
        <tr class="border-b border-gray-700 hover:bg-gray-800">
            <td class="p-3 font-bold align-top">${userId}</td>
            <td class="p-3">${jobsHtml}</td>
            <td class="p-3 text-center align-top admin-only-placeholder">
                <button class="btn btn-danger btn-sm p-1.5 delete-user-char-mgmt-btn admin-only" title="유저 삭제" data-user-id="${userId}">
                    <i data-lucide="user-x" class="icon-xs"></i>
                </button>
            </td>
        </tr>`;
    }).join('');
    tableHtml += `
            </tbody>
        </table>
    </div>
    `;
    characterListDiv.innerHTML = tableHtml;
    lucide.createIcons();
}
function renderPointTable(){const e=Object.entries(state.users).sort((e,t)=>(t[1].points||0)-(e[1].points||0));pointTableBody.innerHTML=e.map(([e,t],n)=>{const r=state.pointLog.filter(t=>t.userId===e).sort((e,t)=>new Date(t.timestamp)-new Date(e.timestamp))[0],a=t.points||0,o=a>=0?"text-blue-400":"text-red-400";return`<tr class="border-b border-gray-700 hover:bg-gray-800"><td class="p-2 font-semibold text-center">${n+1}</td><td class="p-2"><input type="checkbox" class="form-checkbox h-5 w-5 rounded user-select-checkbox admin-only" data-id="${e}"></td><td class="p-2 font-medium">${e}</td><td class="p-2 font-bold text-lg ${o}">${a.toFixed(1)}</td><td class="p-2 text-sm text-gray-400">${r?new Date(r.timestamp).toLocaleString("ko-KR"):"N/A"}</td><td class="p-2 text-center admin-only-placeholder"><button class="btn btn-danger btn-sm p-1.5 delete-user-btn admin-only" title="유저 정보 완전삭제" data-id="${e}"><i data-lucide="trash-2" class="icon-xs"></i></button></td></tr>`}).join(""),lucide.createIcons()}
function toggleAdminMode(e){document.body.classList.toggle("admin-mode",e)}function toggleTheme(){document.documentElement.classList.toggle("light"),document.documentElement.classList.toggle("dark")}function populateBossSelect(){bossSelect.innerHTML="",Object.keys(DB.bosses).forEach(e=>{bossSelect.innerHTML+=`<option value="${e}">${DB.bosses[e].name}</option>`})}function updateItemPickVisibility(){const e=state.teamManagement.settings.boss,t="lazarus"!==e&&"gaia"!==e,n=document.getElementById("item-pick-section").parentElement;if(n){n.style.display=t?"block":"none"}document.querySelectorAll(".item-pick-header, .item-pick-cell").forEach(e=>{e.style.display=t?"table-cell":"none"})}function updateCheckedUserCount(){const e=document.querySelectorAll(".user-select-checkbox:checked").length;checkedUserCountSpan.textContent=e>0?`${e}명 선택됨`:""}
function handleAutocomplete(e){const t=e.value.toLowerCase(),n=e.parentElement;document.querySelectorAll('.autocomplete-results').forEach(el=>el.remove());if(t){const r=Object.keys(state.users).filter(e=>e.toLowerCase().startsWith(t));if(r.length>0){const a=document.createElement("div");a.className="autocomplete-results",r.forEach(t=>{const r=document.createElement("div");r.className="autocomplete-item",r.textContent=t,r.addEventListener("click",()=>{e.value=t;a.remove();e.dispatchEvent(new Event("input",{bubbles:!0}));e.dispatchEvent(new Event("change",{bubbles:!0}));if(e.id==="search-user-id"){handleSearchPoints()}}),a.appendChild(r)}),n.appendChild(a)}}}
function validateManualItemPicks() {
    const warningEl = document.getElementById('item-dupe-warning');
    const allSelects = document.querySelectorAll('.item-pick-select');
    warningEl.classList.add('hidden');
    warningEl.textContent = '';
    allSelects.forEach(s => s.classList.remove('item-dupe-error'));
    if (state.teamManagement.settings.autoDistributeOn) {
        return;
    }
    const itemPicks = [];
    document.querySelectorAll('.item-pick-select').forEach(select => {
        if (select.value) {
            itemPicks.push(select.value);
        }
    });
    const counts = itemPicks.reduce((acc, value) => {
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
    const duplicates = Object.keys(counts).filter(item => counts[item] > 1);
    if (duplicates.length > 0) {
        warningEl.textContent = `아이템 중복: ${duplicates.join(', ')}`;
        warningEl.classList.remove('hidden');
        allSelects.forEach(select => {
            if (duplicates.includes(select.value)) {
                select.classList.add('item-dupe-error');
            }
        });
    }
}

init();