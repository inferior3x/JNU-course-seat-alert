//need modal.js

async function fetchByPost(path, bodyData, funcForNotError, funcForError) {
    try {
        const response = await fetch(path, {
          method: "POST",
          body: JSON.stringify(bodyData),
          headers: { "Content-Type": "application/json" },
        });
        if (response.status === 401){
          showOkModal("계정이 로그아웃되었습니다.", ()=>{window.location.href = '/login';});
          return;
        }
        if (response.ok) {
          const responseData = await response.json();
          if (!responseData.error) {
            funcForNotError(responseData);
          } else {
            funcForError(responseData);
          }
        } else {
          showOkModal("다시 시도해주세요.");
          return;
        }
      } catch (error) {
        console.log(error);
        showOkModal("네트워크 오류가 발생했습니다.");
      }
}

async function fetchByGet(path, funcForNotError, funcForError) {
  try {
    const response = await fetch(path);
    if (response.status === 401){
      showOkModal("계정이 로그아웃되었습니다.", ()=>{window.location.href = '/login';});
      return;
    }
    if (response.ok) {
      const responseData = await response.json();
      if (!responseData.error){
        funcForNotError(responseData);
      }else{
        funcForError(responseData);
      }
    } else {
      showOkModal('다시 시도해주세요.');
      return;
    }
  } catch (error) {
    console.log(error);
    showOkModal('네트워크 오류가 발생했습니다.');
  }
}