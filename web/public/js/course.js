//header - course adder
const nameElement = document.querySelector("#name");
const codeElement = document.querySelector("#code");
const gradeElement = document.querySelector("#grade");
const typeElement = document.querySelector("#type");
const addCourseBtnElement = document.querySelector("#add-course-btn");
const csrfElement = document.querySelector("#_csrf");
//alert
//const messageElement = document.querySelector("#message");
//show course
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
  try {
    const response = await fetch("/fetch-course");
    const responseData = await response.json();
    hideSpinner();
    if (response.ok) {
      if (responseData.courses) {
        courseSectionElement.innerHTML = "";
        courseSectionElement.appendChild(
          coursesUlGenerator(responseData.courses)
        );
        const deleteCourseBtnElement = document.querySelectorAll(".delete-course-btn");
        deleteCourseBtnElement.forEach((button) =>
          button.addEventListener("click", deleteCourse)
        );
        return;
      }
      courseSectionElement.innerHTML = "<p> 알림 받을 과목이 없습니다</p>";
    } else {
      alert("failed");
      return;
    }
  } catch (error) {
    // console.log(error.message);
    alert("networking error");
    hideSpinner();
  }
}

const addCourse = _.throttle(async (event) => {
  showSpinner();
  event.preventDefault();
  const bodyData = {
    name: nameElement.value,
    code: codeElement.value.toUpperCase(),
    grade: gradeElement.value,
    type: typeElement.value,
  };
  bodyData._csrf = csrfElement.value;

  try {
    const response = await fetch("/add-course", {
      method: "POST",
      body: JSON.stringify(bodyData),
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();
    hideSpinner();
    if (response.ok) {
      if (!responseData.error) {
        await fetchCourse();
        //alert('신청되었습니다.');
        //messageElement.textContent = "신청되었습니다.";
      } else {
        alert(responseData.message);
        // messageElement.textContent = responseData.message;
      }
    } else {
      alert("failed");
      return;
    }
  } catch (error) {
    alert("networking error");
    hideSpinner();
  }
}, 1500);

const deleteCourse = _.throttle(async (event) => {
  showSpinner();
  event.preventDefault();

  const selectedCode = event.target.parentElement.parentElement.querySelector(".code-span").textContent;
  const bodyData = { code: selectedCode };
  bodyData._csrf = csrfElement.value;
  //Object.assign(bodyData, { _csrf: csrfElement.value });

  try {
    const response = await fetch("/delete-course", {
      method: "POST",
      body: JSON.stringify(bodyData),
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();
    hideSpinner();
    if (response.ok) {
      if (!responseData.error) {
        await fetchCourse();
        //alert('삭제되었습니다.');
        // messageElement.textContent = "삭제되었습니다.";
      } else {
        alert(responseData.message);
        // messageElement.textContent = responseData.message;
      }
    } else {
      alert("failed");
      return;
    }
  } catch (error) {
    showSpinner();
    alert("networking error");
  }
}, 500);

fetchCourse();
addCourseBtnElement.addEventListener("click", addCourse);