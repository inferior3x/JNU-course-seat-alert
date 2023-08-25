const idElement = document.querySelector("#user-id");
const pwElement = document.querySelector("#user-pw");
const pushTokenElement = document.querySelector("#push-token");
const loginBtnElement = document.querySelector("#spotlight-btn");
const csrfElement = document.querySelector("#_csrf");

const login = _.throttle(async (event) => {
    showSpinner();
    event.preventDefault();
    const bodyData = {
      'user-id': idElement.value,
      'user-pw': pwElement.value,
      'push-token': pushTokenElement.value,
    };
    bodyData._csrf = csrfElement.value;
  
    try {
      const response = await fetch("/login", {
        method: "POST",
        body: JSON.stringify(bodyData),
        headers: { "Content-Type": "application/json" },
      });
      const responseData = await response.json();
      hideSpinner();
      if (response.ok) {
        if (!responseData.error) {
            window.location.href = '/course'
        } else {
          alert(responseData.message);
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

loginBtnElement.addEventListener("click", login);