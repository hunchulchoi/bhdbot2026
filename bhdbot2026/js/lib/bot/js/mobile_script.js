function __confirmPrivacy(privacyNotice){

  console.log('__confirmPrivacy', privacyNotice);


  const step = this.pseInfo.confirms.findIndex(c => !c)

  if(step === 0){
    const listGroup = document.querySelector('div.list-group')
    listGroup.innerHTML = '';

    Object.keys(privacyNotice).forEach(k=>{
      const _a = document.createElement('a')
      _a.classList.add('list-group-item', 'list-group-item-action')
      _a.innerText = privacyNotice[k].title
      _a.href = '#none'

      const _span = document.createElement('span');
      _span.classList.add('ms-4', 'px-2', 'text-center', 'rounded');

      _a.append(_span);

      _a.addEventListener('click', (evt)=>this.showPrivacyOffCanvas(k.replace(/\D/g, ''), this.bseYr, _span))

      listGroup.appendChild(_a);
    })

  }