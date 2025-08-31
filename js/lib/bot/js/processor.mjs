/*import {notice, privacyNotice} from "../info/info.mjs";*/

let {unboxingToken} = await import('./script_test.mjs')
let {__validateUser,__confirmPrivacy} = await import('./web_script.mjs')

import {notice, privacyNotice} from "../info/info.mjs";
import {alertMessage, chat, confirmMessage, customConfirmMessage, Question} from "./chat.mjs";

/**
 * '1': 남자
 * '2': 여자
 * @typedef {'1'|'2'} sxClCd
 */

/**
 * '0': 본인
 * '1': 배우자
 * '3': 자녀
 * @typedef {'0'|'1'|'3'} isrrClCd
 */


/**
 * 보험 대상자 정보
 */
class TgrInfo {
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
    this.bhdSlcSeq = null;

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
class AgrInfo {

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
class IsrPrd {
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
  constructor(data, bhdSlcSeq,  tgrFnm, tgrRrno, tgrSxClcd, tgrAg, cellPhoneNo, files, updFleNo) {
    console.log('data', data, 'tgrFnm', tgrFnm, 'tgrRrno', tgrRrno, 'tgrSxClcd', tgrSxClcd, 'updFleNo', updFleNo)
    this.isrPrdCd = data.isrPrdCd;
    this.isrPrdNm = data.isrPrdNm;
    this.isrDtlCd = data.isrDtlCd;
    this.isrDtlNm = data.isrDtlNm;
    this.isrrClCd = data.isrrClCd;
    this.essYn = data.essYn ? 'Y' : 'N';
    this.bhdSlcSeq = bhdSlcSeq || 0
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
    this.isrUprCd = tgrSxClcd && tgrSxClcd == '1' ? data.mIsrUprCd : data.fIsrUprCd
    this.isrSbcAmt = tgrSxClcd && tgrSxClcd == '1' ? data.mIsrSbcAmt : data.fIsrSbcAmt;
    this.isrSbcScr = tgrSxClcd && tgrSxClcd == '1' ? data.mIsrSbcScr : data.fIsrSbcScr;

    this.files = files
    this.updFleNo = updFleNo
    this.selectedTime = new Date();
    this.agrInfo = null;

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


class StoredData {
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

  get stored(){
    return this.stored;
  }

  set pseSsn(ssn){

    Object.values(this.stored).filter(s=>s.isrrClCd === '0' && s.tgrRrno).forEach(s=>s.tgrRrno = ssn)
  }

  /**
   * 이전에 저장된 보험선택과 비교하여
   * 변경되었는지를 검사한다.
   * 검사 기준은 isrDtlCd, isrUprCd tgrRrno, tgrFnm
   * @param selected {IsrPrd} - 최종 선택 내역
   * @param decode {function} - 주민번호 decode 함수
   * @return {boolean}
   */
  checkChanged(selected, decode){

    console.log('checkChanged', selected, 'this.stored', this.stored)

    if(!selected || !Object.keys(selected).length) return false;



    if(!this.stored || !Object.keys(this.stored).length) return true;

    const flatStored = Object.values(this.stored).flat();

    flatStored.forEach(f=>f.tgrRrno = decode(f.tgrRrno))

    const flatSelected = Object.values(selected).flat();

    if(flatStored.length !== flatSelected.length) return true;

    //if(flatSelected.find(s=>s.files && s.files.length)) return true;

    const found1 = flatSelected.filter(f=>!flatStored.find(b=> {
//if(f.isrPrdCd === b.isrPrdCd) console.log('found1', f.isrPrdCd, b.isrPrdCd, f.isrDtlCd, b.isrDtlCd,  f.isrUprCd, b.isrUprCd, f.tgrFnm, b.tgrFnm, f.tgrRrno, b.tgrRrno)

      return f.isrPrdCd === b.isrPrdCd
        && f.isrDtlCd === b.isrDtlCd
        &&  f.isrUprCd === b.isrUprCd
        &&  f.tgrFnm === b.tgrFnm
        &&  f.tgrRrno ===  b.tgrRrno
        /*&&  f.tgrSxClcd === b.tgrSxClcd
        &&  f.tgrAg === b.tgrAg*/
    }));

console.log('found1', found1)

    if(found1 && found1.length) return true;

    const found2 = flatStored.filter(f=> !flatSelected.find(b=> {

if(f.isrPrdCd === b.isrPrdCd) console.log('found2', f.isrPrdCd, b.isrPrdCd, f.isrDtlCd, b.isrDtlCd,  f.isrUprCd, b.isrUprCd, f.tgrFnm, b.tgrFnm, f.tgrRrno, b.tgrRrno)

      return !f.isrDtlCd
        || (b.isrDtlCd === f.isrDtlCd
            &&  f.isrUprCd === b.isrUprCd
            &&  f.tgrFnm === b.tgrFnm
            &&  f.tgrRrno === b.tgrRrno)
        /*&&  f.tgrSxClcd === b.tgrSxClcd
        &&  f.tgrAg === b.tgrAg
        &&  f.cellPhoneNo === b.cellPhoneNo*/
    }));
console.log('found2', found2)

    if(found2 && found2.length) return true;

    return false;

  }

  getChanged(selected, decode, bseYr, wlfInst, pseInfo){

    console.log('getChanged', selected, 'this.stored', this.stored)

    // 이전 자료가 없으면 전체를 반환
    if(!this.stored || !Object.keys(this.stored).length) return selected;

    const flatStored = Object.values(this.stored).flat();

    flatStored.forEach(f=>f.tgrRrno = decode(f.tgrRrno))

    const flatSelected = Object.values(selected).flat();

    const found1 = flatSelected.filter(f=>!flatStored.find(b=> {

      return f.isrPrdCd === b.isrPrdCd
        && f.isrDtlCd === b.isrDtlCd
        &&  f.isrUprCd === b.isrUprCd
        &&  f.tgrFnm === b.tgrFnm
        &&  f.tgrRrno ===  b.tgrRrno
    }));

    console.log('found1', found1)

    const found2 = flatStored.filter(f=> !flatSelected.find(b=> {

      return !f.isrDtlCd
        || (b.isrDtlCd === f.isrDtlCd
          &&  f.isrUprCd === b.isrUprCd
          &&  f.tgrFnm === b.tgrFnm
          &&  f.tgrRrno === b.tgrRrno)
    }));
    console.log('found2', found2)

    const found3 = (!found1 || !found1.length)?found2:
      found2.filter(f => !found1.find(b=>
        f.isrPrdCd === b.isrPrdCd && f.bhdSlcSeq === b.bhdSlcSeq
      )
    )

    console.log('found3', found3)

    return found1.concat(found3.map(f=>convertSelected(f, bseYr, wlfInst, pseInfo, true)));

  }

}


/**
 * 로딩 표시
 * @param isLoading
 */
const loading = (isLoading = true) => {
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
};

//import {unboxingToken} from "./script_test.mjs";

export function processor() {
  return {

    /**
     * 사전선택 시작시간
     */
    openTime: '08:00',
    loadtime: null,
    storedtime: null,
    testMode: false,
    dcnYn: false,
    storedData: null,
    bseYr: null,
    token: null,
    /**
     * 현재 질문 인덱스
     * @type {number} - 질문 인덱스
     */
    current: -2,

    /**
     * 현재 단계 화면 상단에 stepper를 눌렀을때 변경된다.
     * 실제 단계는 realStep 이다.
     * @type {1|2|3|4|5} - 1. 본인확인, 2.유의사항 확인, 3. 보험선택, 4. 선택결과, 5.보험확정
     *
     */
    step: 1,
    /**
     * 실제 단계
     * @type {1|2|3|4|5}
     */
    realStep: 1,

    setStep: function (step) {
      console.log('setStep', step, 'this.step', this.step, 'this.realStep', this.realStep, this)
      this.step = step;

      this.realStep = Math.max(step, this.realStep)
      console.log('setStep==>', step, 'this.step', this.step, 'this.realStep', this.realStep)
    },
    /**
     * @type {HashidsHelper}
     */
    hashidsHelper: null,

    /**
     * 질문들
     * @type {Question[]}
     */
    questions: [],

    /**
     * 브레드 컴 목록
     * @type {string[]}
     */
    breadCrumbs: [],

    /**
     * 사용자가 선택한 값
     * @type {{isrPrdCd: IsrPrd}}
     */
    selected: {},

    /**
     * 공무원 정보
     * @type TgrInfo
     */
    pseInfo: {validated: false, confirms: []},
    /**
     * 배우자 정보
     * @type TgrInfo
     */
    spsInfo: null,
    spsPrdMin: null,
    /**
     *  자녀 정보
     * @type {[TgrInfo]}
     */
    chldInfo: [],
    /**
     * 자녀 보험 선택 완료 여부
     * @type {boolean}
     */
    childDone: false,

    stepper: null,

    /**
     * 기관 정보
     */
    wlfInst: ({
      /**
       * @type {string} - 사전선택 시작일 yyyyMMdd
       */
      bhdSlcBgnDt: null,
      /**
       * @type {string} - 사전선택 종료일 yyyyMMdd
       */
      bhdSlcNdDt: null,
      /**
       * @type {string} - 보험 시작일 yyyy.MM.dd
       */
      isrBgnDt: null,
      /**
       * @type {string} - 보험 종료일 yyyy.MM.dd
       */
      isrNdDt: null,
      /**
       * @type {string} - 자녀보험연령제한연도 yyyy
       */
      chldIsrAgRstcYr: null,
      bseYr: null,
      wlfInstCd: null,
      wlfInstNm: null,
      oprInstCd: null,
      avgUprUseYn: null,
      olfDndIvgYn: null,
    }),

    async init() {

      this.storedtime = new Date().getTime();

      console.log('init', this.current, this.storedtime);

      if (this.current >= 0 && Object.values(this.selected).length) {
        const confirm = await confirmMessage('보험선택 초기화', `보험을 처음부터 다시 선택 하시겠습니까?`);

        if (!confirm) return;
      }

      if (this.current >= 0) this.current = 0

      // 최초 로딩인 경우
      if (this.current === -2) {

        const urlParams = new URL(location.href).searchParams;

        this.bseYr = urlParams.get("bseYr");
        this.token = urlParams.get("token");

        this.testMode = this.token.length > 500

        if (!this.testMode) {
          this.hashidsHelper = new HashidsHelper(this.token);
        }

        // 최초 모달
        this.welcome();

        try {
          await this.getIsrData();

          this.current = -1;

          this.validateTgr()

        } catch (err) {
          console.error(err)
          this.current = -3;
          return;
        }

      }

      console.log('current', this.current, 'step', this.step, 'realStep', this.realStep)
      // 채팅 시작
      if (this.current >= 0) {

        if (this.current === 0) {

          this.chatStart();

          /*// 본인 인증
          if(!this.pseInfo.validated){
            this.validateUser('name')
          }*/
        }
      }

    },

    /**
     * 보험 정보를 가져옴
     * @param bseYr
     */
    async getIsrData() {

      if (this.testMode) {

        const {pseInfo, wlfInst, rtnList} = unboxingToken(this.token, TgrInfo);

        this.pseInfo = pseInfo;
        this.wlfInst = wlfInst;

        this.questions = rtnList.map(d => new Question({
          'short_title': d.isrPrdNm,
          'message': `${d.essYn ? '<span class="text-success bi bi-check2-square"> 필수</span>' : '<span class="text-primary bi bi-bag-plus"> 선택</span>'} <b>${d.isrPrdNm}</b> 보험을 선택해 주세요`,
          'optionFunc': this.makeIsrPrdOption.bind(this),
          'data': d
        }));
        console.debug('unboxingToken', pseInfo, wlfInst, rtnList, this.questions)

        // 배우자 상품중 첫번째 상품
        this.spsPrdMin = rtnList.filter(p=>p.isrrClCd === '1')?.[0]?.isrPrdCd

        return;
      }

      const initTime = new Date().getTime();

      console.log('this.token', this.token)

      await fetch(`/wus/uim/bsm/nxt/wusUimBsmPreSelctn/${encodeURI(this.token)}.jdo?bseYr=${this.bseYr}`
        , {
          method: 'GET',
          mode: 'same-origin',
          referrerPolicy: 'same-origin',
        })
        .then(res => res.json())
        .then(jsn => {

          this.wlfInst = jsn.wlfInst

          const il001 = jsn.rtnList.find(d => d.isrPrdCd === "IL0001");
          if (!this.pseInfo || !this.pseInfo?.validated) this.pseInfo
            = new TgrInfo(il001.pseFnm, il001.pseRrno, il001.wlfInstCd, il001.wlfInstNm, il001.sxClCd, il001.pseAg, il001.isrrClCd, il001.updFleNo);

          // 보험상품 sort
          jsn.rtnList.sort((a, b) => parseInt(a.isrrClCd) - parseInt(b.isrrClCd)
            || ((a.essYn < b.essYn) ? 1 : (a.essYn > b.essYn) ? -1 : 0)
            || ((a.isrPrdCd > b.isrPrdCd) ? 1 : (a.isrPrdCd < b.isrPrdCd) ? -1 : 0))

          jsn.rtnList.forEach(r => {
            r.essYn = r.essYn === 'Y'
            r.dtlCdList.forEach(d => {
              d.essYn = r.essYn
              d.olfDndIvgYn = r.olfDndIvgYn
            })

            r.dtlCdList.sort((a, b) => (a.mIsrSbcAmt - b.mIsrSbcAmt)
              || ((a.isrDtlCd > b.isrDtlCd) ? 1 : (a.isrDtlCd < b.isrDtlCd) ? -1 : 0))
          })

          console.log('jsn.rtnList', jsn.rtnList)

          // 배우자 상품중 첫번째 상품
          this.spsPrdMin = jsn.rtnList.filter(p=>p.isrrClCd === '1')?.[0]?.isrPrdCd

          this.questions = jsn.rtnList
            .filter((item, index) => jsn.rtnList.findIndex(d => d.isrPrdCd === item.isrPrdCd) === index) //상품코드로 중복 제거 (e.g 자녀보험
            .map(d => new Question({
              'short_title': d.isrPrdNm,
              'message': `${d.essYn?'<span class="text-success bi bi-check2-square"> 필수</span>':'<span class="text-primary bi bi-bag-plus"> 선택</span>'} <b>${d.isrPrdNm}</b> 보험을 선택해 주세요`,
              'optionFunc': this.makeIsrPrdOption.bind(this),
              'data': d
            }));

          console.log('this.questions', this.questions)

          // 가족 개인정보 제공동의 내역
          const fmlAgrInfos = jsn.fmlAgrInfos.map(f => new AgrInfo(f));

          console.log('fmlAgrInfos', fmlAgrInfos)

          // 이미 보험선택 한 사람인지
          this.dcnYn = il001.bhdSlcSeq > 0

          // 보험 선택 내역 변경인 경우
          if (this.dcnYn) {

            // 안내 사항 다 ok
            this.pseInfo.confirms = this.pseInfo.confirms.map(c => true)

            // 보험 선택정보 만들기
            const makeSelected = (isrData) => ({
              isrPrdCd: isrData.isrPrdCd,
              isrPrdNm: isrData.isrPrdNm,
              isrDtlCd: isrData.isrDtlCd,
              isrDtlNm: isrData.dtlCdList.find(d => d.isrDtlCd === isrData.isrDtlCd)?.isrDtlNm || '',
              isrUprCd: isrData.isrUprCd,
              isrSbcAmt: isrData.isrSbcAmt,
              isrSbcScr: isrData.isrSbcScr,
              isrrClCd: isrData.isrrClCd,
              essYn: isrData.essYn,
              bhdSlcSeq: isrData.bhdSlcSeq,
              xmpRegClCd: isrData.xmpRegClCd,
              olfDndIvgYn: isrData.olfDndIvgYn,
              mIsrUprCd: isrData.mIsrUprCd,
              mIsrSbcAmt: isrData.mIsrSbcAmt,
              mIsrSbcScr: isrData.mIsrSbcScr,
              fIsrUprCd: isrData.fIsrUprCd,
              fIsrSbcAmt: isrData.fIsrSbcAmt,
              fIsrSbcSc: isrData.fIsrSbcScr,
              tgrFnm: isrData.tgrFnm,
              tgrRrno: isrData.tgrRrno,
              tgrSxClcd: isrData.tgrSxClCd,
              tgrAg: isrData.tgrAg,
              updFleNo: isrData.updFleNo,
            })


            jsn.rtnList.forEach(d => {

              if (d.isrrClCd === '3') {

                let child;
                if(d.tgrRrno) {

                  child = new TgrInfo(d.tgrFnm, d.tgrRrno, '', '', d.tgrSxClCd, d.tgrAg, d.isrrClCd, d.updFleNo);
                  child.agrInfo = fmlAgrInfos?.find(f => f.tgrFnm === d.tgrFnm && f.tgrRrno === d.tgrRrno)
                  if (child.agrInfo) child.cellPhoneNo = child.agrInfo.tgrTelNo;
                  child.bhdSlcSeq = d.bhdSlcSeq;

                  //child.rrno = this.hashidsHelper.decode(child.rrno)

                  this.chldInfo = this.chldInfo ?? []

                  this.chldInfo.push(child)

                }

                this.selected[d.isrPrdCd] = this.selected[d.isrPrdCd] ?? []

                const idx = this.selected[d.isrPrdCd].push(makeSelected(d))
                this.selected[d.isrPrdCd][idx - 1].agrInfo = child?.agrInfo;

              } else {

                if (d.isrrClCd === '1') {

                  if(d.tgrRrno) {
                    this.spsInfo = new TgrInfo(d.tgrFnm, d.tgrRrno, '', '', d.tgrSxClCd, d.tgrAg, d.tgrSxClCd, d.updFleNo)
                    this.spsInfo.agrInfo = fmlAgrInfos?.find(f => f.tgrFnm === d.tgrFnm && f.tgrRrno === d.tgrRrno)
                    if (this.spsInfo.agrInfo) this.spsInfo.cellPhoneNo = this.spsInfo.agrInfo.tgrTelNo;
                    //this.spsInfo.rrno = this.hashidsHelper.decode(this.spsInfo.rrno)
                  }

                  this.selected[d.isrPrdCd] = makeSelected(d)
                  this.selected[d.isrPrdCd].agrInfo = this.spsInfo?.agrInfo;

                } else {
                  this.selected[d.isrPrdCd] = makeSelected(d)
                }

              }

            })

            console.log('sps', this.spsInfo, 'child', this.chldInfo)

            if (!this.spsInfo?.usrFnm) this.spsInfo = null;
            if (!this.chldInfo || !this.chldInfo.length) this.chldInfo = null;

            this.setStep(4);
            this.setStep(3);
            console.log('this.selected', this.selected)

            // 보험선택 변경여부 체크를 위해 저장되었던 정보를 저장함
            this.storedData = new StoredData(this.selected);

          }

        })
        .catch(err => {
          console.error(err);

          this.throwException(`${this.bseYr}년도 단체보험 보험선택 대상자가 아닙니다.
          
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`)

          chat({
            message: `${this.bseYr}년도 단체보험 보험선택 대상자가 아닙니다.
            
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`
          })

        }).finally(() => {
          this.loadtime =  new Date().getTime() - initTime;
          console.log('load on', this.loadtime);
        }); //loading(false));

    },

    

    /**
     * 보험선택 전에
     * 사전선택 대상자인지 사전선택 기관인지 같은
     * 기본 정합성을 체크한다.
     */
    validateTgr() {

      // 대상자 정보가 없을때
      if (!this.pseInfo || !this.pseInfo.usrFnm) {

        this.throwException(`${this.bseYr}년도 단체보험 보험선택 대상자가 아닙니다.
        
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`)

        return false;
      }

      // 기관 사전선택 보험시작/종료일이 없을때
      if (!this.wlfInst || !this.wlfInst.wlfInstNm || !this.wlfInst.bhdSlcBgnDt || !this.wlfInst.bhdSlcNdDt) {

        this.throwException(`${this.bseYr}년도 단체보험 보험선택 기관이 아닙니다.
        
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`)

        return false;
      }

      // 현재가 사전선택 보험시작/종료일이 아닐때
      const slcBgnDt = moment(`${this.wlfInst.bhdSlcBgnDt} ${this.openTime}`, 'YYYYMMDD HH:mm');
      const slcNdDt = moment(this.wlfInst.bhdSlcNdDt, 'YYYYMMDD');

      if (!moment().isBetween(slcBgnDt, slcNdDt, '', '[]')) {

        this.throwException(`${this.bseYr}년도 단체보험 보험선택 기간이 아닙니다.
<br><span>(${slcBgnDt.format('YYYY-MM-DD(ddd)')} ${this.openTime} ~ ${slcNdDt.format('YYYY-MM-DD(ddd)')})</span>
<br><br>
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`, {stack: 'pctime=${new Date().toLocaleDateString()}'})

        return false;

      }

      return true;
    },


    /**
     * 처음 시작하기전에 모달을 보여줌
     */
    welcome() {
      // 시작시 모달 보여줌
      const modal = new bootstrap.Modal(document.querySelector('#modal'), {});
      modal.show()

      modal._element.addEventListener('hidden.bs.modal', () => {

console.log('modal hidden', this.current);

        if(this.current===-3){
          window.close();
          return;
        }

        this.current = 0;

        this.chatStart();

        const usrFnmEl = document.querySelector('#usrFnm');
        if (this.dcnYn) {

          usrFnmEl.value = this.pseInfo.usrFnm;
          usrFnmEl.classList.remove('is-invalid', 'animate__animated', 'animate__headShake')
          usrFnmEl.classList.add('is-valid')
          usrFnmEl.readOnly = true;

          setTimeout(() => {
            document.querySelector('#usrRrno').focus()
          }, 200)

        } else {
          usrFnmEl.focus()
        }

      })
    },
    /**
     * 채팅 시작
     */
    chatStart() {

      if (this.current < 0) return

      // 채팅창 초기화
      //document.getElementById('messages').innerHTML = '';

      //updateBreadCurmb()

      // 변수 초기화
      if (this.realStep === 0) {
        this.current = 0;

        this.selected = {};
        this.spsInfo = {}
        this.chldInfo = [];
        this.childDone = !this.questions.find(q => q.data.isrrClCd === '3');
      }


      this.validateUser()

    },
    async checkSsn(ssn) {
      if (this.testMode) {
        return {valid: this.pseInfo.rrno === ssn}
      }

      loading()

      const encoded = this.hashidsHelper.encode(ssn);

      return await fetch(`/wus/valid/${this.token}/${encoded}.jdo`)
        .then(r => r.json())
        .then(r => {
          console.log('r', r, 'dcnYn', this.dcnYn);
          
          if (this.dcnYn) {
            
            // storedData에 본인 주민번호 hashids 암호화
            this.storedData.pseSsn = encoded
            
            Object.values(this.selected)
              //.filter(s=>s.isrrClCd === '0')
              .forEach(s => {
                // 주민번호 복호화
                // 본인은 인증받은 주민번호
                console.log('s.isrrClCd', s.isrrClCd, 's.tgrRrno', s.tgrRrno, s)
                if (Array.isArray(s)) {
                  s.forEach(ss => {
                    if (ss.tgrRrno) {
                      const decSsn = this.hashidsHelper.decode(ss.tgrRrno);
                      
                      this.chldInfo.find(c => c.rrno === ss.tgrRrno).rrno = decSsn;
                      ss.tgrRrno = decSsn;
                    }
                    ss.tgrRrno = !ss.tgrRrno ? '' : ss.isrrClCd === '0' ? ssn : this.hashidsHelper.decode(ss.tgrRrno)
                    
                  })
                } else {
                  if (s.tgrRrno) {
                    if (s.isrrClCd === '0') s.tgrRrno = ssn;
                    else {
                      const decSsn = this.hashidsHelper.decode(s.tgrRrno);
                      s.tgrRrno = decSsn;
                      
                      this.spsInfo.rrno = decSsn;
                      
                    }
                    
                    s.tgrRrno = !s.tgrRrno ? '' : s.isrrClCd === '0' ? ssn : this.hashidsHelper.decode(s.tgrRrno)
                    
                  }
                  
                }
              });
          }

          return r;
        })
        .catch(ex => {
          alertMessage('오류 발생', '서버와 통신 중 오류가 발생했습니다.<br>잠시 후 다시 시도해 주십시오', 'danger');
          console.error('본인 인증 오류 발생', ex);
          
          this.sendLog('E', {message: '본인 인증 오류 발생', ex})
          return false;
        }).finally(() => loading(false))
    },

    /**
     * 성명 유효성 확인
     * @param input {HTMLInputElement}
     * @param storedName {string} - 기존에 저장된 이름
     * @return {boolean}
     */
    checkName(input, storedName) {

      input.value = input.value.trim()

      const name = input.value;
      const feedbackEl = input.parentElement.querySelector('.invalid-feedback');

      if (!name) {

        input.classList.remove('is-valid')
        input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
        feedbackEl.innerText = `성명을 입력 해주세요`;
        input.focus();
        return false;
      }

      // 성명 체크
      if (!validateName(name)) {

        this.sendLog("D", {'성명오류': name})

        input.classList.remove('is-valid')
        input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
        feedbackEl.innerText = `성명을 확인해 주세요
성명은 영문 한글 공백만 가능합니다.`;
        input.focus();
        return false;
      }

      // 배우자, 자녀 정보변경하는 경우
      // 성명 변경하지 않은 경우 유효성 체크에서 이미 등록되어 있다고 나오기 때문에
      // 이 이후는 체크하지 않음
      if(storedName === name) return true;

      if (this.pseInfo.usrFnm === name) {
        input.classList.remove('is-valid')
        input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');

        feedbackEl.innerText = '이미 등록되어 있는 성명 입니다.';
        input.focus();
        return false;
      }

      const found = Object.values(this.selected).flat().find(p => p?.tgrFnm === name);
      if (found) {

        input.classList.remove('is-valid')
        input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');

        feedbackEl.innerText = '이미 등록되어 있는 성명 입니다.';
        input.focus();
        return false;
      }


      input.classList.remove('is-invalid', 'animate__animated', 'animate__headShake');
      input.classList.add('is-valid')

      return true;
    },

    /**
     *
     * @param input {HTMLInputElement}
     * @param isrrClCd {isrrClCd}
     * @param storedRrno {string}
     * @return {boolean}
     */
    checkFmlSsn(input, isrrClCd, storedRrno) {

console.log('checkFmlSsn', input.value, 'isrrClCd', isrrClCd, 'storedRrno', storedRrno)

      const rrno = input.value;
      const feedbackEl = input.parentElement.querySelector('.invalid-feedback');

      if (rrno?.length === 13) {


        // 주민번호 형식 체크
        if (!validateSsn(rrno)) {
          input.classList.remove('is-valid')
          input.classList.add('is-invalid');
          feedbackEl.innerText = '올바른 주민번호가 아닙니다.';
          input.focus();
          return false;

        }


        // 배우자 주민번호 체트
        if (isrrClCd === '1') {

          if (rrno === this.pseInfo.rrno) {

            input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
            input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
            feedbackEl.innerText = '배우자의 주민번호가 동일합니다.';
            input.focus();
            return false;
          }

          const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(rrno, this.bseYr);

          if (tgrSxClCd === this.pseInfo.sxClCd) {
            input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
            input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
            feedbackEl.innerText = '배우자의 성별이 동일합니다.';
            input.focus();
            return false;
          }

          if (tgrAg < 19) {
            input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
            input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
            feedbackEl.innerText = '배우자의 주민번호가 미성년자입니다.';
            input.focus();
            return false;
          } else {

            if(storedRrno !== rrno){
              input.classList.remove('is-invalid', 'animate__animated', 'animate__headShake');
              input.classList.add('is-valid')
            }
            return true;
          }

          // 자녀 주민번호 체크
        } else if (isrrClCd === '3') {

          // 주민번호 형식 체크
          const feedbackEl = input.parentElement.querySelector('.invalid-feedback');
          if (!validateSsn(rrno)) {
            input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
            input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
            feedbackEl.innerText = '올바른 주민번호가 아닙니다.';
            input.focus();
            return false;
          }

          if (rrno === this.pseInfo.rrno) {
            input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
            input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
            feedbackEl.innerText = '자녀의 주민번호가 동일합니다.';
            input.focus();
            return false;
          }

          if (this.spsInfo?.rrno === rrno) {
            input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
            input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
            feedbackEl.innerText = '자녀의 주민번호와 배우자의 주민번호가 동일합니다.';
            input.focus();
            return false;
          }

          if(storedRrno !== rrno){

            if (Object.values(this.selected).flat().find(p => p?.tgrRrno === rrno)) {
              input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
              input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');

              feedbackEl.innerText = '이미 등록되어 있는 주민번호 입니다.';
              input.focus();
              return false;
            }
          }


          const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(rrno, this.bseYr, true);

          if (tgrAg <= 0) {
            input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
            input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
            feedbackEl.innerText = '자녀의 나이가 0세 미만 입니다.';
            input.focus();
            return false;
          }

          if (tgrAg >= this.pseInfo.age) {
            input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
            input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
            feedbackEl.innerText = '자녀의 나이가 부모의 나이 보다 많습니다.';
            input.focus();
            return false;
          } else {

            if(storedRrno !== rrno){
              input.classList.remove('is-invalid', 'animate__animated', 'animate__headShake');
              input.classList.add('is-valid')
            }

            return true;
          }

        }

      } else {
        input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
      }

    },

    checkCellPhoneNo(input, storedTelNo) {

console.log('checkCellPhoneNo', input.value, storedTelNo)

      const cellPhoneNo = input.value
      const feedbackEl = input.parentElement.querySelector('.invalid-feedback');

      if (!validateMobileNum(cellPhoneNo)) {
        input.classList.remove('is-valid', 'animate__animated', 'animate__headShake');
        input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');
        feedbackEl.innerText = '올바른 휴대폰 번호가 아닙니다.';
        input.focus();
        return false;
      } else {

        if(cellPhoneNo !== storedTelNo){
          input.classList.remove('is-invalid', 'animate__animated', 'animate__headShake');
          input.classList.add('is-valid');
        }

        return true;
      }

    },

    /**
     * 사용자 본인 인증
     */
    validateUser() {

      // 본인 인증 된경우 다음 단계
      if (this.pseInfo.validated) {
        this.setStep(2);
        this.confirmPrivacy();
      } else {
        this.setStep(1)
      }

    },

    /**
     * 개인정보 제공동의
     */
    confirmPrivacy() {

      console.log('this.step', this.step, 'this.realStep', this.realStep)

      if (this.step > 2) return;

      const step = this.pseInfo.confirms.findIndex(c => !c)

      /*if (step === -1) {

       this.setStep(this.realStep)

      } else {*/

      //this.showPrivacyOffCanvas(step, this.bseYr)
      __confirmPrivacy.bind(this)(privacyNotice)
      this.showPrivacyOffCanvas(0, this.bseYr, document.querySelector('#step0-trigger'))

      //}

    },

    showPrivacyOffCanvas(step = 0, bseYr, btn) {

      console.log('showPrivacyOffCanvas', step, bseYr, btn, privacyOffcanvas._isShown, privacyOffcanvas);

      const nextstep = () => {

        privacyOffcanvas.hide()

        // 이미 동의 된 경우 다음단계 가지말고 창만 닫고 끝냄
        if (!this.pseInfo.confirms[step]) {
          const now = moment().format('YYYY-MM-DD HH:mm:ss');

          btn.title = `  ${now}`

          this.pseInfo.confirms[step] = now;
          btn.classList.remove('active')

          const stepperCircle = btn.querySelector('span.bs-stepper-circle');

          stepperCircle.classList.add('bg-success', 'bi', 'bi-check2');
          stepperCircle.innerText = ''

          const _next = parseInt(step) + 1

          this.showPrivacyOffCanvas(_next, bseYr, document.querySelector(`#step${_next}-trigger`))

        } else {
          const container = document.querySelector('main .container');
          container.scrollTo({top: container.scrollHeight, behavior: 'smooth'});
        }

      }

      if (!privacyNotice[`step${step}`]) return;

      customConfirmMessage(
        privacyNotice[`step${step}`].title,
        privacyNotice[`step${step}`].content(bseYr),
        {
          bsColor: 'primary-subtle',
          onLoaded: () => {

            // modal styling
            const _thisModal = document.querySelector('#infoModal');
            _thisModal.querySelector('div.modal-body div.row div.col').classList.remove('info-message')

            const _thisModalDialog = _thisModal.querySelector('.modal-dialog');
            _thisModalDialog.classList.remove('modal-lg');
            _thisModalDialog.classList.add('modal-xl', 'modal-dialog-scrollable');

            const _thisModalFooter = _thisModal.querySelector('.modal-footer');
            _thisModalFooter.classList.add('row');

            document.querySelector('#offcanvasFooter').remove()

            const __div = _thisModal.querySelector('div.mt-2.fw-bold.text-center');

            if (__div) {
              _thisModal.querySelector('.modal-footer div.d-block').append(__div);
            }

            // 확인 버튼
            const okButton = document.querySelector('#btnPrivacy');
            okButton.addEventListener('click', nextstep)

            // 개인정보 제공동의 홧인 누를때 전체 동의 체크 했는지 확인 필요
            if (step == 1) {

              if (this.pseInfo.confirms[step]) {

                function _readonly(check) {

                  check.checked = true;
                  check.classList.remove('is-invalid');
                  check.classList.add('is-valid');
                  check.disabled = true;
                }

                _readonly(document.querySelector('#agreeAll'))

                document.querySelectorAll('input[type=checkbox][name=checkAgree]').forEach(_readonly);

              } else {
                okButton.disabled = true
                okButton.classList.add('disabled');
              }
            }

          },
          onDispose: () => {
            // modal styling
            const _thisModal = document.querySelector('#infoModal');
            const _thisModalDialog = _thisModal.querySelector('.modal-dialog');
            _thisModalDialog.classList.remove('modal-xl', 'modal-dialog-scrollable');
            _thisModalDialog.classList.add('modal-lg');

            _thisModal.querySelector('div.modal-body div.row div.col').classList.add('info-message')

            const _thisModalFooter = _thisModal.querySelector('.modal-footer');
            _thisModalFooter.classList.remove('row');
          },
          footer: `
  <div class="d-block"></div>
  <div class="d-block">
    <div class="col text-center">
      <button class="btn btn-lg btn-success px-5" id="btnPrivacy" name="okButton" data-bs-dismiss="modal">확인</button>
    </div>
</div>`
        }
      )

    },
    /**
     * 모든 보험 상품을 다 선택했는지 체크한다.
     * @return {Question[]}
     */
    checkNotSelected() {

      const selected = this.questions.filter((question) => {

        if (question.data.isrrClCd === '1') {

          if (this.spsInfo === null) {
            if (this.selected[question.data.isrPrdCd]) {
              this.selected[question.data.isrPrdCd].useYn = 'N'
              this.selected[question.data.isrPrdCd].tgrFnm = ''
              this.selected[question.data.isrPrdCd].tgrRrno = ''
              this.selected[question.data.isrPrdCd].isrDtlCd = ''
              this.selected[question.data.isrPrdCd].isrDtlNm = ''
            }
            return false;
          } else {
            return !this.selected[question.data.isrPrdCd]
          }

        } else if (question.data.isrrClCd === '3') {

          if (this.chldInfo === null) {
            if (this.selected[question.data.isrPrdCd]) {
              delete this.selected[question.data.isrPrdCd];
            }
            return false;

          } else {
            return (!this.selected[question.data.isrPrdCd])
              || (this.chldInfo.length !== this.selected[question.data.isrPrdCd].filter(s => !!s).length)
          }

        } else {
          return !this.selected[question.data.isrPrdCd];
        }
      })

      console.log('checkNotSelected', selected)

      return selected;

    },
    makeIsrStepper() {
      return this.questions;
    },
    /**
     * 보험상품 옵션 만들기
     * @param data {IsrPrd}
     * @param usrFnm {string}
     * @param rrno  {string}
     * @param isrrClCd {string}
     * @param sxClCd {sxClCd}
     * @param age {number}
     * @param cellPhoneNo {string}
     * @param files {any}
     * @return {[HTMLDivElement]}
     */
    makeIsrPrdOption(data, {usrFnm, rrno, isrrClCd, sxClCd, age, cellPhoneNo, files}) {

console.log('makeIsrPrdOption(', 'data', data, 'usrFnm', usrFnm, 'rrno', rrno, 'isrrClCd', isrrClCd, 'sxClCd', sxClCd, 'age', age, 'cellPhoneNo', cellPhoneNo, 'files', files)

      /**
       * 필수 아닐때 미가입 옵션
       * @returns {HTMLButtonElement}
       */
      const ignoreOption = (optionNumber, __data) => {
        const option = document.createElement('button');
        option.classList.add('list-group-item', 'list-group-item-action');
        option.name = `option${__data.isrPrdCd}`;

        if (this.selected[__data.isrPrdCd] && !this.selected[__data.isrPrdCd].tgrFnm) option.classList.add('active');

        const optionTxt = `${optionNumber}. <b>미가입</b>(0원)`

        // 옵션 클릭
        option.onclick = (e) => {

          this.selected[__data.isrPrdCd] = new IsrPrd({
            isrPrdCd: __data.isrPrdCd,
            isrDtlCd: __data.isrDtlCd,
            isrrClCd: __data.isrrClCd,
            essYn: __data.essYn,
            xmpRegClCd: __data.xmpRegClCd,
            olfDndIvgYn: __data.olfDndIvgYn,
          }, __data.bhdSlcSeq)

console.log('ignoreOption', this.selected, '__data', __data)

          this.sendLog('D', {[__data.isrPrdCd]: optionTxt})

          //answer(optionTxt);
          e.target.classList.add('active');

          const sibling = Array.from(e.target.parentElement.querySelectorAll('button.list-group-item-action'));

          sibling.filter(s => s !== e.target).forEach((s => s.classList.remove('active')));

          // stepper trigger lighting
          const _stepperTrigger = document.querySelector(`#${__data.isrPrdCd}-trigger span.bs-stepper-circle`)

          if (!_stepperTrigger.classList.contains('bg-success')) {
            _stepperTrigger.classList.add('bg-success', 'bi', 'bi-check');
            _stepperTrigger.innerText = ''
          }

          setTimeout(() => {
            this.stepper.next()
          }, 700)


        };
        option.innerHTML = optionTxt;

        return option;

      } // end of ignoreOption

      const __options = []


      // 유의사항 버튼
      let __isrPrdCd = data.isrPrdCd;
      // 암진단비
      //if (__isrPrdCd === 'IL0017') __isrPrdCd = 'IL0006'
      //else if (__isrPrdCd == "IL0034" || __isrPrdCd == "IL0035") __isrPrdCd = 'IL0002'

      let optionNumber = 0;

      // 필수 아닐때 미가입 추가
      // 배우자 생명상행도 제외
      if (!data.essYn
        && ((data.isrrClCd === '0')
          || (data.isrrClCd === '1' && data.isrPrdCd !== 'IL0033'))) __options.push(ignoreOption(optionNumber += 1, data));

      // 80세 이상 상품이 있으면 필터가 필요하다
      const containsOver80 = !!data.dtlCdList.find(o => o.isrDtlNm.includes('80세'))

      data.dtlCdList.forEach((o, index) => {

        // 챗봇 형식에서는 배우자 생명상해 미가입 제거
        if (o.isrDtlCd === 'IM0263') return;

        // 80세 이상 상품 필터링
        if (containsOver80) {
          if (age >= 80 && !o.isrDtlNm.includes('80세')) return;
          if (age < 80 && o.isrDtlNm.includes('80세')) return;
        }

        const option = document.createElement('button');
console.log('option', option)

        //option.classList.add('rounded', 'bg-secondary',  'bg-opacity-10', 'p-3', 'mt-1', 'pe-auto', 'focus-ring');
        option.classList.add('list-group-item', 'list-group-item-action');
        option.name = `option${o.isrPrdCd}`;


console.log('this.selected[o.isrPrdCd]?.isrDtlCd', this.selected[o.isrPrdCd]?.isrDtlCd, o.isrDtlCd, 'selected', this.selected[o.isrPrdCd], 'option', option)
        if (this.selected[o.isrPrdCd] && this.selected[o.isrPrdCd].isrDtlCd === o.isrDtlCd) option.classList.add('active');

        optionNumber += 1;

        const sbcAmt = getSbcAmt(sxClCd, o);

        let optionTxt;


        // 자녀 보험
        if (isrrClCd === '3') {

          // 자녀 보험 선택
          if (this.dcnYn && this.chldInfo && this.chldInfo.length && this.selected[o.isrPrdCd]?.length === this.chldInfo.length) option.classList.add('active');


          optionTxt = `<b>${o.isrDtlNm}</b> (${sbcAmt.toLocaleString()}원${sbcAmt > 0 ? '<small> 예상</small>' : ''})`;

        } else {
          optionTxt = `${optionNumber}. <b>${o.isrDtlNm}</b> (${sbcAmt.toLocaleString()}원${sbcAmt > 0 ? '<small> 예상</small>' : ''})`;
        }


        // 옵션 클릭
        option.onclick = async (e) => {

          let delayTime = 600;

          // 의료비 미가입일때 물어보기
          if (data.dtlCdList[index].isrDtlCd === 'IM0212') {

            delayTime = 1200;

            const confirmed = await confirmMessage('의료비 보장 미가입 안내', `의료비 보장 보험은 필수 가입이나,
개인 의료비 보장 보험에 가입되어 있거나, 국가 유공자 등 예우 및 지원에 관한 법률에 의한 대상자에 한하여 미가입 가능합니다.<br>
<br>
미가입 대상자에 해당하십니까?`)

            // 아니요 했을때 상품 가입 시킴
            // 김민경 아이디어임 24. 9. 4. choihunchul
            if (!confirmed) {
              //option.offsetParent.querySelector('div.divForOptionDesc').innerHTML = ''
              return option.nextSibling.click()
            }else{
              this.sendLog('I', {message: 'IM0212', confirm: new Date().toLocaleString()})
            }

          }

          // stepper trigger lighting
          const _stepperTrigger = document.querySelector(`#${data.isrPrdCd}-trigger span.bs-stepper-circle`)

          // 자녀 보험
          if (isrrClCd === '3') {

            this.sendLog('D', {[data.isrPrdCd]: usrFnm})

            const chldIndex = option.dataset.chldIndex;
            const bhdSlcSeq = option.dataset.bhdSlcSeq;

            if (!this.selected[data.isrPrdCd]) this.selected[data.isrPrdCd] = [];

            this.selected[data.isrPrdCd][chldIndex] = new IsrPrd(data.dtlCdList[index], bhdSlcSeq, usrFnm, rrno, sxClCd, age, cellPhoneNo, files);

            if (!_stepperTrigger.classList.contains('bg-success')) {

              if (this.chldInfo.length === this.selected[data.isrPrdCd].filter(s => !!s).length) {
                _stepperTrigger.classList.add('bg-success', 'bi', 'bi-check');
                _stepperTrigger.innerText = ''
              }

            }

          } else {
            this.sendLog('D', {[data.isrPrdCd]: data.dtlCdList[index].isrDtlCd})

            this.selected[data.isrPrdCd] = new IsrPrd(data.dtlCdList[index], data.bhdSlcSeq, usrFnm, rrno, sxClCd, age, cellPhoneNo, files);
          }

          console.log('this.selected', this.selected)


          // selected option lighting
          option.classList.add('active');

          const sibling = Array.from(option.parentElement.querySelectorAll('button.list-group-item-action'));

          sibling.filter(s => s !== option).forEach((s => s.classList.remove('active')));


          setTimeout(() => {
            this.stepper.next()
          }, delayTime)
        };
        option.innerHTML = optionTxt;

        __options.push(option)

      }, true);

      return __options;
    },

    /**
     * 보험선택 tab을 만듬
     * @param indexStep {number}
     */
    async makeQuestion(indexStep= this.stepper._currentIndex){

console.log('makeQuestion', indexStep)

      const question = this.questions[indexStep];

      // 배우자 보험
      if (question.data.isrrClCd === '1' && !this.spsInfo?.usrFnm) {

        document.querySelector(`#${question.data.isrPrdCd}-part div.divForOption`).innerHTML = ''

        await this.confirmSpsIsr(0)

        // 배우자 보험 가입 안함
        if (this.spsInfo === null) {

          let lastestIndex = -1;

          this.questions.filter(q => q.data.isrrClCd === '1')
            .forEach((s => {
              const trigger = document.querySelector(`#${s.data.isrPrdCd}-trigger`);
              trigger.classList.add('opacity-50')

              if(this.selected[s.data.isrPrdCd]) this.selected[s.data.isrPrdCd].tgrFnm = '';

              trigger.parentElement.classList.remove('active')

              const thisIndex = this.stepper._steps.findIndex(s => s.children[0].id === trigger.id);
              if (lastestIndex !== -1) {
                trigger.classList.add('disabled');
              }

              lastestIndex = Math.max(lastestIndex, thisIndex)
            }))

          return lastestIndex > -1 ? this.stepper.to(lastestIndex + 2) : this.stepper.next()

        } else {
          this.questions.filter(q => q.data.isrrClCd === '1')
            .forEach(s => {
              const trigger = document.querySelector(`#${s.data.isrPrdCd}-trigger`);
              trigger.classList.remove('opacity-50')
              trigger.classList.remove('disabled')
            })
        }

        // 자녀 보험
      } else if (question.data.isrrClCd === '3' && !this.chldInfo?.length) {


        document.querySelector(`#${question.data.isrPrdCd}-part div.divForOption`).innerHTML = ''

        await this.confirmChldIsr(0)

        // 자녀 보험 가입 안함
        if (this.chldInfo === null) {

          let lastestIndex = -1;

          this.questions.filter(q => q.data.isrrClCd === '3')
            .forEach((s => {
              const trigger = document.querySelector(`#${s.data.isrPrdCd}-trigger`);
              trigger.classList.add('opacity-50')

              delete this.selected[s.data.isrPrdCd]

              if (s.data.isrPrdCd !== 'IL0035') trigger.classList.add('disabled')

              trigger.parentElement.classList.remove('active')

              lastestIndex = Math.max(lastestIndex, this.stepper._steps.findIndex(s => s.children[0].id === trigger.id))
            }))

          console.log('this.stepper', this.stepper)

          return this.stepper.next()

          //return lastestIndex>-1?this.stepper.to(lastestIndex+2):this.stepper.next()

        } else {
          this.questions.filter(q => q.data.isrrClCd === '3')
            .forEach(s => {
              const trigger = document.querySelector(`#${s.data.isrPrdCd}-trigger`);
              trigger.classList.remove('opacity-50')
              trigger.classList.remove('disabled')
            })
        }

      }

      // 보험 선택 버튼
      const stepsContent = this.stepper._stepsContents[indexStep].querySelector('div.divForOption');

      stepsContent.innerHTML = ''


        const tgrInfo = question.data.isrrClCd === '0' ? this.pseInfo : question.data.isrrClCd === '1' ? this.spsInfo : this.chldInfo

        // 자녀보험
        if (question.data.isrrClCd === '3') {

          if (this.chldInfo && this.chldInfo.length) {
            this.chldInfo.forEach((chld, _idx) => {

              const __div = document.createElement('div')
              __div.classList.add('list-group', 'p-0', 'mb-4', 'focusable')
              const __div2 = document.createElement('div');
              __div2.classList.add('fs-5', 'py-1', 'px-3', 'bg-info-subtle')
              __div2.innerHTML = `${_idx + 1}. <b>${chld.usrFnm}</b>(${formatSsn(chld.rrno)})`
              __div.append(__div2)
              stepsContent.append(__div)

              const options = this.makeIsrPrdOption(question.data, chld)
              options.forEach((option, index) => {
                option.dataset.chldIndex = _idx;
                option.dataset.bhdSlcSeq = chld.bhdSlcSeq || 0;
                option.title = `i:${_idx}, s:${chld.bhdSlcSeq}`
                __div.append(option)
              })
            })
          }

        } else {

          //stepsContent.classList.add('list-group', 'p-0', 'border', 'border-primary', 'animate__animated', 'animate__flash', 'animate__repeat-2', 'animate__slow')
          stepsContent.classList.add('list-group', 'p-0', 'focusable')
          //stepsContent.setAttribute('tabindex', 0)

          const options = this.makeIsrPrdOption(question.data, tgrInfo)

          options.forEach((option, index) => stepsContent.append(option))
        }

        // 유의 사항
        const divForNotice = this.stepper._stepsContents[indexStep].querySelector('div.divForNotice');

        divForNotice.innerHTML = notice[question.data.isrPrdCd].content

        const noticeTitle = document.createElement('div');
        noticeTitle.classList.add('rounded', 'bg-success', 'bg-opacity-25', 'p-2', 'mb-3', 'bi', 'bi-megaphone-fill', 'text-primary', 'fw-bold');
        noticeTitle.textContent = ' 보장내용 및 유의사항';

        divForNotice.prepend(noticeTitle)

        setTimeout(() => {
          stepsContent.focus()
        }, 400)


    },

    /**
     * 보험 선택 관련 질문 ㄱㄱ
     */
    doQuestion() {

      // 스테퍼 설정
      if (!this.stepper) {

        const stepperEL = document.querySelector('#prdSelectStepper');

        this.stepper = new Stepper(stepperEL, {
          linear: false, animation: true
        })

        stepperEL.addEventListener('show.bs-stepper', e => {
          const indexStep = e.detail.indexStep;

console.log('show.bs-stepper', indexStep);

          this.current = indexStep;

          const question1 = this.questions[indexStep];

          const trigger = document.querySelector(`#${question1.data.isrPrdCd}-trigger`);

          if (trigger.classList.contains('disabled')) {
            this.stepper.to(indexStep + 2)
            e.preventDefault()
          }

        })

        stepperEL.addEventListener('shown.bs-stepper', async e => {

          // 다른 stepper tab을 숨김처리함
          Array.from(e.target.querySelectorAll('div.content')).forEach(el => {
            if (el.classList.contains('active')) el.classList.remove('d-none');
            else el.classList.add('d-none')
          })

          const indexStep = e.detail.indexStep;

          return this.makeQuestion(indexStep);

        })
      }

      //scrollTo();
    },

    /**
     * 유의사항 확인한 시각 기록
     * @param isrPrdCd
     */
    doNoticeAgree(isrPrdCd) {
      this.pseInfo.noticeAgree.push({[isrPrdCd]: new Date()})
    },
    deleteSps() {

      confirmMessage('배우자 정보 삭제', `입력된 배우자 정보를 삭제 하시겠습니까?<br>
선택된 모든 배우자 보험도 삭제됩니다.`, 'danger')
        .then(r => {
          if (r) {
            this.spsInfo = null;
            Object.values(this.selected).filter(s => s.isrrClCd === '1')
              .forEach(s => {
                if(this.selected[s.isrPrdCd]) this.selected[s.isrPrdCd].tgrFnm = ''
              });

            console.log('this.selected', this.selected)
            console.log('this.stepper', this.stepper)

            setTimeout(() => {
              this.stepper.next()
            }, 500)

          }
        })
    },

    /**
     * 배우자 정보 변경
     */
    updateSpsIsr(spsFnm, spsRrno, spsTel){

      // 바뀐 내용 확인
      if(spsFnm !== this.spsInfo.usrFnm
        ||  spsRrno !== this.spsInfo.rrno
        ||  spsTel !== this.spsInfo.cellPhoneNo
      ){

        this.sendLog("I", {chgSpsFnm: spsFnm, chgSpsRrno: this.hashidsHelper.encode(spsRrno), chgSpsTel: spsTel})

        const _confirm = confirm('성명: ' + spsFnm + '\n' +
          '주민번호: ' + formatSsn(spsRrno, false) + '\n' +
          '휴대폰 번호: ' + formatMobileNo(spsTel, false) + '\n' +
          '가 맞습니까?')

        if (_confirm) {
          const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(spsRrno, this.bseYr);

          this.spsInfo = new TgrInfo(
            spsFnm, spsRrno, null, null, tgrSxClCd, tgrAg, '1'
          )

          this.spsInfo.cellPhoneNo = spsTel

          Object.values(this.selected).filter(s=>s.isrrClCd === '1')
            .forEach(s => {
              if(s.isrDtlCd){
                s.tgrFnm = spsFnm
                s.tgrRrno = spsRrno
                s.tgrAg = tgrAg
                s.cellPhoneNo = spsTel
              }
            })


          console.log('this.spsInfo', this.spsInfo)
          console.log('this.selected', Object.values(this.selected).filter(s=>s.isrrClCd === '1'))

          alert('배우자 정보가 변경되었습니다.');

          this.makeQuestion()

          return true;
        }

console.log('not changed', this.spsInfo)

        return false;

        // 아무것도 변경 안됐을때 그냥 닫기
      }else{
        return true;
      }


    },

    /**
     * 배우자 보험 가입
     * 0 가입여부
     * 1 성명, 주민번호, 핸드폰
     * @param step {0|1}
     */
    confirmSpsIsr(step) {

      if (step === 0) {

        return confirmMessage('배우자 보험 가입', `<b>배우자 보험 상품에 가입 하시나요?</b>
<div>
  <ul>
    <li>${this.bseYr}.1.1. 기준 <mark>'공무원수당 등에 관한 규정'</mark> 제 10조(가족수당)에 의해 지급되는 대상자</li>
    <li>${this.bseYr}.1.1. 기준 법적혼인관계에 있는 자 (<small>사실혼은 제외</small>)<br>
      <small><b>부부 공무원의 경우 본인의 보험에 가입하는 것이 원칙</b></small></li>
    </ul>
</div>`).then(r => {
          // 정보 입력
          if (r) {

            return this.confirmSpsIsr(1)

            // 배우자 보험 가입 안함
          } else {
            this.spsInfo = null;
            return true;
          }
        })

      } else if (step === 1) {

        return customConfirmMessage('배우자 정보를 입력해주세요', `<div class='row g-3 p-4'>
  <div class="col-md-6">
    <label for="spsFnm" class="form-label">배우자 성명</label>
    <input type="text" id="spsFnm" class="form-control" x-ref="spsFnm" required tabindex="1"
      :value="spsInfo?.usrFnm"
      @keyup.tab="()=>{
        if((!spsInfo?.usrFnm) || (spsInfo.usrFnm !== $el.value)){
          const valid = checkName($el, spsInfo?.usrFnm)
          if(valid)  document.querySelector('button[name=okButton]').click()
        }
      }"
      @blur="()=>{
        const valid = checkName($el, spsInfo?.usrFnm)
        if(valid)  document.querySelector('button[name=okButton]').click()
      }">
    <div class="invalid-feedback"></div>
  </div>
  <div class="col-md-6">
    <label for="spsRrno" class="form-label">배우자 주민번호</label>
    <input :type="spsInfo?.rrno?'password':'tel'" inputmode="numeric" id="spsRrno" x-ref="spsRrno" tabindex="2"
      :value="spsInfo?.rrno"
      x-init="Inputmask({mask: '999999-9999999', keepStatic: true, placeholder: '0', autoUnmask: true}).mask($el);"
      @focus="$el.type='tel'"
      @blur="$el.type='password'"
      @keyup="()=>{
        const valid = checkFmlSsn($el, '1', spsInfo?.rrno)
        if(valid)  document.querySelector('button[name=okButton]').click()
      }"
      class="form-control" required>
    <div class="invalid-feedback"></div>
  </div>
  <div class="col-6">
    <label for="spsTel" class="form-label">배우자 휴대폰 번호
      <em class="text-info bi bi-question-circle-fill"
          x-init="()=>new bootstrap.Tooltip($el)"
         data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"  data-bs-html="true"
         :title="\`배우자 보험 가입을 위해서는 <b>배우자의 개인정보 수집/이용 및 제3자 제공</b>에에 대한 동의가 필요합니다.
보험선택 확정 후에 배우자 휴대폰 번호로 개인정보 동의 확인 메시지가 발송되오니 <b>반드시 기간내에 동의를 완료</b>해주시기 바랍니다.
<b class='text-danger'>미동의시 가입불가</b>\`"></em></label>
    <div class="input-group">
      <input type="tel" inputmode="numeric" id="spsTel" x-ref="spsTel" tabindex="3"
        :value="spsInfo?.cellPhoneNo"
        :disabled="spsInfo?.agrInfo?.agrStsCd==='D'"
        x-init="Inputmask({mask: '999-9999-9999', keepStatic: true, placeholder: '010-0000-0000', autoUnmask: true}).mask($el);"
        @keyup.debounce="($event)=>{
            if($event.target.value.length < 10){
              $el.classList.remove('is-valid');
            }
            if($event.key ==='Enter' || $event.target.value.length === 11){
             const valid = checkCellPhoneNo($el, spsInfo?.cellPhoneNo)
             
             //if(valid) document.querySelector('button[name=okButton]').click()
            }
          }"
        class="form-control" required>
      <button class="btn btn-outline-primary rounded-end d-none"  tabindex="4"
        :disabled="$refs.spsTel.value.length>=10" @click="checkCellPhoneNo($refs.spsTel)">확인</button>
      <div class="invalid-feedback"></div>
    </div>
    <div class="form-text" x-show="spsInfo?.agrInfo?.agrStsCd==='D'">개인정보 제공 동의 완료</div>
  </div>
  <div class="col-12 border rounded-4 bg-warning-subtle p-4 mt-2">
    <small>배우자 보험 가입을 위해서는 <b>배우자의 개인정보 수집/이용 및 제3자 제공</b>에 대한 동의가 필요합니다.<br>
보험선택 확정 후에 배우자 휴대폰 번호로 개인정보 동의 확인 메시지가 발송되오니 <b>반드시 기간내에 동의를 완료</b>해주시기 바랍니다.<br>
<b class="text-danger">미동의시 가입불가</b></small>
  </div>
</div>`, ({
          bsColor: 'info',
          onLoaded: () => {

            setTimeout(() => {
              console.log("document.querySelector('input#spsFnm')", document.querySelector('input#spsFnm'))
              document.querySelector('input#spsFnm').focus()
            }, 400)
          },
          footer: `<button class="w-25 btn btn-lg btn-primary bi bi-check2-all"  tabindex="5" name="okButton">
  확인</button>
<button class="w-25 btn btn-lg btn-danger bi bi-x-circle-fill"  tabindex="6" name="cancelButton">취소</button>`,
          okButton: ({
            callback: () => {

              const spsFnm = document.querySelector('input#spsFnm');
              const spsRrno = document.querySelector('input#spsRrno');
              const spsTel = document.querySelector('input#spsTel');

              if(!this.checkName(spsFnm, this.spsInfo?.usrFnm)){
                spsFnm.focus()
                return false;
              }
              if(spsRrno.value.length!==13){
                spsRrno.classList.remove('is-valid')
                spsRrno.classList.add('is-invalid')
                spsRrno.focus()
                return false;
              }

              if(!this.checkFmlSsn(spsRrno, '1', this.spsInfo?.rrno)){
                spsRrno.focus()
                return false;
              }

              if(!this.checkCellPhoneNo(spsTel)){
                spsTel.focus()
                return false;
              }

              this.sendLog("D", {spsFnm: spsFnm.value, spsRrno: this.hashidsHelper.encode(spsRrno.value), spsTel: spsFnm.value})

              // 배우자 정보 변경
              if(this.spsInfo?.usrFnm){
                return this.updateSpsIsr(spsFnm.value, spsRrno.value, spsTel.value);
              }

              const _confirm = confirm('성명: ' + spsFnm.value + '\n' +
                '주민번호: ' + formatSsn(spsRrno.inputmask._valueGet(), false) + '\n' +
                '휴대폰 번호: ' + formatMobileNo(spsTel.inputmask._valueGet(), false) + '\n' +
                '가 맞습니까?')

              if (_confirm) {
                const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(spsRrno.value, this.bseYr);

                this.spsInfo = new TgrInfo(
                  spsFnm.value, spsRrno.value, null, null, tgrSxClCd, tgrAg, '1'
                )

                this.spsInfo.cellPhoneNo = spsTel.value

                alert('배우자 정보가 입력되었습니다.\n배우자 보험상품을 선택해 주세요');
                return true;
              }

              return false;

            }
          }),
          cancelButton: ({
            callback: () => {

              if(this.spsInfo?.usrFnm){
                return true;
              }


              if (confirm('배우자 보험 상품 가입을 취소 하시겠습니까?')) {
                this.spsInfo = null;

                // 배우자 정보 변경되었을때 선택한 배우자 보험상품 초기화
                Object.values(this.selected).filter(s=>s.isrrClCd === '1')
                  .forEach(s=> {
                    if(this.selected[s.isrPrdCd]) this.selected[s.isrPrdCd].tgrFnm = ''
                  })

                return true;
              }

              return false;
            }
          })

        }))

      }

    },
    validateChildRow(tr) {

      console.log('validateChildRow', tr)

      const childFnm = tr.querySelector('input[name=childFnm]');
      const storedFnm = childFnm.dataset.storedValue;

      const childRrno = tr.querySelector('input[name=childRrno]');
      const storedRrno = childRrno.dataset.storedValue;

      const nextTr = tr.nextElementSibling;

      const childCellphoneNo = nextTr.querySelector('input[name=childCellphoneNo]');
      const storedCellphoneNo = childCellphoneNo.dataset.storedValue;

      const childFile = nextTr.querySelector('input[name=childFile]');

      if (!this.checkName(childFnm, storedFnm)) return false;


      if (childRrno.value?.length !== 13) {

        const feedbackEl = childRrno.parentElement.querySelector('.invalid-feedback');
        childRrno.classList.remove('is-valid');
        childRrno.classList.add('is-invalid');

        feedbackEl.innerText = '주민번호를 입력해주세요';

        childRrno.focus()
        return false;
      }

      if (!this.checkFmlSsn(childRrno, '3', storedRrno)) return false;

      const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(childRrno.value, this.bseYr, true);


      if (tgrAg >= 14) {

        if(nextTr.classList.contains('visually-hidden')) nextTr.classList.remove('visually-hidden')

        if (!this.checkCellPhoneNo(childCellphoneNo, storedCellphoneNo)) {
          childCellphoneNo.focus()
          return false;
        }
      }else{
        if(!nextTr.classList.contains('visually-hidden')) nextTr.classList.add('visually-hidden')
      }

      if (bornYear < parseInt(this.wlfInst.chldIsrAgRstcYr)) {

        if(nextTr.classList.contains('visually-hidden')) nextTr.classList.remove('visually-hidden')
        if(childFile.classList.contains('visually-hidden')){
          childFile.classList.remove('visually-hidden')
          childFile.previousElementSibling.classList.remove('visually-hidden')
        }

console.log('childFile.dataset.storedFile', childFile.dataset.storedFile)

        if (!childFile.value && !childFile.dataset.storedFile) {

          const feedbackEl = childFile.parentElement.querySelector('.invalid-feedback');
          childFile.classList.remove('is-valid');
          childFile.classList.add('is-invalid');

          feedbackEl.innerText = '증빙 파일을 첨부 해 주세요';

          childFile.focus()
          return false
        } else {
          if(childFile.value){
            childFile.classList.remove('is-invalid');
            childFile.classList.add('is-valid');
          }
        }
      }else{
        if(!childFile.classList.contains('visually-hidden')){
          childFile.classList.add('visually-hidden')
          childFile.previousElementSibling.classList.add('visually-hidden')
        }
      }

      return true;

    },
    appendChild(child) {

      const tBody = document.querySelector('table#childRegTable').tBodies[0];

      const _row = tBody.insertRow()

      const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(child?.rrno, this.bseYr, true);

      const overChldIsrAgRstcYr  = child && bornYear > this.wlfInst.chldIsrAgRstcYr

      _row.innerHTML = `
        <th scope="row" x-text="parseInt($el.parentElement.rowIndex/2)+1" rowSpan="2" class="align-middle"></th>
        <td>
          <input type="text" name="childFnm" class="form-control" style="width: 130px"
              value="${child?.usrFnm?child.usrFnm:''}"
              data-stored-value="${child?.usrFnm?child.usrFnm:''}"
              @keyup.tab="()=>{
                const valid = checkName($el, '${child?.usrFnm}')
                if(valid && $el.value !== '${child?.usrFnm}')  document.querySelector('button[name=okButton]').click()
              }"
              @blur="()=>{
                const valid = checkName($el, '${child?.usrFnm}')
                if(valid && $el.value !== '${child?.usrFnm}')  document.querySelector('button[name=okButton]').click()
              }"
          required>
          <div class="invalid-feedback"></div>
        </td>
        <td>
          <input type="${child?'password':'tel'}" inputMode="numeric" name="childRrno" class="form-control" required style="width: 170px"
                 value="${child?.rrno?child.rrno:''}"
                 data-stored-value="${child?.rrno?child.rrno:''}"
                 x-init="()=>Inputmask({mask: '999999-9999999', keepStatic: true, placeholder: '0', autoUnmask: true}).mask($el)"
                @focus="$el.type='tel'"
                @blur="$el.type='password'"
                @keyup="($event)=>{
                    const valid = checkFmlSsn($el, '3', '${child?.rrno?child?.rrno:''}')
                    if(valid && $el.value !== '${child?.rrno?child?.rrno:''}'){
          
                      const _td = $event.target.offsetParent
                      const _tr = $event.target.offsetParent.parentElement
            
                      const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn($el.value, bseYr, true);
                      
                      sendLog('I', {bornYear, tgrSxClCd, tgrAg, birthday})
                      
                      const nextElement = _tr.nextElementSibling;
                      
                      const fileEl = nextElement.querySelector('input[type=file]');
                      
                      // 19세 이상인 경우 장애여부 물어본다.
                      //if ((!fileEl || fileEl.classList.contains('visually-hidden')) && parseInt(bornYear) < parseInt(wlfInst.chldIsrAgRstcYr)) {
                      if (parseInt(bornYear) < parseInt(wlfInst.chldIsrAgRstcYr)) {
                        if(confirm(wlfInst.chldIsrAgRstcYr + '년 1월 1일 이전 출생인 경우 장애가 있는 자녀만 가입이 가능하며, 증빙서류(복지카드 사본, 장애인 증명서 등)가 필요합니다.'
                        + '\\n계속 진행 하시겠습니까?')){
  
                          nextElement.classList.remove('visually-hidden')
                          fileEl.classList.remove('visually-hidden')
                          fileEl.previousElementSibling.classList.remove('visually-hidden')
                          
  
                        // 입력정보 reset
                        }else{
    
                          _tr.querySelector('input[name=childFnm]').value = ''
                          _tr.querySelector('input[name=childRrno]').value = ''
                          nextElement.classList.add('visually-hidden')
                          fielEl.classList.add('visually-hidden')
                          fielEl.previousElementSibling.classList.add('visually-hidden')
                          
                          return;
                
                        }
                      }
                      
                      if(nextElement.classList.contains('visually-hidden')){
                      
                        if(tgrAg>=14){
                          alert('15세 이상 자녀인 경우 보험 가입을 위해서는 자녀의 개인정보 수집/이용 및 제3자 제공동의에 대한 동의가 필요합니다.'
                          + '자녀의 휴대폰 번호를 입력 해 주세요')
                
                          _tr.nextElementSibling.classList.remove('visually-hidden')
                          fileEl.classList.add('visually-hidden')
                          fileEl.previousElementSibling.classList.add('visually-hidden')
      
                        }
                      }
                    _td.nextElementSibling.innerHTML = '<small>생년월일: <b>' + birthday + '</b><br>성별: <b>' + (tgrSxClCd==='1'?'남':'여') + '</b></small>';
                    
                    const tr0 = $el.closest('tr');
                    
                    if(validateChildRow(tr0)){
                      const btn = document.querySelector('button#btnAppendChild')
                      btn.classList.remove('disabled');
                      btn.focus()
                    }
                  }
                }"
          >
          <div class="invalid-feedback"></div>
        </td>
        <td>${child?'<small>생년월일: <b>' + birthday + '</b><br>성별: <b>' + (tgrSxClCd==='1'?'남':'여') + '</b></small>':''}</td>
        <td class="text-end me-1">
          <button class="btn btn-sm btn-warning"
            @click="()=>{
            
              if(confirm('삭제 하시겠습니까?')){
              
                const tr = $el.closest('tr')
                const table = $el.closest('table');
                
                const index = tr.rowIndex
                
                table.deleteRow(index)
                table.deleteRow(index)
                
                if(table.tBodies[0].rows.length <= 0) appendChild()
                
              }
            }">삭제</button>
        </td>`

      const _row2 = tBody.insertRow()
      _row2.classList.add('table-primary')

      if(!child || !child.cellPhoneNo) _row2.classList.add('visually-hidden')

      _row2.innerHTML = `
          <td colSpan="4">
            <div class="row g-3">
              <div class="col px-2 ms-4">
                <label class="form-label mb-1">
                  <small>휴대폰 번호
                    <span class="bi bi-question-circle-fill text-info"
                      data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"  data-bs-html="true"
                      data-bs-title="만 15세 이상 자녀인 경우 보험 가입을 위해서는 자녀의 개인정보 수집/이용 및 제3자 제공동의에 대한 동의가 필요합니다.
<br>
<br>자녀의 휴대폰 번호를 입력 해 주세요"
                        x-init="new bootstrap.Tooltip($el)"
                      ></span>
                    </small>
                  </label>
                <div >
                  <input type="tel" inputMode="numeric" name="childCellphoneNo" class="form-control form-control-sm"
                        value="${child?.cellPhoneNo?child.cellPhoneNo:''}"
                        :disabled="'${child?.agrInfo?.agrStsCd}'==='D'"
                        data-stored-value="${child?.cellPhoneNo?child.cellPhoneNo:''}"
                         x-init="()=>Inputmask({mask: '999-9999-9999', keepStatic: true, placeholder: '010-0000-0000', autoUnmask: true}).mask($el)"
                        @keyup.debounce="($event)=>{
                          if($event.target.value.length < 10){
                            $el.classList.remove('is-valid');
                          }
                          if($event.key ==='Enter' || $event.target.value.length === 11){
                            const valid = checkCellPhoneNo($el)

                            if(valid){
                              const tr0 = $el.closest('tr').previousSibling;
                              if(validateChildRow(tr0)){
                                const btn = document.querySelector('#btnAppendChild')
                                btn.classList.remove('disabled');
                                btn.focus()
                              }
                            }
                          }
                        }"
                  >
                  <button
                    class="btn btn-outline-primary rounded-end d-none" :disabled="$el.previousElementSibling.value.length>=10"
                    @click="checkCellPhoneNo($el.previousElementSibling)">확인
                </button>
                <div class="invalid-feedback"></div>
              </div>
              <div class="form-text" x-show="'${child?.agrInfo?.agrStsCd}'==='D'">개인정보 제공 동의 완료</div>
            </div>
            <div class="col px-2">
              <label class="form-label ${overChldIsrAgRstcYr?'visually-hidden':''}">증빙파일
              <span class="bi bi-question-circle-fill text-info"
                x-init="new bootstrap.Tooltip($el)"
                data-bs-toggle="tooltip"
                :title="\`${this.wlfInst.chldIsrAgRstcYr}년 1월 1일 이전 출생인 경우 장애가 있는 자녀만 가입이 가능하며,
증빙서류(복지카드 사본, 장애인 증명서 등)가 필요합니다.\`"></span></label>
              <input type="file" name="childFile" class="form-control form-control-sm ${overChldIsrAgRstcYr?'visually-hidden':''}"
                     data-stored-file="${child?.updFleNo||''}"
                     accept="image/*,.pdf,.doc,.docx,.hwp,.hwpx;capture=camera"
                      @change="async ()=>{
                        const _preview = $el.parentElement.nextElementSibling.querySelector('div.preview')
                        if(!$el.value) return _preview.innerHTML = ''
                        await imagePreview($el.files, _preview, false)
                        
                        const tr0 = $el.closest('tr').previousSibling
                        if(validateChildRow(tr0)){
                          const btn = document.querySelector('button#btnAppendChild')
                          //btn.classList.remove('disabled');
                          btn.focus()
                        }
                      }"
              >
              <div class="invalid-feedback"></div>
            </div>
            <div class="col">
              <div class="div row preview my-1" style="max-height: 150px;max-width: 150px"
                x-html="printFileviewer({encdFileNo:'${child?.updFleNo||''}', title: '증빙파일 확인'})"
              ></div>
            </div>
          </div>
        </td>`


    },
    /**
     * 자녀 추가
     * 0 가입여부
     * 1 성명, 주민번호, 휴대폰, 증빙서류
     * @param step {0|1}
     */
    confirmChldIsr(step) {


      if (step === 0) {

        const limitAge = parseInt(this.bseYr) - parseInt(this.wlfInst.chldIsrAgRstcYr)

        return confirmMessage('자녀 보험 가입', `<b>자녀 보험 상품에 가입 하시나요?</b>
<div>
  <ul>
    <li>직계비속</li>
    <li>${this.bseYr}.1.1. 기준 <mark>'공무원수당 등에 관한 규정'</mark> 제 10조(가족수당)에 의해 지급되는 대상자</li>
    <li>${this.bseYr}.1.1. 기준 만 ${limitAge}세 미만 <small class="text-muted">(${this.wlfInst.chldIsrAgRstcYr}. 1.1. 이후 출생)</small></li>
    <li>단, 장애가 있는 자녀는 미혼인 경우에 한해 연령에 관계없이 가입이 가능합니다.<b>(증빙서류 필요)</b></li>
    </ul>
</div>`).then(r => {
          // 정보 입력
          if (r) {

            return this.confirmChldIsr(1)

            // 자녀 보험 가입 안함
          } else {
            this.chldInfo = null;

            Object.values(this.selected).flat().filter(s=>s.isrrClCd === '3')
              .forEach(s=>s.tgrFnm = '')

            return true;
          }
        })


      } else if (step === 1) {

        return customConfirmMessage('자녀 정보를 입력해주세요', `<div class='row g-3 p-4'>
<table class="table table-sm table-bordered table-striped table-hover" style="font-size: .7em" id="childRegTable">
  <thead class="table-secondary">
    <tr>
      <th scope="col">#</th>
      <th scope="col">성명</th>
      <th scope="col">주민번호</th>
      <th scope="col">비고</th>
      <th scope="col"></th>
    </tr>
  </thead>
  <tbody>
  
  </tbody>
  <tfoot>
    <tr>
      <td colspan="5" class="text-end me-1">
        <button class="btn btn-danger bi bi-minus-lg"
          id="btnDeleteAllChild"
           @click.throttle="()=>{
              
              if(confirm('모든 자녀 정보를 삭제하시겠습니까?')){
              
                const __table = $el.closest('table');
                __table.tBodies[0].innerHTML = '';
                
                chldInfo = null;
                if(selected){
                  Object.values(selected).flat()
                    .filter(s=> s.isrrClCd === '3')
                    .forEach(s=> delete selected[s.isrPrdCd])
                }
console.log('btnDeleteAllChild this.selected', selected)
                
                makeQuestion(stepper._currentIndex);
                return true;
              }
              
            }"
        > 모든자녀 정보 삭제</button>
        <button class="btn btn-success bi bi-plus-lg"
          id="btnAppendChild"
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"  data-bs-html="true"
          data-bs-title="다른 자녀를 추가하시겠습니까?<br>자녀 정보가 모두 입력된 경우 하단의 파란색 <span class='fw-bold text-bg-primary rounded bi bi-check2-all'> 확인</span>버튼을 누르세요"
          x-init="()=>new bootstrap.Tooltip($el)"
           @click="()=>{
              
              let result = true;
              
              const __table = $el.closest('table');
              Array.from(__table.tBodies[0].rows).filter(r => !r.classList.contains('table-primary'))
                .forEach(r=>{
                if(!validateChildRow(r)) result = false;
              })
              
              if(result) appendChild()
              
            }"
        > 자녀추가</button>
      </td>
    </tr>
  </tfoot>
</table>
  </div>
  <div class="col-12 border rounded-4 bg-warning-subtle p-4 mt-2 fs-6">
    <ul>
      <li>15세 이상 자녀인 경우 보험 가입을 위해서는 <b>자녀의 개인정보 수집/이용 및 제3자 제공동의</b>에 대한 동의가 필요합니다.<br>
보험선택 확정 후에 자녀 휴대폰 번호로 개인정보 동의 확인 메시지가 발송되오니 <b>반드시 기간내에 동의를 완료</b>해주시기 바랍니다.<br>
<b class="text-danger">미동의시 가입불가</b></li>
      <li><b>${this.wlfInst.chldIsrAgRstcYr}</b>년 1월 1일 이전 출생인 경우 장애가 있는 자녀만 가입이 가능하며,
      <b>증빙서류</b>(복지카드 사본, 장애인 증명서 등)가 필요합니다.</li>
</ul>
  </div>
</div>`, ({
          bsColor: 'info', onLoaded: () => {

            const tBody = document.querySelector('table#childRegTable').tBodies[0];

            tBody.innerText = ''

            if(this.chldInfo && this.chldInfo.length){

              this.chldInfo.forEach(c=>{
                this.appendChild(c)
              })

            }else{
              this.appendChild()
            }

            console.log('footer', document.querySelector('div.modal-footer'))
          },
          footer: `<button class="w-25 btn btn-lg btn-primary bi bi-check2-all" name="okButton">
  확인</button>
<button class="w-25 btn btn-lg btn-danger bi bi-x-circle-fill" name="cancelButton">취소</button>`,
          okButton: ({
            callback: () => {

              const rows = Array.from(document.querySelector('table#childRegTable').tBodies[0].rows)
                .filter(r => !r.classList.contains('table-primary'))

              if (rows.find(r => !this.validateChildRow(r))) return false;

              if (confirm(rows.length + ' 명의 자녀를 등록 하시겠습니까?')) {

                this.chldInfo = [];

                rows.forEach(tr => {
                  const childFnm = tr.querySelector('input[name=childFnm]');
                  const childRrno = tr.querySelector('input[name=childRrno]');

                  const nextTr = tr.nextElementSibling;

                  const childCellphoneNo = nextTr.querySelector('input[name=childCellphoneNo]');
                  const childFile = nextTr.querySelector('input[name=childFile]');

                  const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(childRrno.value, this.bseYr);

                  const chld = new TgrInfo(
                    childFnm.value, childRrno.value, null, null, tgrSxClCd, tgrAg, '3'
                  )

                  chld.cellPhoneNo = childCellphoneNo.value
                  chld.files = childFile.files

                  this.chldInfo.push(chld)

                })

                this.sendLog('I', {childInfo: this.chldInfo})

                // 자녀보험 선택 내역 삭제
                Object.values(this.selected).flat().filter(s=>s.isrrClCd === '3')
                  .forEach(s=> delete this.selected[s.isrPrdCd])

                if(this.dcnYn){
                  this.makeQuestion();
                }

                return true;

              }

              return false;

            }
          }),
          cancelButton: ({
            callback: () => {

              // 자녀정보 수정
              if(this.chldInfo && this.chldInfo.length){
                if (confirm(`자녀 정보 변경을 취소 하시겠습니까?
변경하신 정보가 반영되지 않습니다.`)) {
                  this.makeQuestion();
                  return true;
                }
              }

              // 최초 등록
              if (confirm('자녀 보험 상품 가입을 취소 하시겠습니까?')) {
                this.chldInfo = null;
                this.makeQuestion();
                return true;
              }

              return false;
            }
          })

        }))

      }
    },

    __floorAmt(isrAmt) {
      if (!isrAmt) return 0;

      return floorAmt(isrAmt)
    },

    sendSms(tgrInfos) {

      console.log('tgrInfos', tgrInfos);
      if (!tgrInfos?.length) return true;

      const tgrs = tgrInfos
        .filter((t) => (t.pseFnm && t.tgrRrno))
        .filter((t, idx) => tgrInfos.findIndex(tt => tt.tgrFnm === t.tgrFnm) === idx)
        // 이미 보낸 사람은 필터
        // 중복 기준 전화번호, 성명, 주민번호
        .filter(t=>!this.storedData || !Object.values(this.storedData.stored).flat()
          .filter(st=> st.cellPhoneNo)
          .find(st=>st.cellPhoneNo === t.cellPhoneNo
                  && st.tgrFnm === t.tgrFnm
                  && this.hashidsHelper.decode(st.tgrRrno) === t.tgrRrno))
        .map(tgr => ({
          bseYr: this.bseYr,
          oprInstCd: this.wlfInst.oprInstCd,
          tgrFnm: tgr.tgrFnm,
          tgrRrno: tgr.tgrRrno,
          tgrTelNo: tgr.cellPhoneNo,
        }));

        tgrs?.forEach(t=>t.tgrRrno = this.hashidsHelper.decode(t.tgrRrno))

console.log('tgrs', tgrs);

      if(this.testMode) return;

      this.sendLog("I", {'sms': tgrs.map(t=>({tgrFnm: t.tgrFnm, tgrTelNo: t.tgrTelNo}))})
        .then(r=>{
          return fetch(`/wus/agr/r/bhdAgreeSms.jdo`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(tgrs)
          }).then(res => res.json())
            .then(res => {

              if (res > 0) {
                
                console.log(res, '건 문자 발송 성공');
                
                alertMessage('개인정보 제공동의 요청 문자 발송 안내',
                  `${tgrs.map(t => t.tgrFnm + '(' + formatMobileNo(t.tgrTelNo) + ')').join(',<br>')}
번호로 개인정보 제공동의 요청 문자가 발송 되었습니다.
<br>이미 동의가 되어 있거나 일정시간내에 발송된 경우 다시 발송되지 않습니다.
<br>
<br>반드시 기간내에 제공동의를 완료해 주시기 바랍니다.`, 'info')

                return true;
              }else{
                
                this.sendLog('E', {message: '문자발송실패', tgrs, res})
              
                return false;
              }
              
            })
            .catch(err => {
              this.sendLog('E', {message: '문자발송실패', tgrs, err})
              //this.throwException('개인정보 제공 동의 문자 발송 중 오류가 발생 하였습니다.');
              console.error(err)
            })
        })

    },

    async uploadFiles(){

      if(this.testMode) return;

      const __files = Object.values(this.selected)
        .flat().filter(s=>s.tgrFnm && s.files && s.files.length);

console.log('uploadFiles', __files)

      if(!__files || !__files.length) return;

      const formData = new FormData();

      formData.append('bseYr', this.bseYr)
      formData.append('wlfInstCd', this.wlfInst.wlfInstCd)

      __files.forEach((t, idx) => {
        formData.append('tgrRrnos', t.tgrRrno)
        formData.append('cerSeqs', idx)
        Array.from(t.files).forEach(tt=>formData.append(`files${t.tgrRrno}`, tt))
        //formData.append('files', blob, t.files)
      });

      this.sendLog("I", {'files': __files.map(t=>Array.from(t.files).map((f, i)=>({cerSeqs: i, name: f.name, size: f.size})))})
        .then(()=>{

          return fetch('/wus/uim/bsm/nxt/uploadChildDsbFile.jdo',{
            method: 'POST',
            headers: {},
            body: formData,
          }).then(r=>{
console.log('업로드 요청 끝', r)
            return true
          })
            .catch(e=>{
              console.dir(this)

              console.dir(e)

              console.trace(e)
              this.throwException('파일 업로드 중 오류가 발생하였습니다.', e, 'E');
            })
        })
    },

    /**
     * 통계용 cookie를 만듬
     */
    bakeCookie(bhdSlcs){
      // 통계용 cookie 만들기
      document.cookie = `token=${this.token};`
      document.cookie = `loaded=${this.loadtime};`
      document.cookie = `stored=${this.storedtime};`
      document.cookie = `dcnYn=${this.dcnYn};`
      document.cookie = `validated=${this.pseInfo.validated};`
      document.cookie = `confirms=${this.pseInfo.confirms.map(t=>t.getTime?.()||t).join(',')};`
      document.cookie = `noticeAgree=${this.pseInfo.noticeAgree.map(t=>t.getTime?.()||t).join(',')};`
      if(bhdSlcs) document.cookie = `selected=${bhdSlcs.filter(s=>s.selectedTime).map(s =>`${s.isrPrdCd}_${s.selectedTime?.getTime?.()||s.selectedTime}`).join(',')};`
      document.cookie = `maxAge=${60 * 60 * 24};`
    },



    /**
     * 선택 결과에서 확정 누름
     */
    async done() {

console.log('done this.selected', this.selected)

      // 보험상품 다 선택했는지 체크
      const notSelect = this.checkNotSelected();
      if (notSelect.length) {
        this.throwException(notSelect.map(s => s.isrPrdNm).join(', ') + '상품이 선택 되지 않았습니다.');
        return;
      }

      // 파일 업로드
      this.uploadFiles()

      const convertSelected = (isrPrd) => {

        if(isrPrd.isrrClCd === '3'){
          console.log('isrPrd.tgrRrno', isrPrd.tgrRrno, this.bseYr, this.wlfInst.chldIsrAgRstcYr, '==>', calcSsn(isrPrd.tgrRrno, this.bseYr, true))
          console.log(' ====>', calcSsn(isrPrd.tgrRrno, this.bseYr, true).bornYear < parseInt(this.wlfInst.chldIsrAgRstcYr))
        }

        return {
          bseYr: this.bseYr,
          wlfInstCd: this.wlfInst.wlfInstCd,
          oprInstCd: this.wlfInst.oprInstCd,
          avgUprUseYn: this.wlfInst.avgUprUseYn,
          isrBgnDt: this.wlfInst.isrBgnDt.replaceAll(/\D/g, ''),
          isrNdDt: this.wlfInst.isrNdDt.replaceAll(/\D/g, ''),
          pseRrno: this.pseInfo.rrno,
          pseFnm: this.pseInfo.usrFnm,
          pseAg: this.pseInfo.age,
          sxClCd: this.pseInfo.sxClCd,
          bhdSlcSeq: isrPrd.bhdSlcSeq,
          isrPrdCd: isrPrd.isrPrdCd,
          isrDtlCd: isrPrd.isrDtlCd,
          isrrClCd: isrPrd.isrrClCd,
          essYn: isrPrd.essYn,
          useYn: isrPrd.tgrFnm ? 'Y' : 'N',
          isrUprCd: isrPrd.isrUprCd,
          isrSbcAmt: isrPrd.isrSbcAmt,
          isrSbcScr: isrPrd.isrSbcScr,
          tgrRrno: isrPrd.tgrRrno ?? '',
          tgrFnm: isrPrd.tgrFnm ?? '',
          tgrAg: isrPrd.age ?? '',
          tgrSxClCd: isrPrd.sxClCd ?? '',
          dsbYn:  (isrPrd.isrrClCd === '3'
            && calcSsn(isrPrd.tgrRrno, this.bseYr, true).bornYear < parseInt(this.wlfInst.chldIsrAgRstcYr))?'Y':'N',
        //tgrBrthDt: "19730201",
          olfDndIvgYn: isrPrd.olfDndIvgYn,
          xmpRegClCd: isrPrd.xmpRegClCd,
          mIsrUprCd: isrPrd.mIsrUprCd,
          mIsrSbcAmt: isrPrd.mIsrSbcAmt,
          mIsrSbcScr: isrPrd.mIsrSbcScr,
          fIsrUprCd: isrPrd.fIsrUprCd,
          fIsrSbcAmt: isrPrd.fIsrSbcAmt,
          fIsrSbcScr: isrPrd.fIsrSbcScr,
          selectedTime: isrPrd.selectedTime,
          cellPhoneNo: isrPrd.cellPhoneNo,
        }
      }

      // WusUimBsmVO 객체로 만듬
      const bhdSlcs = Object.values(this.selected).flat()
        .sort((a, b) => parseInt(a.isrrClCd) - parseInt(b.isrrClCd)
          || ((a.essYn < b.essYn) ? 1 : (a.essYn > b.essYn) ? -1 : 0)
          || ((a.isrPrdCd > b.isrPrdCd) ? 1 : (a.isrPrdCd < b.isrPrdCd) ? -1 : 0))
        .map(s => convertSelected(s, this.bseYr, this.wlfInst, this.pseInfo));


      /*bhdSlcs.forEach(b=>{
        if(b.pseRrno) b.pseRrno = this.hashidsHelper.encode(b.pseRrno);
        if(b.tgrRrno) b.tgrRrno = this.hashidsHelper.encode(b.tgrRrno);
      })*/

      console.log('bhdSlcs', bhdSlcs)

      console.log('this.storedData', this.storedData?.stored)



      // 파일 업로드
      await this.sendLog("I", {'저장': bhdSlcs.length, 'dcnYn':  this.dcnYn, 'taken': new Date().getTime() - this.storedtime})
        .then(r=> {
console.log('파일업로드 요청')

          return this.uploadFiles().then(r=>true)
        })

console.log('파일업로드 요청 다음')

      console.log('bhdSlcs', bhdSlcs)


      // 보험 선택 데이터가 변경되었는지 확인
      if(this.storedData && !this.storedData.checkChanged(this.selected, (rrno)=>this.hashidsHelper.decode(rrno))){

console.log('변경된 내용 없음', this.storedtime);

        // 문자 보내기
        this.sendSms(bhdSlcs.filter(s => s.cellPhoneNo))
        this.setStep(5);
        return;
      }

      // 통계용 쿠키
      //this.bakeCookie(bhdSlcs)

      // 저장
      if (!this.testMode) {

console.log('보험확정 시작')
        loading();

        await fetch(`/wus/uim/bsm/nxt/store/${this.token}.jdo`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(bhdSlcs)
        }).then(res => res.json())
          .then(data => {
            console.log('data', data);

console.log('보험확정 끝')

            alertMessage('보험 확정', '보험 확정 데이터가 저장되었습니다.')
              .then(()=>{

console.log('문자발송')
                // 문자 보내기
                this.sendSms(bhdSlcs.filter(s => s.cellPhoneNo))
                this.setStep(5)
              })

console.log('보험확정 다음')

          })
          .catch(ex => {
            this.throwException(`저장 중 오류가 발생했습니다.
잠시 후 다시 시도해 주십시오

문의 1588-4321`, ex, 'E')
            console.error(ex);
          }).finally(() => loading(false));

console.log('저장 끝')

      } else {
console.log('test모드 종료');
        // test 모드
        this.setStep(5);
      }

    },

    printMask(data) {
      return printMaskWithEyes(data);
    },
    
    /**
     *
     * @param level {'D'|'I'|'W'|'E'}
     * @param data {object}
     * @param withMeta {boolean=false}
     */
    sendLog(level, data, withMeta = false){{
      
      if(!data.mobile) data.mobile = `Y${window.screen.width}`
      if(!data.token) data.token = this.token;
      
      const objectDiet = (obj)=>{
        if(!obj) return null;
        let newObj = null;
        for(const k in obj){
          if(obj[k]){
            newObj = newObj ?? {}
            if(obj[k] instanceof Object){
              
              newObj[k] = objectDiet(obj[k]);
              
            }else if(obj[k] instanceof Array){
              
              if(obj[k].length) newObj[k] = obj[k];
              
            }else{
              newObj[k] = obj[k];
            }
          }
        }
        return newObj;
      }
      
      if(level==='W' || level==='E' || withMeta){
        if(!data.pseInfo) data.pseInfo= objectDiet(this.pseInfo)
        if(!data.wlfInst) data.wlfInst= objectDiet(this.wlfInst)
        if(!data.selected) data.selected= objectDiet(this.selected)
        if(!data.spsInfo) data.spsInfo= objectDiet(this.spsInfo)
        if(!data.chldInfo) data.chldInfo= objectDiet(this.chldInfo)
      }
      
      if(this.testMode){
        
        console.log('보험선택 로그', level, data);
        
      }else{
        
        if(!data.mobile) data.mobile = `N${window.screen.width}`

console.debug('보험로그 시작')

        return fetch(`/wus/agr/l/${level}/${this.token}.jdo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }).then(r => r.json())
        .then(r =>{
          console.debug('response', r, level, (r.toString()), (r=== '401' && level!=='W'));

          if(r=== '401' && (level==='I' || level==='D')) {
            alertMessage('오류발생', '로그아웃 되었습니다.', 'danger')
              .then((rr)=> {
                console.log(rr, window.opener)
                window.document.location.reload()
              });
          }

console.debug('보험로그 끝')

          return r
        }).catch(r=>{
          console.error(r);

          if(level==='I' || level==='D'){
            alertMessage('오류발생', r.message||'로그아웃 되었습니다.', 'danger')
          }
        })
      }

    },

    /**
     * 예외를 던짐
     * @param message
     * @param ex {Error|Object}
     * @param level {'W'|'E'}
     * @return {boolean}
     */
    throwException(message, ex, level='W') {

      const data = {
        message
        , ex: ex?.stack
      }


      this.sendLog(level, data);

      console.error('오류 발생', data);

      alertMessage('오류발생', message, 'danger');

      throw message;

    }

  }
}// end of processor


/**
 * selected를 저장하기위한 vo로 변경
 * @param isrPrd {IsrPrd}
 * @param bseYr {string}
 * @param wlfInst
 * @param pseInfo {TgrInfo}
 * @param ignore
 * @return {{isrSbcScr, avgUprUseYn: null, isrrClCd, tgrRrno: string, mIsrSbcAmt, fIsrUprCd
 *  , bhdSlcSeq: (null|*|string), pseRrno, cellPhoneNo: (null|*), tgrSxClCd: string, oprInstCd: null
 *  , tgrFnm: string, isrPrdCd, sxClCd, isrNdDt: string, olfDndIvgYn: (null|*)
 *  , fIsrSbcScr, useYn: (string), dsbYn: (string), pseFnm, isrUprCd, mIsrSbcScr
 *  , selectedTime: *, pseAg: (number|*), isrSbcAmt, mIsrUprCd
 *  , isrDtlCd, isrBgnDt: string, xmpRegClCd: (string|*)
 *  , tgrAg: (number|*|string), bseYr: null, wlfInstCd: null, essYn, fIsrSbcAmt}}
 */
function convertSelected(isrPrd, bseYr, wlfInst, pseInfo, ignore=false){

  const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(isrPrd.tgrRrno, bseYr, true);

  return {
    bseYr: bseYr,
    wlfInstCd: wlfInst.wlfInstCd,
    oprInstCd: wlfInst.oprInstCd,
    avgUprUseYn: wlfInst.avgUprUseYn,
    isrBgnDt: wlfInst.isrBgnDt.replaceAll(/\D/g, ''),
    isrNdDt: wlfInst.isrNdDt.replaceAll(/\D/g, ''),
    pseRrno: pseInfo.rrno,
    pseFnm: pseInfo.usrFnm,
    pseAg: pseInfo.age,
    sxClCd: pseInfo.sxClCd,
    bhdSlcSeq: isrPrd.bhdSlcSeq,
    isrPrdCd: isrPrd.isrPrdCd,
    isrPrdNm: isrPrd.isrPrdNm,
    isrDtlCd: isrPrd.isrDtlCd,
    isrDtlNm: isrPrd.isrDtlNm,
    isrrClCd: isrPrd.isrrClCd,
    essYn: isrPrd.essYn,
    useYn: ignore?'N':isrPrd.tgrFnm ? 'Y' : 'N',
    isrUprCd: isrPrd.isrUprCd,
    isrSbcAmt: isrPrd.isrSbcAmt,
    isrSbcScr: isrPrd.isrSbcScr,
    tgrRrno: isrPrd.tgrRrno ?? '',
    tgrFnm: isrPrd.tgrFnm ?? '',
    tgrAg: isrPrd.age ?? '',
    tgrSxClCd: isrPrd.sxClCd ?? '',
    dsbYn:  (isrPrd.isrrClCd === '3' && bornYear < parseInt(wlfInst.chldIsrAgRstcYr))?'Y':'N',
    //tgrBrthDt: "19730201",
    olfDndIvgYn: isrPrd.olfDndIvgYn,
    xmpRegClCd: isrPrd.xmpRegClCd,
    mIsrUprCd: isrPrd.mIsrUprCd,
    mIsrSbcAmt: isrPrd.mIsrSbcAmt,
    mIsrSbcScr: isrPrd.mIsrSbcScr,
    fIsrUprCd: isrPrd.fIsrUprCd,
    fIsrSbcAmt: isrPrd.fIsrSbcAmt,
    fIsrSbcScr: isrPrd.fIsrSbcScr,
    selectedTime: isrPrd.selectedTime,
    cellPhoneNo: pseInfo.usrFnm?isrPrd.cellPhoneNo:'',
  }
}

/**
 * 선택 결과
 *
 */
const infoMessage__ = function () {

  const first = document.createElement('div');
  first.classList.add('other', 'pb-4');
  //document.getElementById('messages').appendChild(first);

  //결과 저장
  //const selected = info.selected.join(',');
  //axios.post('url', {selected});

  // 1차 안내

  const messageDiv = document.createElement('div');
  const thirdClasses = ['flex-shrink-1', 'bg-light', 'rounded', 'py-2', 'px-3'];
  messageDiv.classList.add(...thirdClasses);

  const card = document.createElement('div');
  card.classList.add('card', 'bg-light', 'border-0', 'mb-2');
  card.style.minHeight = '10vh';

  const cardHeader = document.createElement('div');
  cardHeader.classList.add('card-header', 'bg-info', 'fs-5', 'mt-3');
  cardHeader.textContent = '🎁 보험선택을 완료 하시겠습니까?';

  card.appendChild(cardHeader);

  const divRow = document.createElement('div');
  divRow.classList.add('row');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardText = document.createElement('p');
  cardText.classList.add('card-text', 'font-weight-bold', 'mb-1', 'align-middle', 'lead');

  let __idx = 0;

  /**
   * 예상결과에서 가족 정보를 출력함
   * @param tgrfnm {string} - 성명
   * @param tgrrrno {string} - 주민번호
   * @param isrrClcd {1|3} - 관계 1:배우자, 3:자녀
   */
  function fmlInfo(tgrfnm, tgrrrno, isrrClcd) {

    return `
<tr>
  <td class="ps-3 fw-bold">${tgrfnm}</td>
  <td colspan="3">
    <span>${formatSsn(tgrrrno)}</span>
      <em class="ms-2 text-primary bi bi-eye" title="보기" onclick="this.parentElement.querySelector('span').textContent = formatSsn('${tgrrrno}', false);
      setTimeout(()=>this.parentElement.querySelector('span').textContent = formatSsn('${tgrrrno}'), 3000)" title="주민번호 확인"></em>
    <span class="text-warning ms-2"><small>동의 미완료</small></span>
  </td>
</tr>`
  }

  const html = `<table class='table table-bordered table-striped table-sm shadow' style="font-size: smaller">
    <caption class="caption-top w-100 text-end pe-1 fw-bold">${this.pseInfo.usrFnm} (${formatSsn(this.pseInfo.rrno)})</caption>
    <thead class="table-primary">
      <tr>
        <th scope="col"></th>
        <th scope="col">필수여부</th>
        <th scope="col">보험상품</th>
        <th scope="col">보장내용</th>
        <th scope="col">대상</th>
        <th scope="col">성별</th>
        <th scope="col"><small>예상보험료</small></th>
       </tr>
    </thead>
   <tbody>
    ${this.questions.map((io, idx) => {

    const selected = this.selected[io.data.isrPrdCd]

    console.log('selected', io.data.isrPrdCd, selected, 'io', io)
    console.log('spsInfo', this.spsInfo, 'this.chldInfo', this.chldInfo)

    return (io.data.isrrClCd === '1' && this.spsInfo === null) ? '' :
      (io.data.isrrClCd === '3' && this.chldInfo === null) ? '' :
        '<tr><th' + (io.data.isrrClCd !== '0' ? ' rowspan="2"' : '') + ' class="text-end" scope="row">' + (__idx += 1)
        + '</th><td class="text-center">' + (io.data.essYn ? '필수' : '선택') + '</td><td>'
        + io.data.isrPrdNm + '</td><td>'
        + (selected.isrDtlNm || '미가입') + '</td><td class="text-center">'
        + (selected.isrrClCd === '0' ? '본인' : selected.isrrClCd === '1' ? '배우자' : selected.isrrClCd === '3' ? '자녀' : selected.isrrClCd) + '</td><td class="text-center">'
        + (selected.tgrSxClcd === '1' ? '남' : '여') + '</td><td class="text-end pe-1">'
        + (selected.isrSbcAmt ? floorAmt(selected.isrSbcAmt).toLocaleString() : 0) + '</td></tr>'
        + (selected.isrrClCd !== '0' ? fmlInfo(selected.tgrFnm, selected.tgrRrno, selected.isrrClCd) : '')
  })
    .join('')}
  </tbody>
  <tfoot>
    <tr>
        <th scope="row" colspan="7" class="text-end fw-bold p-3">
          <span class="me-2">예상보험료 합계</span>
          <span></span>${Object.values(this.selected).flat().map(d => d.isrSbcAmt ? floorAmt(d.isrSbcAmt) : 0).reduce((accumulator, d) => (accumulator + d), 0).toLocaleString()}<small> 예상</small></span>
        </th>
    </tr>
    <tr class="pt-3">
      <td colspan="7" class="p-2">
        <ul>
          <li>최종보험료는 개인별 보험선택 결과(인원, 평균연령)에 근거하여 계약 체결 후 확정되며, 예상보험료와 다르게 책정될 수 있습니다.</li>
          <li>최종보험료가 개인별 배정 복지점수를 초과할 경우, 환수가 발생할 수 있음을 유의하여 주시기 바랍니다.</li>
        </ul>
      </td>
    </tr>
  </tfoot>
</table>`

  cardText.innerHTML = html;

  cardBody.appendChild(cardText);

  const divCol8 = document.createElement('div');
  divCol8.classList.add('p-0');
  divCol8.appendChild(cardBody);

  divRow.appendChild(divCol8);
  card.appendChild(divRow);
  messageDiv.appendChild(card);

  messageDiv.classList.add('message-friend');

  first.appendChild(messageDiv);

  // 버튼
  const buttonDiv = document.createElement('div');
  buttonDiv.classList.add('text-end');

  /*const button = document.createElement('a');
  button.href = '#none'
  button.classList.add('btn', 'btn-md', 'btn-warning', 'mt-2', 'text-end');
  button.textContent = '재선택';
  button.addEventListener('click', (evt) =>this.init())

  buttonDiv.appendChild(button);*/

  const button2 = document.createElement('a');
  button2.href = '#none';
  button2.classList.add('btn', 'btn-md', 'btn-success', 'mt-2', 'text-end', 'ms-3');
  button2.textContent = '확정';
  button2.addEventListener('click', (evt) => {
    this.done()
    // button.remove()
    button2.remove()
    buttonDiv.remove()

    this.$refs.restart.disabled = true;
  })

  // buttonDiv.appendChild(button);
  buttonDiv.appendChild(button2);

  messageDiv.appendChild(buttonDiv);

  return first
};


const myOffcanvas = new bootstrap.Offcanvas("#offcanvasInfo", {
  backdrop: 'static',
  keyboard: false,
});

myOffcanvas._element.style.transitionDuration = '.7s';

/**
 * 유의 사항
 * @param isrPrdCd
 */
const showNoticeOnOffCanvas = (isrPrdCd) => {

  //제목
  document.querySelector('#offcanvasLabel').textContent = notice[isrPrdCd].title;

  //본문
  document.querySelector('#offcanvasContent').innerHTML = notice[isrPrdCd].content;

  myOffcanvas._element.querySelector('#offcanvas-close-div>button').dataset.isrPrdCd = isrPrdCd;

  myOffcanvas.show();
}


const privacyOffcanvas = new bootstrap.Offcanvas("#offcanvasPrivacy", {
  backdrop: 'static',
  keyboard: false,
});

// 열리고 나서 최상단으로 이동
privacyOffcanvas._element.addEventListener('shown.bs.offcanvas', function (evt) {
  console.log('shown.bs.offcanvas', evt.target.querySelector('#offcanvasPrivacyContent'))

  evt.target.querySelector('#offcanvasPrivacyContent').scrollIntoView()
})




/**
 * 성별에 따른 예상 금액을 가져온다
 * 100원 절사
 * @param sxClCd {sxClCd} - 성별
 * @param isrPrd {IsrPrd} - 보험데이터
 */
function getSbcAmt(sxClCd, isrPrd) {
  console.debug('getSbcAmt', sxClCd, isrPrd);

  return floorAmt((sxClCd === '1' ? isrPrd.mIsrSbcAmt : isrPrd.fIsrSbcAmt))

}

/**
 * 100원 절사
 * @param isrSbcAmt
 * @return {*}
 */
function floorAmt(isrSbcAmt) {
  return _floorAmt(isrSbcAmt, 100)
}

/**
 * 개인 정보 제공동의 문자 재발송
 * @param token {string}
 */
function resendSms(token){

  if(!token) return;
  if(token.length>500){
    console.log('테스트 모드 문자 재발송 무시', token)
    return;
  }

  fetch(`/wus/agr/s/\${token}.jdo`)
    .then(r=>r.json())
    .then(r=>{

      if(r=='1'){
        alert('개인정보 제공동의 요청 SMS가 재발송 되었습니다.')
      }else{
        alert(r);
      }

    })
    .catch(e=>{
      alert(`SMS 발송중에 오류가 발생하였습니다.
잠시 후에 다시 시도하여 주십시오
문의 1588-4321`)

      console.error(e);
    })
}
