import nxtUtil from "../../js/nxt/nxtUtil.esm.js";


/**
 * @enum IsrrClCd {'0'|'1'|'3'} - 보험대상자
 */
export const IsrrClCd = Object.freeze({
  본인: '0',
  배우자: '1',
  자녀: '3',
})

/**
 * @enum AgrStsCd {'R'|'D'|'N'|'X'|'E'} - 동의 상태
 */
const AgrStsCd = Object.freeze({
  신청: 'R',
  동의: 'D',
  미동의: 'N',
  동의시간초과: 'X',
  오류: 'E',
})

/**
 * @enum EssYn {'Y'|'N'|boolean}
 */

/**
 * @enum XmpStsCd {'C'|'N'|'Y'} - 면제구분코드
 */
const XmpStsCd = Object.freeze({
  개인실손면제: 'C',
  면제아님: 'N',
  미가입면제: 'Y',
})

/**
 * @enum {'1'|'2'} - 성별
 */
const SxClCd = Object.freeze({
  남: '1',
  여: '2',
})

/**
 * @typedef IsrPrdData {Object} - 보험 상품 데이터
 * @property essYn {boolean}
 * @property isrPrdCd {string}
 * @property isrrClCd {IsrrClCd}
 * @property isrrClNm {string}
 * @property isrDtlCd {string}
 * @property isrDtlNm {string}
 * @property isrUprCd {string}
 * @property isrrClCd {string}
 * @property bhdSlcSeq {number}
 * @property xmpRegClCd {xmpRegClCd}
 * @property olfDndIvgYn {'Y'|'N'}
 * @property mIsrUprCd {string}
 * @property mIsrSbcAmt {number}
 * @property mIsrSbcScr {number}
 * @property fIsrUprCd {string}
 * @property fIsrSbcAmt {number}
 * @property fIsrSbcScr {number}
 * @property dtlCdList {IsrPrdData[]}
 */


/**
 * @typedef IsrPrdDtlData {Object} - 보험 상품 상세 정보
 * @property isrPrdCd {string}
 * @property isrPrdNm {string}
 * @property isrDtlCd {string}
 * @property isrDtlNm {string}
 * @property isrUprCd {string}
 * @property isrrClCd {string}
 * @property essYn {essYn}
 * @property bhdSlcSeq {number}
 * @property xmpRegClCd {xmpRegClCd}
 * @property olfDndIvgYn {'Y'|'N'}
 * @property mIsrUprCd {string}
 * @property mIsrSbcAmt {number}
 * @property mIsrSbcScr {number}
 * @property fIsrUprCd {string}
 * @property fIsrSbcAmt {number}
 * @property fIsrSbcScr {number}
 */



/**
 * 주민번호 계산 결과
 * @typedef CalcSsn {{bornYear: number, tgrSxClCd: SxClCd, tgrAg: number, birthday: string, over19: boolean?,
 * over14: boolean?}}
 * @property bornYear {number} - 태어난해
 * @property tgrSxClCd {SxClCd} - 성별
 * @property tgrAg {number} - 보험나이
 * @property birthday {String} - YYYY-MM-DD
 * @property over19 {boolean?} - 자녀인 경우 제한 나이 초과(증빙 파일 필요)
 * @property over14 {boolean?} - 자녀인 경우 15세 이상(휴대폰 번호 필요)
 */

/**
 * @typedef {Object} Checked
 * @property {boolean} valid - 체크 결과
 * @property {string?} message - 메세지
 * @property {CalcSsn?} data - 주민번호 계산 결과
 */

/**
 * @class {TgrInfo} 보험 대상자
 *
 */
export class TgrInfo {

  /**
   * @type {string}
   * @private
   */
  _tempId = null;
  /**
   * @type {AgrInfo}
   * @private
   */
  _agrInfo = null;

  /**
   * @param params {Object?}
   * @param params.usrFnm {string} - 대상자 성명
   * @param params.rrno {string} - 주민번호
   * @param params.wlfInstCd {string} - 기관코드
   * @param params.instNm {string} - 기관명
   * @param params.sxClCd {SxClCd} - 성별
   * @param params.age {number} - 대상자 나이
   * @param params.isrrClCd {IsrrClCd} - 대상자 구분
   * @param params.updFleNo {string?} - 증빙파일 번호
   * @param params.cellPhoneNo {string?} - 전화번호
   * @param params.agrInfo {AgrInfo?} - 동의 파일
   * @param params.files {File?} - 업로드 증빙파일
   * @param params.bhdSlcSeq {number?} - 보험 선택 순번
   */
  constructor({ usrFnm, rrno, wlfInstCd, instNm
    , sxClCd, age, isrrClCd, updFleNo
    , cellPhoneNo, agrInfo, files, bhdSlcSeq }) {
    this.usrFnm = usrFnm;
    this.rrno = rrno;
    this.wlfInstCd = wlfInstCd;
    this.instNm = instNm;
    this.sxClCd = sxClCd;
    this.age = age
    this.validated = false;
    this.validatedName = false;
    this.confirms = [false, false, false];
    this.noticeAgree = [];
    this.files = null;
    this.isrrClCd = isrrClCd;
    this._agrInfo = agrInfo;
    this.updFleNo = updFleNo;
    this.cellPhoneNo = cellPhoneNo;
    this._tempId = window.crypto.randomUUID();
  }

  set cellPhoneNo(cellPhoneNo) {

    console.debug('set cellPhoneNo', cellPhoneNo, this._agrInfo)

    if (!this._agrInfo) {
      this._agrInfo = new AgrInfo({ decTgrTelNo: cellPhoneNo })
    } else {
      if (this.isAgreeDone()) {
        console.error('이미 동의 되어 있음', this.agrInfo, cellPhoneNo)
      }
      this._agrInfo.tgrTelNo = cellPhoneNo;
    }
  }

  get cellPhoneNo() {
    return this._agrInfo?.tgrTelNo;
  }

  get tempId() {
    return this._tempId;
  }

  /**
   * 동의 완료 되었는지
   * @return {boolean}
   */
  isAgreeDone() {
    return this._agrInfo?.agrStsCd === AgrStsCd.동의;
  }

}


/**
 * @class {AgrInfo} - 동의정보
 * @property agrNo {string}
 * @property token {string}
 * @property tgrFnm {string}
 * @property tgrRrno {string}
 * @property tgrTelNo {string}
 * @property agrClCd {'BHD'}
 * @property agrStsCd {agrStsCd}
 * @property agrStsCdNm {string}
 * @property agrDttm {string}
 * @property smsTrsmSqn {number} - 문자전송 횟수
 * @property smsFnlDttm {Date} - 최종 발송 시각
 */
export class AgrInfo {

  /**
   * @param {Object} param
   * @param param.agrNo {string?}
   * @param param.token {string?}
   * @param param.tgrFnm {string?}
   * @param param.decTgrRrno {string?}
   * @param param.decTgrTelNo {string}
   * @param [param.agrClCd='BHD'] {string}
   * @param param.agrStsCd {AgrStsCd?}
   * @param param.agrStsCdNm {string?}
   * @param param.agrDttm {string?}
   * @param param.smsTrsmSqn {number?} - 문자전송 횟수
   * @param param.smsFnlDttm {Date?} - 최종 발송 시각
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
 * @class {IsrPrd} - 선택한 보험
 */
export class IsrPrd {

  /**
   *
   * @type {IsrPrdDtlData}
   */
  _isrPrdDtlData = null;
  /**
   *
   * @type {TgrInfo}
   */
  _tgrInfo = null;

  /**
   *
   * @param isrPrdDtlData {IsrPrdDtlData} - 보험 상품 상세 정보
   * @param tgrInfo {TgrInfo?} - 대상자
   * @param [unregister=true] {boolean} - 가입 여부(미가입 상품인 경우 false)
   */
  constructor(isrPrdDtlData, tgrInfo, register = true) {

    console.debug('IsrPrd data', isrPrdDtlData, 'tgrInfo', tgrInfo)

    this._isrPrdDtlData = isrPrdDtlData
    this._tgrInfo = tgrInfo;
    this.useYn = register


    this.selectedTime = new Date().getTime();


    /*
    this.isrPrdCd = isrPrdDtlData.isrPrdCd;
    this.isrPrdNm = isrPrdDtlData.isrPrdNm;
    this.isrDtlCd = isrPrdDtlData.isrDtlCd;
    this.isrDtlNm = isrPrdDtlData.isrDtlNm;
    this.isrrClCd = isrPrdDtlData.isrrClCd;
    this.essYn = isrPrdDtlData.essYn ? 'Y' : 'N';
    this.bhdSlcSeq = bhdSlcSeq
    this.xmpRegClCd = isrPrdDtlData.xmpRegClCd
    this.olfDndIvgYn = isrPrdDtlData.olfDndIvgYn

    this.mIsrUprCd = isrPrdDtlData.mIsrUprCd;
    this.mIsrSbcAmt = isrPrdDtlData.mIsrSbcAmt;
    this.mIsrSbcScr = isrPrdDtlData.mIsrSbcScr;

    this.fIsrUprCd = isrPrdDtlData.fIsrUprCd;
    this.fIsrSbcAmt = isrPrdDtlData.fIsrSbcAmt;
    this.fIsrSbcScr = isrPrdDtlData.fIsrSbcScr;*/


    /*this.tgrFnm = tgrInfo.usrFnm;
    this.tgrRrno = tgrInfo.usrFnm;
    this.tgrAg = tgrInfo.age
    this.tgrSxClcd = tgrInfo.sxClCd;
    this.cellPhoneNo = tgrInfo.cellPhoneNo;
    this.isrUprCd = tgrInfo.sxClCd && tgrInfo.sxClCd === '1' ? isrPrdDtlData.mIsrUprCd : isrPrdDtlData.fIsrUprCd
    this.isrSbcAmt = tgrInfo.sxClCd && tgrInfo.sxClCd === '1' ? isrPrdDtlData.mIsrSbcAmt : isrPrdDtlData.fIsrSbcAmt;
    this.isrSbcScr = tgrInfo.sxClCd && tgrInfo.sxClCd === '1' ? isrPrdDtlData.mIsrSbcScr : isrPrdDtlData.fIsrSbcScr;
    */

  }

  get isrDtlNm() {
    return this._isrPrdDtlData.isrDtlNm
  }

  get tgrFnm() {
    return this._tgrInfo.usrFnm
  }

  get tgrRrno() {
    return this._tgrInfo.rrno
  }

  get tgrSxClcd() {
    return this._tgrInfo.sxClCd
  }

  get agrInfo() {
    return this._tgrInfo.agrInfo
  }



  get isrDtlCd() {
    return this._isrPrdDtlData.isrDtlCd
  }

  get isrrClCd() {
    return this._isrPrdDtlData.isrrClCd
  }

  get isrUprCd() {
    if (!this._tgrInfo || !this._tgrInfo.sxClCd) return null;

    if (this._tgrInfo.sxClCd === SxClCd.남) {
      return this._isrPrdDtlData.mIsrUprCd
    }

    return this._isrPrdDtlData.fIsrUprCd
  }

  get isrSbcAmt() {
    if (!this._tgrInfo || !this._tgrInfo.sxClCd) return -1;

    if (this._tgrInfo.sxClCd === SxClCd.남) {
      return this._isrPrdDtlData.mIsrSbcAmt;
    }

    return this._isrPrdDtlData.fIsrSbcAmt;
  }

  get isrSbcScr() {
    if (!this._tgrInfo || !this._tgrInfo.sxClCd) return -1;

    if (this._tgrInfo.sxClCd === SxClCd.남) {
      return this._isrPrdDtlData.mIsrSbcScr;
    }

    return this._isrPrdDtlData.fIsrSbcScr;
  }

}


/**
 *
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
 *
 * @param childInfo {TgrInfo} - 자녀 정보
 * @param {TgrInfo} pseInfo - 공무원 주민번호
 * @param {string} bseYr - 기준연도
 * @param {string} chldIsrAgRstcYr - 기관의 자녀나이 제한 연도
 * @param {string[]} [otheRrnos=[]] - 다른 주민번호
 * @return {Checked}
 */
export const validateChildSsn = (childInfo, pseInfo, bseYr, chldIsrAgRstcYr, otheRrnos = []) => {

  console.debug('childInfo', childInfo)

  if (!childInfo.rrno) return { valid: false, message: '주민번호를 입력하세요' }

  if (childInfo.rrno.length !== 13 || !nxtUtil.validateSsn(childInfo.rrno)) {
    return { valid: false, message: '올바른 주민번호 형식이 아닙니다.' }
  }


  if (childInfo.rrno === pseInfo.rrno) {
    return { valid: false, message: '자녀와 주민번호가 동일합니다.' }
  }

  if (otheRrnos.includes(childInfo.rrno)) {
    return { valid: false, message: '이미 등록되어 있는 주민번호 입니다.' }
  }

  const ageObj = calcSsn(childInfo.rrno, bseYr, true);

  if (ageObj.tgrAg < 0) {
    return { valid: false, message: '자녀의 나이가 0세 미만 입니다.' };
  }

  if (ageObj.tgrAg >= pseInfo.age) {
    return { valid: false, message: '자녀의 나이가 부모의 나이 보다 많습니다.' };
  }

  // 19세 이상
  if (ageObj.bornYear < parseInt(chldIsrAgRstcYr) && (!childInfo.updFleNo && !childInfo.files)) {
    ageObj.over19 = true;
  }

  // 14세 이상
  if (ageObj.tgrAg >= 14 && !childInfo.cellPhoneNo) {
    ageObj.over14 = true;
  }

  return { valid: !ageObj.over19 && !ageObj.over14, data: ageObj };

}

/**
 *
 * @param name {string}
 * @param [otherNames=[]] {string[]?}
 * @return {Checked}
 */
export const validateName = (name, otherNames = []) => {

  console.debug('validateName', name, 'otherNames', otherNames)

  if (!name) return { valid: false, message: '성명을 입력해 주세요' }

  if (!nxtUtil.validateName(name)) {
    return { valid: false, message: '성명을 확인해 주세요.성명은 영문 한글 공백만 가능합니다.' }
  }

  if (otherNames.find(o => o === name)) {
    return { valid: false, message: '이미 등록되어 있는 성명입니다.' }
  }

  return { valid: true }

}



/**
 * 배우자 성명 체크
 * @param name {string} - 배우자 성명
 * @param validated {boolean} - 배우자 validated 여부
 * @param pseInfo {TgrInfo} - 공무원 정보
 * @param pseInfo {TgrInfo} - 공무원 정보
 * @param childInfo {TgrInfo[]?} - 자녀 정보
 * @return {Checked}
 */
export const validateSpsName = (name, validated, pseInfo, childInfo) => {

  if (!name) {
    return { valid: false, message: '배우자의 성명을 입력해주세요' }
  }

  const checked = validateName(name, childInfo?.filter(c => c.validated).map(c => c.usrFnm));

  if (!checked.valid) {
    return checked;
  }

  // 부부가 성명이 동일한 경우
  // validated가 true면 이미 동의했다고 생각해서 더이상 물어보지 말자
  if (!validated && name === pseInfo.usrFnm) {
    return { valid: false, data: { sameName: true } }
  }

  return checked;

}

/**
 * 배우자 주민 번호 체크
 * @param rrno {string} - 배우자 주민번호
 * @param pseInfo {TgrInfo} - 공무원 정보
 * @param bseYr {string} - 기준연도
 * @param childInfo {TgrInfo[]?} - 자녀 정보
 * @return {Checked}
 */
export const validateSpsSsn = (rrno, pseInfo, bseYr, childInfo) => {

  console.debug('validateSpsSsn', 'spsInfo', rrno, 'rrno.length', rrno.length, 'pseInfo', pseInfo, 'bseYr', bseYr, 'childInfo', childInfo)

  if (!rrno || rrno.length !== 13) return { valid: false, message: '올바른 주민번호가 아닙니다.' }

  // 주민번호 형식 체크
  if (!nxtUtil.validateSsn(rrno)) {
    return { valid: false, message: '올바른 주민번호가 아닙니다.' }
  }

  if (rrno === pseInfo.rrno) {
    return { valid: false, message: '배우자의 주민번호가 동일합니다.' }
  }

  if (!bseYr) bseYr = new Date().getFullYear().toString();

  const { bornYear, tgrSxClCd, tgrAg, birthday } = calcSsn(rrno, bseYr);

  console.debug('calcssn', tgrSxClCd, tgrAg);
  if (tgrSxClCd === pseInfo.sxClCd) {
    return { valid: false, message: '배우자의 성별이 동일합니다.' }
  }
  if (tgrAg < 18) {
    return { valid: false, message: '배우자의 주민번호가 미성년자입니다.' }
  }

  return { valid: true, data: { bornYear, tgrSxClCd, tgrAg, birthday } }

}

/**
 * 배우자 정보 체크
 * @param spsInfo {TgrInfo} - 배우자 정보
 * @param pseInfo {TgrInfo} - 공무원 정보
 * @param bseYr {string} - 기준연도
 * @param childInfo {TgrInfo[]?} - 자녀 정보
 * @return {Checked}
 */
export const validateSps = (spsInfo, pseInfo, bseYr, childInfo) => {

  const checkName = validateSpsName(spsInfo.usrFnm, spsInfo.validatedName, pseInfo, childInfo);

  if (!checkName.valid) return checkName;

  const checkRrno = validateSpsSsn(spsInfo.rrno, pseInfo, bseYr, childInfo);

  if (!checkRrno.valid) return checkRrno;

  if (!spsInfo.cellPhoneNo || !nxtUtil.validateMobileNum(spsInfo.cellPhoneNo)) {
    return { valid: false, data: { needCellphone: true }, message: '휴대폰 번호를 확인해 주세요' };
  }

  return { valid: true }

}

/**
 * 보험 선택
 * @param isrPrdDtlData {IsrPrdDtlData} - 보험 상품 상세
 * @param tgrInfo {TgrInfo} - 대상자
 * @param selected {Object} - 선택 상품
 * @param [ignore=false] {boolean} - 미가입 선택
 */
const selectIsrPrd = (isrPrdDtlData, tgrInfo, selected, ignore = false) => {

  const select = new IsrPrd(isrPrdDtlData,)

  // 이미 보험이 선택 되어 있다면
  if (selected[isrPrdDtlData.isrPrdCd]) {


    selected.push()
  } else {

    if (isrPrdDtlData.isrrClCd === IsrrClCd.자녀) {

      selected.push([new IsrPrd(isrPrdDtlData,)])
    } else {

    }
  }


}


/**
 * 대상자의 선택한 보험을 삭제함
 * @param tgrInfo
 * @param selected
 */
const deleteIsrPrd = (tgrInfo, selected) => {
  if (selected && tgrInfo.rrno) {
    Object.entries(selected).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value[0].isrrClCd === tgrInfo.isrrClCd) {
          value.forEach((v, i) => {
            if (v.tgrRrno === tgrInfo.rrno) {
              value.splice(i, 1);
            }
          })
        }
      } else {
        if (value.isrrClCd === tgrInfo.isrrClCd && value.tgrRrno === tgrInfo.rrno) {
          delete this.selected[key]
        }
      }
    })
  }
}


export const deleteChildInfo = (childId, childInfo, selected) => {

  const _child = childInfo.find(c => c.tempId === childId);

  if (!_child) throw new Error('해당 자녀가 없습니다.');

  if (!_child.rrno) {

  }

}

/**
 * 보험 데이터 sort및 정렬
 * @param rtnList {Object}
 * @return {IsrPrdData[]}
 */
export const transformIsrData = (rtnList) => {

  // 보험상품 sort
  // 1. 보험 대상자 구분
  // 2. 필수 여부
  // 3. 보험 상품 코드
  // 4. 보험 대상자 주민 번호
  rtnList.sort((a, b) => parseInt(a.isrrClCd) - parseInt(b.isrrClCd)
    || ((a.essYn < b.essYn) ? 1 : (a.essYn > b.essYn) ? -1 : 0)
    || ((a.isrPrdCd > b.isrPrdCd) ? 1 : (a.isrPrdCd < b.isrPrdCd) ? -1 : 0)
    || (parseInt(this.hashidsHelper.decode(a.tgrRrno)) - parseInt(this.hashidsHelper.decode(b.tgrRrno)))
  )

  // 보험 상품 데이터  가공
  // essYn: Y/N => boolean
  rtnList.forEach(r => {

    if (typeof r.essYn === 'string') {
      r.essYn = r.essYn === 'Y'
    }

    // 보험 상품 상세 데이터 가공
    // essYn 추가
    // olfDndIvgYn 추가
    r.dtlCdList.forEach(d => {
      d.essYn = r.essYn
      d.olfDndIvgYn = r.olfDndIvgYn
    })

    // 보험 상품 상세 데이터 sort
    // 1. 가격
    // 2. 상품 상세 코드
    r.dtlCdList.sort((a, b) => (a.mIsrSbcAmt - b.mIsrSbcAmt)
      || ((a.isrDtlCd > b.isrDtlCd) ? 1 : (a.isrDtlCd < b.isrDtlCd) ? -1 : 0))
  })

  return rtnList;

}













