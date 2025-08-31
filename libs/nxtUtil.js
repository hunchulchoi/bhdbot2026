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

const alertInfo = message => {

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


const alertError = message => {

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
const validateSsn = (rrno) => {

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

  return ssnPattern.test(rrno);
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
            console.log(img);
            _div.innerHTML = `${f.name} - ${radableKb(f.size)}<br>크기: ${img.width} X ${img.height}`

            previewEL.prepend(_div);
          }
        }

        previewEL.appendChild(img);

      }else if(f.type.endsWith('/pdf')){

        const _col = document.createElement('div');
        _col.classList.add('row');

        _col.innerHTML = `<h2 class="bi bi-file-pdf text-danger"></h2>
<div class="row">${f.name}  - ${radableKb(f.size)}</div>`

        previewEL.appendChild(_col);
      }else{
        const _col = document.createElement('div');
        _col.classList.add('row');

        _col.innerHTML = `<h2 class="bi bi-file-fill text-success"></h2>
<div class="row">${f.name}  - ${radableKb(f.size)}</div>`

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
  const namePattern = /^[가-힣a-zA-Z]+[ ]{0,1}[가-힣a-zA-Z]+$/

  return namePattern.test(name);
}

/**
 * 주민번호 뒷자리 마스크
 * @param rrno
 * @param needMask
 * @return {`${string}-${string|string}`}
 */
const formatSsn = (rrno, needMask = true) => {

  return `${rrno.substring(0, 6)}-${needMask ? rrno.substring(6, 7) + '******' : rrno.substring(6)}`;
}


/**
 * 주민번호를 가지고 생년월일, 보험 나이와 성별을 계산한다.
 * 보험나이 기준연도 - 생년 - (생월이 6월 이후이면 1년을 더 빼줌)
 * @param rrno {string} - 주민번호
 * @param [bseYr=new Date().getFullYear()] {string|number} - 기준연도
 * @return {{bornYear: number, tgrSxClCd: (string), tgrAg: number, birthday: string}}
 */
const calcSsn = (rrno, bseYr=new Date().getFullYear()) => {

  const typeNumber = rrno.substring(6, 7);
  const bornYear = Number(rrno.substring(0, 2)) + (['1', '2', '5', '6'].includes(typeNumber) ? 1900 : 2000);
  const bornMonth = Number(rrno.substring(2, 4));

  const tgrSxClCd = Number(typeNumber) % 2 ? '1' : '2';

  const tgrAg = parseInt(bseYr)
    - bornYear
    - (bornMonth>6?1:0);

  const birthday = `${bornYear}-${bornMonth}-${rrno.substring(4, 6)}`;

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

