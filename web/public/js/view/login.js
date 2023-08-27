const idElement = document.querySelector("#user-id");
const pwElement = document.querySelector("#user-pw");
const pushTokenElement = document.querySelector("#push-token");
const loginBtnElement = document.querySelector("#spotlight-btn");
const csrfElement = document.querySelector("#_csrf");

const login = _.throttle(async () => {
  const bodyData = {
    'user-id': idElement.value,
    'user-pw': pwElement.value,
    'push-token': pushTokenElement.value,
  };
  bodyData._csrf = csrfElement.value;
  
  showSpinner();
  await fetchByPost("/login", 
    bodyData, 
    () => {window.location.href = "/course"},
    (responseData) => {showOkModal(responseData.message)},
  );
  hideSpinner();

}, 1500);

loginBtnElement.addEventListener("click", login);