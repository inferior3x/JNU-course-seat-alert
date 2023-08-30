const idElement = document.querySelector("#user-id");
const pwElement = document.querySelector("#user-pw");
const pw2Element = document.querySelector("#user-pw2");
const pushTokenElement = document.querySelector("#push-token");
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
      () => { //auto login
        showOkModal("가입되었습니다.", 
          async () => {
            delete bodyData['user-pw2'];
            bodyData['push-token'] = pushTokenElement.value;
            await fetchByPost("/login", 
              bodyData, 
              () => {window.location.href = "/course"},
              (responseData) => {showOkModal(responseData.message)},
            );
          }
        );
      },
      (responseData) => {showOkModal(responseData.message)},
    );
    hideSpinner();
  }, 1500);

signupBtnElement.addEventListener("click", signup);