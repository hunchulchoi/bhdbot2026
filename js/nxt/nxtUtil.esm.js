export default {

  /**
   * 주민번호 형식 체크
   * @param rrno {string}
   * @return {boolean}
   */
  validateSsn(rrno) {

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
  },

  /**
   * 주민번호를 가지고 생년월일, 보험 나이와 성별을 계산한다.
   * 보험나이 기준연도 - 생년 - (생월이 6월 이후이면 1년을 더 빼줌 자녀인경우는 제외)
   * 주민번호가 falsy하거나 형식에 맞지 않는 경우 모든값이 undefined로 반환된다.
   * @param rrno {string} - 주민번호
   * @param [bseYr=new Date().getFullYear()] {string|number} - 기준연도
   * @param isChild {boolean=false} - 자녀여부
   * @return {{bornYear: number, tgrSxClCd: (string), tgrAg: number, birthday: string}}
   */
  calcSsn(rrno, bseYr=new Date().getFullYear(), isChild = false) {

    let bornYear, tgrSxClCd, tgrAg, birthday;

    if(!rrno || !this.validateSsn(rrno)) return {bornYear, tgrSxClCd, tgrAg, birthday};

    const typeNumber = rrno.substring(6, 7);
    bornYear = Number(rrno.substring(0, 2)) + (['1', '2', '5', '6'].includes(typeNumber) ? 1900 : 2000);
    const bornMonth = Number(rrno.substring(2, 4));

    tgrSxClCd = Number(typeNumber) % 2 ? '1' : '2';

    tgrAg = parseInt(bseYr)
      - bornYear
      - ((!isChild && bornMonth>6)?1:0);

    birthday = `${bornYear}-${bornMonth}-${rrno.substring(4, 6)}`;

    return {bornYear, tgrSxClCd, tgrAg, birthday};
  },



  /**
   * 성명 형식 체크
   * 한글 2~23자 공백 허용 '한 글' '한 이름' 같이 앞에 한글자 + 공백 + 한글은 안됨
   * 영문 2~45자 공백 -'. 허용
   * @param name {string}
   * @return {boolean}
   */
  validateName: (name)=>{
    //const namePattern = /^[가-힣 ]{2,25}|[a-zA-Z ]{2,45}$/
    const namePattern = /^(?! )(?!^[가-힣] [가-힣]+$)(?:[가-힣 ]{2,25}|[a-zA-Z-'. ]{2,45})(?<! )$/


    return namePattern.test(name);
  },

  /**
   * 핸드폰 번호 형식 체크
   * @param mobileNo {string} -  핸드폰 번호
   * @return {boolean}
   */
  validateMobileNum: (mobileNo) => {
    const ssnPattern = /^(01[016789]{1})-?\d{3,4}-?\d{4}$/

    return ssnPattern.test(mobileNo);
  },

  /**
   * 주민번호 뒷자리 마스크
   * 000000-1****** 혹은 000000-0000000
   * @param rrno {string} - 주민번호
   * @param [needMask=true] {boolean} - 뒷자리 마스크 할건지
   * @return {string} - 000000-1****** 혹은 000000-0000000
   */
  formatSsn(rrno, needMask = true){

    if (!rrno) return '';

    rrno = rrno.replace(/\D/g, '');

    if(!this.validateSsn(rrno)) return rrno;

    return `${rrno.substring(0, 6)}-${needMask ? rrno.substring(6, 7) + '******' : rrno.substring(6)}`;
  },

  /**
   * 주민번호나 휴대폰 번호를 마스킴하고 언마스킹 아이콘과 함께 보여준다.
   * @param {Object} options - 옵션 객체
   * @param {string} options.valueObj   - 표시할 값(필수)
   * @param {'ssn'|'mobile'} [options.type='ssn']  - 식별자 타입 (기본값: 'ssn')
   * @param {'info'|'warning'|'danger'} [options.color='info']  - 색상 (기본값: 'info')
   * @param {string} [options.bi='eye']          - 아이콘 이름 (기본값: 'eye')
   * @param {number} [options.delay=2000]        - 지연 시간(ms) (기본값: 2000)
   * @return {HTML}
   */
  printMaskWithEyes({valueObj, type = 'ssn', color='info', bi='eye', delay=2000 }){

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
  },

  getHashIdsHelper(token){
    return new HashidsHelper(token);
  },

  /**
   * base64를 byte array롷
   * @param base64
   * @return {Uint8Array}
   */
  base64ToByte(base64){
    return base64 && Uint8Array.from(atob(base64), m=>m.codePointAt(0));
  }

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


