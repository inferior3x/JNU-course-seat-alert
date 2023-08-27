const idElement = document.querySelector("#user-id");
const pwElement = document.querySelector("#user-pw");
const pw2Element = document.querySelector("#user-pw2");
const signupBtnElement = document.querySelector("#spotlight-btn");
const csrfElement = document.querySelector("#_csrf");

const signup = _.throttle(async () => {
    const bodyData = {
      'user-id': idElement.value,
      'user-pw': pwElement.value,
      'user-pw2': pw2Element.value,
    };
    bodyData._csrf = csrfElement.value;

    showSpinner();
    await fetchByPost("/signup", 
      bodyData, 
      () => {window.location.href = "/login"},
      (responseData) => {showOkModal(responseData.message)},
    );
    hideSpinner();
    
  }, 1500);

signupBtnElement.addEventListener("click", signup);