function copy(el){

    const _value = el.innerText?.trim();

   copyText(_value);
}

function copyText(_value){
  if (typeof(navigator.clipboard)=='undefined') {
    console.log('navigator.clipboard');
    var textArea = document.createElement("textarea");
    textArea.value = _value;
    textArea.style.position="fixed";  //avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      alertInfo(_value + ' 복사 했습니다.');
    } catch (err) {
      console.error(err, '클립보드 복사 실패');
      alertError('클립보드 복사 실패');
    }
    document.body.removeChild(textArea)

  }else{
    navigator.clipboard.writeText(_value);
    alertInfo(_value + ' 복사 했습니다.');
  }
}

function alertInfo(message){

  if(!bootstrap?.Alert){
    alert(message)
    return;
  }

    const _alert = document.createElement('div');
    _alert.classList.add('alert', 'alert-info', 'd-flex', 'align-items-center', 'opacity-75', 'fixed-bottom', 'fade');
    _alert.setAttribute('role', 'alert');

    _alert.innerHTML = `${message}`;

    const _close = document.createElement('button');
    _close.classList.add('btn-close', 'ms-5', 'text-danger');
    _close.dataset.bsDismiss = 'alert';
    _close.setAttribute('aria-label', 'Close');
    _close.setAttribute('type', 'button');

    _alert.appendChild(_close);

    document.body.prepend(_alert);
    const _el = bootstrap.Alert.getOrCreateInstance(_alert);

    window.setTimeout(()=> {
        _el.close();
    }, 2500);
}


function alertError(message){

  if(!bootstrap?.Alert){
    alert(message)
    return;
  }

    const _alert = document.createElement('div');
    _alert.classList.add('alert', 'alert-danger', 'd-flex', 'align-items-center', 'opacity-100', 'fixed-bottom', 'fade');
    _alert.setAttribute('role', 'alert');

    _alert.innerHTML = `${message}`;

    const _close = document.createElement('button');
    _close.classList.add('btn-close', 'ms-5', 'text-danger');
    _close.dataset.bsDismiss = 'alert';
    _close.setAttribute('aria-label', 'Close');
    _close.setAttribute('type', 'button');

    _alert.appendChild(_close);

    document.body.prepend(_alert);
    const _el = bootstrap.Alert.getOrCreateInstance(_alert);

    window.setTimeout(()=> {
        _el.close();
    }, 2500);
}

/**
 * 주민번호 형식 체크
 * @param rrno {string}
 * @return {boolean}
 */
function validateSsn(rrno) {

  const ssnPattern = /^\d{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])([1-8])\d{6}$/;

 /* 유효한 날짜인지 체크해야 되는데 momemnts.js가 필요함
  if(ssnPattern.test(rrno)){
    const i7 = rrno.substring(6,7)

    let birthYear = Number(rrno.substring(0, 2));

    switch(i7){
      case '1', '2', '5', '6':
        birthYear += 1900;
      case '3', '4', '7', '8':
        birthYear += 2000;
    }



  }
  else return false;*/

  const b = ssnPattern.test(rrno);

  if(!b) console.error('validateSsn', rrno, '->', b)

  return b;
}
/**
 * 파일크기를 kb, mb. gb로 보여줌
 * @param weight {number} 파일크기
 * @return radableKb {string} 파일크기를 kb, mb. gb로 보여줌
 */
const radableKb = (weight)=>{

  if(weight == null || weight == undefined || isNaN(weight) ) return;

  if(weight>1024*1024*1024){
     return `${(weight/(1024*1024*1024)).toFixed(2)}GB`;
  }else if(weight>1024*1024){
    return `${(weight/(1024*1024)).toFixed(2)}MB`;
  }else if(weight>1024){
    return `${(weight/(1024)).toFixed(2)}KB`;
  }else return `${weight.toLocaleString()}B`;
}

/**
 * 페이지 네이션을 만들 데이터를 계산한다.
 * @param total {number} 데이터 총 개수
 * @param amount {number} 한 페이지에 보여줄 데이터 개수
 * @param currentPageNo {number} 현재 페이지 1부터 시작한다.
 * @param paginationWidth {number} 페이지 네이션에 몇개를 보여줄지 최소 5 이상
 * @return {start, end, lastPage} {object} 시작, 끝, 마지막페이지
 */
const paginationData = (total, amount, currentPageNo, paginationWidth ) =>{

  // 페이지 네이션에서 시작이 중간보다 얼마나 떨어져 있는지 결정
  const paginationWidthHalfStart = parseInt(paginationWidth/2);
  const paginationWidthHalfEnd = parseInt(paginationWidth/2 -1 + (paginationWidth%2?1:0));

  const lastPage = parseInt((total/amount) + ((total%amount)?1:0));
  const start = (currentPageNo < paginationWidthHalfStart + 1)?1
    :(currentPageNo + paginationWidthHalfStart > lastPage)?lastPage-paginationWidth+1:currentPageNo -paginationWidthHalfStart;
  const end = (lastPage<paginationWidth || currentPageNo+paginationWidthHalfEnd>lastPage)?lastPage
    :(lastPage>paginationWidth && currentPageNo+paginationWidthHalfEnd<paginationWidth)?paginationWidth:currentPageNo+paginationWidthHalfEnd;

  return {start, end, lastPage};

}

/**
 * 부트스트랩 페이지 네이션을 그린다.
 * @param start {number} 페이지네이션의 시작 페이지
 * @param end {number} 페이지네이션의 끝 페이지
 * @param lastPage {number} 마지막 페이지 번호
 * @param currentPageNo {number} 현재 페이지 번호
 * @param pagination {HTMLUListElement} 부트스트랩 페이지네이션의 상위 ul객체
 * @param pageFunction {Function} 페이지 번호를 눌렀을때 호출하는 함수
 */
const drawBsPagination = (start, end, lastPage, currentPageNo, pagination, pageFunction) =>{

console.log('pageFunction', pageFunction)

  pagination.innerHTML = '';

  //처음
  const li1 = document.createElement('li');
  li1.classList.add('page-item', 'bg-primary-subtle');
  const a1 = document.createElement('a');
  a1.classList.add('page-link');
  a1.href = '#';
  a1.textContent= '처음';
  a1.addEventListener('click', (evt)=> pageFunction(1));

  li1.append(a1);
  pagination.append(li1);

  // 중간
  for(let pageNo = start; pageNo<=end; pageNo++){
    const li2 = document.createElement('li');
    li2.classList.add('page-item');
    const a2 = document.createElement('a');
    a2.classList.add('page-link');

    if(pageNo === currentPageNo) a2.classList.add('active');

    a2.href = 'javscript:void(0);';
    a2.textContent= pageNo;
    a2.addEventListener('click', (evt)=> pageFunction(pageNo));

    li2.append(a2);
    pagination.append(li2);

  }

  // 마지막
  const li3 = document.createElement('li');
  li3.classList.add('page-item');
  const a3 = document.createElement('a');
  a3.classList.add('page-link');
  a3.href = '#';
  a3.textContent= `마지막(${lastPage})`;
  a3.addEventListener('click', (evt)=> pageFunction(lastPage));

  li3.append(a3);
  pagination.append(li3);
}

/**
 * 이미지 선택시 미리보기
 * @param files {[file]} 파일 input에서 읽은 파일 input.files
 * @param previewEL {HTMLDivElement} 미리보기 할 el
 * @param needInfo=true {boolean} 파일 정보를 보여줄지 여부
 */
const imagePreview = (files, previewEL, needInfo=true)=>{

  console.log('files', files)

  previewEL.innerHTML = '';

  Array.from(files).forEach(f=>{
    const reader = new FileReader();

    reader.onload = (ev)=>{

      if(f.type.startsWith('image/')){

        const img = document.createElement('img');
        img.src = ev.target.result
        img.title = `${f.name} - ${radableKb(f.size)}`

        img.onload = (evt)=>{
          if(needInfo){
            const _div = document.createElement('div');
            _div.classList.add('row', 'my-3', 'p-3', 'bg-info-subtle', 'rounded-2')
            _div.innerHTML = `${f.name} - ${radableKb(f.size)}<br>크기: ${img.width} X ${img.height}`

            previewEL.prepend(_div);
          }
        }

        previewEL.appendChild(img);

      }else if(f.type.endsWith('/pdf')){

        const _col = document.createElement('div');
        _col.classList.add('row');

        _col.innerHTML = `<div class="col text-truncate"><span class="bi bi-file-pdf text-danger"></span>${f.name}  - ${radableKb(f.size)}</div>`

        previewEL.appendChild(_col);
      }else{
        const _col = document.createElement('div');
        _col.classList.add('row');

        _col.innerHTML = `<div class="row"><span class="bi bi-file-check text-success"></span>${f.name}  - ${radableKb(f.size)}</div>`

        previewEL.appendChild(_col);
      }

    }

    reader.readAsDataURL(f);
  })

  }

/**
 * 검색 결과에 하이라이트
 * @param search
 * @param text {string} - 검색어
 * @return text {string} - 하이라이트 된 태그
 */
const searchHilight = (search, text)=>{
    if(search && text){
      const regex = new RegExp(search, 'g');

      return text.replace(regex, `<mark>${search}</mark>`)
    }

    return text;
  }


/**
 * 핸드폰 번호 형식 체크
  * @param mobileNo {string} -  핸드폰 번호
 * @return {boolean}
 */
const validateMobileNum = (mobileNo) => {
  const ssnPattern = /^(01[016789]{1})-?\d{3,4}-?\d{4}$/

  return ssnPattern.test(mobileNo);
}

/**
 * 일반 전화 형식 체크
 * @param telephoneNo {string} - 유선 전화 번호
 * @return {boolean}
 */
const validateTelephoneNum = (telephoneNo) => {
  const ssnPattern = /^0[2-9]{1}\d*-?\d{3,4}-?\d{4}?$/

  return ssnPattern.test(telephoneNo);
}

/**
 * 성명 형식 체크
 * 한글 공백 영어 2글자이상
 * @param name {string} - 성명
 * @return {boolean}
 */
const validateName = (name)=>{
  const namePattern = /^(?! )(?!^[가-힣] [가-힣]+$)(?:[가-힣 ]{2,25}|[a-zA-Z ]{2,45})(?<! )$/

  return namePattern.test(name);
}

/**
 * usrId 형식 체크 영어(대,소), 숫자, _ 3~20글자
 * @param usrId
 * @return {boolean}
 */
const validateUsrId = (usrId)=>{
  const namePattern = /^[A-Za-z0-9_]{3,20}$/;

  return namePattern.test(usrId);
}

/**
 * 주민번호 뒷자리 마스크
 * @param rrno {string}
 * @param [needMask=true] {boolean}
 * @return {`${string}-${string|string}`}
 */
const formatSsn = (rrno, needMask = true) => {

  if (!rrno) return '';

  rrno = rrno.replace(/\D/g, '');

  return `${rrno.substring(0, 6)}-${needMask ? rrno.substring(6, 7) + '******' : rrno.substring(6)}`;
}


/**
 * 주민번호를 가지고 생년월일, 보험 나이와 성별을 계산한다.
 * 보험나이 기준연도 - 생년 - (생월이 6월 이후이면 1년을 더 빼줌 자녀인경우는 제외)
 * @param rrno {string} - 주민번호
 * @param [bseYr=new Date().getFullYear()] {string|number} - 기준연도
 * @param isChild {boolean=false} - 자녀여부
 * @return {{bornYear: number, tgrSxClCd: (string), tgrAg: number, birthday: string}}
 */
const calcSsn = (rrno, bseYr=new Date().getFullYear(), isChild = false) => {

  let bornYear, tgrSxClCd, tgrAg, birthday;

  if(!validateSsn(rrno)) return {bornYear, tgrSxClCd, tgrAg, birthday};

  const typeNumber = rrno.substring(6, 7);
  bornYear = Number(rrno.substring(0, 2)) + (['1', '2', '5', '6'].includes(typeNumber) ? 1900 : 2000);
  const bornMonth = Number(rrno.substring(2, 4));

  tgrSxClCd = Number(typeNumber) % 2 ? '1' : '2';

  tgrAg = parseInt(bseYr)
    - bornYear
    - ((!isChild && bornMonth>6)?1:0);

  birthday = `${bornYear}-${bornMonth}-${rrno.substring(4, 6)}`;

  return {bornYear, tgrSxClCd, tgrAg, birthday};
}




/**
 * 마지막 글자에 받침이 있는지 확인 한다.
 * @param str {string}
 */
const endsWithBatchim = (str) => {

  const lastLetter = str[str.length - 1];
  const uni = lastLetter.charCodeAt(0);

  // 한글이 아닌 경우
  if (uni < 44032 || uni > 55203) return false;

  return (uni - 44032) % 28 != 0;

}

/**
 * text를 base64로 인코딩함
 * @param text
 * @return {string}
 */
const encodeBase64 = (text)=>{
  if(!text) return ;

  const binString = new TextEncoder().encode(text);

  return btoa(String.fromCodePoint(...binString))
}

/**
 * bytes 를 base64로 인코딩함
 * @param bytes
 * @return {*|string}
 */
const byteToBase64 = (bytes)=>{
  return bytes && btoa(String.fromCodePoint(...bytes))
}

/**
 * base64를 byte array롷
 * @param base64
 * @return {Uint8Array}
 */
const base64ToByte = (base64)=>{
  return base64 && Uint8Array.from(atob(base64), m=>m.codePointAt(0));
}

/**
 * base64를 text로 변환
 * @param base64
 * @return {Uint8Array}
 */
const decodeBase64 = (base64)=>{
  return base64 && new TextDecoder().decode(Uint8Array.from(atob(base64), m=>m.codePointAt(0)));
}

/**
 * obj를 json 문자열로 변환한다.
 * @param obj {object}
 * @return {string}
 */
const toJson = (obj)=>{
  console.log('toJson', obj, !!obj)

  return obj && JSON.stringify(obj);
}

/**
 * isrrClCd를 한글로 변환
 * @param isrrClCd {'0'|'1'|'2'|'3'}
 */
const getIsrrClNm = (isrrClCd)=>{
  switch(isrrClCd){
    case '0': return '본인'
    case '1': return '배우자'
    case '2': return '부모'
    case '3': return '자녀'
  }
}

/**
 * 핸드폰 번호를 010-xxx-xxxx 나 010-xxxx-xxxx 포맷으로 변환
 * @param mobileNo {string} - 바꿀 폰번호
 * @param needMask {boolean=false} - 마스킹 할건지
 * @return {string}
 */
const formatMobileNo = (mobileNo, needMask=false)=>{

  if(!mobileNo) return ''

  const _mobileNo = mobileNo.replaceAll(/|D/g, '');

  switch (_mobileNo.length){
    case 10: return `${_mobileNo.substring(0,3)}-${needMask?_mobileNo.substring(3,5)+ '*':_mobileNo.substring(3,6)}-${needMask?_mobileNo.substring(6,8)+'**':_mobileNo.substring(6)}`
    case 11: return `${_mobileNo.substring(0,3)}-${needMask?_mobileNo.substring(3,5)+ '**':_mobileNo.substring(3,7)}-${needMask?_mobileNo.substring(7,9)+'**':_mobileNo.substring(7)}`
    default: return mobileNo
  }
}

/**
 * 100원 단위 절사
 * @param isrSbcAmt {number} - 절사할 금액
 * @param amount {number} - 절사할 단위
 */
function _floorAmt(isrSbcAmt, amount){
  return Math.floor(isrSbcAmt/amount)*amount;
}


/**
 * ms 만큼 실행을 지연 시킴
 * @param ms {number} 밀리세컨드
 */
function sleep(ms){
  const wakeUpTime = Date.now() + ms;
  while(Date.now() < wakeUpTime){}
}

/**
 * hashids용
 */
class HashidsHelper{
  constructor(key) {
    this.__hashids = new Hashids(key);
  }
  encode(strings){
    return this.__hashids.encode([9,...strings]);
  }
  decode(encoded){
    if(!encoded) return '';
    if(encoded.match(/^\d{13}$/)) return encoded;

    return this.__hashids.decode(encoded).join('').substring(1);
  }
}

/**
 * @type MaskData
 *
 */

/**
 * 주민번호나 휴대폰 번호를 마스킴하고 언마스킹 아이콘과 함께 보여준다.
 * @param {{valueObj, type = 'ssn', color='info', bi='eye', delay=2000}}
 * @return {HTML}
 */
const printMaskWithEyes = ({valueObj, type = 'ssn', color='info', bi='eye', delay=2000 })=>{

  if(!valueObj || !`${valueObj}`) return '';

console.log('valueObj', valueObj, (typeof valueObj), 'type', type, 'color', color, 'bi', bi, 'delay', delay)

  let mask, unmask, titleName;

  switch(type){
    case "ssn":
      titleName = '주민번호'
      mask = `formatSsn(${valueObj}, true)`;
      unmask = `formatSsn(${valueObj}, false)`;
      break;
    case "mobile":
      titleName = '전화번호'
      mask = `formatMobileNo(${valueObj}, true)`;
      unmask = `formatMobileNo(${valueObj}, false)`;
  }

  return `
<div class="col" style="cursor:pointer" x-show="${valueObj}"
  @click.throttle="()=>{
//console.log($el)

      const _span = $el.querySelector('span.me-2')
      _span.classList.add('box')
      setTimeout(()=>{
          _span.innerText = ${unmask}
          _span.classList.add('in')
       }, 30)
      setTimeout(()=>{
          _span.classList.remove('box', 'in')
          _span.innerText = ${mask}
       }, ${delay})
    }">
    <span class="me-2" x-text="${mask}" style="font-family: Consolas, monospace, monospace"></span>
    <em class="bi bi-${bi} text-${color}" title="${titleName} 확인"></em>
</div>`;
}

/**
 * 파일 뷰어 아이콘 태그를 출력
 * @param encdFileNo {string} - 파일이름
 * @param w {number=800} - width
 * @param h {number=800} - height
 * @param windowName {string=gwpViewer} - 팝업이름
 * @param bi {string=file-lock2-fill} - bs icon
 * @param color {string=secondary} - color
 * @param title {string=파일보기} - 타이틀
 * @return {string} - html태그
 */
const printFileviewer =({encdFileNo, w=800, h=800, windowName='gwpViewer',
                          title='파일보기' , bi='file-lock2-fill', color='secondary', top, left})=> {

  console.log('encdFileNo', encdFileNo)

  if(!encdFileNo) return '';

  if(!top) top = Math.ceil((window.screen.height - h)/2);
  if(!left) left = Math.ceil((window.screen.width - w)/2);

  return `<em class="bi bi-${bi} fs-4 text-${color}" style="cursor: pointer;" title="${title}"
    @click.throttle="()=>{
      const win = window.open('/cmmn/fle/view/fileViewer.jdo?encdFileNo=${encdFileNo}', '${windowName}', 'top=${top},left=${left},width=${w},height=${h}')
      if(!win) alert('팝업 차단을 해제해 주세요');
      win.focus();
    }"></em>`
}


const popupQrcode = (url)=>{
  if(!url) retrun;

  const winPop = window.open(`/cmmn/nxt/qrCodeView.jdo?url=${url}`, 'qrPop', 'height=770,width=580');
  if(!winPop){
    alert('팝업 차단을 해제해 주세요');
    return;
  }

  winPop.focus();

}



function moveServerContext(evt){

  evt.preventDefault();

  const element = document.querySelector('#moveServerMenu');
  if(element){
    element.remove();
    return false;
  }

  const menu = document.createElement('div');
  menu.id = 'moveServerMenu'
  menu.style.zIndex = '1100';
  menu.style.position = 'relative';
  menu.style.left = `${evt.x}px`;
  menu.style.top = `${evt.y}px`;
  menu.style.display = 'inline-block';

  menu.classList.add('p-1', 'text-bg-light', 'bg-opacity-75', 'rounded-3', 'shadow');

  const ul = document.createElement('ul');
  ul.classList.add('border', 'border-success');

  const li1 = document.createElement('li');

  const a1 = document.createElement('a');
  a1.innerText = '운영';
  a1.href= `https://wca.gwp.or.kr${window.location.pathname}`;

  const li2 = document.createElement('li');

  const a2 = document.createElement('a');
  a2.innerText = '검증';
  a2.href= `https://devwca.gwp.or.kr${window.location.pathname}`;

  const li3 = document.createElement('li');

  const a3 = document.createElement('a');
  a3.innerText = '로컬';
  a3.href = `http://127.0.0.1:18081${window.location.pathname}`;

  li1.append(a1);
  li2.append(a2);
  li3.append(a3);

  ul.append(li1);
  ul.append(li2);
  ul.append(li3);

  menu.append(ul);


  document.body.prepend(menu);
}


/**
 * color mode 'dark, light'를 변경함
 * @param isDevDb=true {boolean}  - 개발기 여부
 */
function setTheme(isDevDb = true){

  document.documentElement.dataset.bsTheme = isDevDb ? 'light':'dark'
}

/**
 * json을 table 로 만듬
 * @param _jsonData {JSON}
 * @return {HTMLTableElement}
 */
function jsonToTable(_jsonData){

  let table =  `<table class="table table-sm table-hover table-bordered w-100">
  <thead></thead>
  <tbody>
`

  for(let key in _jsonData){

    table += `<tr>
  <th scope="row" onclick="copy(this)">${key}</th>
  <td style="max-width: 400px !important; word-wrap: break-word;" onclick="copy(this)">${_jsonData[key]}</td>
  <td>${typeof _jsonData[key]}</td>
</tr>`

  }

  table += '</tbody></table>'

  return table
}

function jsonToFormData(_jsonData){

  const formData = new FormData();


  for(let key in _jsonData){
    formData.append(key, _jsonData[key]);
  }

  return formData;

}

/**
 *
 * @param number {number}
 * @return {string}
 */
function geKoreanNumber(number) {
  const koreanUnits = ['조', '억', '만', ''];
  const unit = 10000;
  let answer = '';
  //console.log('number', number)

  if(!number) return '-';

  while (number > 0) {
    const mod = number % unit;
    const modToString = mod.toString().replace(/(\d)(\d{3})/, '$1,$2');
    number = Math.floor(number / unit);
    //console.log(mod, answer)
    if(!answer && mod===0){
      koreanUnits.pop();
    }
    else answer = `${modToString}${koreanUnits.pop()}${answer}`;
  }
  return answer;
}

/**
 * 숫자를 한글로 변환한다.
 * e.g) 12345 -> 만이천삼백사십오
 * @param number {number} - 숫자
 * @return {string} - 숫자 한글
 */
function geFullKoreanNumber(number) {
  const koreanNumber = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const tenUnit = ['', '십', '백', '천'];
  const tenThousandUnit = ['조', '억', '만', ''];
  const unit = 10000;

  if(!number) return '-';

  let answer = '';

  while (number > 0) {
    const mod = number % unit;
    const modToArray = mod.toString().split('');
    const length = modToArray.length - 1;

    const modToKorean = modToArray.reduce((acc, value, index) => {
      const valueToNumber = +value;
      if (!valueToNumber) return acc;
      // 단위가 십 이상인 '일'글자는 출력하지 않는다. ex) 일십 -> 십
      const numberToKorean = index < length && valueToNumber === 1 ? '' : koreanNumber[valueToNumber];
      return `${acc}${numberToKorean}${tenUnit[length - index]}`;
    }, '');

    answer = `${modToKorean}${tenThousandUnit.pop()} ${answer}`;
    number = Math.floor(number / unit);
  }

  return answer.replace();
}

function logFormData(formData){

  if(formData && formData.entries) console.log(Object.fromEntries(formData.entries));

}


/**
 * 파일뷰어 팝업 호출
 * @param encdFileNo {!string} - 파일번호
 * @param w {number=800} - 가로크기
 * @param h {number=800} - 세로크기
 * @param windowName {string=gwpViewer} - 창이름
 * @param top {number*} - top좌표
 * @param left {number*} - left좌표
 */
function fileViewer({encdFileNo, w=800, h=800, windowName='gwpViewer'
                      , top, left}){

  console.log('encdFileNo', encdFileNo)

  if(!encdFileNo) return;

  if(!top) top = Math.ceil((window.screen.height - h)/2);
  if(!left) left = Math.ceil((window.screen.width - w)/2);

  const win = window.open(`/cmmn/fle/view/fileViewer.jdo?encdFileNo=${encdFileNo}`, windowName, `top=${top},left=${left},width=${w},height=${h}`)
  if(!win) alert('팝업 차단을 해제해 주세요');
  win.focus();
}
