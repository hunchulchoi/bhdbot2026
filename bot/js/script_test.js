import nxtUtilEsm from "../../js/nxt/nxtUtil.esm.js";

export const unboxingToken = (token, TgrInfo)=>{

  const myData = JSON.parse(pako.inflate(nxtUtilEsm.base64ToByte(token), {to: 'string'}));

  console.debug('myData', myData)

  const { tgrSxClCd, tgrAg} = nxtUtilEsm.calcSsn(myData.pseInfo.pseRrno, myData.bseYr)

  const pseInfo = new TgrInfo({
    usrFnm: myData.pseInfo.pseFnm,
    rrno: myData.pseInfo.pseRrno,
    wlfInst: myData.pseInfo.wlfInstCd,
    instNm: myData.pseInfo.instNm,
    sxClCd: tgrSxClCd,
    age: tgrAg,
    isrrClCd: '0',
  });

  let spsCop = false;

  const fmlInfo = myData.fmlInfo?.map(f=> {
    const fml = new TgrInfo({
      usrFnm: f.name,
      rrno: f.rrno,
      sxClCd: f.sxClCd,
      age: f.age,
      isrrClCd: f.isrrClCd,
      cellPhoneNo: f.tel,
    });

    if(f.isrrClCd === '1') spsCop = f.isCop;

    return fml;
  }) || [];



  console.debug('fmlInfo', fmlInfo)

  const {wlfInst} = myData;

  // 테스트 모드 표시
  const footer = document.querySelector('footer div');

  if(!footer.innerText.includes('테스트')){
    footer.classList.add('text-warning', 'fs-4', 'text-center')
    footer.innerHTML = ''

    const span = document.createElement('div');
    span.classList.add('col-8');
    span.innerHTML = '<em class="bi bi-robot text-info"></em> 테스트 모드 입니다.'

    function changeCor(rgb){

      console.log('changeCor', rgb, `#${rgb.split(',').map(d=>d.replaceAll(/\D/g, '')).map(d=>componentToHex(d)).join('')}`)

      return `#${rgb.split(',').map(d=>d.replaceAll(/\D/g, '')).map(d=>componentToHex(d)).join('')}`
    }

    function componentToHex(component) {
      const hex = parseInt(component).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }

    const inputGroup = document.createElement('div');
    inputGroup.classList.add('row');


    if(Array.from(document.styleSheets).find(s=>s.href?.includes('main.css'))){

      const cssRules = [...Array.from(document.styleSheets).find(s=>s.href?.includes('main.css')).cssRules]
  console.log('cssRules', cssRules)


      //document.querySelector('.header').getComputedStyle(inputGroup).display = 'none'

      const div1 = document.createElement('div');
      div1.classList.add('col-1', 'px-2');

      const colorChat = document.createElement('input');
      colorChat.classList.add('form-control', 'form-control-color', 'me-2');
      colorChat.type = 'color'

      const chatCssRule = cssRules.find(x=>x.selectorText==='.message');

      colorChat.value = changeCor(chatCssRule.style.backgroundColor);

      console.log('colorChat', chatCssRule.style.backgroundColor, chatCssRule)

      colorChat.addEventListener('change', (evt)=>{
        console.log('change', chatCssRule.style.backgroundColor, '->', `${evt.target.value}!important;`)
        chatCssRule.style.cssText = `color: rgb(34,34,38);background-color: ${evt.target.value}!important;`

        console.log('changed', chatCssRule.style)
      });

      div1.appendChild(colorChat);

      const div2 = document.createElement('div');
      div2.classList.add('col-1', 'px-2');

      const colorBg = document.createElement('input');
      colorBg.classList.add('form-control', 'form-control-color', 'me-2');
      colorBg.type = 'color'

      const bgCssRule = cssRules.find(x=>x.selectorText==='.card');
      colorBg.value = changeCor(bgCssRule.style.backgroundColor);

  console.log('colorBg', bgCssRule.style.backgroundColor)

      colorBg.addEventListener('change', (evt)=>{
        console.log('change bg', bgCssRule.style.backgroundColor, '->', evt.target.value)
        bgCssRule.style.backgroundColor = evt.target.value
      });

      div2.appendChild(colorBg);

      const div3 = document.createElement('div');
      div3.classList.add('col-2');

      const colorHeader = document.createElement('input');
      colorHeader.classList.add('form-control', 'form-control-color', 'me-4');
      colorHeader.type = 'color'

      const headerCssRUle = cssRules.find(x=>x.selectorText==='.card-header');
      colorHeader.value = changeCor(headerCssRUle.style.backgroundColor);

      console.log('colorHeader', headerCssRUle.style.backgroundColor)

      colorHeader.addEventListener('change', (evt)=>headerCssRUle.style.backgroundColor = evt.target.value);

      div3.appendChild(colorHeader);

      span.addEventListener('click', ()=>alert(`${colorChat.value},
${colorBg.value},
${colorHeader.value}`))

      inputGroup.appendChild(div1)
      inputGroup.appendChild(div2)
      inputGroup.appendChild(div3)


    }

    inputGroup.appendChild(span)

    footer.appendChild(inputGroup);

  }

  //const breadCurmbs = myData.rtnList.map(d => d.isrPrdNm);

  return {pseInfo, wlfInst, fmlInfo, spsCop, 'rtnList': myData.rtnList}

}
