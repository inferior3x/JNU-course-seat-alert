const nameElement = document.querySelector("#name");
const codeElement = document.querySelector("#code");
const gradeElement = document.querySelector("#grade");
const typeElement = document.querySelector("#type");
const addCourseBtnElement = document.querySelector("#add-course-btn");
const csrfElement = document.querySelector("#_csrf");
const errorMessageElement = document.querySelector("#error-message");


async function addCourse(event) {
  event.preventDefault();
  const courseInfo = {
    name: nameElement.value,
    code: codeElement.value,
    grade: gradeElement.value,
    type: typeElement.value,
  };
  Object.assign(courseInfo, {_csrf: csrfElement.value});

  try {
    const response = await fetch("/add-course", {
      method: "POST",
      body: JSON.stringify(courseInfo),
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();

    if (response.ok) {

        if (!responseData.error){
            //성공
            errorMessageElement.textContent = '신청되었습니다.';
            //과목 목록에 추가
        }else{
            //실패
            errorMessageElement.textContent = responseData.message;
        }
        
    } else {
      alert("failed"); //이 메세지 수정해야 함
      return;
    }
  } catch (error) {
    alert("networking error");
  }
}

addCourseBtnElement.addEventListener("click", addCourse);
