/*import {notice, privacyNotice} from "../info/info.mjs";*/

let {unboxingToken} = await import('./script_test.js')

import {notice, privacyNotice} from "../info/info.js";
import {alertMessage, answer, chat, confirmMessage, fileUpload, Question, questionWithInput} from "./chat.js";

import {
  TgrInfo, AgrInfo, IsrPrd, StoredData, validateChildSsn, validateSpsName, validateSpsSsn, validateSps,
  validateName
} from "./bhdSlcScript.js";


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


//import {unboxingToken} from "./script_test.mjs";

export function processor() {

  let tempData = '';

  return {

    /**
     * 사전선택 시작시간
     */
    openTime: '08:00',
    mobileYn: 'Y',
    loadtime: null,
    storedtime: null,
    testMode: false,
    /**
     * {boolean} - 보험선택 완료자인지
     */
    dcnYn: false,
    /**
     * {boolean} - 보험 변경 기간인가
     */
    bhdSlcChnYn: false,
    /**
     * {boolean} - 배우자 보험중에 필수가 있는 지 여부
     */
    spsEssYn: true,
    /**
     * {boolean} - 배우자 의료비 보장 말고 다른 배우자 보험에 가입된게 있는지 체크
     * 의료비 조정 기간에는 다른 배우자 보험에 가입되어 있으면 배우자 삭제를 하면 안되기 때문이다
     */
    spsOtherIsrYn: false,
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
      //console.log('setStep', step, 'this.step', this.step, 'this.realStep', this.realStep, this)
      this.step = step;

      this.realStep = Math.max(step, this.realStep)
      //console.log('setStep==>', step, 'this.step', this.step, 'this.realStep', this.realStep)
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
    pseInfo: null,
    /**
     * 배우자 정보
     * @type TgrInfo
     */
    spsInfo: null,
    /**
     * 배정에 있는 가족 정보
     * 배우자 정보와 자녀 정보를 입력하기 위한 정보
     * {TgrInfo[]} - 배정에 있는 가족 정보
     */
    fmlInfo: [],

    /**
     *  자녀 정보
     * @type {[TgrInfo]}
     */
    chldInfo: [],
    /**
     * 현재(선택중인) 자녀
     * @type {TgrInfo}
     */
    currentChild: null,
    /**
     * 자녀 보험 선택 완료 여부
     * @type {boolean}
     */
    childDone: false,

    isLoading: false,
    rrnoInputMask: Inputmask({mask: "999999-9999999", keepStatic: true, placeholder: '_', autoUnmask: true}),

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
      wlfInstCd: null,
      wlfInstNm: null,

    }),

    async init(){

      this.storedtime = new Date().getTime();

      console.log('init', this.current, Object.keys(this.selected).length);

      // loading watch
      this.$watch('this.isLoading',  value=> {
        if (value) {
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

      });


      if (this.current>=0 && Object.keys(this.selected).length) {
        const confirm = await confirmMessage('보험선택 초기화', `보험을 처음부터 다시 선택 하시겠습니까?`);

        if (!confirm) return;

        if(this.spsInfo) this.spsInfo.validated = false;

        if(this.chldInfo){
          this.chldInfo.forEach(c=>c.validated = false);
        }

      }

      if(this.current>=0) this.current = 0

      // 최초 로딩인 경우
      if(this.current === -2){
        

        const urlParams = new URL(location.href).searchParams;

        this.bseYr = urlParams.get("bseYr");
        this.token = urlParams.get("token") ;

        this.testMode = this.token.length > 500
        //if (!this.testMode) {
          this.hashidsHelper = new HashidsHelper(this.token);
        //}

//this.testMode = true;

        try{

          // 최초 모달
          this.welcome();

          await this.getIsrData()

          this.current = -1;
          this.validateTgr()
        }catch(err){
          console.error(err)
          this.current = -3;
          return;
        }

      }

      // 채팅 시작
      if(this.current>=0){
        
        if(this.current===0){
          
          this.chatStart();

        }
      }
      
    },

    /**
     * 보험 정보를 가져옴
     */
    async getIsrData(){

      const initTime = new Date().getTime();

      if (this.testMode) {
        return
      }

      //loading();

      await fetch(`/wus/uim/bsm/nxt/wusUimBsmPreSelctn/${encodeURI(this.token)}.jdo?bseYr=${this.bseYr}`
        ,{
          method: 'GET',
          mode: 'same-origin',
          referrerPolicy: 'same-origin',
        })
        .then(res => res.json())
        .then(jsn => {

          //console.log('bseYr', bseYr)
          this.wlfInst = jsn.wlfInst

          const il001 = jsn.rtnList.find(d => d.isrPrdCd === "IL0001");
          if (!this.pseInfo || !this.pseInfo?.validated)
            this.pseInfo = new TgrInfo({
              usrFnm: il001.pseFnm,
              rrno: il001.pseRrno,
              wlfInstCd: il001.wlfInstCd,
              instNm: il001.wlfInstNm,
              sxClCd: il001.sxClCd,
              age: il001.pseAg,
              isrrClCd: il001.isrrClCd,
              updFleNo: il001.updFleNo,
            });

          // 보험상품 sort
          jsn.rtnList.sort((a, b) => parseInt(a.isrrClCd) - parseInt(b.isrrClCd)
            || ((a.essYn < b.essYn) ? 1 : (a.essYn > b.essYn) ? -1 : 0)
            || ((a.isrPrdCd > b.isrPrdCd) ? 1 : (a.isrPrdCd < b.isrPrdCd) ? -1 : 0)
            || (parseInt(this.hashidsHelper.decode(a.tgrRrno)) - parseInt(this.hashidsHelper.decode(b.tgrRrno)))
          )

          jsn.rtnList.forEach(r => {
            r.essYn = r.essYn === 'Y'
            r.dtlCdList.forEach(d => {
              d.essYn = r.essYn
              d.olfDndIvgYn = r.olfDndIvgYn
            })

            r.dtlCdList.sort((a, b) => (a.mIsrSbcAmt - b.mIsrSbcAmt)
              || ((a.isrDtlCd > b.isrDtlCd) ? 1 : (a.isrDtlCd < b.isrDtlCd) ? -1 : 0)
            )
          })

          console.log('jsn.rtnList', jsn.rtnList)

          this.questions = jsn.rtnList
            .filter((item, index) => jsn.rtnList.findIndex(d => d.isrPrdCd === item.isrPrdCd) === index) //상품코드로 중복 제거 (e.g 자녀보험
            .map(d => new Question({
              'short_title': d.isrPrdNm,
              'message': `<b>${d.isrPrdNm}</b> 보험을 선택해 주세요`,
            'optionFunc': this.makeIsrPrdOption.bind(this),
              'data': d
          }));
          //this.breadCrumbs = jsn.rtnList.map(d => d.isrPrdNm);

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

            // 유의사항 다 ok
            this.questions.forEach(d => this.doNoticeAgree(d.data.isrPrdCd));

            console.log('this.pseInfo.noticeAgree', this.pseInfo.noticeAgree)

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

                  child = new TgrInfo({
                    usrFnm: d.tgrFnm,
                    rrno: d.tgrRrno,
                    sxClCd: d.tgrSxClCd,
                    age: d.tgrAg,
                    isrrClCd: d.isrrClCd,
                    updFleNo: d.updFleNo,
                  });

                  child.agrInfo = fmlAgrInfos?.find(f =>f.tgrFnm === d.tgrFnm && f.tgrRrno === d.tgrRrno)
                  if (child.agrInfo) child.cellPhoneNo = child.agrInfo.tgrTelNo;

console.log('child', child)

                  //child.rrno = this.hashidsHelper.decode(child.rrno)

                  this.chldInfo = this.chldInfo ?? []

                  this.chldInfo.push(child)
                }

                this.selected[d.isrPrdCd] = this.selected[d.isrPrdCd] ?? []

                const idx = this.selected[d.isrPrdCd].push(makeSelected(d))
                this.selected[d.isrPrdCd][idx - 1].agrInfo = child?.agrInfo;

console.log('idx', idx, 'child.agrInfo', child?.agrInfo, 'selected[d.isrPrdCd][idx - 1]', this.selected[d.isrPrdCd][idx - 1])

              } else {

                if (d.isrrClCd === '1') {

                  if(d.tgrRrno){
                    this.spsInfo = new TgrInfo({
                      usrFnm: d.tgrFnm,
                      rrno: d.tgrRrno,
                      sxClCd: d.tgrSxClCd,
                      age: d.tgrAg,
                      isrrClCd: d.isrrClCd,
                      updFleNo: d.updFleNo,
                    })
                    this.spsInfo.agrInfo = fmlAgrInfos?.find(f => f.tgrFnm === d.tgrFnm && f.tgrRrno === d.tgrRrno)
                    if (this.spsInfo.agrInfo) this.spsInfo.cellPhoneNo = this.spsInfo.agrInfo.tgrTelNo;
                    //this.spsInfo.rrno = this.hashidsHelper.decode(this.spsInfo.rrno)
                    this.selected[d.isrPrdCd] = makeSelected(d)
                    this.selected[d.isrPrdCd].agrInfo = this.spsInfo.agrInfo;
                  }else{
                    if(!this.spsInfo?.rrno) this.spsInfo = {}
                  }

                } else {
                  this.selected[d.isrPrdCd] = makeSelected(d)
                }

              }

            })

console.log('this.questions', this.questions)
console.log('this.question', this.questions.find(q=>q.data.isrrClCd === '1' && q.data.essYn))

            // 의료비 보장 변경 기간인 경우
            // 배우자 생명상해 가입안했으면 의료비보장 가입 못하도록
            const slcBgnChnDt = moment(`${this.wlfInst.bhdSlcChnBgnDt} ${this.openTime}`, 'YYYYMMDD HH:mm');
            const slcChnNdDt = moment(`${this.wlfInst.bhdSlcChnNdDt} 23:59`, 'YYYYMMDD HH:mm');

            if (moment().isBetween(slcBgnChnDt, slcChnNdDt, '', '[]')) {

              const spsEssPrd = this.questions.find(q=>q.data.isrrClCd === '1' && q.data.essYn)

console.log('spsEssPrd', spsEssPrd, 'this.selected', this.selected[spsEssPrd?.isrPrdCd])

              if(spsEssPrd){
                if(!this.selected[spsEssPrd.data.isrPrdCd]?.tgrRrno) this.spsEssYn = false;
                else  this.spsEssYn = true;
              }else  this.spsEssYn = true;

              // 배우자 의료비 보장 말고 다른 배우자 보험에 가입된게 있는지 체크
              // 의료비 조정 기간에는 다른 배우자 보험에 가입되어 있으면 배우자 삭제를 하면 안되기 때문이다 24. 12. 2. choihunchul
              this.spsOtherIsrYn = !!this.questions.find(q=>q.data.isrrClCd === '1' && !this.checkIL002(q.data.isrPrdCd) && this.selected[q.data.isrPrdCd]?.tgrRrno)

            }

            console.log('sps', this.spsInfo, 'child', this.chldInfo)

            //if (!this.spsInfo?.usrFnm) this.spsInfo = null;
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

      return true;

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

      }

      // 기관 사전선택 보험시작/종료일이 없을때
      if (!this.wlfInst || !this.wlfInst.wlfInstNm || !this.wlfInst.bhdSlcBgnDt || !this.wlfInst.bhdSlcNdDt) {

        this.throwException(`${this.bseYr}년도 단체보험 보험선택 기관이 아닙니다.
        
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`)
      }

      // 현재가 사전선택 보험시작/종료일이 아닐때
      const slcBgnDt = moment(`${this.wlfInst.bhdSlcBgnDt} ${this.openTime}`, 'YYYYMMDD HH:mm');
      const slcNdDt = moment(`${this.wlfInst.bhdSlcNdDt} 23:59`, 'YYYYMMDD HH:mm');

      if (!moment().isBetween(slcBgnDt, slcNdDt, '', '[]')) {

        // 보험변경 기간인지 채크
        const slcBgnChnDt = moment(`${this.wlfInst.bhdSlcChnBgnDt} ${this.openTime}`, 'YYYYMMDD HH:mm');
        const slcChnNdDt = moment(`${this.wlfInst.bhdSlcChnNdDt} 23:59`, 'YYYYMMDD HH:mm');

        if (moment().isBetween(slcBgnChnDt, slcChnNdDt, '', '[]')) {

          if (!this.dcnYn){
            this.throwException(`보험선택 완료자에 한해서 ${this.bseYr}년도 단체보험 보험선택 의료비보장 변경이 가능합니다.
<br><br>
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`, {stack: `pctime=${new Date().toLocaleDateString()}`})
          }else{

            // 의료비보장 변경 기간
            this.bhdSlcChnYn = true;
          }


        }else {

          this.throwException(`${this.bseYr}년도 단체보험 보험선택 기간이 아닙니다.
<br><span>(${slcBgnDt.format('YYYY-MM-DD(ddd)')} ${this.openTime} ~ ${slcNdDt.format('YYYY-MM-DD(ddd)')})</span>
<br><br>
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`, {stack: `pctime=${new Date().toLocaleDateString()}`})
        }

      }

    },


    /**
     * 처음 시작하기전에 모달을 보여줌
     */
    welcome() {

      if (this.testMode) {

        const {pseInfo, wlfInst, fmlInfo, spsCop, rtnList} = unboxingToken(this.token, TgrInfo);

        this.pseInfo = pseInfo;
        this.wlfInst = wlfInst;

        this.fmlInfo = fmlInfo;

        if(spsCop){
          tempData = this.fmlInfo.find(f=>f.isrrClCd === '1').rrno;
        }

        this.questions = rtnList.map(d => new Question({
          'short_title': d.isrPrdNm,
          'message': `<b>${d.isrPrdNm}</b> 보험을 선택해 주세요`,
          'optionFunc': this.makeIsrPrdOption.bind(this),
          'data': d
        }));
        console.debug('unboxingToken', this.pseInfo, this.wlfInst, this.rtnList, this.questions)
      }

      // 시작시 모달 보여줌
      const modal = new bootstrap.Modal(document.querySelector('#modal'), {});
      modal.show()

      modal._element.addEventListener('hidden.bs.modal', () => {

        if (this.current === -3) {
          return;
        }

        const welcomeModalMessage = this.bhdSlcChnYn?`<ul style="font-size: 1em;">
          <li class="py-1"><strong>의료비 보장 보험 조정기간:</strong> ${moment(this.wlfInst.bhdSlcChnBgnDt, 'YYYYMMDD').format('YYYY-MM-DD(ddd)')}~${moment(this.wlfInst.bhdSlcChnNdDt, 'YYYYMMDD').format('YYYY-MM-DD(ddd)')}</li>
          <li class="py-1">${this.bseYr}년도 보험선택 완료자(<small>기본보험 일괄적용 대상자 포함</small>)에 한하여 기간내에 의료비 보장 보험을 조정할 수 있습니다.</li>
          <li class="py-1">의료비 보장보험(실손)외 다른 보험 상품(생명/상해, 특정질병 진단비 등)은 변경할 수 없습니다.</li>
          <li class="py-1">선택하신 보험은 ${this.wlfInst.isrBgnDt}일부터 ${this.wlfInst.isrNdDt}일까지 적용될 예정입니다.</li>
          <li class="py-1"><span class="text-primary">표시되는 보험료는 <mark>예상보험료</mark>로 최종보험료는 계약체결 후 확정됩니다.</span></li>
          <li class="py-1"><span class="text-primary">배우자와 15세 이상 자녀(2011.12.31. 이전 출생자)의 의료비 보장 보험 가입 시 개인정보
   수집·이용 및 제3자(보험사) <mark>제공 동의 절차가 완료</mark>되어야만 최종 가입이 완료됩니다.</span>
          </li>
        </ul>`
            :`<ul style="font-size: 1em;">
          <li class="py-1"><strong>단체보험 선택기간:</strong> ${moment(this.wlfInst.bhdSlcBgnDt, 'YYYYMMDD').format('YYYY-MM-DD(ddd)')}~${moment(this.wlfInst.bhdSlcNdDt, 'YYYYMMDD').format('YYYY-MM-DD(ddd)')}</li>
          <li class="py-1">기간 내에 보험을 선택하지 않은 경우에는 <mark>기본보험(기관최저보장보험)</mark>으로 가입됩니다.</li>
          <li class="py-1">선택하신 보험은 ${this.wlfInst.isrBgnDt}일부터 ${this.wlfInst.isrNdDt}일까지 적용될 예정입니다.</li>
          <li class="py-1">${this.bseYr - 1}년 퇴직 예정자는 ${this.bseYr}년도 단체보험 적용을 받지 않으므로 보험선택 대상자가 아닙니다.</li>
          <li class="py-1">${this.bseYr}년도 휴직자는 개인의 보험선택 결과와 무관하게 소속기관에서 정한 <mark>'휴직후 적용보험'</mark>을 적용합니다.</li>
          <li class="py-1"><span class="text-primary">표시되는 보험료는 <mark>예상보험료</mark>로 최종보험료는 계약체결 후 확정됩니다.</span></li>
        </ul>`;

        alertMessage(`${this.bseYr}년도 보험선택${this.bhdSlcChnYn?' 의료비 보장 보험 조정':''} 안내`, welcomeModalMessage, 'info').then(() => {

          this.current = 0;

          this.chatStart();

        })

      })

    },
    /**
     * 채팅 시작
     */
    async chatStart() {

      if (this.current < 0) return

      // 채팅창 초기화
      document.getElementById('messages').innerHTML = '';
      document.querySelector('ol.breadcrumb').innerHTML = '';

      //updateBreadCurmb()

      // 변수 초기화
      if(!this.dcnYn){
        this.current = 0;

        this.selected = [];
        this.spsInfo = {}
        this.chldInfo = [];
        this.childDone = !this.questions.find(q => q.data.isrrClCd === '3');
      }


      const _div = document.createElement('div');
      //_div.classList.add(classname);
      _div.classList.add('pb-4', 'text-center');
      document.getElementById('messages').appendChild(_div);
      const _span = document.createElement('span');

      _span.textContent = moment().locale('ko').format('YYYY MMMM Do a h:mm');
      _div.appendChild(_span);
      _div.appendChild(document.createElement('hr'));

      this.validateUser('name')
        .then(()=>{

          // 유의사항 확인
          this.confirmPrivacy()
        })
        .catch(ex=>{
          console.trace(ex)
          this.throwException(ex.message)
        })
        .finally(()=>console.log('validateUser finally'))

    },

    async checkSsn(ssn){

      if(!validateSsn(ssn)) return false;

      const decodeRrno = ()=>{

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

      if(this.testMode){
        const valid = this.pseInfo.rrno === ssn

        if(valid && this.dcnYn){
          decodeRrno();
        }

        return {valid}
      }

      this.isLoading = true;
      //loading()

      const encoded = this.hashidsHelper.encode(ssn);

      return await fetch(`/wus/valid/${this.token}/${encoded}.jdo`)
        .then(r => r.json())
        .then(r => {
          console.log('r', r, 'dcnYn', this.dcnYn);

          if(this.dcnYn) decodeRrno();

          return r;
        })
        .catch(ex => {
          alertMessage('오류 발생', '서버와 통신 중 오류가 발생했습니다.<br>잠시 후 다시 시도해 주십시오', 'danger');

          this.sendLog('E', {message: '주민번호 검증 오류 발생', ex})
          console.error('본인 인증 오류 발생', ex);
          return false;
        }).finally(() => this.isLoading = false)
    },

    /**
     * 사용자 본인 인증
     * @param type {'name'|'rrno'}
     */
    async validateUser(type) {
      
      return new Promise((resolve, reject)=>{
        
        // 본인 인증 된경우 다음 단계
        //if (pseInfo.validated) return chat(questions[current]);
        if (this.pseInfo.validated) return resolve();
        
        // 성명 확인
        if (type === 'name') {
          
          this.breadCrumbs = ['본인확인']
          
          chat('🔐 보험선택에 앞서 본인확인을 시작합니다.');
          
          chat({
            message: `<b>${this.wlfInst.wlfInstNm}</b> 근무하시는 <b>${this.pseInfo.usrFnm}</b> 님이 맞나요?`
            , options: [
              {
                text: '네', callback:  (e)=> {
                  resolve(this.validateUser('rrno'));
                }
              },
              {
                text: '아니오', callback: function (e) {
                  chat('성명 확인을 위해 공단(☎1588-4321)으로 문의 주시기 바랍니다.<br>불편을 드려 죄송합니다.');

                  reject()
                }
              }
            ]
          });
          
          //scrollTo();
          
        } else {
          
          const nameIp = questionWithInput('본인 확인을 위해 주민번호를 입력하세요');
          nameIp.type = 'text';
          
          //Inputmask({mask: "999999-9999999", keepStatic: true, placeholder: '_', autoUnmask: true}).mask(nameIp);
          this.rrnoInputMask.mask(nameIp)
          
          nameIp.setAttribute('inputMode', 'numeric');
          
          nameIp.ariaDescripedby = 'invalidCheck';
          
          const invalid = document.createElement('div')
          invalid.id = 'invalidCheck';
          invalid.classList.add('invalid-feedback');
          invalid.innerText = `등록된 주민번호와 다릅니다.
본인 주민번호가 맞는 경우
공단(☎1588-4321)으로 문의 주시기 바랍니다`;
          
          nameIp.parentElement.classList.add('form-check')
          nameIp.parentElement.appendChild(invalid)
          
          nameIp.addEventListener('keyup', async (evt) => {
            //console.log(evt, nameIp.value, this.pseInfo.rrno);

            if(evt.target.readOnly){
              return evt.preventDefault();
            }
            

            if (nameIp.value.length === 13) {


              const checkResult = await this.checkSsn(nameIp.value);

              if (checkResult.valid) {

                markingInvalid(nameIp, false)

                this.pseInfo.rrno = nameIp.value;
                nameIp.inputmask.remove()
                nameIp.value = formatSsn(nameIp.value);

                this.bhdSlcChnYn?chat( '본인 확인이 완료 되었습니다.')
                  :chat( '본인 확인이 완료 되었습니다.<br>다음 안내 사항을 숙지해주세요');
                //chat(questions[current]);
                
                this.pseInfo.validated = true;
                
                this.sendLog("I", {validated: this.pseInfo.validated});

                //scrollTo();
                
                resolve()
                
              } else {
                markingInvalid(nameIp)
              }
            }
          });
          
          //scrollTo();
          nameIp.focus();
        }
        
      })
    },
    
    /**
     * 개인정보 제공동의
     */
    confirmPrivacy(){
      
      const step = this.pseInfo.confirms.findIndex(c => !c)
      
console.log('confirmPrivacy', step)
      
      // 다 동의한 경우 본인 인증 단계
      //if (step === -1) return validateUser('name')
      if (step === -1) {

        if(this.dcnYn){

          if(!this.bhdSlcChnYn){

            // 보험 선택 변경인 경우
            // 안내사항 나열만 하고 건너뜀
            Object.keys(privacyNotice).forEach((k, i)=>{

              chat({
                message: privacyNotice[k].title,
                options: [{text: '확인', callback: (evt) => this.showPrivacyOffCanvas(i, this.bseYr, evt.target)}]
              });

            })
          }

          this.resultTable();



        }else{

          alertMessage('안내', '보험선택을 시작힙니다.<br>보험 선택 시 <mark><strong>보장내용 및 유의사항</strong></mark>을 잘 확인해 주시기 바랍니다.')
            .then((r)=>{
              console.log('r', r)
              if(r){
                chat('보험선택을 시작합니다.');
                return this.doQuestion()
              }
            })

        }



      } else {
        
        privacyNotice.bseYr = this.bseYr
        this.breadCrumbs = ['본인확인', '안내사항 확인']
        
        chat({
          message: privacyNotice[`step${step}`].title,
          options: [{text: '확인', callback: (evt) => this.showPrivacyOffCanvas(step, this.bseYr, evt.target), once: false}]
        });
        //scrollTo();
        
      }
      
    },
    disableAnswerButton(e){
      e.target.classList.add('bg-opacity-25');
      const sibling = e.target.parentElement.querySelectorAll('div.bg-secondary');

      for (let el of sibling) {
        el.onclick = undefined;
        el.classList.remove('pointer');
      }
    },
    
    showPrivacyOffCanvas(step = 0, bseYr, btn) {
      
      console.log('showPrivacyOffCanvas', step, bseYr);
      
      //제목
      const canvasTitle = document.querySelector('#offcanvasPrivacyLabel');
      canvasTitle.textContent = privacyNotice[`step${step}`].title;
      
      //본문
      const canvasBody = document.querySelector('#offcanvasPrivacyContent');
      canvasBody.innerHTML = privacyNotice[`step${step}`].content(bseYr);
      
      //확인 버튼
      let confirmButton = document.createElement('button')
      confirmButton.innerText = '확인'
      confirmButton.classList.add('btn', 'btn-lg', 'btn-success', 'px-5')
      
      confirmButton.id = 'btnPrivacy';


      const nextstep = () => {

        privacyOffcanvas.hide()

        // 이미 동의 된 경우 다음단계 가지말고 창만 닫고 끝냄
        if(!this.pseInfo.confirms[step]){
          const now = moment().format('YYYY-MM-DD HH:mm:ss');

console.log('nextstep', btn)

          //const btn = document.querySelector('.message-friend > div.rounded.bg-secondary.p-3.mt-1');
          btn.classList.add('border', 'border-success', 'bi', 'bi-check-lg', 'fw-bolder')
          btn.innerText = `  ${now}`
          //btn.disabled = true;
          //btn.classList.remove('pointer');

          this.pseInfo.confirms[step] = now;
          this.confirmPrivacy()
        }else{
          const container = document.querySelector('main .container');
          container.scrollTo({top: container.scrollHeight, behavior: 'smooth'});
        }

      }

      confirmButton.addEventListener('click', (evt) => {
        nextstep()
     })
  
      let offFooter = document.querySelector('#offcanvasFooter');
      offFooter.innerHTML = ''
      offFooter.append(confirmButton);
      privacyOffcanvas.show();

      // 개인정보 제공동의 홧인 누를때 전체 동의 체크 했는지 확인 필요
      if(step === 1) {

        if(this.pseInfo.confirms[step]){

          function _readonly(check){

            check.checked = true;
            check.classList.remove('is-invalid');
            check.classList.add('is-valid');
            check.disabled = true;
          }

          _readonly(document.querySelector('#agreeAll'))

          document.querySelectorAll('input[type=checkbox][name=checkAgree]').forEach(_readonly);


          //document.querySelectorAll('input[name=checkAgree]').checked = false;

        }else{
          confirmButton.disabled = true
          confirmButton.classList.add('disabled');
        }
      }
    },

    checkIL002(isrPrdCd){
      return ['IL0002', 'IL0034', 'IL0035'].includes(isrPrdCd)
    },

    breadbcrumb(){

      if(this.breadCrumbs.length>4) return [this.breadCrumbs[0], '...', this.breadCrumbs.at(-3), this.breadCrumbs.at(-2), this.breadCrumbs.at(-1)]
        .map(b=>`<li class="breadcrumb-item">${b}</li>`).join('\n')
      
      return this.breadCrumbs.map(b=>`<li class="breadcrumb-item">${b}</li>`).join('\n')
    },

  /**
     * 보험상품 옵션 만들기
     * @param data
     * @return {[HTMLDivElement]}
     */
    makeIsrPrdOption(data){
      
      // BreadCurmb update
      //updateBreadCurmb(breadCurmbs[current]);

console.log('data', data)
      
      /**
       * 필수 아닐때 미가입 옵션
       * @returns {HTMLDivElement}
       */
      const ignoreOption = (optionNumber, __data) => {
        const option = document.createElement('div');
        option.classList.add('rounded', 'bg-secondary', 'bg-opacity-10', 'p-3', 'mt-1', 'pointer');
        option.name = `option${this.current}`;
        
        const optionTxt = `${optionNumber}. 미가입(0원)`
        option.onclick = async (e) => {

          // 로그인 연장을 위해서 그냥 로그 전송
          this.sendLog('D', {[__data.isrPrdCd]: optionTxt});

          // 보험 변경 기간에 자녀 의료비보장 미가입 클릭
          if(this.bhdSlcChnYn && __data.isrrClCd === '3'){

console.log('자녀 의료비 보장 미가입', __data, 'childInfo', this.chldInfo);

            const rrno = this.hashidsHelper.decode(__data.tgrRrno);
            const childRrno = formatSsn(rrno, true);

            const cfirm = await confirmMessage('자녀 의료비 보장 미가입 확인',
              `<b>${__data.tgrFnm}(${childRrno})</b> 자녀 의료비 보장 보험 가입을 취소하시겠습니까?
<br><br>
해당 자녀의 정보도 삭제 됩니다.`);

            if(cfirm){

              this.currentChild = null;

              const found = this.chldInfo.findIndex(c=> c.usrFnm === __data.tgrFnm && c.rrno === rrno);

              if(found>=0) this.chldInfo.splice(found,1);

console.log('found', found, 'this.chldInfo', this.chldInfo, 'this.selected[__data.isrPrdCd]', this.selected[__data.isrPrdCd]);

              if(this.selected[__data.isrPrdCd]){

                if(this.selected[__data.isrPrdCd].length === 1) delete this.selected[__data.isrPrdCd];
                else{
                  const foundSelected = this.selected[__data.isrPrdCd].findIndex(c=> c.usrFnm === __data.tgrFnm && c.rrno === rrno);

                  if(foundSelected>=0) this.selected[__data.isrPrdCd].splice(foundSelected,1);
                }
              }

              answer(optionTxt + '<br>자녀정보 삭제');
              e.target.classList.add('bg-opacity-25', 'fw-bold');

              this.doQuestion()

              return;

            }else{
              return false;
            }

          }

          this.selected[__data.isrPrdCd] = new IsrPrd({
            isrPrdCd: __data.isrPrdCd,
            isrDtlCd: __data.isrDtlCd,
            isrrClCd: __data.isrrClCd,
            essYn: __data.essYn,
            xmpRegClCd: __data.xmpRegClCd,
            olfDndIvgYn: __data.olfDndIvgYn,
          }, __data.bhdSlcSeq)

          answer(optionTxt);
          this.doQuestion()
        };
        option.textContent = optionTxt;

        return option;

      } // end of ignoreOption

      const __options = []


      // 유의사항 버튼
      let __isrPrdCd = data.isrPrdCd;
      // 암진단비
      //if (__isrPrdCd === 'IL0017') __isrPrdCd = 'IL0006'
      //else if (__isrPrdCd == "IL0034" || __isrPrdCd == "IL0035") __isrPrdCd = 'IL0002'

      if (notice[__isrPrdCd]) {
        const option = document.createElement('div');
        option.classList.add('rounded', 'bg-success', 'bg-opacity-25', 'p-3', 'mt-1', 'pointer', 'bi', 'bi-megaphone-fill', 'text-primary', 'fw-bold');
        option.textContent = ' 보장내용 및 유의사항';

        option.dataset.isrPrdCd = __isrPrdCd;
        option.onclick = (evt) => showNoticeOnOffCanvas(evt.target.dataset.isrPrdCd)

        __options.push(option);
      }

      // 배우자 생명상해 해당없음 추가
      //if (question.data.isrPrdCd === 'IL0033') third.appendChild(ignoreOption());
      let optionNumber = 0;

      // 필수 아닐때 미가입 추가
      // 배우자 생명상행도 제외
      if(!data.essYn
        && ((data.isrrClCd === '0')
          || (data.isrrClCd === '1' && data.isrPrdCd !== 'IL0033')
          || (data.isrrClCd === '3')
        )) __options.push(ignoreOption(optionNumber+=1, data));

        // 80세 이상 상품이 있으면 필터가 필요하다
        const containsOver80 = !!data.dtlCdList.find(o => o.isrDtlNm.includes('80세'))

        data.dtlCdList.forEach((o, index) => {

          // 챗봇 형식에서는 배우자 생명상해 미가입 제거
          if(o.isrDtlCd === 'IM0263') return;

          // 80세 이상 상품 필터링
          const {usrFnm, rrno, sxClCd, age, cellPhoneNo, files, updFile} = data.isrrClCd === '0' ? this.pseInfo
            : data.isrrClCd === '1' ? this.spsInfo
              : this.currentChild

console.log('tgrInfo', 'isrrClCd', data.isrrClCd,  'usrFnm', usrFnm, 'rrno', rrno, 'sxClCd', sxClCd, 'age', age, 'files', files, 'updFile', updFile)

          if (containsOver80) {
            if (age >= 80 && !o.isrDtlNm.includes('80세')) return;
            if (age < 80 && o.isrDtlNm.includes('80세')) return;
          }

          const option = document.createElement('div');
          option.classList.add('rounded', 'bg-secondary', 'bg-opacity-10', 'p-3', 'mt-1', 'pointer');

          if(this.dcnYn && data.isrDtlCd === o.isrDtlCd) option.classList.add('border', 'border-secondary')

          option.name = `option${this.current}`;

          optionNumber += 1;

          const sbcAmt = getSbcAmt(sxClCd, o);
          const optionTxt = `${optionNumber}. ${o.isrDtlNm} (${sbcAmt.toLocaleString()}원${sbcAmt>0?'<small> 예상</small>':''})`;

          // 보험 선택 클릭
          option.onclick = async (e) => {

console.log('isTrust', e.isTrusted, e)

            let confirmed = null;

            // 의료비 미가입일때 물어보기
            if(data.dtlCdList[index].isrDtlCd === 'IM0212') {

              confirmed = await confirmMessage('의료비 보장 미가입 안내', `의료비 보장 보험은 필수 가입이나,
개인 의료비 보장 보험에 가입되어 있거나, 국가 유공자 등 예유 및 재원에 관한 법률에 의한 대상자에 한하여 미가입 가능합니다.<br>
<br>
미가입 대상자에 해당하십니까?`)

              // 아니요 했을때 상품 가입 시킴
              // 김민경 아이디어임 24. 9. 4. choihunchul
              if(confirmed){

                  const confirmed = new Date().toLocaleString()

                  this.sendLog('I', {message: 'IM0212', confirmed})

                  await answer(`<span><b><em class='bi bi-check-square-fill text-success'></em> 개인 의료비 보장 가입등에 따른 미가입 대상자 확인:</b>
                  ${confirmed}</span>`);

               }else{
                chat('미가입 대상자가 아닌 경우에는 의료비 보장 보험에 필수 가입합니다.')
                return option.nextSibling.click()
              }

            }


            // 선택한 옵션 마킹
            e.target.classList.add('bg-opacity-25', 'fw-bold');

            // 대답한 질문에 또 대답할수 없도록 click 이벤트 회수
            const sibling = e.target.parentElement.querySelectorAll('div.bg-secondary');

            for (let el of sibling) {
              el.onclick = undefined;
              el.classList.remove('pointer');
            }

            if(data.isrrClCd === '3'){
              this.selected[data.isrPrdCd] = this.selected[data.isrPrdCd]??[]

              if(!Array.isArray(this.selected[data.isrPrdCd])) this.selected[data.isrPrdCd] = []

console.log(`this.selected[${data.isrPrdCd}]`,this.selected[data.isrPrdCd])

              const _index = this.chldInfo.findIndex(c=>c.rrno === rrno)
              const bhdSlcSeq = this.selected[data.isrPrdCd].find(c=>c.rrno === rrno)?.bhdSlcSeq || 0;

console.log('_index', _index, rrno, 'bhdSlcSeq', bhdSlcSeq, 'this.chldInfo', this.chldInfo)

              this.selected[data.isrPrdCd][_index] = new IsrPrd(data.dtlCdList[index], bhdSlcSeq, usrFnm, rrno, sxClCd, age, cellPhoneNo, files, updFile)

              // 자녀 보험이 2종류 일수도 있기 때문에 초기화 안함 25. 8. 14. choihunchul
              //this.currentChild = null;

              this.sendLog('D', {[data.isrPrdCd]: data.dtlCdList[index].isrDtlCd, tgrFnm: usrFnm})
            }else{
              this.selected[data.isrPrdCd] = new IsrPrd(data.dtlCdList[index], data.bhdSlcSeq, usrFnm, rrno, sxClCd, age, cellPhoneNo, files, updFile)
              this.sendLog('D', {[data.isrPrdCd]: data.dtlCdList[index].isrDtlCd})
            }

console.log('this.selected', this.selected)

            const delay = this.dcnYn?100:(confirmed!==null || !e.isTrusted)?1500:600

            await answer(`<div class="fw-bold">${data.isrPrdNm}</div>
  ${optionTxt}`, {delay});


            //if (data.isrrClCd === '3') this.chldInfo = {};

            this.doQuestion();
          };
          option.innerHTML = optionTxt;
          //third.appendChild(option);

          __options.push(option)

      });

      return __options;
    },

    /**
     * 보험 선택 관련 질문 ㄱㄱ
     */
    doQuestion(){


console.log('doQuestion', 'this.current', this.current, 'this.spsInfo', this.spsInfo);

      /**
       * 보험 선택 질문
       * @param question
       */
      const chatForSelectPrd = (question)=>{

        // 한번 유의사항 봤으면 안보여줌
        const isrPrdCd = question.data.isrPrdCd;
        if(notice[isrPrdCd] && !this.pseInfo.noticeAgree.find(n => n[isrPrdCd])) question.onRendered = ()=> showNoticeOnOffCanvas(isrPrdCd)

        this.current++;

console.log('this.current', this.current, 'this.questions', this.questions)

        if(!question.message.includes('<span ')) question.message = question.data.essYn?`<span class="text-success bi bi-check2-square"> 필수</span> ${question.message}`
          : `<span class="text-primary bi bi-bag-plus"> 선택</span> ${question.message}`

        chat(question);
      }// end of chatForSelectPrd

      /**
       * 보험 선택 수정에서 자녀 정보 수정관련 질문들
       */
      const questionForChild =  ()=>{

        // 자녀 정보가 있는 경우
        if(this.chldInfo && this.chldInfo.length){

          console.log('questionForChild this.currentChild', this.currentChild);

          // 현재 순번의 자녀를 검색
          let idx = this.currentChild
            ?this.chldInfo.findIndex(c=>c===this.currentChild)
            :this.chldInfo.findIndex(c=>!c.validated);

          // validate되고 보험선택까지 했는지 검사
          if(idx>0){
            if(!this.selected[thisQuestion.data.isrPrdCd][idx-1]?.selectedTime) idx=idx-1;
          }

          // 다 validate 된경우
          if(idx===-1){
            const maxIdx = this.chldInfo.length-1;

            if(!this.selected[thisQuestion.data.isrPrdCd][maxIdx].selectedTime) idx=maxIdx;
            else{
              // 다 validate 되고 선택까지 했다면 자녀 추가 질문
              return this.confirmChldIsr(4, maxIdx+1);
            }
          }

          // 현재 순번 자녀 선택
          this.currentChild = this.currentChild || this.chldInfo[idx];

          // 현재 순번 자녀가 validated가 아니면
          if(!this.currentChild?.validated){

            console.log('idx', idx, this.currentChild)

            // 수정 여부
            this.confirmChldIsr(5, idx)

          }else{

            // 보험 선택
            chatForSelectPrd(thisQuestion);
          }

        }else{
          // 자녀 등록
          this.confirmChldIsr(0);
        }

      }// end of questionForChild

      // breadCrumbs 설정
      if(this.current === 0) {
        this.breadCrumbs = ['<b>보험선택</b>']
      }

      // 질문 설정
      const thisQuestion = this.questions[this.current] || this.questions.at(-1);
      //const nextQuestion = () =>this.questions[this.current+1];
console.debug('this.questions', this.questions)
console.debug(`this.questions[${this.current}]`, this.questions[this.current], thisQuestion)

      // 보험 선택이 모두 끝났거나 자녀보험 인 경우
      if(this.current >= this.questions.length || thisQuestion.data.isrrClCd === '3'){

console.debug('this.current', this.current, 'this.questions.length', this.questions.length, 'this.currentChild', this.currentChild, 'thisQuestion', thisQuestion)

        // 마지막 보험이 자녀보험이 아니라면 보험 선택 완료 된 경우
        // this.childDOne 이라면 자녀 보험 미가입 선택 했거나 더 선택 안한다고 했을때
        if (thisQuestion.data.isrrClCd !== '3' || this.childDone) {

          // 결과 출력
          return this.resultTable()
        }

        // 자녀 보험인데 index 초과한 경우
        if(this.current >= this.questions.length){

console.debug('this.chldInfo', this.chldInfo)
console.debug('thisQuestion', thisQuestion, 'this.selected', this.selected)

          // 현재 인덱스를 자녀보험 처음 인덱스로 돌림
          this.current = this.questions.findIndex(q=>q.data.isrrClCd === '3');
          // 다음 자녀 정보를 받기 위해 현재 자녀 정보 초기화
          this.currentChild = null;

        }

        questionForChild();

      } else {

        // 보험 변경 기간
        if(this.bhdSlcChnYn && !this.checkIL002(thisQuestion.data.isrPrdCd )){

          //this.selected[thisQuestion.data.isrPrdCd] =
          this.current++;
          return this.doQuestion();

        }

        // breadcrumbs 추가
        if(!this.breadCrumbs.includes(thisQuestion.short_title)) this.breadCrumbs.push(thisQuestion.short_title)

        if (thisQuestion.data.isrrClCd === '0') {

          chatForSelectPrd(thisQuestion);

          // 배우자
        } else if (thisQuestion.data.isrrClCd === '1') {
          console.log('spsInfo', this.spsInfo);

          // 보험상품 가입 안한다고 했을때
          if (!this.spsInfo) {

            this.current++
            this.doQuestion();

            // 배우자 정보 입력
          } else if (this.spsInfo.usrFnm) {

            // 배우자 정보가 확인 되었음
            if(this.spsInfo.validated){
              chatForSelectPrd(thisQuestion);
            }else{

              // 보험 완료후 수정 일때 배우자 정보 수정할건지 물어봄
              if(this.dcnYn){
                this.confirmSpsIsr(3);

              // 여기에 오는 경우는 없을 것 같긴 한데 25. 8. 14. choihunchul
              }else{

                this.sendLog("W", {message:'배우자 정보 확인 안됨', spsInfo: this.spsInfo}, true)

                this.confirmSpsIsr(0);
              }
            }

          } else {

            // 보험 변경 기간
            if(this.bhdSlcChnYn){
              if(this.spsEssYn) this.confirmSpsIsr(0);
              else{
                this.current++
                this.doQuestion();
              }
            }else{
              this.confirmSpsIsr(0);
            }
          }


        }

      }

      //scrollTo();
    },

    /**
     * 유의사항 확인한 시각 기록
     * @param isrPrdCd
     */
    doNoticeAgree(isrPrdCd){
      this.pseInfo.noticeAgree.push({[isrPrdCd]: new Date()})
    },

    /**
     * 배우자 공무원인지 체크
     * @param rrno
     * @return {Promise<*|boolean>}
     */
    async checkSpousePublicOfficial(rrno){

      if(!rrno) return true;

      let checked = false;

      if(this.testMode){

        console.group('checkSpousePublicOfficial', rrno, 'tempData', tempData)

        if(rrno === tempData){
          checked = true;
        }

      }

      console.debug('checkSpousePublicOfficial', checked)

      if(checked){

        const r = await Swal.fire({
          icon: 'warning',
          title: '배우자 분이 배정정보가 있는 대상자입니다.',
          html: `배우자 보험에 가입하시는 것이 맞습니까?
          
          <div class="text-danger">부부공무원의 경우 본인보험 가입이 원칙</div>`,
          showCancelButton: true,
          confirmButtonText: '배우자 보험 가입',
          cancelButtonText: '보험 가입 안함',
        })

        console.debug('checkSpousePublicOfficial', r)
        console.groupEnd()

        return r.isConfirmed;
      }else{
        console.groupEnd()
        return true
      }

      //TODO: 배우자 공무원 여부 확인
      this.throwException('배우자 공무원 여부 확인 구현안됨', {}, 'W')

    },

    /**
     * 배우자 보험 가입
     * 0 가입여부
     * 1 성명
     * 2 주민번호
     * 3 변경 여부
     * 4 배정정보 불러올건지 체크
     * 5 핸드폰
     * @param step {0|1|2|3|4|5} - 0: 가입여부, 1: 성명, 2: 주민번호, 3: 변경 여부, 4: 배정정보 불러올건지 체크, 5: 핸드폰
     */
    async confirmSpsIsr(step){

      if (step === 0) {

        chat({
          message: `<em class="text-info bi bi-chat-quote-fill me-1"></em> 배우자 보험 상품에 가입 하시나요?
<div>
  <ul>
    <li>${this.bseYr}.1.1. 기준 <mark>'공무원수당 등에 관한 규정'</mark> 제 10조(가족수당)에 의해 지급되는 대상자</li>
    <li>${this.bseYr}.1.1. 기준 법적혼인관계에 있는 자 (<small>사실혼은 제외</small>)</li>
    <li>부부 공무원의 경우 본인의 보험에 가입하는 것이 원칙</li>
  </ul>
</div>`
          , options:
            [
              {
                text: '네', callback: async (e)=> {

                  // 배정 내역 데이터 체크
                  // 안하기로 함 25. 8. 26. choihunchul
                  /*const find = this.fmlInfo.find(f=>f.isrrClCd === '1');
                  if(find){
                    this.confirmSpsIsr(4);
                  }else{
                    this.confirmSpsIsr(1);
                  }*/

                  const r = await confirmMessage('부부 공무원 단체보험 가입 안내', `배우자 분이 공무원 단체보험에 가입하는 경우<br>
<mark>본인의 보험</mark>에 가입하는 것이 원칙입니다.`)

                  if(r){
                    this.confirmSpsIsr(1);
                  }else{
                    chat('배우자 보험 가입 취소');
                    this.spsInfo = null;
                    this.doQuestion();
                  }


                }
              },
              {
                text: '아니오', callback:  e=> {

                  this.spsInfo = null;
                  this.doQuestion();
                }
              },
            ]
        })
      } else if (step === 1) {

        const input = questionWithInput('배우자 성명을 입력해주세요');
        input.maxLength = 30;

        // 배우자 정보 수정
        if(this.spsInfo?.usrFnm) input.value = this.spsInfo.usrFnm;

        const _button = document.createElement('button');
        _button.classList.add('btn', 'btn-primary', 'rounded-end');
        _button.textContent = '확인';

        input.parentElement.classList.add('input-group')
        input.parentElement.appendChild(_button);

        const invalid = document.createElement('div')
        invalid.id = 'invalidCheckSpsName';
        invalid.classList.add('invalid-feedback');

        input.parentElement.classList.add('form-check')
        input.parentElement.appendChild(invalid)

        const checkName = async (evt)=>{

          input.value = input.value.trim()
          const spsName = input.value;

          const checked = validateSpsName(spsName, this.spsInfo.validatedName, this.pseInfo, this.chldInfo);

console.debug('validateSpsName', checked)

          if(!checked.valid){

            // 부부 성명이 동일한 경우
            if(checked.data.sameName){

              const r = await confirmMessage('배우자 분 성명이 동일한가요?', '배우자 분과 성명이 동일한 경우 "네"를 눌러주세요')

console.debug('r', r)

              if(r){

                this.sendLog('I', {text: '배우자 성명 동일', pseFnm: this.pseInfo.usrFnm, spsFnm: spsName})

                markingInvalid(input, false)

                this.spsInfo.usrFnm = spsName;
                this.spsInfo.validatedName = true;

                input.readOnly = true;
                _button.disabled = true;
                //evt.target.disabled = true;
                this.confirmSpsIsr(2)
                return true;
              }else{

                markingInvalid(input, true, '이미 등록된 성명입니다.')
                input.select();
                input.focus();
                return false;
              }


            }else{

              markingInvalid(input, true, checked.message)
              return false
            }

          }

          markingInvalid(input, false)

          confirmMessage('성명 확인', `배우자 분 성명이 <b>${spsName}</b> ${endsWithBatchim(spsName) ? '이' : '가'} 맞나요?`)
            .then(r=>{
              if(r){
                this.spsInfo.usrFnm = spsName;
                this.spsInfo.validatedName = true;

                input.readOnly = true;
                _button.disabled = true;
                //evt.target.disabled = true;
                this.confirmSpsIsr(2)
              }else{
                input.select();
                input.focus();
              }
            })

        }// end of checkName

        _button.addEventListener('click', evt => {
          checkName(evt);
        })

        input.addEventListener('keyup', async evt => {
          if(evt.target.readOnly){
            return evt.preventDefault();
          }

          if (evt.key === 'Enter') {
            checkName(evt);
          }
        })

        input.focus();

      } else if (step === 2) {

        const input = questionWithInput('배우자 주민번호를 입력해주세요');
        //Inputmask({mask: "999999-9999999", keepStatic: true, placeholder: '0', autoUnmask: true}).mask(input);
        this.rrnoInputMask.mask(input)

        // 배우자 정보 수정
        // 피민경이 빼달라고해서 뺌 24. 11. 12. choihunchul
        // 다시 넣는다. 25. 8. 26. choihunchul
        if(this.spsInfo?.rrno) input.value = this.spsInfo.rrno;

        input.ariaDescripedby = 'invalidCheckSps';
        input.setAttribute('inputMode', 'numeric');

        const invalid = document.createElement('div')
        invalid.id = 'invalidCheckSps';
        invalid.classList.add('invalid-feedback');

        input.parentElement.classList.add('form-check')
        input.parentElement.appendChild(invalid)

        input.addEventListener('keyup', evt => {

          if(evt.target.readOnly){
            return evt.preventDefault();
          }

          const rrno = evt.target.value;
          console.log(evt.target, rrno)

          if (rrno?.length === 13) {

            // 주민번호 정합성 검사
            const checked = validateSpsSsn(rrno, this.pseInfo, this.bseYr, this.chldInfo);

console.debug('validateSpsSsn', checked)

            if(!checked.valid){
              markingInvalid(evt.target, true, checked.message)
              return false;
            }

            const {bornYear, tgrSxClCd, tgrAg, birthday} = checked.data

//console.log(tgrSxClCd, tgrAg);

              // 마스킹
              evt.target.inputmask.remove();
              evt.target.value = formatSsn(rrno);

              markingInvalid(evt.target, false)

              confirmMessage('배우자 주민번호 확인', `배우자 분 주민번호가 <strong>${formatSsn(rrno, false)}</strong> 가 맞나요?
<br>성별: <strong>${tgrSxClCd === '1' ? '남' : '여'}</strong>
<br>생년월일: <strong>${moment(birthday).format('YYYY년 M월 D일')}</strong>`)


                .then(r=>{

                  if(r){

                    this.spsInfo.rrno = rrno;
                    this.spsInfo.sxClCd = tgrSxClCd;
                    this.spsInfo.isrrClCd = '1';

                    this.sendLog("I", {chgSpsFnm: this.spsInfo.usrFnm, birthday, telNo: this.spsInfo.cellPhoneNo});

                    markingInvalid(evt.target, false)

                    evt.target.inputmask?.remove();
                    evt.target.value = formatSsn(rrno);

                    // 핸드폰 번호 입력

                    this.confirmSpsIsr(5);
                    return;

                  }else {

                    markingInvalid(evt.target, true, '주민번호를 확인해 주세요')

                    if(!evt.target.inputmask){
                      this.rrnoInputMask.mask(evt.target)
                    }

                    evt.target.value = rrno;

                    evt.target.select()
                    evt.target.focus()
                  }

                })

          }
        });

        input.focus();

      }else if(step === 3) {

        // 정합성 체크
        const checked = validateSps(this.spsInfo, this.pseInfo, this.chldInfo);

console.debug('sps checked', checked)

        const {birthday, tgrSxClCd} = calcSsn(this.spsInfo.rrno, this.bseYr);

        const okButton = {text: '✅ 수정안함', callback: () => {
            this.spsInfo.validated = true;
            this.doQuestion()
          }};

        const options =  []

        // 배우자 정보가 validated일때만 수정안함 버튼 보이게
        if(checked.valid){
          options.push(okButton);
        }

        options.push({text: '✏️ 수정', callback: () => this.confirmSpsIsr(1)})

console.debug('this.spsInfo.rrno', this.spsInfo, options)

        if(!this.bhdSlcChnYn && !this.spsOtherIsrYn){

          options.push(  {
            text: '❌ 배우자 정보 삭제', callback: (evt) => {
              confirmMessage('배우자 정보 삭제', `배우자 정보를 삭제 하시겠습니까?
선택된 모든 배우자 보험 상품도 삭제됩니다.`)
                .then(r => {
                  if(r){

                    this.sendLog("I", {from: '배우자정보삭제'})

                    this.spsInfo = null;
                    Object.values(this.selected).flat()
                      .filter(s=>s.isrrClCd === '1')
                      .forEach(s=> delete this.selected[s.isrPrdCd])
                    chat(`배우자 정보가 삭제되었습니다.
  선택된 모든 배우자 보험 상품도 삭제되었습니다.`)
                    this.doQuestion();
                  }else{
                    evt.target.classList.remove('bg-opacity-25', 'fw-bold')
                    evt.target.classList.add('bg-opacity-10')
                  }
                })
            }, once: false
          },)

        }

        chat({
          message: `

<div class="col p-3">
<div class="fs-4 fw-bold">배우자 정보입니다.</div>
<div class="row mt-3">
<table class="table table-striped table-bordered table-hover shadow-sm">
  <caption class="sr-only d-none">배우자 정보</caption>
  <colgroup>
    <col style="width: 5em">
    <col>
  </colgroup>
  <tbody>
    <tr>
      <th scope="row">성명</th>
      <td>${this.spsInfo.usrFnm}</td>
    </tr>
    <tr>
      <th scope="row">주민번호</th>
      <td><small>${printMaskWithEyes({valueObj:'spsInfo?.rrno'})}</small></td>
    </tr>
    <tr>
      <th scope="row">생년월일</th>
      <td>${birthday}</td>
    </tr>
    <tr>
      <th scope="row">성별</th>
      <td>${tgrSxClCd==='1'?'남':'여'}</td>
    </tr>
    <tr>
      <th scope="row">전화번호</th>
      <td>
        ${this.spsInfo.cellPhoneNo?printMaskWithEyes({valueObj:'spsInfo?.cellPhoneNo', type: 'mobile'}):'-'}
      </td>
    </tr>
    <tr class="align-middle">
      <th scope="row">개인정보<br>제공동의</th>
      <td>${this.spsInfo.agrInfo?.agrStsCd === 'D' ? '동의완료' : '동의미완료'}</td>
    </tr>
  </tbody>
</table>
</div>
<div class="my-3">${checked.valid?'수정하시겠습니까?':'<strong class="text-danger">수정이 필요합니다.</strong>'}</div>
<hr>
</div>
        `,
          options
        }, true)
      }else if(step===4){


        chat({
          message: `현재 배정정보의 배우자 정보를 불러 오시겠습니까?`
          , options:
            [
              {
                text: '네', callback: (e)=> {

                  // 배정 내역 데이터 체크
                  const find = this.fmlInfo.find(f=>f.isrrClCd === '1');

                  this.spsInfo = find;

                  this.confirmSpsIsr(3);
                }
              },
              {
                text: '아니오', callback: (e)=> {

                  this.spsInfo = {};
                  this.confirmSpsIsr(1);
                }
              },
            ]
        })
      }else if(step === 5) {

        // 핸드폰 번호 받기
        this.inputCellphoneNo(`배우자 보험 가입을 위해서는 <mark>배우자의 개인정보 수집/이용 및 제3자 제공</mark>에 대한 동의가 필요합니다.<br>
다음 화면에서 배우자 휴대폰 번호를 입력하여 동의화면을 보내주시기 바랍니다.<br>
<b class="text-danger">미동의시 가입불가</b>`, this.spsInfo)
          .then(()=>{

            // 최종 validation
            const checked = validateSps(this.spsInfo, this.pseInfo, this.bseYr, this.chldInfo);
console.log('validateSps', checked)

            if(checked.valid){
              this.spsInfo.validated = true;
              this.doQuestion()

            }else{
              // TODO: 어떻게 해야 하나.
              this.sendLog('E', {text: '배우자 정합성 실패', checked, spsInfo: this.spsInfo}, true)
            }


          })
      }

    },



    validateSps(){

      if(!this.spsInfo){
        this.throwException('this.spsInfo not')
      }

      return this.checkChildRrno();

    },

    checkSpsRrno(){

      if(!this.spsInfo){
        this.throwException('this.spsInfo not')
      }

      const otherRrnos = [...this.pseInfo.rrno, this.chldInfo.filter(c=>c.validated && c !== this.currentChild)]

      console.debug('checkChildRrno otherRrnos', otherRrnos, 'this.spsInfo', this.spsInfo)

      return  validateChildSsn(this.currentChild, this.pseInfo, this.bseYr, this.wlfInst.chldIsrAgRstcYr, otherRrnos);

    },


    /**
     * 자녀 추가
     * 0 가입여부
     * 1 성명
     * 2 주민번호
     * 4 추가 여부
     * 5 수정 여부
     * 6 배정정보 불러오기
     * @param step {0|1|2|4|5|6} - 0: 가입여부, 1: 성명, 2: 주민번호, 4: 추가 여부, 5: 수정 여부, 6: 배정정보 불러오기
     * @param index {number=0} - 자녀 순번
     */
    async confirmChldIsr(step, index=0) {

console.log('confirmChldIsr', 'step', step, 'index', index);


      if (step === 0) {

        let limitAge = parseInt(this.bseYr) - parseInt(this.wlfInst.chldIsrAgRstcYr)

        limitAge = limitAge ===29?30:limitAge;

        chat({
          message: `<em class="text-info bi bi-chat-quote-fill me-1"></em> 자녀 보험 상품에 가입 하시나요?
<div>
  <ul>
    <li>${this.bseYr}.1.1. 기준 <mark>'공무원수당 등에 관한 규정'</mark> 제 10조(가족수당)에 의해 지급되는 대상자</li>
    <li>직계비속</li>
    <li>${this.bseYr}.1.1. 기준 만 ${limitAge}세 미만 <small class="text-muted">(${this.wlfInst.chldIsrAgRstcYr}. 1.1. 이후 출생)</small></li>
    <li>단, 장애가 있는 자녀는 미혼인 경우에 한해 연령에 관계없이 가입이 가능합니다.<b>(증빙서류 필요)</b></li>
  </ul>
</div>`
          , options:
            [
              {
                text: '네', callback: (e)=> {

                  this.childDone = false;
                  this.chldInfo = []
                  this.currentChild = null;

                  // 배정 정보 체크
                  // 안하기로 함 25. 8. 26. choihunchul
                  /*const found = this.fmlInfo.find(f=>f.isrrClCd === '3')

                  if(found){

                    this.confirmChldIsr(6, 0);


                  }else{

                    this.confirmChldIsr(1, 0);
                  }*/

                  this.confirmChldIsr(1, 0);

                }
              },
              {
                text: '아니오', callback: (e)=> {

                  this.childDone = true;
                  this.chldInfo = null;
                  this.currentChild = null;
                  this.doQuestion()
                }
              },
            ]
        })
      } else if (step === 1) {

        this.currentChild = null;

        const input = questionWithInput('자녀 성명을 입력해주세요');

        if(index!==0 && !index){
          index = this.chldInfo?.length-1;
          if(!index ||index<0) index = 0
        }

        // 자녀 정보 수정
        if(this.chldInfo[index]?.usrFnm){
          input.value = this.chldInfo[index].usrFnm;
          input.dataset.storedName = this.chldInfo[index].usrFnm;
        }

        const _button = document.createElement('button');
        _button.classList.add('btn', 'btn-primary', 'rounded-end');
        _button.textContent = '확인';

        input.parentElement.classList.add('input-group')
        input.parentElement.appendChild(_button);

        const invalid = document.createElement('div')
        //invalid.id = 'invalidCheckName';
        invalid.classList.add('invalid-feedback');

        input.parentElement.classList.add('form-check')
        input.parentElement.appendChild(invalid)

        // 성명 체크
        const checkName = (evt)=> {

console.log('checkName', input)

        input.value = input.value.trim()

        const childName = input.value;

        const otherNames = [this.pseInfo.usrFnm];

        if(this.spsInfo?.validated){
          otherNames.push(this.spsInfo.usrFnm)
        }

console.debug('this.chldInfo', this.chldInfo, 'this.currentChild', index)

        const checked = validateName(childName, otherNames
          .concat(this.chldInfo.filter((c, i)=>c.validated && i !== index)
            .map(c=>c.usrFnm)));

        if(!checked.valid){
          markingInvalid(input, true, checked.message)
          return false;
        }

          markingInvalid(input, false)

          confirmMessage('자녀 성명 확인', `자녀분 성명이 <b>${childName}</b> ${endsWithBatchim(childName) ? '이' : '가'} 맞나요?`)
            .then(r=>{

              if(r){

                console.log('index', index, `this.chldInfo[${index}]`, this.chldInfo[index], this.chldInfo);

                if(!this.chldInfo[index]) this.chldInfo[index] = {usrFnm: childName, rrno: ''}
                else this.chldInfo[index].usrFnm = childName;

                this.currentChild = this.chldInfo[index];

                input.readOnly = true;
                _button.disabled = true;
                this.confirmChldIsr(2, index)
              } else {
                input.select();
                input.focus();
              }
            })

        }

        _button.addEventListener('click', checkName);

        input.addEventListener('keyup', async evt => {
          if(evt.target.readOnly){
            return evt.preventDefault();
          }

          if (evt.key === 'Enter') {
            checkName(evt)
          }
        })

        input.focus();


      } else if (step === 2) {

        /**
         * 자녀 주민번호 체크
         * @param input {HTMLInputElement}
         * @returns {boolean}
         */
        const checkChildRrno = (input)=>{

          const rrno = input.value;

          this.currentChild.rrno = rrno
          //const storedRrno = input.dataset.storedRrno;
          console.log(input, rrno)

          const checked = this.checkChildRrno(index);

console.debug('checkChildRrno', checked)

          if(!checked.valid){

            this.currentChild.validated = false;

            if(checked.message){
              markingInvalid(input, true, checked.message)
              return false;
            }

          }

          this.sendLog("D", checked)

//console.log(tgrSxClCd, tgrAg);

          input.inputmask?.remove();
          input.value = formatSsn(rrno);
          /*input.readOnly = 'readonly';
          _button.disabled = true;*/

          markingInvalid(input, false)

          confirmMessage('자녀 주민번호 확인', `자녀의 주민번호가 <strong>${formatSsn(rrno, false)}</strong> 이 맞나요?
<br>성별: <strong>${checked.data.tgrSxClCd === '1' ? '남' : '여'}</strong>
<br>생년월일: <strong>${moment(checked.data.birthday).format('YYYY년 M월 D일')}</strong>`)
            .then((r)=> {
              if(r){

                this.chldInfo[index].rrno = rrno;
                this.chldInfo[index].sxClCd = checked.data.tgrSxClCd;
                this.chldInfo[index].isrrClCd = '3';

                console.log('index', index, 'this.chldInfo', this.chldInfo, 'this.wlfInst.chldIsrAgRstcYr', this.wlfInst.chldIsrAgRstcYr,  this.currentChild);

                // 19세 이상인 경우 장애여부 물어본다.
                if (checked.data.over19) {

                  if(this.chldInfo[index].updFleNo){

                    //input.value = formatSsn(rrno);

                    confirmMessage('자녀 증빙 서류 확인', `<strong>${this.wlfInst.chldIsrAgRstcYr}</strong>년 1월 1일 이전 출생 인 경우 장애가 있는 자녀만 가입이 가능하며
  , 증빙서류(복지카드 사본, 장애인 증명서등)가 필요합니다.
  <br>증빙서류를 다시 업로드 하시겠습니까?`).then((r) => {

                      const targetEl = input;

                      if (r) {

                        const message = `증빙서류를 첨부해 주세요
  (복지카드 사본, 장애인 증명서등)`

                        /**
                         * @type {Button} - ok버튼
                         */
                        const okButton = {
                          callback: (evt, input) => {
                            //this.currentChild.validated = true;
                            markingInvalid(targetEl, false)

                            _button.disabled = true;

                            //targetEl.disabled = true;

                            //targetEl.value = formatSsn(targetEl.value);

                            this.chldInfo[index].files = input.files

                            chat('증빙 서류가 등록 되었습니다.');

                            if(this.chldInfo[index].agrInfo?.agrStsCd !== 'D'){
                              // 핸드폰 번호 받기
                              this.inputCellphoneNo(`만 15세 이상 자녀인 경우 보험 가입을 위해서는 <mark>자녀의 개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.<br>
  하단에 자녀 핸드폰 번호를 입력하고 '확인'을 클릭하여 동의화면을 보내주시기 바랍니다.<br>
  <b class="text-danger">미동의시 가입불가</b>`, this.chldInfo[index])
                                .then(() => {
                                  console.log('this.chldInfo', this.chldInfo, this.currentChild)
                                  this.doQuestion()
                                })
                            }else{
                              this.doQuestion()
                            }

                          }
                        }

                        /**
                         * @type {Button} - 취소버튼
                         */
                        const cancelButton = {
                          callback: (evt) => {

                            chat('증빙 서류 등록이 취소 되었습니다. 기존 파일을 유지합니다.');

                            //this.currentChild.validated = true;
                            markingInvalid(targetEl, false)

                            _button.disabled = true;

                            //targetEl.disabled = true;

                            //targetEl.value = formatSsn(targetEl.value);

                            if(this.chldInfo[index].agrInfo?.agrStsCd !== 'D'){
                              // 핸드폰 번호 받기
                              this.inputCellphoneNo(`만 15세 이상 자녀인 경우 보험 가입을 위해서는 <mark>자녀의 개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.<br>
  하단에 자녀 핸드폰 번호를 입력하고 '확인'을 클릭하여 동의화면을 보내주시기 바랍니다.<br>
  <b class="text-danger">미동의시 가입불가</b>`, this.chldInfo[index])
                                .then(() => {
                                  console.log('this.chldInfo', this.chldInfo, this.currentChild)
                                  this.doQuestion()
                                })
                            }else{
                              this.doQuestion()
                            }

                          },
                        }

                        fileUpload(({message, okButton, cancelButton}));
                        return;

                      // 증빙서류 이미 있는 경우 재 업로드 안함
                      } else {

                        //this.currentChild.validated = true;
                        markingInvalid(targetEl, false)

                        _button.disabled = true;

                        //targetEl.disabled = true;

                        //targetEl.value = formatSsn(targetEl.value);

                        if(this.chldInfo[index].agrInfo?.agrStsCd !== 'D'){
                          // 핸드폰 번호 받기
                          this.inputCellphoneNo(`만 15세 이상 자녀인 경우 보험 가입을 위해서는 <mark>자녀의 개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.<br>
  하단에 자녀 핸드폰 번호를 입력하고 '확인'을 클릭하여 동의화면을 보내주시기 바랍니다.<br>
  <b class="text-danger">미동의시 가입불가</b>`, this.chldInfo[index])
                            .then(() => {
                              console.log('this.chldInfo', this.chldInfo, this.currentChild)

                              this.currentChild.validated = true;
                              this.doQuestion()
                            })

                        // 동의 완료
                        }else{

                          this.currentChild.validated = true;
                          this.doQuestion()
                        }

                        return;
                      }

                    })

                  // 자녀등록시 증빙서류 등록
                  }else {

                    //input.value = formatSsn(rrno);

                    confirmMessage('자녀 증빙 서류 확인', `<strong>${this.wlfInst.chldIsrAgRstcYr}</strong>년 1월 1일 이전 출생 인 경우 장애가 있는 자녀만 가입이 가능하며
  , 증빙서류(복지카드 사본, 장애인 증명서등)가 필요합니다.
  <br>계속 진행 하시겠습니까?`).then((r) => {

                      if (r) {

                        const targetEl = input;

                        const message = `증빙서류를 첨부해 주세요
  (복지카드 사본, 장애인 증명서등)`

                        /**
                         * @type {Button} - ok버튼
                         */
                        const okButton = {
                          callback: (evt, input) => {
                            this.currentChild.validated = true;
                            markingInvalid(targetEl, false)

                            _button.disabled = true;

                            //targetEl.disabled = true;

                            //targetEl.value = formatSsn(targetEl.value);

                            this.chldInfo[index].files = input.files

                            chat('증빙 서류가 등록 되었습니다.');

                            // 핸드폰 번호 받기
                            this.inputCellphoneNo(`만 15세 이상 자녀인 경우 보험 가입을 위해서는 <mark>자녀의 개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.<br>
  하단에 자녀 핸드폰 번호를 입력하고 '확인'을 클릭하여 동의화면을 보내주시기 바랍니다.<br>
  <b class="text-danger">미동의시 가입불가</b>`, this.chldInfo[index])
                              .then(() => {

                                this.currentChild.validated = true;
                                console.log('this.chldInfo', this.chldInfo, this.currentChild)
                                this.doQuestion()
                              })
                          }
                        }

                        /**
                         * @type {Button} - 취소버튼
                         */
                        const cancelButton = {
                          confirmMessage: `증빙 서류 업로드를 취소 하시겠습니까?
  <br><b>${this.currentChild.usrFnm}</b> 자녀에 대한 보험 가입이 취소됩니다.`,
                          callback: (evt) => {
                            chat('증빙 서류 첨부가 취소되었습니다.');

                            this.chldInfo.splice(index, 1)

                            chat(`${this.currentChild.usrFnm} 보험 가입 취소`)

                            this.currentChild = null;

                            markingInvalid(targetEl, true, `${this.wlfInst.chldIsrAgRstcYr} 년도 이후 출생 입니다.`)

                            _button.disabled = true;

                            //targetEl.value = formatSsn(targetEl.value);

                            // 이미 자녀 보험이 하나라도 있으면 자녀 추가할건지 물어보고
                            // 없으면 자녀 보험 가입할건지 물어봄
                            if (this.selected.find(p => p.isrrClCd === '3')) this.confirmChldIsr(4, index);
                            else this.confirmChldIsr(0, index);
                          },
                        }

                        fileUpload(({message, okButton, cancelButton}));
                        return;

                      } else {

                        this.currentChild.validated = false;

                        markingInvalid(input)

                        _button.disabled = true;

                        input.value = formatSsn(rrno, true, `${this.wlfInst.chldIsrAgRstcYr}년도 이후 출생자 입니다.`);

                        this.chldInfo.splice(index, 1)

                        // 이미 자녀 보험이 하나라도 있으면 자녀 추가할건지 물어보고
                        // 없으면 자녀 보험 가입할건지 물어봄
                        if (this.selected.find(p => p.isrrClCd === '3')) this.confirmChldIsr(4, index);
                        else this.confirmChldIsr(0, index);

                        return;
                      }

                    })

                  }

                // 19세 미만
                } else {

                  markingInvalid(input, false)

                  _button.disabled = true;

                  input.value = formatSsn(rrno);

                  //15세 이상인 경우 휴대폰 번호 받기
                  if (this.chldInfo[index]?.agrInfo?.agrStsCd !== 'D' && checked.data.tgrAg >= 14) {
                    // 핸드폰 번호 받기
                    this.inputCellphoneNo(`15세 이상 자녀인 경우 보험 가입을 위해서는 <mark>자녀의 개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.<br>
하단에 자녀 핸드폰 번호를 입력하고 '확인'를 클릭하여 동의화면을 보내주시기 바랍니다.<br>
<b class="text-danger">미동의시 가입불가</b>`, this.currentChild)
                      .then(() =>{

                        this.currentChild.validated = true;

                        console.log('this.chldInfo', this.chldInfo, this.currentChild)
                        this.doQuestion()
                      })

                  } else {
                    this.currentChild.validated = true;

                    this.doQuestion()
                  }

                }
              }else{
                input.focus()
              }
            })

        }

        const input = questionWithInput('자녀 주민번호를 입력해주세요');

        // 자녀 정보 수정
        if(this.chldInfo[index]?.rrno){
          input.value = this.chldInfo[index].rrno;
          input.dataset.storedRrno = this.chldInfo[index].rrno;
        }

        //Inputmask({mask: "999999-9999999", keepStatic: true, placeholder: '0', autoUnmask: true}).mask(input);
        this.rrnoInputMask.mask(input)

        input.ariaDescripedby = 'invalidCheckChld';
        input.setAttribute('inputMode', 'numeric');

        const _button = document.createElement('button');
        _button.classList.add('btn', 'btn-primary', 'rounded-end');
        _button.textContent = '확인';

        _button.addEventListener('click', ()=>checkChildRrno(input))

        input.parentElement.appendChild(_button);

        const invalid = document.createElement('div')
        invalid.id = 'invalidCheckChld';
        invalid.classList.add('invalid-feedback');

        input.parentElement.classList.add('form-check', 'input-group')
        input.parentElement.appendChild(invalid)

        input.addEventListener('keyup', evt => {
          if(evt.target.readOnly){
            return evt.preventDefault();
          }
          if(evt.target.value.length === 13) checkChildRrno(evt.target);

        });

        input.focus();

        // 자녀 추가
      } else if (step === 4) {

        let limitAge = parseInt(this.bseYr) - parseInt(this.wlfInst.chldIsrAgRstcYr)

        limitAge = limitAge ===29?30:limitAge;

        chat({
          message: `또 다른 자녀가 있으신가요?
<div>
  <ul>
    <li>직계비속</li>
    <li>${this.bseYr}. 1. 1기준 만 ${limitAge}세 미만 <small class="text-muted">(${this.wlfInst.chldIsrAgRstcYr}. 1. 1이후 출생)</small></li>
    <li>단, 장애가 있는 자녀는 미혼인 경우에 한해 연령에 관계없이 가입이 가능합니다.<b>(증빙서류 필요)</b></li>
  </ul>
</div>`
          , options:
            [
              {
                text: '네', callback: (e)=> {
                  this.childDone = false;

                  index = this.chldInfo?.length;
                  if(!index ||index<0) index = 0

                  this.confirmChldIsr(1, index);
                }
              },
              {
                text: '아니오', callback:  (e)=> {
                  this.childDone = true;
                  this.doQuestion();
                }
              },
            ]
        })

      // 수정 여부
      }else if(step === 5){

console.log('step', step, 'index', index, 'this.chldInfo', this.chldInfo)

        this.currentChild = this.chldInfo[index];

        const checked = this.validateChild();

        if(!checked.valid){

          alertMessage('자녀 정보 수정', '자녀 정보 수정이 필요합니다.', 'warning')
        }

        const rrno = this.currentChild.rrno
        const cellPhoneNo = this.currentChild.cellPhoneNo
        const updFleNo = this.currentChild.updFleNo

        const {birthday, tgrSxClCd} =calcSsn(rrno, this.bseYr, true)
        const agrInfo = this.currentChild.agrInfo;

        let childTable = `

<div class="col p-3">
<div class="fs-4">자녀 정보입니다.</div>
<div class="row mt-3">
  <div class="mt-3">
    <table class="table table-striped table-bordered table-sm table-hover shadow-sm">
      <caption class="sr-only d-none">자녀정보</caption>
      <colgroup>
        <col style="width: 5em">
        <col>
      </colgroup>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">${index+1}/${this.chldInfo.length}</th>
        </tr>
      </thead>
      <tbody class="table-group-divider">
        <tr>
          <th scope="row">성명</th>
          <td>${this.chldInfo[index].usrFnm}</td>
        </tr>
        <tr>
          <th scope="row">주민번호</th>
          <td>
            <small>${printMaskWithEyes({valueObj: `'${rrno}'`})}</small>
          </td>
        </tr>
        <tr>
          <th scope="row">생년월일</th>
          <td>${birthday}</td>
        </tr>
        <tr>
          <th scope="row">성별</th>
          <td>${tgrSxClCd === '1' ? '남' : '여'}</td>
        </tr>
        <tr class="align-middle ${this.currentChild.updFleNo?'':'d-none'}">
          <th scope="row">증빙파일</th>
          <td>${updFleNo?printFileviewer({encdFileNo: `${updFleNo}`}):''}</td>
        </tr>
        <tr class="${cellPhoneNo??'d-none'}">
          <th scope="row">전화번호</th>
          <td>
            <small>${printMaskWithEyes({valueObj: `'${cellPhoneNo}'`, type: 'mobile'})}</small>
          </td>
        </tr>
        <tr class="align-middle ${agrInfo??'d-none'}">
          <th scope="row">개인정보<br>제공동의</th>
          <td>${agrInfo?.agrStsCd === 'D' ? '동의완료' : '동의미완료'}</td>
        </tr>
      </tbody>
      </table>
    </div>

      <hr>
      
    </div>`

        const okButton = {text: '✅ 수정안함', callback: () => {
            this.currentChild = this.chldInfo[index]

            const checked = this.checkChildRrno();

            console.log('checked', checked, this.checkChildRrno)

            if(checked){

              if(checked.data.over19){

                this.inputUpdFile();

              }else if(checked.data.over14){

                this.inputCellphoneNo()

              }else{
                this.chldInfo[index].validated = true;
                this.doQuestion()
              }

            }else{

            }

          }};


        const options = [ {text: '✏️ 수정', callback: () => this.confirmChldIsr(1, index)},
          {
            text: '❌ 자녀 정보 삭제', callback: (evt) => {
              confirmMessage('자녀 정보 삭제', `자녀 정보를 삭제 하시겠습니까?
해당 자녀의 보험 상품도 삭제됩니다.`)
                .then(r => {
                  if(r){

                    Object.values(this.selected).flat()
                      .filter(s=>s.isrrClCd === '3' && s.tgrRrno === this.chldInfo[index].rrno)
                      .forEach(s=> this.selected[s.isrPrdCd].splice(this.selected[s.isrPrdCd].findIndex(f=>f===s)))
                    this.chldInfo.splice(index, 1)

                    console.log('delete this.chldInfo',this.chldInfo);
                    if(!this.chldInfo || !this.chldInfo.length) this.currentChild = null;
                    else if(this.chldInfo.length-1 <= index ) this.currentChild = null;
                    else this.currentChild = this.chldInfo[index];

                    chat(`자녀 정보가 삭제되었습니다.
  해당 자녀의 보험 상품도 삭제되었습니다.`)
                    this.doQuestion();
                  }else{
                    evt.target.classList.remove('bg-opacity-25', 'fw-bold')
                    evt.target.classList.add('bg-opacity-10')
                  }
                })
            }, once: false
          }]

        // 자녀정보가 validate된 경우에만 수정 버튼 보이게
        if(checked.valid){
          options.unshift(okButton)
        }

        chat({
          message: childTable,
          options
        }, true)

      }else if (step === 6) {

        chat({
          message: `현재 배정정보의 자녀 정보를 불러 오시겠습니까?`
          , options:
            [
              {
                text: '네', callback: (e)=> {

                  // 배정 내역 데이터 체크
                  this.chldInfo = this.fmlInfo.filter(f=>f.isrrClCd === '3');

console.log('find', find, 'this.fmlInfo', this.fmlInfo, ' this.chldInfo',  this.chldInfo)

                  this.childDone = false;
                  this.currentChild = null;

                  this.confirmChldIsr(5);
                }
              },
              {
                text: '아니오', callback: (e)=> {

                  this.childDone = false;
                  this.chldInfo = []
                  this.currentChild = null;

                  this.confirmChldIsr(1);
                }
              },
            ]
        })

      }

      //scrollTo();

    },

    /**
     * 자녀 정보 validate
     * @param {number} - index
     * @return {Checked}
     */
    validateChild(index){

      if(!this.currentChild){
        this.throwException('this.currentChild not')
      }

      const otherNames = this.chldInfo.filter((c,i)=>c.validated && i !== index).map(c=>c.usrFnm)

      otherNames.push(this.pseInfo.usrFnm);

      if(this.spsInfo?.validated){
        otherNames.push(this.spsInfo.usrFnm)
      }

      const checkName = validateName(this.currentChild.usrFnm, otherNames);

      if(!checkName.valid){
        return checkName;
      }

      const checkRrno =  this.checkChildRrno(index);

      if(!checkRrno.valid){
        return checkRrno;
      }

      return {valid: true}

    },

    checkChildRrno(index){

      if(!this.currentChild){
        this.throwException('this.currentChild not')
      }

      const otherRrnos = this.chldInfo.filter((c, i)=>c.validated && c !== index).map(c=>c.rrno)

      if(this.spsInfo?.validated){
        otherRrnos.push(this.spsInfo.rrno)
      }

console.debug('checkChildRrno otherRrnos', otherRrnos, 'this.currentChild', this.currentChild)

      return  validateChildSsn(this.currentChild, this.pseInfo, this.bseYr, this.wlfInst.chldIsrAgRstcYr, otherRrnos);

    },

    async inputUpdFile(){

      const r = await confirmMessage('자녀 증빙 서류 확인', `<strong>${this.wlfInst.chldIsrAgRstcYr}</strong>년 1월 1일 이전 출생 인 경우 장애가 있는 자녀만 가입이 가능하며
  , 증빙서류(복지카드 사본, 장애인 증명서등)가 필요합니다.
  <br>증빙서류를 업로드 하시겠습니까?`)


        const targetEl = input;

        if (r) {

          const message = `증빙서류를 첨부해 주세요
  (복지카드 사본, 장애인 증명서등)`

          /**
           * @type {Button} - ok버튼
           */
          const okButton = {
            callback: (evt, input) => {
              this.currentChild.validated = true;
              markingInvalid(targetEl, false)

              _button.disabled = true;

              //targetEl.disabled = true;

              targetEl.value = formatSsn(targetEl.value);

              this.chldInfo[index].files = input.files

              chat('증빙 서류가 등록 되었습니다.');

              if (this.chldInfo[index].agrInfo?.agrStsCd !== 'D') {
                // 핸드폰 번호 받기
                this.inputCellphoneNo(`만 15세 이상 자녀인 경우 보험 가입을 위해서는 <mark>자녀의 개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.<br>
  하단에 자녀 핸드폰 번호를 입력하고 '확인'을 클릭하여 동의화면을 보내주시기 바랍니다.<br>
  <b class="text-danger">미동의시 가입불가</b>`, this.chldInfo[index])
                  .then(() => {
                    console.log('this.chldInfo', this.chldInfo, this.currentChild)
                    this.doQuestion()
                  })
              } else {
                this.doQuestion()
              }

            }
          }

          /**
           * @type {Button} - 취소버튼
           */
          const cancelButton = {
            callback: (evt) => {

              chat('증빙 서류 등록이 취소 되었습니다. 기존 파일을 유지합니다.');

              this.currentChild.validated = true;
              markingInvalid(targetEl, false)

              _button.disabled = true;

              //targetEl.disabled = true;

              targetEl.value = formatSsn(targetEl.value);

              if (this.chldInfo[index].agrInfo?.agrStsCd !== 'D') {
                // 핸드폰 번호 받기
                this.inputCellphoneNo(`만 15세 이상 자녀인 경우 보험 가입을 위해서는 <mark>자녀의 개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.<br>
  하단에 자녀 핸드폰 번호를 입력하고 '확인'을 클릭하여 동의화면을 보내주시기 바랍니다.<br>
  <b class="text-danger">미동의시 가입불가</b>`, this.chldInfo[index])
                  .then(() => {
                    console.log('this.chldInfo', this.chldInfo, this.currentChild)
                    this.doQuestion()
                  })
              } else {
                this.doQuestion()
              }

            },
          }

          fileUpload(({message, okButton, cancelButton}));
          return;
        }

    },

    /**
     * 개인정보 제공동의를 받기위해 전화번호를 받음
     * @param message {string} - 표시할 메세지
     * @param tgrInfo {TgrInfo} - 개인정보 제공동의를 받을 사람
     * @param callback {function} - 완료후 돌아갈 callback
     */
    inputCellphoneNo(message, tgrInfo, callback){

console.log('inputCellphoneNo message', message, 'tgrInfo', tgrInfo, 'callback', callback)

      return new Promise(async (resolve, reject)=>{

        if(tgrInfo.agrInfo?.agrStsCd === 'D') return resolve();

        const isrrClNm = getIsrrClNm(tgrInfo.isrrClCd);

console.log('inputCellphoneNo', tgrInfo)

        return alertMessage(`${isrrClNm} 휴대폰 번호`, message)
          .then(()=>{

            const input = questionWithInput(`📞 ${isrrClNm} 휴대폰 번호를 입력해주세요`);

            // 정보 수정
            if(tgrInfo?.cellPhoneNo) input.value = tgrInfo.cellPhoneNo;

            Inputmask({mask: "999-9999-9999", keepStatic: true, placeholder: '010-____-____', autoUnmask: true}).mask(input);

            input.autocomplete = false

            input.ariaDescripedby = 'invalidCheckChld';
            input.setAttribute('inputMode', 'numeric');

            const _button = document.createElement('button');
            _button.classList.add('btn', 'btn-primary', 'rounded-end');
            _button.textContent = '확인';

            input.parentElement.classList.add('input-group')
            input.parentElement.appendChild(_button);

            const invalid = document.createElement('div')
            invalid.classList.add('invalid-feedback');

            input.parentElement.classList.add('form-check')
            input.parentElement.appendChild(invalid)

            const checkCellPhoneNo = async (cellPhoneNo) => {

              const feedbackEl = input.parentElement.querySelector('.invalid-feedback');

              if(!validateMobileNum(cellPhoneNo)){
                markingInvalid(input, true, '올바른 휴대폰 번호가 아닙니다.')
              } else {

                markingInvalid(input, false)

                const __confirm = await confirmMessage('휴대폰 번호 확인', `📞 ${isrrClNm} 휴대폰번호가 <b>${formatMobileNo(cellPhoneNo)}</b> 맞나요?`);

                if (__confirm) {
                  tgrInfo.cellPhoneNo = cellPhoneNo;
                  input.readOnly = true;
                  //input.disabled = true;
                  _button.disabled = true;

                  return alertMessage('휴대폰 등록완료',`보험확정 후 ${isrrClNm} 휴대폰 번호로 개인정보 동의 확인 메시지가 발송되오니 반드시 기간내에 동의를 완료해주시기 바랍니다.`)
                    .then(r=>{
                      chat(`${isrrClNm} 휴대폰 등록 되었습니다.`)
                      return resolve()
                    })

                  //return resolve()

                } else {

                  input.select();
                  input.focus();
                }

              }

            }

            _button.addEventListener('click',  async evt => {
              return checkCellPhoneNo(input.value)
            })

            input.addEventListener('keyup', async evt => {

              if(evt.target.readOnly){
                return evt.preventDefault();
              }

              if(evt.target.value?.length===11){
                return checkCellPhoneNo(input.value)
              }
            })

            input.focus()

          })

      })

    },

    /**
     * 보험 선택 결과를 보여줌
     */
    resultTable(){

      infoMessage.bind(this)()

    },

    sendSms(tgrInfos) {

      console.log('tgrInfos', tgrInfos);
      if (!tgrInfos?.length) return true;

      const tgrs = tgrInfos.filter(t=>(t.tgrFnm && t.tgrRrno))
        .filter((t, idx) => tgrInfos.findIndex(tt => tt.tgrFnm === t.tgrFnm) === idx)
        // 15세 미만 제외
        .filter(t=> calcSsn(t.tgrRrno, this.bseYr, true).tgrAg >=14)
        // 이미 보낸 사람은 필터
        // 중복 기준 전화번호, 성명, 주민번호
        .filter(t=>!this.storedData || !Object.values(this.storedData.stored).flat()
          .filter(st=> st.cellPhoneNo)
          .find(st=>
            st.cellPhoneNo === t.cellPhoneNo
              && st.tgrFnm === t.tgrFnm
              && this.hashidsHelper.encode(st.tgrRrno) === t.tgrRrno
          ))
        .map(tgr => ({
          bseYr: this.bseYr,
          oprInstCd: this.wlfInst.oprInstCd,
          tgrFnm: tgr.tgrFnm,
          tgrRrno: tgr.tgrRrno,
          tgrTelNo: tgr.cellPhoneNo,
          isrrClCd: tgr.isrrClCd,
        }));

      tgrs?.forEach(t=>t.tgrRrno = this.hashidsHelper.decode(t.tgrRrno))

      console.log('tgrs', tgrs);

      if(!tgrs || !tgrs.length) return true;

      this.sendLog("I", {'sms': tgrs.map(t=>({tgrFnm: t.tgrFnm, tgrTelNo: t.tgrTelNo}))})

      if(this.testMode) return;

      fetch(`/wus/agr/r/bhdAgreeSms.jdo`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(tgrs)
      }).then(res => res.json())
        .then(res => {

          if (res > 0) {
            chat(`${tgrs.map(t => t.tgrFnm + '(' + formatMobileNo(t.tgrTelNo) + ')').join(',<br>')}
번호로 개인정보 제공동의 요청 문자가 발송 되었습니다.
<br>이미 동의가 되어 있거나 일정시간내에 발송된 경우 다시 발송되지 않습니다.
<br>
반드시 기간내에 제공동의를 완료해 주시기 바랍니다.`)

          }

          console.log(res, '건 문자 발송 성공');
          return res > 0;
        })
        .catch(err => {
          //this.throwException('개인정보 제공 동의 문자 발송 중 오류가 발생 하였습니다.');
          console.error(err)
        })

    },

    uploadFiles(){


      const __files = Object.values(this.selected).flat().filter(s=>s.files && s.files.length);

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

      if(this.testMode) return;

      fetch('/wus/uim/bsm/nxt/uploadChildDsbFile.jdo',{
        method: 'POST',
        headers: {},
        body: formData,
      }).catch(e=>{
        console.trace(e)
        this.throwException('파일 업로드 중 오류가 발생하였습니다.', e);
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
      document.cookie = `noticeAgree=${this.pseInfo.noticeAgree.map(t=>Object.entries(([k,v])=>`${k}_${v.getTime?.()||v}`)).join(',')};`
      if(bhdSlcs) document.cookie = `selected=${bhdSlcs.filter(s=>s.selectedTime).map(s =>`${s.isrPrdCd}_${s.selectedTime?.getTime?.()||s.selectedTime}`).join(',')};`
      document.cookie = `maxAge=${60 * 60 * 24};`
    },


    /**
     * 선택 결과에서 확정 누름
     */
    async store(){

      this.breadCrumbs = ['<em class="bi bi-check-circle-fill text-success me-1"></em> <b>보험확정</b>']

      // WusUimBsmVO 객체로 만듬
      const bhdSlcs = Object.values(this.selected).flat()
        .sort((a, b) => parseInt(a.isrrClCd) - parseInt(b.isrrClCd)
          || ((a.essYn < b.essYn) ? 1 : (a.essYn > b.essYn) ? -1 : 0)
          || ((a.isrPrdCd > b.isrPrdCd) ? 1 : (a.isrPrdCd < b.isrPrdCd) ? -1 : 0))
        .map(s => convertSelected(s, this.bseYr, this.wlfInst, this.pseInfo));

      bhdSlcs.forEach(b=>{
        if(b.pseRrno) b.pseRrno = this.hashidsHelper.encode(b.pseRrno);
        if(b.tgrRrno) b.tgrRrno = this.hashidsHelper.encode(b.tgrRrno);
      })

      console.log('bhdSlcs', bhdSlcs)

      console.log('this.storedData', this.storedData?.stored)

      // 파일 업로드
      await this.sendLog("I", {'저장': bhdSlcs.filter(s=>s.tgrFnm).length, 'dcnYn':  this.dcnYn, 'taken': new Date().getTime() - this.storedtime})
        .then(r=> this.uploadFiles())

      console.log('파일업르드가 끝나고 ')

      // 보험 선택 데이터가 변경되었는지 확인
      if(this.storedData && !this.storedData.checkChanged(this.selected, (rrno)=>this.hashidsHelper.decode(rrno))){

        console.log('변경된 내용 없음', this.storedtime);

        // 문자 보내기
        this.sendSms(bhdSlcs.filter(s => s.cellPhoneNo))

      }else{
        // 통계용 쿠키
        this.bakeCookie(bhdSlcs)

        // 저장
        if (!this.testMode) {

          //loading();
          this.isLoading = true;

          fetch(`/wus/uim/bsm/nxt/store/${this.token}.jdo`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(bhdSlcs)
          }).then(res => res.json())
            .then(data => {
              console.log('보험선택 저장', data);

              this.sendLog("D", {action: '보험확정'
                , savNcnt: data
                , bseYr: this.bseYr
                , dcnYn:  this.dcnYn?'Y':'N'
                , oprInstCd: this.wlfInst.oprInstCd
                , mobileYn: this.mobileYn
                , scrnSz: window.screen.width
                , elpHr: new Date().getTime() - this.storedtime
              })

              this.done(bhdSlcs);

            })
            .catch(ex => {
              console.trace(ex);
              this.throwException(`저장 중 오류가 발생했습니다.
잠시 후 다시 시도해 주십시오

문의 1588-4321`, ex, 'E')
            }).finally(() => this.isLoading = false);

        } else {

          this.done(bhdSlcs);
          console.log('test모드 종료');
        }
      }
    },

    /**
     *
     * @returns {Promise<void>}
     */
    done(bhdSlcs){

      alertMessage('보험 확정', '보험 확정 데이터가 저장되었습니다.')
        .then(()=>{
          // 문자 보내기
          this.sendSms(bhdSlcs.filter(s => s.cellPhoneNo))


          const message1 = this.bhdSlcChnYn?
            `의료비 보장 조정 기간(
                  ${moment(this.wlfInst.bhdSlcChnBgnDt, 'YYYYMMDD').format('YYYY-MM-DD(ddd)')}~${moment(this.wlfInst.bhdSlcChnNdDt, 'YYYYMMDD').format('YYYY-MM-DD(ddd)')})</span>`
              :`보험선택 기간(
                  <small>${moment(this.wlfInst.bhdSlcBgnDt, 'YYYYMMDD').format('YYYY-MM-DD(ddd)')}~${moment(this.wlfInst.bhdSlcNdDt, 'YYYYMMDD').format('YYYY-MM-DD(ddd)')})</small>`
          // 채팅창
          chat(`<div class="row">
<div>
  <img src="/js/lib/bot/img/mascot/thanks.png" alt="믿음이 감사합니다." style="width:90%;max-width: 200px">
</div>
<div>${this.bseYr}년도 ${this.pseInfo.usrFnm}님의 보험선택이 확정되었습니다.
<div class="bg-warning-subtle text-muted rounded my-2 p-2" style="font-size: .8em;">
  <ol>
      <li class="my-1" x-html="\`${message1}
                  내 변경이 가능하며, 종료시 변경 불가합니다.\`"></li>
      <li class="my-1">안내한 보험료는 예상 보험료이며, 평균 연령 및 선택인원에 따라 최종보험료가 산출될 예정입니다.</li>
      <li class="my-1">배우자 및 15세이상 자녀 보험 가입 시 <b>기간내 개인정보 동의 필수</b>
        <small class="text-danger fw-bold">※ 미동의시 가입 불가</small>
      </li>
      <li class="my-1">확정 보험료가 복지포인트를 초과할 시 환수 발생할 수 있습니다.</li>
  </ol>
</div>
감사합니다.</div>

</div>`, true)
        })

    },


    /**
     * 개인 정보 제공동의 문자 재발송
     * @param token {string}
     */
   resendSms(token){
    if(!token) return;
    if(token.length>500){
      console.log('테스트 모드 문자 재발송 무시', token)
      return;
    }

    fetch(`/wus/agr/s/${token}.jdo`)
      .then(r=>r.json())
      .then(r=>{

        if(r=='1'){
          alertMessage('SMS 재발송', '개인정보 제공동의 요청 SMS가 재발송 되었습니다.', 'info')
        }else{
          alert(r);
        }

      })
      .catch(e=>{
        alertMessage('SMS 발송 오류',`SMS 발송중에 오류가 발생하였습니다.
잠시 후에 다시 시도하여 주십시오
문의 1588-4321`, 'danger')

        console.error(e);
      })
  },

    /**
     *
     * @param level {'D'|'I'|'W'|'E'}
     * @param data {object}
     * @param withMeta {boolean=false}
     */
    sendLog(level, data, withMeta = false){

      if(!data.mobile) data.mobile = `${this.mobileYn}${window.screen.width}`
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
        return new Promise(resolve => resolve())

      }else{

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
                  //window.opener.document.location.reload().focus()
                });
            }

console.log('sendlog', level, r);

            return r;
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
     * @return {boolean}
     * @param level {'W'|'E'}
     */
    throwException(message, ex, level='W') {

      //this.bakeCookie()

      const data = {
        message
        , ex: ex?.stack
      }

      this.sendLog(level, data)

      console.error('오류 발생', data);
      console.trace(data);

      const options = [
        {text: '닫기', callback: ()=> window.close()}
      ];

      if(this.current>0) options.unshift({text: '처음부터', callback: ()=> this.chatStart()},)

      chat({message, options})

      throw message;

      return false;
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
    cellPhoneNo: isrPrd.cellPhoneNo,
  }
}

/**
 * 선택 결과
 *
 */
const infoMessage = function(){

  const info = Object.values(this.selected).flat()

console.log('this.selected', this.selected)
console.log('info', info)

  const first = document.createElement('div');
  first.classList.add('other', 'pb-4');
  document.getElementById('messages').appendChild(first);

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
  cardHeader.textContent = this.dcnYn?'🎁 보험선택 내역입니다.':'🎁 보험선택을 완료 하시겠습니까?';

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
   * @param tgrObj {string} - 대상 객체 이름
   * @param isrrClcd {1|3} - 관계 1:배우자, 3:자녀
   * @param agrInfo {AgrInfo} -
   * @param updFleNo {string} - 증빙파일 번호
   * @param tgrObj {string}
   */
  function fmlInfo(tgrfnm, tgrObj, isrrClcd, agrInfo, updFleNo) {

console.log('fmlInfo', tgrfnm, 'agrInfo', agrInfo)

    if(!tgrfnm) return ''
    return `
<tr class="align-middle">
  <td class="ps-3 fw-bold">${tgrfnm}</td>
  <td colspan="3">
    ${printMaskWithEyes({valueObj: tgrObj+'?.rrno'})}
     <div class="ms-2 ${updFleNo??'d-none'}">
        <small>증빙 파일</small>
        ${printFileviewer({encdFileNo: updFleNo})}
      </div>
      <div class="ms-2 ${agrInfo??'d-none'} ${agrInfo?.agrStsCd==='D'?'text-success':'text-muted'}">
        ${printMaskWithEyes({valueObj: tgrObj+'?.agrInfo?.tgrTelNo', type:'mobile'})}
        <small>개인정보 제공 ${agrInfo?.agrStsCd==='D'?'동의 완료':'동의 미완료'}</small>
        <button
          @click.throttle="resendSms('${agrInfo?.token}')"
          class="btn btn-sm btn-warning ${(agrInfo && agrInfo.agrStsCd && agrInfo.agrStsCd!=='D')?'':'d-none'}"
        >재전송</button>
      </div>
  </td>
</tr>`
  }

  const html = `<table class='table table-bordered table-striped table-sm shadow' style="font-size: smaller" id="bhdResultTable">
    <caption class="caption-top w-100 text-end pe-1 fw-bold">${this.pseInfo.usrFnm} (${formatSsn(this.pseInfo.rrno)})</caption>
    <thead class="table-primary">
      <tr>
        <th scope="col"></th>
        <th scope="col">보험상품</th>
        <th scope="col">보장내용</th>
        <th scope="col">성별</th>
        <th scope="col"><small>예상보험료</small></th>
       </tr>
    </thead>
   <tbody>
    ${info.map((io, idx) => {
    
      const ignore = !io.tgrFnm
    
    
console.log('io', io.tgrFnm, io.tgrRrno, 'this.chldInfo', this.chldInfo, 'io', io)
    
     const tgrInfo = io.isrrClCd === '0'?'':io.isrrClCd === '1'?'spsInfo':`chldInfo[${this.chldInfo?.findIndex(c=>c.rrno === io.tgrRrno)}]`
    
console.log('tgrInfo=>', tgrInfo)
    
    return (!io.isrPrdNm || !io.tgrFnm )? '' :
      '<tr class="align-middle"><td' + (io.isrrClCd !== '0' && !ignore ? ' rowspan="2"' : '') + '>' + (__idx += 1)
      + '</td><td' + (ignore?' class="fst-italic"':'') + '>' + io.isrPrdNm + '</td>'
      +'<td' + (ignore?' class="fst-italic"':'') + '>'
      + (io.isrDtlNm || '미가입') + '</td><td class="text-center">'
      + (io.isrDtlNm?io.tgrSxClcd === '1' ? '남' : '여':'') + '</td><td class="text-end pe-1">'
      + (floorAmt(io.isrSbcAmt).toLocaleString()) + '</td></tr>'
      + (io.isrrClCd !== '0' ? fmlInfo(io.tgrFnm, `${tgrInfo}`, io.isrrClCd, io.agrInfo, io.updFleNo) : '')
  })
    .join('')}
  </tbody>
  <tfoot>
    <tr>
       <td colspan="2"></td>
        <td colspan="3" id="summaryTd" class="text-end fw-bold p-3">
          
          <span class="me-2">예상보험료 합계</span>
          <span></span>${info.map(d => d.isrSbcAmt ? floorAmt(d.isrSbcAmt) : 0).reduce((accumulator, d) => (accumulator + d), 0).toLocaleString()}<small> 예상</small></span>
        </td>
    </tr>
    <tr class="pt-3">
      <td colspan="5" class="p-2" id="noticeDiv">
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

  let button;
  const button2 = document.createElement('a');

  if(this.dcnYn && !this.childDone){
    button = document.createElement('a');
    button.href = '#none'
    button.classList.add('btn', 'btn-md', 'btn-warning', 'mt-2', 'text-end');

    button.textContent = this.bhdSlcChnYn?'보험선택 의료비보장 변경':'재선택';

    button.addEventListener('click', (evt) =>{
      chat(this.bhdSlcChnYn?'보험선택 내역 중에 의료비보장 상품을 변경 합니다.':'보험을 재선택 합니다.');
      this.current = 0;
      this.spsInfo = this.spsInfo??{}
      this.chldInfo = this.chldInfo??[]

      this.doQuestion()

      button.remove();
      button2.remove();
      buttonDiv.remove();
    })
   buttonDiv.appendChild(button);

  }
  button2.href = '#none';
  button2.classList.add('btn', 'btn-lg', 'btn-success', 'mt-2', 'text-end', 'ms-3');
  button2.textContent = '✔ 확정';
  button2.id = 'btnApply'
  button2.addEventListener('click', (evt)=>{
    this.store()
    button?.remove?.()
    button2.remove()
    buttonDiv.remove()

    this.$refs.restart.disabled = true;
    this.$refs.restart.classList.add('d-none')
  })

 // buttonDiv.appendChild(button);
  buttonDiv.appendChild(button2);

  messageDiv.appendChild(buttonDiv);

  const driverStep = window.driver.js.driver({
    showProgress: true,
    steps:[
      {element: '#bhdResultTable', popover: {
          title: '보험 선택 내역 확인',
          description: '보험 선택 내역을 다시 확인 해주세요',
          align: 'start',
          side: 'top',
        },
      },
      {element: '#summaryTd', popover:{
          title: '예상 보험료 합계를 확인 해주세요',
          description: `최종보험료는 개인별 보험선택 결과(인원, 평균연령)에 근거하여 <mark>계약 체결 후 확정</mark>되며,<br>
예상보험료와 다르게 책정될 수 있습니다.`,
          align: 'start',
          side: 'top',
        },
      },
      {element: '#noticeDiv', popover:{
          title: '안내사항을 확인 해주세요',
          align: 'start',
          side: 'top',
        },
      },
      {element: '#btnApply', popover:{
          title: '📢 반드시 확정을 눌러야 보험선택 내용이 저장됩니다.',
          align: 'start',
          side: 'top',
        },
      },
    ],
    prevBtnText: '이전',
    nextBtnText: '다음',
    doneBtnText: '확인',

  })

  setTimeout(()=>driverStep.drive(), 500)
  //scrollTo(first);
};




const myOffcanvas = new bootstrap.Offcanvas("#offcanvasInfo", {
  backdrop: 'static',
  keyboard: false,
});

myOffcanvas._element.style.transitionDuration = '.7s';

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


/**
 * 성별에 따른 예상 금액을 가져온다
 * 100원 절사
 * @param sxClCd {sxClCd} - 성별
 * @param isrPrd {IsrPrd} - 보험데이터
 */
function getSbcAmt(sxClCd, isrPrd){
console.debug('getSbcAmt', sxClCd, isrPrd);

  return floorAmt((sxClCd === '1' ? isrPrd.mIsrSbcAmt : isrPrd.fIsrSbcAmt))

}

/**
 * 100원 절사
 * @param isrSbcAmt
 * @return {*}
 */
function floorAmt(isrSbcAmt){
  return _floorAmt(isrSbcAmt, 100)
}


/**
 * bootstrap from validator 표시
 * @param input {HTMLInputElement}
 * @param invalid {boolean=true}
 * @param message {string?} - 에러 메시지
 */
function markingInvalid(input, invalid=true, message){

  const feedbackEl = input.parentElement.querySelector('.invalid-feedback');

  if(invalid){
    input.classList.remove('is-valid');
    input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');

    input.readOnly = false;

    window.navigator.vibrate?.([200])
console.log(' window.navigator.vibrate',  window.navigator.vibrate)

    if(message){
      if(feedbackEl){
        feedbackEl.textContent = message;
      }
    }

    input.focus()

  }else{
    input.classList.remove('is-invalid', 'animate__animated', 'animate__headShake');
    input.classList.add('is-valid');

    //if (feedbackEl) feedbackEl.remove();

    input.readOnly = 'readonly';
    //input.inputmask?.remove();

  }

}







