

/**
 * 메지지 창 생성
 * @param question {object} - 질문객체
 * @param input {boolean} - input 필요한지
 * @return {HTMLDivElement|*}
 */
const messagediv = (question, input = false) => {

  const { message, options, optionFunc, data } = question;

  const third = document.createElement('div');
  const thirdClasses = ['flex-shrink-1', 'bg-light', 'rounded', 'py-2', 'px-3'];
  third.classList.add(...thirdClasses);

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('mb-1', 'lead');

  msgDiv.innerHTML = message.includes('<') ? message : message.replaceAll('\n', '<br>');

  third.appendChild(msgDiv);

  // 입력창 있는 질문
  if (input) {

    const option = document.createElement('div');
    option.classList.add('rounded', 'p-3', 'mt-1', 'pointer');

    const _input = document.createElement('input');
    _input.classList.add('form-control', 'form-control-lg');

    option.appendChild(_input);

    third.appendChild(option);

    // 별도의 옵션 생성용 함수가 있는경우
  } else if (optionFunc) {

    optionFunc(data).forEach(o => third.appendChild(o))

  } else if (options) {

    // 보험 상품이 아닌 질문 옵션 만들기
    options.forEach(o => {
      const option = document.createElement('div');
      option.classList.add('rounded', 'bg-secondary', 'bg-opacity-10', 'p-3', 'mt-1', 'pointer');
      option.innerText = o.text;

      option.onclick = (evt) => {
        evt.target.classList.remove('bg-opacity-10')
        evt.target.classList.add('bg-opacity-25', 'fw-bold')

        // 대답한 질문에 또 대답할수 없도록 click 이벤트 회수
        const sibling = evt.target.parentElement.children;

        if (o.once ?? true) {

          for (let el of sibling) {
            el.onclick = undefined;
            el.classList.remove('pointer');
          }
        }

        console.log('o', o)

        o.callback?.(evt);

      }


      third.appendChild(option);
    })

    // 그냥 채팅 볼드
  } else {
    msgDiv.classList.add('fw-bold')
  }

  return third;
};

/**
 * 아바타 보여줌
 * @returns {HTMLDivElement}
 */
const avatar = () => {
  const second = document.createElement('div');
  second.classList.add('mx-2');

  const avatar = document.createElement('img');
  avatar.src = '/js/lib/bot/img/users/geps.gif';
  avatar.classList.add('rounded-circle', 'me-1');
  avatar.width = 40;
  avatar.height = 40;
  avatar.alt = '믿음이';

  second.appendChild(avatar);
  return second;
};

/**
 * 채팅시간 보여줌
 * @param classname {string} - 클래스 이름
 */
const timediv = (classname) => {
  const fourth = document.createElement('div');
  fourth.classList.add('ms-2');

  const timeDiv = document.createElement('div');
  timeDiv.classList.add('text-muted', 'small', 'text-nowrap', 'mt-2');
  timeDiv.textContent = moment().locale('ko').format('a h:mm');
  timeDiv.classList.add(classname);

  fourth.appendChild(timeDiv);
  return fourth;
};


/**
 * 채팅창 생성
 * @param question {{message, options, data}| string}
 * @param noneedTime {boolean=false} - 채팅창에 시간표시 할건지
 */
const chat = (question, noneedTime = false) => {

  return new Promise((resolve, reject) => {

    if (typeof question === 'string') question = ({ message: question })

    const first = document.createElement('div');
    first.classList.add('other', 'pb-4');
    document.getElementById('messages').appendChild(first);

    // 아바타
    first.appendChild(avatar());

    // 메세지
    const messageDiv = messagediv(question);
    messageDiv.classList.add('message-friend');
    first.appendChild(messageDiv);


    //시간
    if (!noneedTime) first.appendChild(timediv('ms-2'));

    // 질문 생성후 실행함수
    question.onRendered?.();

    first.focus()

    if (question.data?.delay) {
      setTimeout(() => {
        resolve()
      }, ((infoModal._isShown || infoModal._isTransitioning) ? 700 : 200) + question.data.delay)
    } else {
      resolve()
    }

  })

};

/**
 * 질문 했을때 대답
 * @param message {string}
 * @param options {{onRendered}}
 */
const answer = (message, options) => {

  return new Promise((resolve, reject) => {

    const first = document.createElement('div');
    first.classList.add('own', 'pb-4');
    document.getElementById('messages').appendChild(first);

    // 메세지
    const messageDiv = messagediv({ message });
    messageDiv.classList.add('message');
    first.appendChild(messageDiv);

    //시간
    first.appendChild(timediv('me-2'));

    options?.onRendered?.();

    if (options?.delay) {
      setTimeout(() => {
        resolve()
      }, ((infoModal._isShown || infoModal._isTransitioning) ? 700 : 200) + options.delay)
    } else {
      resolve()
    }
  })

};

const questionWithInput = (message) => {

  chat({ message });

  return input(message);
}

const input = (message) => {
  const first = document.createElement('div');
  first.classList.add('own', 'pb-4');
  document.getElementById('messages').appendChild(first);

  // 메세지
  const messageDiv = messagediv({ message }, true);
  messageDiv.classList.add('message');
  first.appendChild(messageDiv);

  //시간
  first.appendChild(timediv('me-2'));

  // input
  return first.querySelector('input');

};

/**
 * @typedef {Object} Button
 * @property {string?} text - 버튼에 표시할 글씨
 * @property {function?} callback - 버튼 눌렀을때 callback
 * @property {string?} confirmMessage - 컨펌 메세지
 */

/**
 * 파일 업로드
 * @param message {string} - 메세지
 * @param okButton {Button} - ok눌렀을때
 * @param cancelButton {Button} - cancel 눌렀을때
 * @param bootstrap {boostrap} - 부트스트랩
 */
const fileUpload = ({ message, okButton, cancelButton, bootstrap }) => {

  const input = questionWithInput(message);

  input.type = 'file';
  input.classList.add('form-control');
  input.accept = 'image/*,.pdf;capture=camera';

  // 이미지 업로드시 미리보기
  const div = input.parentElement;

  const previewDiv = document.createElement('div');
  previewDiv.classList.add('preview', 'row', 'my-1');

  const div2 = document.createElement('div');
  div2.classList.add('pt-2', 'text-end')

  /**
   * ok버튼
   * @type {HTMLButtonElement}
   */
  const button1 = document.createElement('button');
  button1.classList.add('btn', 'btn-primary');
  button1.innerText = '업로드';
  button1.dataset.bsToggle = 'popover'
  button1.dataset.bsTrigger = 'focus'
  button1.dataset.bsPlacement = 'top'
  //button1.dataset.bsTitle= '증빙서류를 업로드 하시겠습니까?'
  button1.dataset.bsContent = '업로드 하시겠습니까?';
  button1.disabled = true;

  /**
   * 업로드 버튼 클릭
   */
  button1.addEventListener('click', async (evt) => {

    if (!input.value) {
      return await alertMessage('파일 첨부 누락', '파일을 첨부해 주세요', 'danger');
    }

    if (okButton.confirmMessage) {
      const _confirm = await confirmMessage('안내', cancelButton.confirmMessage);

      if (!_confirm) return;
    }

    input.readOnly = 'readonly'
    input.classList.add('pe-none');

    //button2.remove();
    evt.target.parentElement.remove()
    //button1.remove();

    await okButton.callback?.(evt, input)

  });

  /**
   * 파일 첨부 했을때
   */
  input.addEventListener('change', (evt) => {

    return new Promise((resolve, reject) => {

      if (evt.target.files) {

        // FIXME: needInfo 켜놓음 태스트로
        imagePreview(evt.target.files, previewDiv, true)

        setTimeout(() => {

          const onLoaded = () => {
            button1.disabled = false;
            button1.focus()
            resolve()
          }

          const image = previewDiv.querySelector('img');

          // 업로드한 파일이 이미지가 아니거나 이미지가 로드된 경우
          if (!image || image.clientHeight) {
            onLoaded();
          } else {
            image.onload = (evt) => {
              console.log('image.onload', evt)
              onLoaded()
            }
          }

        }, 500)

      } else {
        previewDiv.innerHTML = ''
        button1.disabled = true;
        reject()
      }

    });

  });

  /**
   * 취소 버튼
   * @type {HTMLButtonElement}
   */
  const button2 = document.createElement('button');
  button2.classList.add('btn', 'btn-danger', 'me-1');
  button2.innerText = cancelButton?.text || '취소';

  button2.addEventListener('click', async (evt) => {

    if (cancelButton.confirmMessage) {
      const _confirm = await confirmMessage('업로드 취소', cancelButton.confirmMessage, 'warning');

      if (!_confirm) return;
    }

    input.readOnly = true
    input.disabled = true;
    input.classList.add('pe-none');

    previewDiv.innerHTML = ''

    evt.target.parentElement.remove();

    cancelButton.callback?.(evt)

  });

  div2.appendChild(button2);
  div2.appendChild(button1);

  div.appendChild(previewDiv);
  div.appendChild(div2);

  new bootstrap.Popover(button1);

  //scrollTo();
}


/*infoModal._element.addEventListener('hidden.bs.modal', () => {
  console.log('hidden.bs.modal')
})

infoModal._element.addEventListener('hide.bs.modal', () => {
  console.log('hide.bs.modal')
})*/

/**
 *
 * @param title {string} - 제목
 * @param message {string} - 메세지
 * @param bsColor {'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark'} - 부트스트랩 색상 모달의 헤더 색깔로 쓰임
 */
async function alertMessage(title, message, bsColor = 'primary') {

  console.debug('alertMessage infoModal', infoModal._isShown, infoModal._isTransitioning, infoModal);
  //console.dir(infoModal)
  const okButton = document.createElement('button');

  setTimeout(() => {

    alertDialog(title, message, bsColor);
    infoModal._dialog.querySelector('.modal-footer').innerHTML = '';

    okButton.classList.add('btn', 'btn-md', 'btn-primary', 'w-25', 'bi', 'bi-check2-all');
    okButton.dataset.bsDismiss = 'modal';
    okButton.innerText = ' 확인';

    infoModal._dialog.querySelector('.modal-footer').append(okButton);

    infoModal.show();

  }, (infoModal._isShown || infoModal._isTransitioning) ? 700 : 100)

  return new Promise((resolve, reject) => {
    okButton.addEventListener('click', () => {
      resolve(true)
    })
  });
}

/**
 *
 * @param title
 * @param message
 * @param options {{bsColor, onLoaded, onDispose, footer, okButton, cancelButton}}
 * @return {Promise<unknown>}
 */
async function customConfirmMessage(title, message, options) {


  try {
    let okButton;
    let cancelButton;

    const footer = infoModal._dialog.querySelector('.modal-footer');
    footer.innerHTML = '';

    if (options?.footer) {

      footer.innerHTML = options.footer;

      okButton = document.querySelector('button[name=okButton]')
      cancelButton = document.querySelector('button[name=cancelButton]')

    } else {

      okButton = document.createElement('button');
      cancelButton = document.createElement('button');

      okButton.classList.add('w-25', 'btn', 'btn-lg', 'btn-primary', 'bi', 'bi-check2-all');
      okButton.name = 'okButton'
      okButton.dataset.bsDismiss = 'modal';
      okButton.innerText = options?.okButton?.text || ' 네';

      cancelButton.classList.add('btn', 'btn-lg', 'btn-danger', 'bi', 'bi-x-circle-fill');
      cancelButton.dataset.bsDismiss = 'modal';
      cancelButton.name = 'cancelButton'
      cancelButton.innerText = options?.cancelButton?.text || ' 아니오';

      footer.append(okButton);
      footer.append(cancelButton);
    }

    setTimeout(() => {

      alertDialog(title, message, options?.bsColor);

      options?.onLoaded?.()

      infoModal.show();

    }, (infoModal._isShown || infoModal._isTransitioning) ? 700 : 100)

    return new Promise((resolve, reject) => {
      okButton.addEventListener('click', async (event) => {
        console.debug('okButton click===============', event)

        if (options?.okButton?.callback) {

          const r = await options.okButton.callback();

          console.debug('okButton', r)

          if (!r) {
            return false;
          }

        }

        infoModal.hide()
        options?.onDispose?.()

        resolve(true)
      })
      cancelButton?.addEventListener('click', async () => {

        if (options?.cancelButton?.callback) {

          const r = await options.cancelButton.callback();

          console.debug('cancelButton', r)

          if (!r) {
            return false;
          }
        }

        infoModal.hide()
        options?.onDispose?.()

        resolve(false)
      })
    });

  } catch (exception) {
    console.error(exception)
  }

}

/**
 * @typedef {'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark'} BsColor
 */

/**
 *
 * @param title {string} - 제목
 * @param message {string} - 메세지
 * @param bsColor {BsColor} - 부트스트랩 색상 모달의 헤더 색깔로 쓰임
 * @param onLoaded {function} - confirm창이 로딩되고 난후 실행될 함수
 * @return {Promise<boolean>}
 */
async function confirmMessage(title, message, bsColor = 'warning', onLoaded) {


  try {
    const okButton = document.createElement('button');
    const cancelButton = document.createElement('button');

    setTimeout(() => {

      alertDialog(title, message, bsColor);

      infoModal._dialog.querySelector('.modal-footer').innerHTML = '';

      okButton.classList.add('w-25', 'btn', 'btn-lg', 'btn-primary', 'bi', 'bi-check2-all');
      okButton.name = 'okButton'
      okButton.dataset.bsDismiss = 'modal';
      okButton.innerText = ' 네';

      cancelButton.classList.add('btn', 'btn-lg', 'btn-danger', 'bi', 'bi-x-circle-fill');
      cancelButton.dataset.bsDismiss = 'modal';
      cancelButton.name = 'cancelButton'
      cancelButton.innerText = ' 아니오';

      infoModal._dialog.querySelector('.modal-footer').append(okButton);
      infoModal._dialog.querySelector('.modal-footer').append(cancelButton);

      if (onLoaded) {
        infoModal.addEventListener('shown.bs.modal', onLoaded);
        infoModal.addEventListener('hidePrevented.bs.modal', () => {
          infoModal.removeEventListener('shown.bs.modal', onLoaded);
        });
      }

      infoModal.show();

    }, (infoModal._isShown || infoModal._isTransitioning) ? 700 : 100)


    //console.debug('confirmMessage3', title, message, bsColor, infoModal)

    return new Promise((resolve, reject) => {
      okButton.addEventListener('click', () => {
        resolve(true)
      })
      cancelButton.addEventListener('click', () => {
        resolve(false)
      })
    });

  } catch (exception) {
    console.error(exception)
  }

}


/**
 *
 * @param title {string} - 제목
 * @param message {string} - 메세지

 * @param bsColor {'primary'|'secondary'|'success'|'danger'|'warning'|'info'|'light'|'dark'} - 부트스트랩 색상 모달의 헤더 색깔로 쓰임
 */
function alertDialog(title, message, bsColor = 'primary') {

  //console.debug('alertDialog', title, message, bsColor);

  let textColor = 'black';
  let bi = 'info-square-fill'

  switch (bsColor) {
    case 'primary':
      textColor = 'light';
      break;
    case 'secondary':
      textColor = 'light';
      break;
    case 'success':
      textColor = 'light';
      break;
    case 'dark':
      textColor = 'light';
      break;
    case 'danger':
      textColor = 'light';
      bi = 'exclamation-triangle-fill'
      break;
    case 'warning':
      bi = 'question-circle-fill'
      break;
    case 'info':
      break;
    case 'light':
      bi = 'info-square-fill'
      break;

  }
  const modalHeader = infoModal._dialog.querySelector('.modal-header');
  const modalTitle = infoModal._dialog.querySelector('.modal-title');

  const found = Array.from(modalHeader.classList).find(c => c.startsWith('bg-'));

  if (found) {
    modalHeader.classList.remove(found);
    modalTitle.classList.remove(...Array.from(modalTitle.classList).filter(c => c.startsWith('text-')));
    modalTitle.classList.remove(...Array.from(modalTitle.classList).filter(c => c.startsWith('bi')));
  }

  modalHeader.classList.add(`bg-${bsColor}`)
  modalTitle.classList.add(`text-${textColor}`, 'bi', `bi-${bi}`);
  modalTitle.textContent = ' ' + title;
  infoModal._dialog.querySelector('.info-message').innerHTML = message;
}



export { chat, answer, questionWithInput, fileUpload, alertMessage, confirmMessage, customConfirmMessage };
