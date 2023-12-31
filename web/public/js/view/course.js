//header - course adder
const nameElement = document.querySelector("#name");
const codeElement = document.querySelector("#code");
const gradeElement = document.querySelector("#grade");
const typeElement = document.querySelector("#type");
const addCourseBtnElement = document.querySelector("#add-course-btn");
const csrfElement = document.querySelector("#_csrf");

//show course
const appliedCourseStatusElement = document.querySelector("#applied-course-status");
const courseSectionElement = document.querySelector("#course-section");

function coursesUlGenerator(courses) {
  const ulElement = document.createElement("ul");
  ulElement.id = "courses-list";
  for (const course of courses) {
    course.type = course.type === "1" ? "타과" : "자과";
    course.alerted = course.alerted == true ? "여석 존재" : "여석 없음";
    const liElement = document.createElement("li");
    ulElement.appendChild(liElement);

    liElement.innerHTML = `
      <div class="course-info">
        <span class="name-span">${course.name}</span>
        <span class="code-span">${course.code}</span>
        <span class="divide-span">|</span>
        <span class="type-span">${course.type}</span>
        <span class="divide-span">|</span>
        <span class="alerted-span">${course.alerted}</span>
      </div>
      <div class="delete-course">
        <button  class="delete-course-btn" type="button">삭제</button>
      <div>
    `;
  }
  return ulElement;
}

async function fetchCourse() {
  showSpinner();
  await fetchByGet("/fetch-course",
    (responseData) => {
      if (responseData.courses) {
        appliedCourseStatusElement.children[0].textContent = responseData.courses.length;
        appliedCourseStatusElement.children[1].textContent = 4;
        courseSectionElement.innerHTML = "";
        courseSectionElement.appendChild(coursesUlGenerator(responseData.courses));
        const deleteCourseBtnElement = document.querySelectorAll(".delete-course-btn");
        deleteCourseBtnElement.forEach((button) => button.addEventListener("click", deleteCourse));
      }else{
        courseSectionElement.innerHTML = "<p> 알림 받을 과목이 없습니다</p>";
      }
    },
    (responseData) => {showOkModal(responseData.error);},
  );
  hideSpinner();
}

const addCourse = _.throttle(async () => {
  const bodyData = {
    name: nameElement.value,
    code: codeElement.value.toUpperCase(),
    grade: gradeElement.value,
    type: typeElement.value,
  };
  bodyData._csrf = csrfElement.value;

  showSpinner();
  await fetchByPost("/add-course", 
      bodyData, 
      async () => {
        await fetchCourse();
        showOkModal('신청되었습니다.');},
      (responseData) => {showOkModal(responseData.message)},
  );
  hideSpinner();
}, 1500);

const deleteCourse = _.throttle(async (event) => {
  const selectedCode = event.target.parentElement.parentElement.querySelector(".code-span").textContent;
  const bodyData = { code: selectedCode };
  bodyData._csrf = csrfElement.value;

  showSpinner();
  await fetchByPost("/delete-course", 
      bodyData, 
      async () => {
        await fetchCourse();
        showOkModal('삭제되었습니다.');},
      (responseData) => {showOkModal(responseData.message)},
  );
  hideSpinner();
}, 500);

fetchCourse();

addCourseBtnElement.addEventListener("click", addCourse);