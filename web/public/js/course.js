//header - course adder
const nameElement = document.querySelector("#name");
const codeElement = document.querySelector("#code");
const gradeElement = document.querySelector("#grade");
const typeElement = document.querySelector("#type");
const addCourseBtnElement = document.querySelector("#add-course-btn");
const csrfElement = document.querySelector("#_csrf");

//alert
const messageElement = document.querySelector("#message");

//show course
const courseSectionElement = document.querySelector("#course-section");

function coursesUlGenerator(courses) {
  const ulElement = document.createElement("ul");
  ulElement.id = "courses-list";
  for (const course of courses) {
    course.type = course.type === "1" ? "타과" : "자과";
    course.alerted = course.alerted == true ? "O" : "X";
    const liElement = document.createElement("li");
    ulElement.appendChild(liElement);
    liElement.innerHTML = `
        <span class="name_span">${course.name}</span>
        <span class="code_span">${course.code}</span>
        <span class="type_span">${course.type}</span>
        <span class="alerted_span">${course.alerted}</span>
        <button type="button" class="delete-course">삭제</button>
    `;
  }
  return ulElement;
}

async function fetchCourse() {
  try {
    const response = await fetch("/fetch-course");
    const responseData = await response.json();

    if (response.ok) {
      if (responseData.courses) {
        courseSectionElement.innerHTML = "";
        courseSectionElement.appendChild(
          coursesUlGenerator(responseData.courses)
        );
        const deleteCourseBtnElement = document.querySelectorAll(".delete-course");
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
    alert("networking error");
  }
}

const addCourse = _.throttle(async (event) => {
  console.log("did");
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

    if (response.ok) {
      if (!responseData.error) {
        await fetchCourse();
        messageElement.textContent = "신청되었습니다.";
      } else {
        messageElement.textContent = responseData.message;
      }
    } else {
      alert("failed");
      return;
    }
  } catch (error) {
    alert("networking error");
  }
}, 1500);

const deleteCourse = _.throttle(async (event) => {
  event.preventDefault();

  const selectedCode = event.target.parentElement.querySelector(".code_span").textContent;
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
    if (response.ok) {
      if (!responseData.error) {
        await fetchCourse();
        messageElement.textContent = "삭제되었습니다.";
      } else {
        messageElement.textContent = responseData.message;
      }
    } else {
      alert("failed");
      return;
    }
  } catch (error) {
    alert("networking error");
  }
}, 500);

fetchCourse();
addCourseBtnElement.addEventListener("click", addCourse);
