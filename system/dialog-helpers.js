const {dialog} = require('electron');

function sendErrorRes(res, incomingErrorResMessage) {
  showAlert(incomingErrorResMessage);
  res.json({ success: false, message: incomingErrorResMessage });
  return;
};
function showAlert(message) {
  const options = {
    type: 'info',
    buttons: ['OK'],
    title: 'Error',
    message: message,
    modal:true
  };
  dialog.showMessageBox(null, options);
};

module.exports = {
  sendErrorRes,
  showAlert
};