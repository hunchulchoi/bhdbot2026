function validateUser(){

}

function throwException(){
  const data = {
    message
    , pseInfo: this.pseInfo
    , wlfInst: this.wlfInst
    , selected: this.selected
    , questions: this.questions
    , spsInfo: this.spsInfo
    , chldINfo: this.chldInfo
  }

  console.error('오류 발생', data);

  throw message;

  return false;
}


function __validateUser(){

  return new Promise((resolve,reject)=>{

    document.querySelector('#usrFnm').focus();

    const usrRrno = document.querySelector('#usrRrno');

    usrRrno.inputmask?.remove();

    Inputmask({mask: "999999-9999999", keepStatic: true, placeholder: '0', autoUnmask: true}).mask(usrRrno);

    document.querySelector('#nextBtn1').onclick = () =>{
      return resolve();
    }

  })

}

function __confirmPrivacy(privacyNotice){

  console.log('__confirmPrivacy', privacyNotice);

  const _stepper = document.querySelector('#privacyStepper>div.bs-stepper-header');
  _stepper.innerHTML = ''


  Object.keys(privacyNotice).forEach((k, index)=>{

    if(index){
      const _line = document.createElement('div');
      _line.classList.add('line');
      _stepper.appendChild(_line);
    }

    const _step = document.createElement('div')
    _step.classList.add('step');

    //_step.dataset.target = `#${k}-content`

    const _button = document.createElement('button');
    _button.classList.add('step-trigger');
    _button.role = 'tab';
    _button.style.flexWrap = 'nowrap';

    //_button.setAttribute('aria-controls', `${k}-content`)
    _button.id = `${k}-trigger`

    const thisStep = k.replaceAll(/\D/g, '');
    _button.onclick = ()=>this.showPrivacyOffCanvas(thisStep, this.bseYr, document.querySelector(`#step${thisStep}-trigger`))

    const _span1 = document.createElement('span');
    _span1.classList.add('bs-stepper-circle')
    _span1.innerText = index+1;

    const _span2 = document.createElement('span');
    _span2.classList.add('bs-stepper-label')
    _span2.style.cssText = 'word-break: break-all;overflow-wrap: break-word;'
    _span2.innerText = privacyNotice[k].title;

    _button.appendChild(_span1);
    _button.appendChild(_span2);
    _step.appendChild(_button);

    _stepper.appendChild(_step);

  })

}

export {__validateUser, __confirmPrivacy}
