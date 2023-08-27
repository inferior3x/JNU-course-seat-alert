//need modal.js

async function fetchByPost(path, bodyData, funcForNotError, funcForError) {
    try {
        const response = await fetch(path, {
          method: "POST",
          body: JSON.stringify(bodyData),
          headers: { "Content-Type": "application/json" },
        });
        const responseData = await response.json();
        if (response.ok) {
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
    const responseData = await response.json();
    if (response.ok) {
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