import { debounce } from 'https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/+esm'

import 'https://cdn.jsdelivr.net/npm/js-loading-overlay@1.2.0/+esm'



export default {

  /**
   * 주민번호 검사
   * @param rrno {string} - 주민번호
   * @return {Checked} - 검사 결과
   */
  validateSsn(rrno) {

    if (!rrno) return { valid: true }

    if (rrno.length !== 13) {
      return { valid: false, message: '올바른 주민번호 형식이 아닙니다.' }
    }

    // 주민번호 형식 체크
    const ssnPattern = /^\d{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])([1-8])\d{6}$/;

    if (!ssnPattern.test(rrno)) {
      return { valid: false, message: '올바른 주민번호 형식이 아닙니다.' }
    }

    return { valid: true };

  },

  /**
   * 주민번호를 가지고 생년월일, 보험 나이와 성별을 계산한다.
   * 보험나이 기준연도 - 생년 - (생월이 6월 이후이면 1년을 더 빼줌 자녀인경우는 제외)
   * @param rrno {string} - 주민번호
   * @param [bseYr=new Date().getFullYear()] {string|number} - 기준연도
   * @param isChild {boolean=false} - 자녀여부
   * @return {{bornYear: number, tgrSxClCd: (string), tgrAg: number, birthday: string}}
   */
  calcSsn(rrno, bseYr = new Date().getFullYear(), isChild = false) {

    let bornYear, tgrSxClCd, tgrAg, birthday;

    if (!this.validateSsn(rrno)) return { bornYear, tgrSxClCd, tgrAg, birthday };

    const typeNumber = rrno.substring(6, 7);
    bornYear = Number(rrno.substring(0, 2)) + (['1', '2', '5', '6'].includes(typeNumber) ? 1900 : 2000);
    const bornMonth = Number(rrno.substring(2, 4));

    tgrSxClCd = Number(typeNumber) % 2 ? '1' : '2';

    tgrAg = parseInt(bseYr)
      - bornYear
      - ((!isChild && bornMonth > 6) ? 1 : 0);

    birthday = `${bornYear}-${bornMonth}-${rrno.substring(4, 6)}`;

    return { bornYear, tgrSxClCd, tgrAg, birthday };
  },


  /**
  * base64를 byte array롷
  * @param base64
  * @return {Uint8Array}
  */
  base64ToByte(base64) {
    return base64 && Uint8Array.from(atob(base64), m => m.codePointAt(0));
  },


  /**
   * 주민번호 뒷자리 마스크
   * @param rrno {string} - 주민번호
   * @param {boolean} [needMask=true] - 마스크 여부
   * @return {`${string}-${string}`}
   */
  formatSsn: (rrno, needMask = true) => {

    if (!rrno) return '';

    rrno = rrno.replace(/\D/g, '');

    return `${rrno.substring(0, 6)}-${needMask ? rrno.substring(6, 7) + '******' : rrno.substring(6)}`;
  },


  /**
   * 100원 단위 절사
   * @param isrSbcAmt {number} - 절사할 금액
   * @param [amount=100] {number} - 절사할 단위
   */
  floorAmt: (isrSbcAmt, amount = 100) => Math.floor(isrSbcAmt / amount) * amount,

  /**
* 로딩 표시
* @param {boolean} [isLoading = true] - 로딩 표시 여부 
*/
  loading(isLoading = true) {

    debounce(() => {

      if (isLoading) {
        JsLoadingOverlay.show({
          'spinnerIcon': 'timer'
          , 'spinnerColor': '#0d6efd'
          , 'offsetY': '-32%'
          , 'sppinerZIndex': 1000
          , 'overlayZIndex': 999
        })
      } else {
        JsLoadingOverlay.hide()
      }

    }, 300)();

  }



}
