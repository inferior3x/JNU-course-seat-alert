
function setErrorInputData(req, errorMessage, data, action) {
    req.session.inputData = {
        error: true,
        message: errorMessage,
        ...data
    }
    req.session.save(action);
}
function getErrorInputData(req){
    const inputData = req.session.inputData;
    req.session.inputData = null;
    return inputData;
}
function getEmptyInputData(data){
    const inputData = {
        error: false,
        ...data,
    }
    return inputData;
}
module.exports = {setErrorInputData:setErrorInputData, getErrorInputData:getErrorInputData, getEmptyInputData:getEmptyInputData};