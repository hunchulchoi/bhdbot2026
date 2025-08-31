import Hashids from 'https://cdn.jsdelivr.net/npm/hashids@2.3.0/+esm'

import nxtUtil from "/src/common/nxtUtil.esm.js";


/**
 * @typedef QuestionOption {Object} - 질문-옵션
 * @property {string} text - 질문 대답내용
 * @property {function?} callback - 대답 클릭 시 콜백함수
 * @property {boolean=true} once - true인 경우 대답 클릭 시에 다시 클릭할수 없도록 클릭 이벤트를 다 회수함
 */

/**
 * 질문 객체
 */
export class Question {
  /**
   * @param short_title {string} - 짧은 제목
   * @param message {string} - 질문내용
   * @param options {QuestionOption} - 질문 옵션에 넣을 항목들
   * @param optionFunc {function} - 옵션 생성용 function
   * @param data {object} - 데이터
   * @param onRenderd {function?} - 채팅 창 생성후 실행할 함수
   *
   */
  constructor({ short_title, message, options, optionFunc, data }) {
    this.short_title = short_title;
    this.message = message;
    this.options = options;
    this.optionFunc = optionFunc;
    this.data = data;
  }
}

/**
 * 보험 대상자 정보
 */
export class TgrInfo {
  /**
   *
   * @param usrFnm {string} - 대상자 성명
   * @param rrno {string} - 주민번호
   * @param wlfInstCd {string} - 기관코드
   * @param instNm {string} - 기관명
   * @param sxClCd {sxClCd} - 성별
   * @param age {number} - 대상자 나이
   * @param isrrClCd {isrrClCd} - 대상자 구분
   * @param updFleNo {string} - 증빙파일 번호
   */
  constructor(usrFnm, rrno, wlfInstCd, instNm, sxClCd, age, isrrClCd, updFleNo) {
    this.usrFnm = usrFnm;
    this.rrno = rrno;
    this.wlfInstCd = wlfInstCd;
    this.instNm = instNm;
    this.sxClCd = sxClCd;
    this.age = age
    this.validated = false;
    this.confirms = [false, false, false];
    this.noticeAgree = [];
    this.files = null;
    this.cellPhoneNo = null;
    this.isrrClCd = isrrClCd;
    this.agrInfo = null;
    this.updFleNo = updFleNo

  }
}

/**
 * R: 신청
 * D: 동의
 * N: 미동의
 * X: 동의시간 초과
 * E: 오류
 * @typedef agrStsCd {'R'|'D'|'N'|'X'|'E'}
 */

/**
 * 개인정보 제공 동의 정보
 */
export class AgrInfo {

  /**
   * @typedef AgrInfoData
   * @type agrNo {string}
   * @type token {string}
   * @type tgrFnm {string}
   * @type decTgrRrno {string}
   * @type decTgrTelNo {string}
   * @type agrClCd {'BHD'}
   * @type agrStsCd {agrStsCd}
   * @type agrStsCdNm {string}
   * @type agrDttm {string}
   * @type smsTrsmSqn {number} - 문자전송 횟수
   * @type smsFnlDttm {Date} - 최종 발송 시각
   */
  constructor({
    agrNo, token, tgrFnm, decTgrRrno, decTgrTelNo, agrClCd, agrStsCd
    , agrStsCdNm, agrDttm, smsTrsmSqn, smsFnlDttm,
  }) {
    this.agrNo = agrNo;
    this.token = token;
    this.tgrFnm = tgrFnm;
    this.tgrRrno = decTgrRrno;
    this.tgrTelNo = decTgrTelNo;
    this.agrClCd = agrClCd;
    this.agrStsCd = agrStsCd;
    this.agrStsCdNm = agrStsCdNm;
    this.agrDttm = agrDttm;
    this.smsTrsmSqn = smsTrsmSqn;
    this.smsFnlDttm = smsFnlDttm;
  }
}

/**
 * @typedef essYn {'Y'|'N'|boolean}
 */

/**
 * 면제 등록 구분 코드
 * C: 개인실손 면제
 * N: 면제아님
 * Y: 미가입 면제
 * @typedef xmpRegClCd {'C'|'N'|'Y'}
 */

/**
 * @typedef IsrPrdData
 * @type isrPrdCd {string}
 * @type isrPrdNm {string}
 * @type isrDtlCd {string}
 * @type isrDtlNm {string}
 * @type isrUprCd {string}
 * @type isrrClCd {string}
 * @type essYn {essYn}
 * @type bhdSlcSeq {number}
 * @type xmpRegClCd {xmpRegClCd}
 * @type olfDndIvgYn {'Y'|'N'}
 * @type mIsrUprCd {string}
 * @type mIsrSbcAmt {number}
 * @type mIsrSbcScr {number}
 * @type fIsrUprCd {string}
 * @type fIsrSbcAmt {number}
 * @type fIsrSbcScr {number}
 */


/**
 * 선택한 보험 객체
 * @class
 *
 */
export class IsrPrd {

  /**
   *
   * @param data {IsrPrdData}
   * @param bhdSlcSeq {number}
   * @param tgrFnm {string?}
   * @param tgrRrno {string?}
   * @param tgrSxClcd {sxClCd?}
   * @param tgrAg {number?}
   * @param cellPhoneNo {string?}
   * @param files {any?}
   * @param updFleNo {string} - 증빙파일 번호
   */
  constructor(data, bhdSlcSeq, tgrFnm, tgrRrno, tgrSxClcd, tgrAg, cellPhoneNo, files, updFleNo) {
    console.debug('data', data, 'bhdSlcSeq', bhdSlcSeq, 'tgrFnm', tgrFnm, 'tgrRrno', tgrRrno, 'tgrSxClcd', tgrSxClcd, 'tgrAg', tgrAg, 'cellPhoneNo', cellPhoneNo, 'files', files, 'updFleNo', updFleNo)
    this.isrPrdCd = data.isrPrdCd;
    this.isrPrdNm = data.isrPrdNm;
    this.isrDtlCd = data.isrDtlCd;
    this.isrDtlNm = data.isrDtlNm;
    this.isrrClCd = data.isrrClCd;
    this.essYn = data.essYn ? 'Y' : 'N';
    this.bhdSlcSeq = bhdSlcSeq
    this.xmpRegClCd = data.xmpRegClCd
    this.olfDndIvgYn = data.olfDndIvgYn

    this.mIsrUprCd = data.mIsrUprCd;
    this.mIsrSbcAmt = data.mIsrSbcAmt;
    this.mIsrSbcScr = data.mIsrSbcScr;

    this.fIsrUprCd = data.fIsrUprCd;
    this.fIsrSbcAmt = data.fIsrSbcAmt;
    this.fIsrSbcScr = data.fIsrSbcScr;


    this.tgrFnm = tgrFnm;
    this.tgrRrno = tgrRrno;
    this.tgrAg = tgrAg
    this.tgrSxClcd = tgrSxClcd;
    this.cellPhoneNo = cellPhoneNo;
    this.isrUprCd = tgrSxClcd && tgrSxClcd === '1' ? data.mIsrUprCd : data.fIsrUprCd
    this.isrSbcAmt = tgrSxClcd && tgrSxClcd === '1' ? data.mIsrSbcAmt : data.fIsrSbcAmt;
    this.isrSbcScr = tgrSxClcd && tgrSxClcd === '1' ? data.mIsrSbcScr : data.fIsrSbcScr;

    this.files = files
    this.updFleNo = updFleNo
    this.selectedTime = new Date().getTime();
    this.agrInfo = null;

  }
}

/**
* hashids용
*/
class HashidsHelper {
  constructor(key) {
    this.__hashids = new Hashids(key);
  }
  encode(strings) {
    return this.__hashids.encode([9, ...strings]);
  }
  decode(encoded) {
    if (!encoded) return '';
    if (encoded.match(/^\d{13}$/)) return encoded;

    return this.__hashids.decode(encoded).join('').substring(1);
  }
}


/**
 * @typedef storedData
 * @type isrPrdCd {string}
 * @type isrPrdNm {string}
 * @type isrDtlCd {string}
 * @type isrDtlNm {string}
 * @type isrUprCd {string}
 * @type isrrClCd {isrrClCd}
 * @type bhdSlcSeq {number}
 * @type tgrFnm {string?}
 * @type tgrRrno {string?}
 * @type tgrSxClcd {sxClCd?}
 * @type tgrAg {number?}
 * @type cellPhoneNo {string?}
 * @type files {any?}
 */


export class StoredData {
  /**
   *
   * @type {Object.<string, storedData|storedData[]>}
   */
  stored

  constructor(selected) {

    Object.entries(selected).forEach(([key, data]) => {

      console.log(key, 'data', data, this.stored);

      /**
       *
       * @param __data {IsrPrd}}
       * @return {storedData}
       */
      const convert = (__data) => {

        return {
          isrPrdCd: __data.isrPrdCd,
          isrPrdNm: __data.isrPrdNm,
          isrDtlCd: __data.isrDtlCd,
          isrDtlNm: __data.isrDtlNm,
          isrUprCd: __data.isrUprCd,
          isrrClCd: __data.isrrClCd,
          bhdSlcSeq: __data.bhdSlcSeq,
          tgrFnm: __data.tgrFnm,
          tgrRrno: __data.tgrRrno,
          tgrSxClcd: __data.tgrSxClcd,
          tgrAg: __data.tgrAg,
          cellPhoneNo: __data.agrInfo?.tgrTelNo,
          files: __data.files,
          essYn: __data.essYn,
          isrSbcAmt: __data.isrSbcAmt,
          isrSbcScr: __data.isrSbcScr,
          olfDndIvgYn: __data.olfDndIvgYn,
          xmpRegClCd: __data.xmpRegClCd,
          mIsrUprCd: __data.mIsrUprCd,
          mIsrSbcAmt: __data.mIsrSbcAmt,
          mIsrSbcScr: __data.mIsrSbcScr,
          fIsrUprCd: __data.fIsrUprCd,
          fIsrSbcAmt: __data.fIsrSbcAmt,
          fIsrSbcScr: __data.fIsrSbcScr,
          selectedTime: __data.selectedTime,
        }
      }

      if (!this.stored) this.stored = {}

      if (Array.isArray(data)) {

        if (!this.stored[key]) this.stored[key] = []

        data.forEach(d => {
          this.stored[key].push(convert(d));
        })

      } else {

        this.stored[key] = convert(data)
      }

    });
    console.log('this.#stored', this.stored)
  }

  get stored() {
    return this.stored;
  }

  set pseSsn(ssn) {

    Object.values(this.stored).filter(s => s.isrrClCd === '0' && s.tgrRrno).forEach(s => s.tgrRrno = ssn)
  }

  /**
   * 이전에 저장된 보험선택과 비교하여
   * 변경되었는지를 검사한다.
   * 검사 기준은 isrDtlCd, isrUprCd tgrRrno, tgrFnm
   * @param selected {IsrPrd} - 최종 선택 내역
   * @param decode {function} - 주민번호 decode 함수
   * @return {boolean}
   */
  checkChanged(selected, decode) {

    console.log('checkChanged', selected, 'this.stored', this.stored)

    if (!selected || !Object.keys(selected).length) return false;



    if (!this.stored || !Object.keys(this.stored).length) return true;

    const flatStored = Object.values(this.stored).flat();

    flatStored.forEach(f => f.tgrRrno = decode(f.tgrRrno))

    const flatSelected = Object.values(selected).flat();

    if (flatStored.length !== flatSelected.length) return true;

    //if(flatSelected.find(s=>s.files && s.files.length)) return true;

    const found1 = flatSelected.filter(f => !flatStored.find(b => {

      return f.isrPrdCd === b.isrPrdCd
        && f.isrDtlCd === b.isrDtlCd
        && f.isrUprCd === b.isrUprCd
        && f.tgrFnm === b.tgrFnm
        && f.tgrRrno === b.tgrRrno
    }));

    console.log('found1', found1)

    if (found1 && found1.length) return true;

    const found2 = flatStored.filter(f => !flatSelected.find(b => {

      if (f.isrPrdCd === b.isrPrdCd) console.log('found2', f.isrPrdCd, b.isrPrdCd, f.isrDtlCd, b.isrDtlCd, f.isrUprCd, b.isrUprCd, f.tgrFnm, b.tgrFnm, f.tgrRrno, b.tgrRrno)

      return !f.isrDtlCd
        || (b.isrDtlCd === f.isrDtlCd
          && f.isrUprCd === b.isrUprCd
          && f.tgrFnm === b.tgrFnm
          && f.tgrRrno === b.tgrRrno)
    }));
    console.log('found2', found2)

    if (found2 && found2.length) return true;

    return false;

  }

}



/**
 * @typedef {Object} Checked
 * @property {boolean} valid - 체크 결과
 * @property {string?} message - 메세지
 * @property {Object?} data
 */



/**
 *
 * @param childInfo {TgrInfo} - 자녀 정보
 * @param {TgrInfo} pseInfo - 공무원 주민번호
 * @param {string} bseYr - 기준연도
 * @param {string} chldIsrAgRstcYr - 기관의 자녀나이 제한 연도
 * @param {string[]} [otheRrnos=[]] - 다른 주민번호
 * @return {Checked}
 */
export const validateChildSsn = (childInfo, pseInfo, bseYr, chldIsrAgRstcYr, otheRrnos = []) => {

  const checked = validateSsn(childInfo.rrno);

  if (!checked.valid) return checked;

  if (childInfo.rrno === pseInfo.rrno) {
    return { valid: false, message: '자녀와 주민번호가 동일합니다.' }
  }

  if (otheRrnos.includes(childInfo.rrno)) {
    return { valid: false, message: '이미 등록되어 있는 주민번호 입니다.' }
  }

  const ageObj = nxtUtil.calcSsn(childInfo.rrno, bseYr, true);

  if (ageObj.tgrAg < 0) {
    return { valid: false, message: '자녀의 나이가 0세 미만 입니다.' };
  }

  if (ageObj.tgrAg >= pseInfo.age) {
    return { valid: false, message: '자녀의 나이가 부모의 나이 보다 많습니다.' };
  }

  // 19세 이상
  if (ageObj.bornYear < parseInt(chldIsrAgRstcYr) && !childInfo.updFleNo) {
    ageObj.over19 = true;
  }

  // 14세 이상
  if (ageObj.tgrAg >= 14 && !childInfo.cellPhoneNo) {
    ageObj.over14 = true;
  }

  return { valid: true, data: ageObj };

}

export const getHashidsHelper = (token) => new HashidsHelper(token);

export const loading = (isLoading) => nxtUtil.loading(isLoading)

export const formatSsn = nxtUtil.formatSsn;

/**
* 성별에 따른 예상 금액을 가져온다
* 100원 절사
* @param sxClCd {sxClCd} - 성별
* @param isrPrd {IsrPrd} - 보험데이터
*/
export const getSbcAmt = (sxClCd, isrPrd) => {
  console.debug('getSbcAmt', sxClCd, isrPrd);

  return nxtUtil.floorAmt((sxClCd === '1' ? isrPrd.mIsrSbcAmt : isrPrd.fIsrSbcAmt))

}
