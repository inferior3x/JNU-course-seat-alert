//overlay
const settingOverlayElement = document.querySelector("#setting-overlay");
//setting btn
const settingBtnElement = document.querySelector("#setting-btn");
const closeSettingBtnElement = document.querySelector("#close-setting-btn");
//feature btn of setting
const accountInitBtnElement = document.querySelector('#account-init-btn');
const accountDeleteBtnElement = document.querySelector('#account-delete-btn');
const logoutBtnElement = document.querySelector('#logout-btn');


async function initAccount() {
  const bodyData = {};
  bodyData._csrf = csrfElement.value;

  showSpinner();
  await fetchByPost("/init-account", 
    bodyData, 
    async () => {
      await fetchCourse();
      showOkModal('계정이 초기화되었습니다.');},
    (responseData) => {showOkModal(responseData.message)},
  );
  hideSpinner();
}

async function deleteAccount() {
  const bodyData = {};
  bodyData._csrf = csrfElement.value;

  showSpinner();
  await fetchByPost("/delete-account", 
    bodyData, 
    () => {window.location.href = '/signup'},
    (responseData) => {showOkModal(responseData.message)},
  );
  hideSpinner();
}

async function logout() {
  const bodyData = {};
  bodyData._csrf = csrfElement.value;
  
  showSpinner();
  await fetchByPost("/logout", 
    bodyData, 
    () => {window.location.href = '/login'},
    (responseData) => {showOkModal(responseData.message)},
  );
  hideSpinner();
}


//setting btn
settingBtnElement.addEventListener('click', () => {
    settingOverlayElement.style.left = '0%';
    //settingOverlayElement.style.display = 'none';
  });
closeSettingBtnElement.addEventListener('click', () => {
    settingOverlayElement.style.left = '100%';
    //settingOverlayElement.style.display = 'block';
});

//feature btn of setting 
accountInitBtnElement.addEventListener('click', () => {
    showQuestionModal('계정을 제외한 모든 데이터가 초기화됩니다.\n진행하시겠습니까?', initAccount);
});
accountDeleteBtnElement.addEventListener('click', () => {
    showQuestionModal('계정이 삭제됩니다.\n진행하시겠습니까?', deleteAccount);
});
logoutBtnElement.addEventListener('click', async () => {
    showQuestionModal('로그아웃 하시겠습니까?', logout);
});