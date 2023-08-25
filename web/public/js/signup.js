const idElement = document.querySelector("#user-id");
const pwElement = document.querySelector("#user-pw");
const pw2Element = document.querySelector("#user-pw2");
const signupBtnElement = document.querySelector("#spotlight-btn");
const csrfElement = document.querySelector("#_csrf");

const signup = _.throttle(async (event) => {
    showSpinner();
    event.preventDefault();
    const bodyData = {
      'user-id': idElement.value,
      'user-pw': pwElement.value,
      'user-pw2': pw2Element.value,
    };
    bodyData._csrf = csrfElement.value;
  
    try {
      const response = await fetch("/signup", {
        method: "POST",
        body: JSON.stringify(bodyData),
        headers: { "Content-Type": "application/json" },
      });
      const responseData = await response.json();
      hideSpinner();
      if (response.ok) {
        if (!responseData.error) {
            window.location.href = '/login'
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

signupBtnElement.addEventListener("click", signup);