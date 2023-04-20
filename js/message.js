import { isEscEvent } from "./util.js";
// Вывод сообщений при отправке данных на сервер

// const bodyTag = document.querySelector('body');

// const errorButton = document.querySelector('#error')
//   .content
//   .querySelector('.error__button');

// let message = null;

// const onclick = () => {
//   closeMessage();
// };

// const onEscKeydown = (evt) => {
//   if (isEscEvent(evt)) {
//     evt.preventDefault();
//     closeMessage();
//   }
// };
// const closeMessage = () => {
//   bodyTag.removeChild(message);
//   document.removeEventListener('keydown', onEscKeydown);
//   document.removeEventListener('click', onclick);
// };

// const sendMessage = (messageStatus) => {
//   message = messageStatus.cloneNode(true);
//   bodyTag.appendChild(message);

//   document.addEventListener('keydown', onEscKeydown);
//   document.addEventListener('click', onclick);
//   errorButton.addEventListener('click', onclick);
// };

// export {sendMessage};


const closePopup = () => {
  if (document.querySelector('.success')) {
    document.querySelector('.success').remove();
  }
  if (document.querySelector('.error')) {
    document.querySelector('.error').remove();
  }
  document.removeEventListener('keydown', onPopupEscKeydown);
  document.removeEventListener('keydown', onPopupClick);
};

const onPopupEscKeydown = (evt) => {
  if (isEscEvent(evt)) {
    evt.preventDefault();
    closePopup();
  }
};

const onPopupClick = () => {
  closePopup();
};

const showSuccessMessage = () => {
  const successTemplate = document.querySelector('#success').content.querySelector('.success');
  const successMessage = successTemplate.cloneNode(true);
  successMessage.style.zIndex = 1000;
  document.querySelector('main').append(successMessage);
  document.addEventListener('keydown', onPopupEscKeydown);
  document.addEventListener('click', onPopupClick);
};

const showErrorMessage = (message) => {
  const errorTemplate = document.querySelector('#error').content.querySelector('.error');
  const errorMessage = errorTemplate.cloneNode(true);
  errorMessage.style.zIndex = 1000;
  if (message) {
    errorMessage.querySelector('p').textContent = message;
  }
  document.querySelector('main').append(errorMessage);
  document.addEventListener('keydown', onPopupEscKeydown);
  document.addEventListener('click', closePopup);
};
export {
showSuccessMessage,
  showErrorMessage
};
