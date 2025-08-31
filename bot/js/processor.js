/*import {notice, privacyNotice} from "../info/info.mjs";*/

import {notice, privacyNotice, ask} from "../info/info.js";
import {alertMessage, chat, confirmMessage, customConfirmMessage, Question} from "./chat.js";

let {unboxingToken} = await import('./script_test.js')
let {__validateUser, __confirmPrivacy} = await import('./web_script.js')


import nxtUtil from "../../js/nxt/nxtUtil.esm.js";

import {
  TgrInfo, AgrInfo, IsrPrd, StoredData, IsrrClCd, validateChildSsn, validateSpsName, validateSpsSsn, validateSps,
  validateName, transformIsrData
} from "./bhdSlcScript.js";



export function processor() {

  return {

    /**
     * 사전선택 시작시간
     */
    openTime: '08:00',
    mobileYn: 'N',
    /**
     * @type {Date|number} - 시작하고 보험데이터를 가져오기까지 걸린 시간
     */
    loadtime: null,
    /**
     * @type {Date|number} - 시작한 시간
     */
    storedtime: null,

    testMode: false,
    /**
     * @type {boolean} - 보험선택 완료 되었었는가?
     */
    dcnYn: false,
    /**
     * @type {boolean} - 의료보험 조정 기간인가?
     */
    bhdSlcChnYn: false,
    
    /**
     * @type {StoredData}
     */
    storedData: null,
    /**
     * @type {string}
     */
    bseYr: null,
    /**
     * @type {string}
     */
    token: null,
    /**
     * 현재 질문 인덱스
     * -3: 오류 발생
     * -2: 최초
     * -1: 보험 데이터 가져옴
     *  0: 초기 안내 모달이 닫힐때, 채팅 시작  시
     *  >0: 보험 선택 index
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
    spsInfo: new TgrInfo({}),
    /**
     * @type {string?} - 배우자 상품중 첫번째 상품 코드
     */
    spsPrdMin: null,
    /**
     * @type {boolean} - 배우자 보험 중에 필수 보험이 있고 보험 완료면 가입했는지
     */
    spsEssYn: true,
    /**
     * @type {boolean} - 배우자 의료비 보장 말고 다른 배우자 보험에 가입된게 있는지 체크
     */
    spsOtherIsrYn: false,
    
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
    
    /**
     * @type {boolean} - loading
     */
    isLoading: false,
    rrnoInputMask: Inputmask({mask: "999999-9999999", keepStatic: true, placeholder: '_', autoUnmask: true}),
    
    /**
     * 배정에 있는 가족 정보
     * 배우자 정보와 자녀 정보를 입력하기 위한 정보
     * @type {TgrInfo[]} - 배정에 있는 가족 정보
     */
    fmlInfo: [],
    stepper: null,
    driverObj: window.driver.js.driver({
      popoverClass: 'driverjs-theme',
      overlayOpacity: .2,
    }),

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
      })

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

        //if (!this.testMode) {
          this.hashidsHelper = nxtUtil.getHashIdsHelper(this.token);
        //}

        // 최초 모달
// FIXME
//this.welcome();

        try {
          await this.getIsrData();


// FIXME set
this.pseInfo.validated = true;
this.current = 5;
this.setStep(3);
this.doQuestion()
return;

          this.current = -1;

          this.validateTgr()

        } catch (err) {
          console.error(err)

          this.throwException('에러가 발생하였습니다.', err, 'E')
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
     * 의료비 보장 관련 보험인지 체크
     * @param isrPrdCd
     * @return {boolean}
     */
    checkIL002(isrPrdCd){
      return ['IL0002', 'IL0034', 'IL0035'].includes(isrPrdCd)
    },
    nextIL002(){
      const steps = Array.from(document.querySelectorAll('div#prdSelectStepper div.step:not(:disabled):not(.opacity-50)'));

      if(!steps || !steps.length) return;

      let _active = false;

      for(const step of steps){

        if(_active){

          return step.querySelector('button.step-trigger')?.click();
        }

        if(step.classList.contains('active')){
          _active = true;
        }

      }

      // 마지막이 active이면 더이상 진행하지 않음
      if(!_active) steps[0].querySelector('button.step-trigger')?.click();

    },
    /**
     * 보험 데이터를 질문데이터로 변경
     * @param isrPrdData {IsrPrdData}
     */
    generateQuestion(isrPrdData){
      
      return new Question({
        'short_title': isrPrdData.isrPrdNm,
        'message': `${isrPrdData.essYn ? '<span class="text-success bi bi-check2-square"> 필수</span>'
          : '<span class="text-primary bi bi-bag-plus"> 선택</span>'}
<b>${isrPrdData.isrPrdNm}</b> ${isrPrdData.bhdSlcSeq?'보험 선택 내역 입니다.':'보험을 선택해 주세요'}`,
        'optionFunc': this.makeIsrPrdOption.bind(this),
        'data': isrPrdData
      })
      
    
    },
    /**
     * 보험 정보를 가져옴
     */
    async getIsrData() {

      if (this.testMode) {

console.debug('TGRINFO', TgrInfo)

        const {pseInfo, wlfInst, fmlInfo, spsCop, rtnList} = unboxingToken(this.token, TgrInfo);

        this.pseInfo = pseInfo;
        this.wlfInst = wlfInst;
        this.fmlInfo = fmlInfo;
        
console.debug('rtnList', rtnList)
        
        const rtnList1 = transformIsrData(rtnList)

        this.questions = rtnList1.map(d => this.generateQuestion(d));
        console.debug('unboxingToken', pseInfo, wlfInst, rtnList1, this.questions)

        // 배우자 상품중 첫번째 상품
        this.spsPrdMin = rtnList1.filter(p=>p.isrrClCd === '1')?.[0]?.isrPrdCd

        return;
      } // end of testMode
      
      
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

          // 공무원 생명상해 상품
          const il001 = jsn.rtnList.find(d => d.isrPrdCd === "IL0001");
          
          // 이미 보험선택 한 사람인지
          this.dcnYn = il001.bhdSlcSeq > 0
          
          // 공무원 정보가 없고 보험 상품 완료가 아니면
          // 보험 선택 정보에서 공무원 정보를 가져옴
          if ((!this.pseInfo || !this.pseInfo.validated) && this.dcnYn ){
            this.pseInfo= new TgrInfo({
              usrFnm: il001.pseFnm,
              rrno: il001.pseRrno,
              wlfInstCd: il001.wlfInstCd,
              instNm: il001.wlfInstNm,
              sxClCd: il001.sxClCd,
              age: il001.pseAg,
              isrrClCd: il001.isrrClCd,
            });
          }

          // 보험 데이터 가공및 정렬
          const rtnList = transformIsrData(jsn.rtnList)
          
          // 의료비 보장 변경 기간인 경우
          // 배우자 생명상해 가입안했으면 의료비보장 가입 못하도록
          const slcBgnChnDt = moment(`${this.wlfInst.bhdSlcChnBgnDt} ${this.openTime}`, 'YYYYMMDD HH:mm');
          const slcChnNdDt = moment(`${this.wlfInst.bhdSlcChnNdDt} 23:59`, 'YYYYMMDD HH:mm');

          if (moment().isBetween(slcBgnChnDt, slcChnNdDt, '', '[]')) {
            this.bhdSlcChnYn = true;
          }

console.log('this.bhdSlcChnYn', this.bhdSlcChnYn)

          // 배우자 상품중 첫번째 상품
          this.spsPrdMin = rtnList.filter(p=>p.isrrClCd === '1')?.[0]?.isrPrdCd

          // 질문 객체를 만듬
          this.questions = rtnList
            //상품코드로 중복 제거 (e.g 자녀보험)
            .filter((item, index) =>
              rtnList.findIndex(d => d.isrPrdCd === item.isrPrdCd) === index)
            .map(d => this.generateQuestion(d));

          // 가족 개인정보 제공동의 내역
          const fmlAgrInfos = jsn.fmlAgrInfos.map(f => new AgrInfo(f));
          
          // 보험 선택 내역 변경인 경우
          if (this.dcnYn) {

            // 안내 사항 다 ok
            this.pseInfo.confirms = this.pseInfo.confirms.map(c => true)
            
            /**
             * 보험 선택정보 만들기
             * @param isrData {IsrPrdData}
             * @return {{isrPrdCd, isrPrdNm, isrDtlCd, isrDtlNm: (*|string), isrUprCd, isrSbcAmt, isrSbcScr, isrrClCd, essYn, bhdSlcSeq, xmpRegClCd, olfDndIvgYn, mIsrUprCd, mIsrSbcAmt, mIsrSbcScr, fIsrUprCd, fIsrSbcAmt, fIsrSbcSc}}
             */
            const toIsrDtl = (isrData) => ({
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
            })
            
            rtnList.forEach(d => {

              if (d.isrrClCd === IsrrClCd.자녀) {

                let child;
                if(d.tgrRrno) {

                  child = new TgrInfo({
                    usrFnm: d.tgrFnm,
                    rrno: d.tgrRrno,
                    sxClCd: d.tgrSxClCd,
                    age: d.tgrAg,
                    isrrClCd: d.isrrClCd,
                    updFleNo: d.updFleNo,
                    agrInfo: fmlAgrInfos?.find(f => f.tgrFnm === d.tgrFnm && f.tgrRrno === d.tgrRrno),
                    bhdSlcSeq: d.bhdSlcSeq
                  });
                  

                  //child.rrno = this.hashidsHelper.decode(child.rrno)

                  this.chldInfo = this.chldInfo ?? []

                  this.chldInfo.push(child)

                }

                this.selected[d.isrPrdCd] = this.selected[d.isrPrdCd] ?? []

                const idx = this.selected[d.isrPrdCd].push(new IsrPrd(toIsrDtl(d), child))
                //this.selected[d.isrPrdCd][idx - 1].agrInfo = child?.agrInfo;

              } else {
                
                if (d.isrrClCd === IsrrClCd.배우자) {

                  if(d.tgrRrno) {
                    this.spsInfo = new TgrInfo({
                      usrFnm: d.tgrFnm,
                      rrno: d.tgrRrno,
                      sxClCd: d.tgrSxClCd,
                      age: d.tgrAg,
                      isrrClCd: '1',
                      agrInfo: fmlAgrInfos?.find(f => f.tgrFnm === d.tgrFnm && f.tgrRrno === d.tgrRrno)
                    })
                    
                    //this.spsInfo.rrno = this.hashidsHelper.decode(this.spsInfo.rrno)
                  }

                  this.selected[d.isrPrdCd] = new IsrPrd(toIsrDtl(d), this.spsInfo)

                } else {
                  this.selected[d.isrPrdCd] = new IsrPrd(toIsrDtl(d), this.pseInfo)
                }

              }

            })

console.log('this.questions', this.questions)
console.log('this.question', this.questions.find(q=>q.data.isrrClCd === '1' && q.data.essYn))

            // 의료비 보장 변경 기간인 경우
            // 배우자 생명상해 가입안했으면 의료비보장 가입 못하도록
            if (this.bhdSlcChnYn) {

              // 배우자 가입 보험이 있고 필수 인지
              const spsEssPrd = this.questions.find(q=>q.data.isrrClCd === '1' && q.data.essYn)

              console.log('spsEssPrd', spsEssPrd, 'this.selected', this.selected[spsEssPrd?.isrPrdCd])

              if(spsEssPrd){
                this.spsEssYn = !!this.selected[spsEssPrd.data.isrPrdCd]?.tgrRrno;
              }else  this.spsEssYn = true;


              // 배우자 의료비 보장 말고 다른 배우자 보험에 가입된게 있는지 체크
              // 의료비 조정 기간에는 다른 배우자 보험에 가입되어 있으면 배우자 삭제를 하면 안되기 때문이다 24. 12. 2. choihunchul
              this.spsOtherIsrYn = !!this.questions.find(q=>q.data.isrrClCd === '1' && !this.checkIL002(q.data.isrPrdCd) && this.selected[q.data.isrPrdCd]?.tgrRrno)
            }

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
      const slcNdDt = moment(`${this.wlfInst.bhdSlcNdDt} 23:59`, 'YYYYMMDD HH:mm');

      if (!moment().isBetween(slcBgnDt, slcNdDt, '', '[]')) {

        // 보험변경 기간인지 채크
        const slcBgnChnDt = moment(`${this.wlfInst.bhdSlcChnBgnDt} ${this.openTime}`, 'YYYYMMDD HH:mm');
        const slcChnNdDt = moment(`${this.wlfInst.bhdSlcChnNdDt} 23:59`, 'YYYYMMDD HH:mm');

console.log('slcBgnChnDt', slcBgnChnDt, 'slcChnNdDt', slcChnNdDt)

        if (moment().isBetween(slcBgnChnDt, slcChnNdDt, '', '[]')) {

          if (!this.dcnYn){
            this.throwException(`보험선택 완료자(기본보험 일괄적용 대상자 포함)에 한해서 ${this.bseYr}년도 단체보험 의료비보장 보험 조정이 가능합니다.
<br><br>
문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`, {stack: `pctime=${new Date().toLocaleDateString()}`})
          }else{

            // 의료비보장 변경 기간
            this.bhdSlcChnYn = true;
          }

        }else{

          this.throwException(`${this.bseYr}년도 단체보험 보험선택 기간이 아닙니다.
  <br><span>(${slcBgnDt.format('YYYY-MM-DD(ddd)')} ${this.openTime} ~ ${slcNdDt.format('YYYY-MM-DD(ddd)')})</span>
  <br><br>
  문의 사항은 공단(☎1588-4321)로 연락 바랍니다.`, {stack: `pctime=${new Date().toLocaleDateString()}`})
        }


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

      //loading()
        this.isLoading = true;

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
console.debug('s.isrrClCd', s.isrrClCd, 's.tgrRrno', s.tgrRrno, s)
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
        }).finally(() => this.isLoading = false)
    },

    /**
     * 성명 유효성 확인
     * @param input {HTMLInputElement}
     * @param isrrClCd {IsrrClCd}
     * @param _otherNames {string[]?}
     * @return {boolean}
     */
    async checkName(input, isrrClCd, _otherNames)  {

      input.value = input.value.trim()
      const name = input.value;

      switch (isrrClCd){

        // 배우자
        case '1': {

          const checked = validateSpsName(name, this.spsInfo.validatedName, this.pseInfo, this.chldInfo)

          this.spsInfo.validatedName = checked.valid

          if (checked.valid) {
            markingInvalid(input);
            return true;
          } else {

            // 부부 성명 동일
            if (checked.data.sameName) {

              const r = await Swal.fire({
                icon: 'question',
                title: '배우자와 성명이 동일한가요?',
                confirmButtonText: '배우자와 성명이 같습니다.',
                cancelButtonText: '다시 입력',
                showCancelButton: true,
                focusConfirm: false,
              })

              if (r.isConfirmed) {

                this.sendLog("I", {'배우자 성명동일': name + ',' + this.pseInfo.usrFnm})
                markingInvalid(input);
                this.spsInfo.validatedName = true;
                return true;
              } else {

                markingInvalid(input, false, '이미 등록되어 있는 성명입니다.');
                return false;
              }

            }

            markingInvalid(input, false, checked.message);
            return false;
          }
        }

        // 자녀
        case '3': {

          if(_otherNames) _otherNames = this.otherNames('3', input)

          const checked = validateName(name, _otherNames)

          if (checked.valid) {
            markingInvalid(input);
            return true;
          } else {
            markingInvalid(input, false, checked.message);
            return false;
          }

        }

      }


    },

    /**
     *
     * @param input {HTMLInputElement}
     * @param isrrClCd {IsrrClCd}
     * @param child {TgrInfo?}
     * @param otherRrnos {string[]?}
     * @return {Checked}
     */
    async checkFmlSsn(input, isrrClCd, child, otherRrnos) {

      const rrno =  input.dataset.unmask || input.value;

console.debug('checkFmlSsn', isrrClCd, rrno, rrno.length)

      if (rrno.length !== 13) {
        markingInvalid(input, false, '주민번호를 입력해 주세요');
        return {valid:false};
      }

      switch (isrrClCd){

        // 배우자 주민번호 체크
        case '1':{

          const checked = validateSpsSsn(rrno, this.pseInfo, this.bseYr, this.chldInfo);

console.debug('checkFmlSsn', checked, isrrClCd, rrno, rrno.length)

          if (checked.valid) {
            markingInvalid(input);
          } else {
            markingInvalid(input, false, checked.message);

          }
          return checked
        }

        case '3':{
          const checked = validateChildSsn(child, this.pseInfo, this.bseYr, this.wlfInst.chldIsrAgRstcYr, otherRrnos)

console.debug('checkFmlSsn', checked, isrrClCd, rrno, rrno.length)

          if (checked.valid) {
            markingInvalid(input);
          } else {

            if(checked.message){
              markingInvalid(input, false, checked.message);
            }else{

              if(checked.data?.over19 || checked.data?.over14){
                markingInvalid(input);
              }else{
                markingInvalid(input, true, 'x');
              }

            }
          }

          return checked;
        }

      }

    },

    /**
     * 휴대전화 번호 체크
     * @param input {HTMLInputElement}
     * @return {boolean}
     */
    checkCellPhoneNo(input) {

console.debug('checkCellPhoneNo', input.id, 'disabled', input.disabled, 'value', input.value, input)

      if(!input || input.disabled) return false;

      const cellPhoneNo = input.value

      if(!cellPhoneNo){
        markingInvalid(input, false, '휴대폰 번호를 입력해 주세요.')
        return false;
      }

      const b = nxtUtil.validateMobileNum(cellPhoneNo);

console.debug('checkCellPhoneNo==>', b, input.id, 'disabled', input.disabled, 'value', input.value, input)

      if (!b) {
        markingInvalid(input, false, '올바른 휴대폰 번호가 아닙니다.')
        return false;
      } else {

console.debug('checkCellPhoneNo=======>', b, input.id, 'disabled', input.disabled, 'value', input.value, input)

        markingInvalid(input)

        return true;
      }

    },

    async checkSpousePublicOfficial(rrno){

      if(!rrno) return true;

      let checked = false;

      if(this.testMode){

console.group('checkSpousePublicOfficial', rrno)

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

console.log('this.spsInfo', this.spsInfo);

          if (this.spsInfo === null) {
            if (this.selected[question.data.isrPrdCd]) {
              delete this.selected[question.data.isrPrdCd]
            }
            return false;
          } else {

            // 의료비 보장 보험 조정 기간
            if(this.bhdSlcChnYn){

              // 의료비 관련 보험만 체크 하자
              // 국세청인 경우 배우자 보험이 필수가 아닌 암진단비와 의료비 보장만 있는데
              // 조정기간에는 암진단비는 바꿀수 없고 의료비 보장만 바꿀수 있기 때문에
              // 다 선택 하지 않은 것으로 판단 된다.
              if(this.checkIL002(question.data.isrPrdCd)) return !this.selected[question.data.isrPrdCd]
              else return false


            }else return !this.selected[question.data.isrPrdCd]
          }

        } else if (question.data.isrrClCd === '3') {

          if (this.chldInfo === null) {
            if (this.selected[question.data.isrPrdCd]) {
              delete this.selected[question.data.isrPrdCd];
            }
            return false;

          } else {

console.debug(`this.selected[${question.data.isrPrdCd}]`, this.selected[question.data.isrPrdCd])

            return (!this.selected[question.data.isrPrdCd])
              || (this.chldInfo.length !== this.selected[question.data.isrPrdCd]?.filter(s => !!s).length)
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
    clickIsrPrdOption(){
    
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

          let selectedAll = false;

          // stepper trigger lighting
          const _stepperTrigger = document.querySelector(`#${__data.isrPrdCd}-trigger span.bs-stepper-circle`)

          // 자녀 보험
          if (isrrClCd === '3') {

            this.sendLog('D', {[data.isrPrdCd]: usrFnm})

            const chldIndex = option.dataset.chldIndex;
            const bhdSlcSeq = option.dataset.bhdSlcSeq;

            if (!this.selected[data.isrPrdCd]) this.selected[data.isrPrdCd] = [];

            this.selected[data.isrPrdCd][chldIndex] = new IsrPrd({
                                                                  isrPrdCd: __data.isrPrdCd,
                                                                  isrDtlCd: __data.isrDtlCd,
                                                                  isrrClCd: __data.isrrClCd,
                                                                  essYn: __data.essYn,
                                                                  xmpRegClCd: __data.xmpRegClCd,
                                                                  olfDndIvgYn: __data.olfDndIvgYn,
                                                                }, __data.bhdSlcSeq)

            if (!_stepperTrigger.classList.contains('bg-success')) {

              console.debug('this.chldInfo.length', this.chldInfo.length, 'this.selected[data.isrPrdCd]', this.selected[data.isrPrdCd], this.selected[data.isrPrdCd].filter(s => !!s))

              selectedAll = this.chldInfo.length === this.selected[data.isrPrdCd].filter(s => !!s).length;

              if (selectedAll) {
                _stepperTrigger.classList.add('bg-success', 'bi', 'bi-check');
                _stepperTrigger.innerText = ''
              }

            }

          }else{

            selectedAll = true;

            this.selected[__data.isrPrdCd] = new IsrPrd({
              isrPrdCd: __data.isrPrdCd,
              isrDtlCd: __data.isrDtlCd,
              isrrClCd: __data.isrrClCd,
              essYn: __data.essYn,
              xmpRegClCd: __data.xmpRegClCd,
              olfDndIvgYn: __data.olfDndIvgYn,
            }, __data.bhdSlcSeq)

            this.sendLog('D', {[__data.isrPrdCd]: optionTxt})

            //answer(optionTxt);
            sibling.filter(s => s !== e.target).forEach((s => s.classList.remove('active')));


            if (!_stepperTrigger.classList.contains('bg-success')) {
              _stepperTrigger.classList.add('bg-success', 'bi', 'bi-check');
              _stepperTrigger.innerText = ''
            }
          }
          
          e.target.classList.add('active');
          
          const sibling = Array.from(e.target.parentElement.querySelectorAll('button.list-group-item-action'));
          
          console.debug('sibling--------------', sibling)
          
          setTimeout(() => {

            // 의료비 보장 변경 기간에는 관련 상품들간 이동하도록
            if(this.bhdSlcChnYn) this.nextIL002()
            else{
              if(selectedAll) this.stepper.next()
            }
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

console.log('data.essYn', data.essYn, 'data.isrrClCd', data.isrrClCd)

      // 필수 아닐때 미가입 추가
      // 배우자 생명상행도 제외
      if (!data.essYn
        && ((data.isrrClCd === '0')
          || (data.isrrClCd === '3')
          || (data.isrrClCd === '1' && data.isrPrdCd !== 'IL0033'))){

        __options.push(ignoreOption(optionNumber += 1, data));
      }

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
          if (this.dcnYn && this.chldInfo
              && this.chldInfo.length
              && this.selected[o.isrPrdCd]?.length === this.chldInfo.length){

            option.classList.add('active');
          }

          optionTxt = `${optionNumber}. <b>${o.isrDtlNm}</b> (${sbcAmt.toLocaleString()}원${sbcAmt > 0 ? '<small> 예상</small>' : ''})`;

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
미가입 대상자에 해당하십니까?

<br><br><strong class="text-danger">📢 미가입 선택 시 보험선택 기간 이후 가입으로 변경은 불가합니다.</strong>`)

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

          let selectedAll = true;

          // 자녀 보험
          if (isrrClCd === '3') {

            this.sendLog('D', {[data.isrPrdCd]: usrFnm})

            const chldIndex = option.dataset.chldIndex;
            const bhdSlcSeq = option.dataset.bhdSlcSeq;

            if (!this.selected[data.isrPrdCd]) this.selected[data.isrPrdCd] = [];

            this.selected[data.isrPrdCd][chldIndex] = new IsrPrd(data.dtlCdList[index], bhdSlcSeq, usrFnm, rrno, sxClCd, age, cellPhoneNo, files);

            if (!_stepperTrigger.classList.contains('bg-success')) {

console.group('this.chldInfo.length', this.chldInfo.length, 'this.selected[data.isrPrdCd]', this.selected[data.isrPrdCd], this.selected[data.isrPrdCd].filter(s => !!s))

              selectedAll = this.chldInfo.length === this.selected[data.isrPrdCd].filter(s => !!s).length;

console.debug('this.chldInfo.length', this.chldInfo.length, this.selected[data.isrPrdCd].filter(s => !!s), 'length', this.selected[data.isrPrdCd].filter(s => !!s).length, 'selectedAll', selectedAll)

              if (selectedAll) {
                _stepperTrigger.classList.add('bg-success', 'bi', 'bi-check');
                _stepperTrigger.innerText = ''
              }

console.groupEnd()

            }

          } else {
            this.sendLog('D', {[data.isrPrdCd]: data.dtlCdList[index].isrDtlCd})

            this.selected[data.isrPrdCd] = new IsrPrd(data.dtlCdList[index], data.bhdSlcSeq, usrFnm, rrno, sxClCd, age, cellPhoneNo, files);
          }

          console.log('this.selected', this.selected)


          // selected option lighting
          option.classList.add('active');

          const sibling = Array.from(option.parentElement.querySelectorAll('button.list-group-item-action'));

console.debug('sibling====', sibling)

          sibling.filter(s => s !== option).forEach((s => s.classList.remove('active')));

          setTimeout(() => {
            // 의료비 보장 변경 기간에는 관련 상품들간 이동하도록
            if(this.bhdSlcChnYn) this.nextIL002()
            else{

              if(selectedAll){
                this.stepper.next()
              }

            }
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

      const question = this.questions[indexStep];
console.log('makeQuestion', indexStep, question, 'stepper', this.stepper, this.stepper._currentIndex)

      const _prdCd = question.data.isrPrdCd;

      // 의료비 보장 조정기간 없음 안내 추가 - by 예현핑 25. 8. 11. choihunchul
      if(_prdCd === 'IL0002'){
        Swal.fire({
          icon: 'info',
          title: '의료비 보장 안내',
          html: `보험선택 기간 이후 의료비보장 조정기간은 주어지지 않으며, 의료비보장 제외는 <mark>중지신청</mark>으로만 가능합니다.`,
          confirmButtonText: '확인',
        })
      }


      // 배우자 보험
      if (question.data.isrrClCd === IsrrClCd.배우자 && !this.spsInfo?.usrFnm) {

        document.querySelector(`#${question.data.isrPrdCd}-part div.divForOption`).innerHTML = ''

        if(this.bhdSlcChnYn){

          if(this.spsEssYn){

            if(this.checkIL002(question.data.isrPrdCd)) await this.confirmSpsIsr(0)

          }else {
            // 배우자 필수 가입 안한 경우 배우자 의료비 보장 변경할 수 없다는 안내 24. 11. 25. choihunchul
            if (this.questions.find(q => q.data.isrrClCd === IsrrClCd.배우자 && q.data.essYn)) {

              await alertMessage('배우자 의료비 보장 조정 안내', `필수 상품인 <mark>배우자 생명/상해</mark> 보험을 선택하지 않아 배우자 의료비 보장 보험을
추가 가입할 수 없습니다.`, 'danger')
            }
          }

        }else{
          await this.confirmSpsIsr(0)
        }


        // 배우자 보험 가입 안함
        if (this.spsInfo === null) {

          let lastestIndex = -1;

          this.questions.filter(q => q.data.isrrClCd === IsrrClCd.배우자)
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
          this.questions.filter(q => q.data.isrrClCd === IsrrClCd.배우자)
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

          this.questions.filter(q => q.data.isrrClCd === IsrrClCd.자녀)
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
          this.questions.filter(q => q.data.isrrClCd === IsrrClCd.자녀)
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
      
        const tgrInfo = question.data.isrrClCd === IsrrClCd.본인 ? this.pseInfo
          : question.data.isrrClCd === IsrrClCd.배우자 ? this.spsInfo : this.chldInfo

        // 자녀보험
        if (question.data.isrrClCd === IsrrClCd.자녀) {

          if (this.chldInfo && this.chldInfo.length) {
            this.chldInfo.forEach((chld, _idx) => {

              const __div = document.createElement('div')
              __div.classList.add('list-group', 'p-0', 'mb-4', 'focusable')
              const __div2 = document.createElement('div');
              __div2.classList.add('fs-5', 'py-1', 'px-3', 'bg-info-subtle')
              __div2.innerHTML = `${_idx + 1}. <b>${chld.usrFnm}</b>(${nxtUtil.formatSsn(chld.rrno)})`
              __div.append(__div2)
              stepsContent.append(__div)

              const options = this.makeIsrPrdOption(question.data, chld)
              options.forEach((option, index) => {
                option.dataset.chldIndex = _idx;
                option.dataset.bhdSlcSeq = chld.bhdSlcSeq || 0;
                option.title = `i:${_idx}, s:${chld.bhdSlcSeq}`
                __div.append(option)

console.log('this.dcnYn', this.dcnYn, 'chld.bhdSlcSeq', chld.bhdSlcSeq, 'option', option)

                /*if(this.dcnYn && !chld.bhdSlcSeq){
                  option.click()
                }*/

              })
            })
          }

        } else {

          //stepsContent.classList.add('list-group', 'p-0', 'border', 'border-primary', 'animate__animated', 'animate__flash', 'animate__repeat-2', 'animate__slow')
          stepsContent.classList.add('list-group', 'p-0', 'focusable')
          //stepsContent.setAttribute('tabindex', 0)

          const options = this.makeIsrPrdOption(question.data, tgrInfo)

          options.forEach((option, index) => {

            // 의료비보장 수정기간에는 의료비보장 상품이 아니면 클릭 안되게
            if(this.bhdSlcChnYn && !this.checkIL002(option.name.replace('option', ''))){
              option.disabled = true;
              option.title = '의료비 보장 조정기간에는 의료비 보장보험(실손)외 다른 보험 상품(생명/상해, 특정질병 진단비 등)은 변경할 수 없습니다.'
              stepsContent.classList.remove('focusable')
              stepsContent.classList.add('opacity-75')
            }

            stepsContent.append(option)
          })
        }

        // 유의 사항
        const divForNotice = this.stepper._stepsContents[indexStep]
          .querySelector('div.divForNotice');

        if(notice[question.data.isrPrdCd]){

          divForNotice.style.display = 'block'

          divForNotice.innerHTML = notice[question.data.isrPrdCd]?.content || ''

          const noticeTitle = document.createElement('div');
          noticeTitle.classList.add('rounded', 'bg-success', 'bg-opacity-25', 'p-2', 'mb-3', 'bi', 'bi-megaphone-fill', 'text-primary', 'fw-bold');
          noticeTitle.textContent = ' 보장내용 및 유의사항';

          divForNotice.prepend(noticeTitle)

        }else{
          divForNotice.style.display = 'none'
        }

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
          linear: false,
          animation: true
        })

        stepperEL.addEventListener('show.bs-stepper', e => {
          const indexStep = e.detail.indexStep;

console.log('show.bs-stepper', indexStep, e);

          this.current = indexStep;

          const question1 = this.questions[indexStep];

          const trigger = document.querySelector(`#${question1.data.isrPrdCd}-trigger`);

          if (trigger.classList.contains('disabled')) {
            this.stepper.to(indexStep + 2)
            e.preventDefault()
          }


        })

        stepperEL.addEventListener('shown.bs-stepper', async e => {

console.log('shown.bs-stepper', e)

          // 다른 stepper tab을 숨김처리함
          Array.from(e.target.querySelectorAll('div.content')).forEach(el => {
            if (el.classList.contains('active')) el.classList.remove('d-none');
            else el.classList.add('d-none')
          })

          const indexStep = e.detail.indexStep;

          return this.makeQuestion(indexStep);

        })

        // 의료비 보정 기간에는
        // 최초 의료비보장 수정 처음 상품 보여준다
        if(this.bhdSlcChnYn){
          this.nextIL002();
        }

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
     * 배정 정보에서 가족 정보를 검색함
     * @param isrrClCd {IsrrClCd}
     * @return {TgrInfo|TgrInfo[]}
     */
    findLatestFmlInfo(isrrClCd){

      // 사용하지 않기로 함
      //FIXME
      //return false;
      switch (isrrClCd){
        case IsrrClCd.배우자:
          return this.fmlInfo.find(f=>f.isrrClCd === isrrClCd)
        case IsrrClCd.자녀:
          return this.fmlInfo.filter(f=>f.isrrClCd === isrrClCd)
      }
    },

    /**
     * 배우자 정보 변경
     */
    async updateSpsIsr(spsFnm, spsRrno, spsTel){

      // 바뀐 내용 확인
      if(spsFnm !== this.spsInfo.usrFnm
        ||  spsRrno !== this.spsInfo.rrno
        ||  spsTel !== this.spsInfo.cellPhoneNo
      ){

        this.sendLog("I", {chgSpsFnm: spsFnm, chgSpsRrno: this.hashidsHelper.encode(spsRrno), chgSpsTel: spsTel})

        // 정보확인
        const _confirm = await this.confirmSpsInfo(spsFnm, spsRrno, spsTel)

        this.spsInfo.validated = _confirm.isConfirmed

        if (_confirm.isConfirmed) {

          const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(spsRrno, this.bseYr);

          this.spsInfo = new TgrInfo({
            usrFnm: spsFnm,
            rrno: spsRrno,
            sxClCd: tgrSxClCd,
            age: tgrAg,
            isrrClCd: '1',
            cellPhoneNo: spsTel,
          })

          // 선택한 보험 변경
          Object.values(this.selected).filter(s=>s.isrrClCd === '1')
            .forEach(s => {
              if(s.isrDtlCd){
                s.tgrFnm = spsFnm
                s.tgrRrno = spsRrno
                s.tgrAg = tgrAg
                s.cellPhoneNo = spsTel
              }
            })

console.debug('this.spsInfo', this.spsInfo)
console.debug('this.selected', Object.values(this.selected).filter(s=>s.isrrClCd === '1'))

          await Swal.fire({
            icon: 'success',
            title: '배우자 정보가 변경되었습니다.',
            timer: 2000,
            timerProgressBar: true,
            confirmButtonText: '확인',
          })

          this.makeQuestion()
          return true;

        }

console.debug('not _confirm', _confirm)

        return false;

        // 아무것도 변경 안됐을때 그냥 닫기
      }else{

        console.log('not changed', this.spsInfo)
        // 보험 완료인 경우가 아니면 배정 내역의 배우자 정보를 불러온 경우이기 때문에
        // 다시한번 확인
        if(!this.dcnYn){

          // 정보확인
          const _confirm = await this.confirmSpsInfo(spsFnm, spsRrno, spsTel)

          this.spsConfirmed = _confirm.isConfirmed;

          return _confirm.isConfirmed;

        }

        return true;

      }


    },
    /**
     * 배우자 최종 정보 확인 modal
     * @param name {string}
     * @param rrno {string}
     * @param telNo {string}
     * @return {Promise<*>}
     */
    async confirmSpsInfo(name, rrno, telNo){

      const _confirm = await Swal.fire({
        icon: 'question',
        title: '배우자 정보 확인',
        allowOutsideClick: false,
        confirmButtonText: '등록',
        cancelButtonText: '취소',
        showCancelButton: true,
        html: `<table class="table table-striped rounded-4 overflow-hidden shadow my-3">
  <tbody>
    <tr>
      <th scope="row">성명</th>
      <td class="text-start ps-4">${name}</td>
    </tr>
    <tr>
      <th scope="row">주민번호</th>
      <td class="text-start ps-4">${nxtUtil.formatSsn(rrno, false)}</td>
    </tr>
    <tr>
      <th scope="row">휴대폰</th>
      <td class="text-start ps-4">${formatMobileNo(telNo, false)}</td>
    </tr>
  </tbody>
</table>

<div class="text-center fs-5 mt-4">
  정보가 맞습니까?
</div>
`
      })


      return _confirm;

    },

    /**
     * 배우자 보험 가입
     * 0 가입여부
     * 1 성명, 주민번호, 핸드폰
     * @param step {0|1}
     */
    async confirmSpsIsr(step) {


      switch(step){

        // 가입 여부
        case 0:

          // 보험 조정 기간이고 배우자 보험이 의무가 아니면 통과
          if(this.bhdSlcChnYn && !this.spsEssYn) return false;

          const r = await confirmMessage('배우자 보험 가입', `<b>배우자 보험 상품에 가입 하시나요?</b>
<div>
  ${ask.spsRegister(this.bseYr)}
</div>`)

          // 정보 입력
          if (r) {
            return this.confirmSpsIsr(1)

            // 배우자 보험 가입 안함
          } else {
            this.spsInfo = null;
            return true;
          }

        //
        case 1:

          // 부부 공무원 안내
          const res = await Swal.fire({
            icon: 'info',
            title:'부부 공무원 단체보험 가입안내',
            html: '각자 가입하세영',
            confirmButtonText: '네',
          })


          // 배정 내역에서 배우자 정보 체크
          // 안 쓰기로 함 25. 8. 26. choihunchul
          const find = this.findLatestFmlInfo(IsrrClCd.배우자)

          console.debug('this.fmlInfo', this.fmlInfo, 'find', find)

          if(!this.spsInfo?.validated && find){

            const res = await Swal.fire({
              icon: 'question',
              title: '배우자 정보 가져오기',
              text: '현재 배정정보에 배우자 정보를 불러 오시겠습니까?',
              showCancelButton: true,
              confirmButtonText: '네',
              cancelButtonText: '아니오'
            })

            console.debug('this.fmlInfo', res)

            if(res.isConfirmed){
              this.spsInfo = find;
            }

          }

          return customConfirmMessage('배우자 정보를 입력해주세요', `<div class='row g-3 p-4'>
  <div class="col-md-6"
    x-data="{
        isComposing: false,
        checkName:async (el)=>{
           if(!this.isComposing){
            this.isComposing = true;
            
            const valid = await checkName(el, '1')
            
            if(valid){
               document.querySelector('button[name=okButton]').click()
            }

            this.isComposing = false;
          }
        }

      }"
    >
    <label for="spsFnm" class="form-label">배우자 성명</label>
    <input type="text" id="spsFnm" class="form-control" x-ref="spsFnm" required tabindex="1"
      :value="spsInfo?.usrFnm"
      @keyup.enter="checkName($el)"
      @change.throttle.500ms="()=>{
          if(spsInfo) spsInfo.validated = false;
          checkName($el)
        }"
      x-init="()=>{
        if(spsInfo?.usrFnm) checkName($el)
      }"
      >
    <div class="invalid-feedback"></div>
  </div>
  <div class="col-md-6" x-data="{
      checkRrno: (el)=>checkFmlSsn(el, '1')
    }">
    <label for="spsRrno" class="form-label">배우자 주민번호</label>
    <input type="tel" inputmode="numeric" id="spsRrno" x-ref="spsRrno" tabindex="2"
      :value="spsInfo?.rrno"
      @focus="$el.type='tel'"
      @blur="$el.type='password'"
      @change="if(spsInfo) spsInfo.validated = false;"
      @keyup.throttle="async ()=>{
        const valid = await checkRrno($el)
        if(valid) document.querySelector('button[name=okButton]').click()
      }"
      x-init="()=>{
        rrnoInputMask.mask($el)
      }"
      class="form-control" required>
    <div class="invalid-feedback"></div>
  </div>
  <div class="col-6">
    <label for="spsTel" class="form-label">배우자 휴대폰 번호
      <em class="text-info bi bi-question-circle-fill"
          x-init="()=>new bootstrap.Tooltip($el)"
         data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"  data-bs-html="true"
         :title="\`<div class='p-2 rounded-1 text-start'>
배우자 보험 가입을 위해서는 <b>배우자의 개인정보 수집/이용 및 제3자 제공</b>에 대한 동의가 필요합니다.<br><br>
보험선택 확정 후에 배우자 휴대폰 번호로 개인정보 동의 확인 메시지가 발송되오니 <b>반드시 기간내에 동의를 완료</b>해주시기 바랍니다.<br><br>
<b class='text-danger'>미동의시 가입불가</b></div>\`"></em></label>
      <input type="tel" inputmode="numeric" id="spsTel" x-ref="spsTel" tabindex="3"
        :value="spsInfo?.cellphoneNo"
        :disabled="spsInfo?.isAgreeDone"
        x-init="Inputmask({mask: '999-9999-9999', keepStatic: true, placeholder: '010-____-____', autoUnmask: true}).mask($el);"
        @change="if(spsInfo) spsInfo.validated = false;"
        @keyup.debounce="($event)=>{
            if($event.target.value.length < 10){
              $el.classList.remove('is-valid');
            }
            if($event.key ==='Enter' || $event.target.value.length === 11){
             const valid = checkCellPhoneNo($el, spsInfo.cellPhoneNo)

             //if(valid) document.querySelector('button[name=okButton]').click()
            }
          }"
        class="form-control" required>
      <div class="invalid-feedback"></div>
    <div class="form-text" x-show="spsInfo?.isAgreeDone()">개인정보 제공 동의 완료</div>
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
              callback: async () => {

                const spsFnm = document.querySelector('input#spsFnm');
                const spsRrno = document.querySelector('input#spsRrno');
                const spsTel = document.querySelector('input#spsTel');

                const checkName = await this.checkName(spsFnm, '1');

                if(!checkName){
                  return false;
                }

                const checkSsn = await this.checkFmlSsn(spsRrno, '1');
                if(!checkSsn.valid){
                  return false;
                }

                if(!this.checkCellPhoneNo(spsTel)){
                  spsTel.focus()
                  return false;
                }

                this.sendLog("D", {spsFnm: spsFnm.value, spsRrno: this.hashidsHelper.encode(spsRrno.value), spsTel: spsTel.value})

console.debug('this.selected', this.selected)

                // 배우자 정보 변경
                if(Object.values(this.selected).find(s=>s.isrrClCd === '1')){
                  return await this.updateSpsIsr(spsFnm.value, spsRrno.value, spsTel.value);
                }

                // 정보 확인
                const _confirm = await this.confirmSpsInfo(spsFnm.value, spsRrno.value, spsTel.value)

                this.spsInfo.validated = _confirm.isConfirmed;

                if (_confirm.isConfirmed) {

                  const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(spsRrno.value, this.bseYr);

                  this.spsInfo = new TgrInfo({
                    usrFnm: spsFnm.value,
                    rrno: spsRrno.value,
                    sxClCd: tgrSxClCd,
                    age: tgrAg,
                    isrrClCd: '1',
                    cellPhoneNo: spsTel.value
                  })

                  await Swal.fire({
                    icon: 'success',
                    title: `배우자 정보가 입력되었습니다.\n배우자 보험상품을 선택해 주세요`,
                    timer: 2000,
                    timerProgressBar: true,
                  })

                  return true;

                }

                return false;

              }
            }),
            cancelButton: ({
              callback: async () => {

                // 배우자 정보변경 취소 아무것도 안함
                if(this.spsInfo.validated){
                  return true;
                }

                const r = await Swal.fire({
                  icon: 'question',
                  title: '배우자 보험 상품 가입을 취소 하시겠습니까?',
                  confirmButtonText: '가입안함',
                  cancelButtonText: '가입',
                  showCancelButton: true,
                })

                if(r.isConfirmed){
                  this.spsInfo = null;

                  // 배우자 정보 변경되었을때 선택한 배우자 보험상품 초기화
                  Object.values(this.selected).filter(s=>s.isrrClCd === '1')
                    .forEach(s=> delete this.selected[s.isrPrdCd])

                  return true;
                }else{
                  return false;
                }

              }
            })

          }))


      }// end switch


    },
    /**
     * 자녀 입력 모달에서 한줄씩 validation
     * @param tr {HTMLTableRowElement}
     * @return {Promise<boolean>}
     */
    async validateChildRow(tr) {
    
console.debug('validateChildRow this.childInfo',  this.chldInfo)
      const _id = tr.dataset.childId;
      const _child = this.chldInfo.find(c=>c.tempId === _id);
      
console.debug('validateChildRow _id',  _id, _child, 'tr', tr, 'this.chldInfo',  this.chldInfo)

      const childFnm = tr.querySelector('input[name=name1]');
      
console.debug('validateChildRow _child', childFnm.id, _child, childFnm.value)

      const checkName1 = await this.checkName(childFnm, '3', this.otherNames('3', childFnm));

console.debug('validateChildRow checkName b', childFnm.id, checkName1, childFnm.value)

      if(!checkName1){
        return false;
      }

      const childRrno = tr.querySelector('input[name=idnum1]');

      const childCellphoneNo = tr.querySelector('input[name=phone2]');

      const childFile = tr.querySelector('input[name=file2]');

console.debug('validateChildRow childRrno', childFnm.id, childRrno, childFnm.value)
console.debug('validateChildRow childRrno', childFnm.id, childRrno, childFnm.value)
console.debug('validateChildRow childCellphoneNo', childFnm.id, childCellphoneNo, childFnm.value)
console.debug('validateChildRow childFile', childFnm.id, childFile, childFnm.value)
      
      const checked = await this.checkFmlSsn(childRrno, '3', _child, this.otherRrnos(childRrno));

console.debug('validateChildRow checked2', childFnm.id, checked, childFnm.value)

      if(!checked.valid){

        if(checked.data?.over14){
          markingInvalid(childCellphoneNo,  false,'휴대전화 번호를 입력해 주세요');
        }

        if(checked.data?.over19){
          markingInvalid(childFile, false, '증빙파일을 첨부해 주세요');
        }
        return false;

      }

console.debug('validateChildRow checked2', childFnm.id, childCellphoneNo.value, childFnm.value)

      if(!childCellphoneNo && !childCellphoneNo.disabled && !this.checkCellPhoneNo(childCellphoneNo)){
console.debug('validateChildRow checked2', childFnm.id, '', childCellphoneNo, childFnm.value)
        return false;
      }
      
console.debug('validateChildRow ==> true', childFnm.id, childCellphoneNo, childFnm.value)

      return true;

    },
    /**
     * 성명 정합성 체크시에 이름 중복 검사를 위해 다른 사람의 이름을 가져옴
     * @param isrrClCd {IsrrClCd}
     * @param index {number|HTMLInputElement?}
     * @return {string[]}
     */
    otherNames(isrrClCd, index){

console.debug('otherNames', isrrClCd, 'index', index)

      let otherNames = [];

      switch (isrrClCd){
        case '1':

          otherNames = this.chldInfo?.filter(c=>c.validated).map(c=>c.usrFnm)
          otherNames.push(this.pseInfo.usrFnm)

          return otherNames;

        case '3':

          if(typeof index === 'number') {
            otherNames = this.chldInfo?.filter((c, i) => i !== index).map(c => c.usrFnm)
          }else{
            otherNames = Array.from(document
              .querySelectorAll('input[name=name1]')).filter(i=> i.value && i !== index).map(e=>e.value)
          }

          otherNames.push(this.pseInfo.usrFnm)

          if(this.spsInfo?.validated){
            otherNames.push(this.spsInfo.usrFnm)
          }

          return otherNames;

      }

    },
    /**
     * 자녀정보에서 현재 자녀를 제외한 주민번호를 가져옴
     * @param index {number|HTMLInputElement}
     * @return {string[]}
     */
    otherRrnos(index){

      let otherRrnos_ = [];

      if(typeof index === 'number') {
        otherRrnos_ = this.chldInfo?.filter((c, i) => i !== index).map(c => c.rrno)
      }else{
        otherRrnos_ = Array.from(document.querySelectorAll('input[name=idnum1]')).filter(i=> i.value && i !== index).map(e=>e.value)
      }

      if(this.spsInfo?.validated){
        otherRrnos_.push(this.spsInfo.rrno)
      }

      return otherRrnos_

    },
    /**
     *
     * @param child {TgrInfo}
     * @return {{child: {name: void | string, nameValidate: boolean, rrno: *, rrnoValidate: boolean, cellphoneNo: *, cellphoneNoValidate: boolean, updFileNo: *, updFileNoValidate: boolean}, check(*): void, checkChildRrno(*): Promise<undefined|boolean>, checkPhoneNo(*): void, isOver14: *, isOver19: boolean, birthday: string, tgrSxClCd: string, age: number, removeChild(*): void}|boolean}
     */
    childData: (child)=>{
      return{
        init(){
console.debug('childData init', this.child, child, 'this.chldInfo', this.chldInfo)
        },
        child,
        check(el){

          console.log('check',el.value, 'el', el, this.child)

          if (!this.child.usrFnm) return;

          this.child.nameValidate = this.checkName(el, "3", this.otherNames("3", el))
        },
        /**
         * 자녀 입력 모달에서 주민번호 체크
         * @param el {HTMLInputElement}
         * @param [isBatch=false] {boolean} - 배치작업인지 배치작업일때는 중간에 확인 modal을 띄우지 않음
         * @return {Promise<boolean>}
         */
        async checkChildRrno(el, isBatch = false) {

          const rrno = el.value;

          if (!rrno || rrno.length !== 13) return;

          this.child.rrno = rrno;

          const checked = await this.checkFmlSsn(el, "3", this.child, this.otherRrnos(el))

console.debug('checkChildRrno', checked)

          if (checked.data?.birthday) {
            this.birthday = checked.data.birthday;
            this.child.sxClCd = checked.data.tgrSxClCd
            this.child.age = checked.data.tgrAg;

            this.sxClCd = checked.data.tgrSxClCd === '1'?'남':'여'

            this.isOver14 = this.child.age >= 14;
            this.isOver19 = checked.data.bornYear < this.wlfInst.chldIsrAgRstcYr

          }

          if(checked.valid || checked.data?.over14 || checked.data?.over19 ){

            // x-init에서 호출 했을때는 질문은 따로 띄워줄 필요가 없다.
            if(isBatch){
              this.rrnoValidate = true;
              markingInvalid(el)
              return true;
            }

            // 주민번호 확인
            const r = await Swal.fire({
              icon: 'question',
              title: `${this.child.usrFnm} 자녀의 주민번호를 확인 해 주세요`,
              html: `


<table class="table table-striped">
  <tbody>
    <tr>
      <th scope="row">주민번호</th>
      <td class="text-primary">${formatSsn(rrno, false)}</td>
    </tr>
    <tr>
      <th scope="row">생년월일</th>
      <td>${this.birthday}</td>
    </tr>
    <tr>
      <th scope="row">성별</th>
      <td>${this.sxClCd}</td>
    </tr>
  </tbody>
</table>`,
              showCancelButton: true,
              confirmButtonText: '확인',
              cancelButtonText: '수정',
            })

            if(r.isConfirmed){

              //19세
              if(checked.data?.over19){

                const r = await Swal.fire({
                  icon: 'warning',
                  title: '증빙서류 등록 안내',
                  html: '<strong>' + this.wlfInst.chldIsrAgRstcYr + '년 1월 1일</strong> 이전 출생인 경우 장애가 있는 자녀만 가입이 가능하며,'
                    + '<br><mark>증빙서류(복지카드 사본, 장애인 증명서 등)</mark>가 필요합니다.'
                    + '<br><br>계속 진행 하시겠습니까?',
                  showCancelButton: true,
                  confirmButtonText: '등록',
                  cancelButtonText: '취소',
                })

                this.rrnoValidate = r.isConfirmed

                if(r.isConfirmed){

                  markingInvalid(el)

                  setTimeout(()=>{

                      const phone2 = el.closest('div.row.child-row').querySelector('input[name=phone2]');
                      const file2 = el.closest('div.row.child-row').querySelector('input[name=file2]');

                      const driverStep = window.driver.js.driver({
                        showProgress: true,
                        steps:[
                          {element: phone2
                            , popover: {
                              title: '휴대폰 번호를 입력해 주세요',
                              description: '15세 이상 자녀인 경우 보험 가입을 위해서는 자녀의 <mark>개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.',
                              align: 'start',
                              side: 'top',
                            },
                          },
                          {element: file2
                            , popover:{
                              title: '증빙파일 업로드',
                              description: `${this.wlfInst.chldIsrAgRstcYr}년 1월 1일 이전 출생인 경우 장애가 있는 자녀만 가입이 가능하며,
<mark>증빙서류(복지카드 사본, 장애인 증명서 등)</mark>가 필요합니다.`,
                              align: 'start',
                              side: 'top',
                            },
                          },
                        ],
                        overlayOpacity: .3,
                        prevBtnText: '이전',
                        nextBtnText: '다음',
                        doneBtnText: '확인',
                      })

                      driverStep.drive();

                      phone2.focus()
                    }

                    , 700)

                  return true;
                }else{


                  return false;
                }

              }else if(checked.data?.over14){

                await Swal.fire({
                  icon: 'warning',
                  title: '15세 이상 자녀 가입 안내',
                  html: '15세 이상 자녀인 경우 보험 가입을 위해서는 자녀의 <mark>개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.<br><br>자녀의 <strong>휴대폰 번호</strong>를 입력 해 주세요',
                  confirmButtonText: '확인',
                })

                markingInvalid(el)

                this.rrnoValidate = true

                setTimeout(()=>{

                    const phone2 = el.closest('div.row.child-row').querySelector('input[name=phone2]');

                    this.driverObj.highlight({
                      element: phone2,
                      popover:{
                        title: '휴대폰 번호를 입력해 주세요',
                        description: '15세 이상 자녀인 경우 보험 가입을 위해서는 자녀의 <mark>개인정보 수집/이용 및 제3자 제공동의</mark>에 대한 동의가 필요합니다.',
                        align: 'start',
                        side: 'top',
                      },
                    })

                    phone2.focus()
                  }

                  , 700)


                return true;

              }

              this.rrnoValidate = r.isConfirmed

              /*const tr0 = el.closest('div.row.child-row')
              if(await this.validateChildRow(tr0)){
                const btn = document.querySelector('button#btnAppendChild')
                //btn.classList.remove('disabled');
                btn.focus()
              }*/

              return true;

            }else{
              this.rrnoValidate = false
              return false;
            }

          }
          this.rrnoValidate = false

          return false;

        },
        checkPhoneNo(evt){

          const el = evt.target;

          if(el.value.length < 10){
            markingInvalid(el, true, 'x')
          }

          if(evt.key ==='Enter' || el.value.length === 11){
            const valid = this.checkCellPhoneNo(el);

            if(valid){
              const tr0 = el.closest('div.row.child-row');
              if(this.validateChildRow(tr0)){
                const btn = document.querySelector('#btnAppendChild')
                btn.classList.remove('disabled');
                btn.focus()
              }
            }
          }

        },
        rrnoValidate: false,
        isOver14: false,
        sxClCd: '',
        isOver19: false,
        birthday: "",
        removeChild(el){
          Swal.fire({
            icon: 'question',
            title: `${this.child.usrFnm} 자녀 정보를 삭제 하시겠습니까?`,
            text: '입력한 정보와 선택한 보험 정보가 삭제됩니다.',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
          }).then(r=>{
            if(r.isConfirmed){

              //TODO: 보험 삭제
console.debug('remove child', this.chldInfo, 'findIndex', this.chldInfo.findIndex(c=> c=== this.child))

              this.chldInfo.splice(this.chldInfo.findIndex(c=> c=== this.child), 1)

console.debug('remove child', this.chldInfo)
            }

          })
        },
      }
    },
    /**
     * 자녀 추가
     */
    async appendChild() {
    
console.debug('appendChild')
      
      
      let _result = true;
      
      // 모든 row에 대해서 정합성 검사후 이상없을때만 추가
      for(const tr of document.querySelectorAll('div.row.child-row')){
        
        const valid = await this.validateChildRow(tr);
        console.debug('appendChild valid', valid, tr)
        if(!valid){
          _result = false;
        }
      }
      
console.debug('appendChild _result', _result)

      if(_result){
        this.chldInfo.push(new TgrInfo({isrrClCd: '3'}))
      }

    },
    /**
     * 자녀 보험 삭제
     * @param tgrInfo {TgrInfo}
     */
    deleteChildIsrPrd(tgrInfo){
      if(this.selected){
        Object.entries(this.selected).forEach(([key,value]) => {
          if(Array.isArray(value)){
            if(value[0].isrrClCd === tgrInfo.isrrClCd){
              value.forEach((v, i)=>{
                if(v.tgrRrno === tgrInfo.rrno){
                  value.splice(i,1);
                }
              })
            }
          }else{
            if(value.isrrClCd === tgrInfo.isrrClCd && value.tgrRrno === tgrInfo.rrno){
              delete this.selected.key
            }
          }
        })
      }
    },
    /**
     * 모든 자녀 정보 삭제
     * @return {Promise<boolean>}
     */
    async deleteAllChild(){

      const r = await Swal.fire({
        icon: 'warning',
        title: '모든 자녀 정보를 삭제하시겠습니까?',
        text: '모든 자녀 정보와 선택한 자녀 보험이 삭제됩니다.',
        showCancelButton: true,
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
      })

      if(r.isConfirmed){

        this.chldInfo = null;

        if(selected){
          
          //for(const s of )
          
          Object.values(this.selected).flat()
            .filter(s=> s.isrrClCd === '3')
            .forEach(s=> delete selected[s.isrPrdCd])
        }
        console.log('btnDeleteAllChild this.selected', selected)

      }

      return r.isConfirmed;

    },
    /**
     * 자녀 등록
     * 0 가입여부
     * 1 성명, 주민번호, 휴대폰, 증빙서류
     *
     * @param step {0|1}
     */
    async confirmChldIsr(step) {

      switch (step){

        // 가입여부 묻기
        case 0:

          return confirmMessage('자녀 보험 가입', `<b>자녀 보험 상품에 가입 하시나요?</b>
<div>
  ${ask.childRegister(this.bseYr, this.wlfInst.chldIsrAgRstcYr)}
</div>`).then(async  r => {
            // 정보 입력
            if (r) {

              return await this.confirmChldIsr(1)

              // 자녀 보험 가입 안함
            } else {
              this.chldInfo = null;

              /*Object.entries(this.selected).flat().filter(s=>s.isrrClCd === '3')
                .forEach(s=> delete s)*/

              return true;
            }
          })

        case 1:

          // 배정 정보의 자녀정보를가져옴
          // 가져오지 않기로 함 25. 8. 27. choihunchul
          //const find = this.fmlInfo.filter(f=>f.isrrClCd === '3');
          const find = this.findLatestFmlInfo(IsrrClCd.자녀)

          console.debug('this.fmlInfo', this.fmlInfo, 'find', find)

          if(find && find.length){

            const res = await Swal.fire({
              icon: 'question',
              title: '자녀 정보 가져오기',
              text: '현재 배정정보에 자녀 정보를 불러 오시겠습니까?',
              showCancelButton: true,
              confirmButtonText: '네',
              cancelButtonText: '아니오'
            })

            console.debug('this.fmlInfo', res)

            if(res.isConfirmed){
              this.chldInfo = find;
            }

          }

          // 자녀 정보가 없으면 임시로 하나 만듬
          if(!this.chldInfo || !this.chldInfo.length){
            this.chldInfo = [new TgrInfo({isrrClCd:'3'})]
          }
          
          

          return customConfirmMessage('자녀 정보를 입력해주세요', `<div class='row g-3 p-4'>

      <div id="childForm" x-id="['child', 'name1', 'idnum1', 'phone2', 'file2']">
      
        <template x-for="(child_, idx ) in chldInfo" :key="child_.tempId">
          
          <div class="row g-3 border-bottom child-row"
            :data-child-id="child_.tempId"
            x-data="childData(child_)"
            x-effect="console.log('x-effect', idx, child, 'chldInfo', chldInfo)"
          >
            <div class="col-md-1 border-dark-subtle border-end border-top bg-secondary-subtle d-flex align-items-center justify-content-center"
                x-text="idx+ 1"
              >
            </div>

      <div class="col-md-10 border-end">
      
        <div class="row align-items-center py-2 border-top">
          <div class="col-md-4">
            <label :for="$id('name1', idx)" class="form-label sr-only d-none">성명</label>
            <input type="text" :id="$id('name1', idx)" name="name1" class="form-control" placeholder="이름을 입력하세요"
              x-model="child.usrFnm"
              :value="child.usrFnm"
              @keyup.enter="check($el)"
              @change="check($el)"
              x-init="check($el)"
            >
            <div class="invalid-feedback small" style="font-size: 0.6em"></div>
          </div>
           <div class="col-md-4">
           
            <label :for="$id('idnum1', idx)" class="form-label sr-only d-none">주민등록번호</label>
            <input type="text" :id="$id('idnum1', idx)" name="idnum1" class="form-control" placeholder="주민번호를 입력하세요"
                inputmode="number"
                style="font-family: monospace, monospace"
                :data-unmask="child.rrno"
                :value="rrnoValidate?formatSsn($el.value):child.rrno"
                x-init="()=>{
                  checkChildRrno($el, true)
                  
                  $watch('rrnoValidate', (value)=>{
                    if(value){
                      $el.inputmask?.remove();
                      $el.value = formatSsn($el.value)
                    }else{
                      if(!$el.inputmask){
                        rrnoInputMask.mask($el)
                      }
                    }
                  })
                }"
                @focus="()=>{
                  //$el.type='tel'
                  if(!$el.inputmask){
                    rrnoInputMask.mask($el)
                  }
                  $el.value = child.rrno
                }"
                @blur="()=>{
                  child.rrno = $el.value
                  if(rrnoValidate){
                    $el.inputmask?.remove();
                    $el.value = formatSsn($el.value)
                  }
                }"
               @keyup.debounce="checkChildRrno($el)"
            >
            <div class="invalid-feedback small" style="font-size: 0.7em"></div>
          </div>
          <div class="col-md-4">
            <small x-show="child.rrnoValidate && birthday" x-transition style="font-size: .6em;">
              <div>생년월일: <b x-text="birthday"></b></div>
              <div>성별: <b x-text="sxClCd"></b></div>
            </small>
          </div>
        </div>
        
        <!-- 2줄 -->
          <div class="row g-3 mb-1 py-2" x-show="isOver14 || isOver19" x-collapse>
            
            <div class="col-md-4" x-show="isOver14">
            
              <label :for="$id('phone2', idx)" class="form-label" style="font-size: 0.7em">
                <small>휴대폰 번호
                <span class="bi bi-question-circle-fill text-info"
                      data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true"
                      data-bs-title="만 15세 이상 자녀인 경우 보험 가입을 위해서는 자녀의 개인정보 수집/이용 및 제3자 제공동의에 대한 동의가 필요합니다.
<br>
<br>자녀의 휴대폰 번호를 입력 해 주세요"
                        x-init="new bootstrap.Tooltip($el)"
                      ></span>
                </small>
              </label>
              
              <input type="tel" :id="$id('phone2', idx)" name="phone2" class="form-control"
                style="font-family: monospace, monospace"
                x-model="child.cellPhoneNo"
                :value="child.cellPhoneNo"
                :disabled="!isOver14"
                @keyup.debounce="checkPhoneNo($event)"
                x-init="()=>{
                  Inputmask({mask: '999-9999-9999', keepStatic: true, placeholder: '010-____-____', autoUnmask: true}).mask($el)
                  
                  $watch('isOver14', (value)=>{
                    if(value){
console.debug('$watch(isOver14)===>', $el.id, value, $el.value, $el)
                      const b = checkCellPhoneNo($el);
console.debug('$watch(isOver14)=====>',b, $el.id, value, $el.value, $el)
                     }
                  })
                  
                }"
              >
              <div class="invalid-feedback small" style="font-size: 0.65em"></div>
            </div>
      
            <div class="col-md-6" x-show="isOver19">
            
              <label :for="$id('file2', idx)" class="form-label" style="font-size: .7em">
                증빙파일
                <span class="bi bi-question-circle-fill text-info"
                  x-init="new bootstrap.Tooltip($el)"
                  data-bs-toggle="tooltip"
                  :title="\`${this.wlfInst.chldIsrAgRstcYr}년1월1일이전출생인경우장애가있는자녀만가입이가능하며, 증빙서류(복지카드사본, 장애인증명서등)가필요합니다.\`"></span>
              </label>
              <input type="file" :id="$id('file2', idx)" name="file2"
                 accept="image/*,.pdf,.doc,.docx,.hwp,.hwpx;capture=camera"
                 :class="\`form-control\${(isOver19 && child.updFleNo)?' is-valid':' is-invalid animate__animated animate__headShake'}\`"
                 :disabled="!isOver19"
                 @change="async ()=>{
                        const _preview = $el.parentElement.nextElementSibling.querySelector('div.preview')
                        if(!$el.value) return _preview.innerHTML = ''
                        await imagePreview($el.files, _preview, false)
                        
                        child.updFleNo = $el.files;

                        const tr0 = $el.closest('div.row.child-row')
                        if(validateChildRow(tr0)){
                          const btn = document.querySelector('button#btnAppendChild')
                          //btn.classList.remove('disabled');
                          btn.focus()
                        }
                      }"
              >
              <div class="invalid-feedback small" style="font-size: 0.65em">증빙 파일을 업로드 해주세요</div>
            </div>
            
             <div class="col-md-2">
                <div class="div row preview my-1" style="max-height: 150px;max-width: 150px"
                  x-html="printFileviewer({encdFileNo: child.updFleNo, title: '증빙파일 확인'})"
                ></div>
              </div>
          </div>
      
      </div>

      <div class="col-md-1 py-2 border-top d-flex align-items-center justify-content-center">
        <button type="button" class="btn btn-sm btn-outline-danger bi bi-x-lg" @click="removeChild($el)"
                  x-init="new bootstrap.Tooltip($el)"
                  data-bs-toggle="tooltip"
                  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true"
                  data-bs-title="자녀 정보 삭제"></button>
      </div>
    </div>
      
      </template>
      
      </div>
      
      
      <div class="text-end me-1">
        <button class="btn btn-danger bi bi-minus-lg"
          id="btnDeleteAllChild"
           @click.debounce="()=>{
              deleteAllChild()
            }"
        > 모든자녀 정보 삭제</button>
        <button class="btn btn-success bi bi-plus-lg"
          id="btnAppendChild"
          data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"  data-bs-html="true"
          data-bs-title="<div class='p-1 rounded-3'>다른 자녀를 추가하시겠습니까?<br>자녀 정보가 모두 입력된 경우 하단의 파란색 <span class='fw-bold text-bg-primary rounded bi bi-check2-all p-1'> 확인</span>버튼을 누르세요</div>"
          x-init="()=>new bootstrap.Tooltip($el)"
           @click.debounce="appendChild()"
        > 자녀추가</button>
      </div>
      
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
            bsColor: 'info',
            footer: `<button class="w-25 btn btn-lg btn-primary bi bi-check2-all" name="okButton">
  확인</button>
<button class="w-25 btn btn-lg btn-danger bi bi-x-circle-fill" name="cancelButton">취소</button>`,
            okButton: ({
              callback: async () => {

                const rows = [];

                for(const row of Array.from(document.querySelector('table#childRegTable').tBodies[0].rows)){

                  if(row.classList.contains('table-primary')) continue;

                  const b = await this.validateChildRow(row)

                  if(!b) return false;

                  rows.push(row);
                }

                const res = await Swal.fire({
                  icon: 'question',
                  title: `${rows.length} 명의 자녀를 등록 하시겠습니까?`,
                  allowOutsideClick: false,
                  allowEscapeKey: false,
                  showCancelButton: true,
                  showConfirmButton: true,
                  confirmButtonText: '등록',
                  cancelButtonText: '취소',
                })

                if (res.isConfirmed) {

                  this.chldInfo = [];

                  rows.forEach(tr => {
                    const childFnm = tr.querySelector('input[name=childFnm]');
                    const childRrno = tr.querySelector('input[name=childRrno]');

                    const nextTr = tr.nextElementSibling;

                    const childCellphoneNo = nextTr.querySelector('input[name=childCellphoneNo]');
                    const childFile = nextTr.querySelector('input[name=childFile]');

                    const {bornYear, tgrSxClCd, tgrAg, birthday} = calcSsn(childRrno.value, this.bseYr);

                    const chld = new TgrInfo({
                      usrFnm: childFnm.value,
                      rrno: childRrno.value,
                      sxClCd: tgrSxClCd,
                      age: tgrAg,
                      isrrClCd: '3',
                      cellPhoneNo: childCellphoneNo.value,
                      files: childFile.files,
                    })

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

                }else{
                  return false;
                }
              }
            }),
            cancelButton: ({
              callback: async () => {

                // 자녀정보 수정
                if(this.chldInfo && this.chldInfo.length){

                  const r = await Swal.fire({
                    icon: 'question',
                    title: '자녀 정보 변경을 취소 하시겠습니까?',
                    text: '변경하신 정보가 반영되지 않습니다.',
                    showCancelButton: true,
                    confirmButtonText: '정보 변경 취소',
                    cancelButtonText: '계속 등록',
                  })

                  if (r.isConfirmed) {
                    this.makeQuestion();
                    return true;
                  }
                }

                // 최초 등록
                const r1 = await Swal.fire({
                  icon: 'question',
                  title: '자녀 보험 상품 가입을 취소 하시겠습니까?',
                  text: '입력하신 자녀 정보가 모두 삭제 됩니다.',
                  showCancelButton: true,
                  confirmButtonText: '가입 취소',
                  cancelButtonText: '계속 등록',
                })

                if (r1.isConfirmed) {
                  this.chldInfo = null;
                  this.makeQuestion();
                  return true;
                }

                return false;
              }
            })

          }))


      }// end switch


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
        .filter(t=> calcSsn(t.tgrRrno, this.bseYr, true).tgrAg >=14)
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
          isrrClCd: tgr.isrrClCd,
        }));

        tgrs?.forEach(t=>t.tgrRrno = this.hashidsHelper.decode(t.tgrRrno))

console.log('tgrs', tgrs);

      if(this.testMode) return;

      if(!tgrs || !tgrs.length) return true;

      this.sendLog("I", {action:'문자발송', 'sms': tgrs.map(t=>({tgrFnm: t.tgrFnm, tgrTelNo: t.tgrTelNo}))})
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

      this.sendLog("I", {action:'파일업로드', 'files': __files.map(t=>Array.from(t.files).map((f, i)=>({cerSeqs: i, name: f.name, size: f.size})))})
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
      await this.sendLog("I", {action: '보험선택저장', '저장': bhdSlcs.filter(s=>s.tgrFnm).length, 'dcnYn':  this.dcnYn, 'taken': new Date().getTime() - this.storedtime})
        .then(r=> {
console.log('파일업로드 요청', r)

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
        this.isLoading = true;
        //loading();

        await fetch(`/wus/uim/bsm/nxt/store/${this.token}.jdo`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(bhdSlcs)
        }).then(res => res.json())
          .then(data => {
            console.log('data', data);

            this.sendLog("D", {action: '보험확정'
              , savNcnt: data
              , bseYr: this.bseYr
              , dcnYn:  this.dcnYn?'Y':'N'
              , oprInstCd: this.wlfInst.oprInstCd
              , mobileYn: this.mobileYn
              , scrnSz: window.screen.width
              , elpHr: new Date().getTime() - this.storedtime
            })

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
          }).finally(() => this.isLoading = false);

console.log('저장 끝')

      } else {
console.log('test모드 종료');
        // test 모드
        this.setStep(5);
      }

    },

    printMask(data) {
      return nxtUtil.printMaskWithEyes(data);
    },

    /**
     * 예외를 던짐
     * @param message
     * @param ex {Error|Object}
     * @param level {'W'|'E'}
     * @return {boolean}
     */
    async throwException(message, ex, level='W') {

      const data = {
        message
        , ex: ex?.stack
      }

      await this.sendLog(level, data, true);

      console.error('오류 발생', data);

      alertMessage('오류발생', message, 'danger');

      //throw new Error(message);

    },

    /**
     * 보험 선택 로그를 보냄
     * @param level {'D'|'I'|'W'|'E'}
     * @param data {object}
     * @param withMeta {boolean=false}
     */
    sendLog(level, data, withMeta = false){

      console.log('sendLogs this', this.testMode, 'this', this)

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

        if(level === 'D'){
          console.debug('보험선택 로그', level, data)
        }else if(level === 'I'){
          console.log('보험선택 로그', level, data);
        }else if(level === 'W'){
          console.warn('보험선택 로그', level, data);
        }else if(level === 'E'){
          console.error('보험선택 로그', level, data);
          console.table(data)
        }

        return new Promise((resolve, reject)=>{
          setTimeout(resolve('로그 성공'), 600)
        });

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
    <span>${nxtUtil.formatSsn(tgrrrno)}</span>
      <em class="ms-2 text-primary bi bi-eye" title="보기" onclick="this.parentElement.querySelector('span').textContent = nxtUtil.formatSsn('${tgrrrno}', false);
      setTimeout(()=>this.parentElement.querySelector('span').textContent = nxtUtil.formatSsn('${tgrrrno}'), 3000)" title="주민번호 확인"></em>
    <span class="text-warning ms-2"><small>동의 미완료</small></span>
  </td>
</tr>`
  }

  const html = `<table class='table table-bordered table-striped table-sm shadow' style="font-size: smaller">
    <caption class="caption-top w-100 text-end pe-1 fw-bold">${this.pseInfo.usrFnm} (${nxtUtil.formatSsn(this.pseInfo.rrno)})</caption>
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
        Swal.fire({
          icon: 'success',
          title:'개인정보 제공동의 요청 SMS가 재발송 되었습니다.',
          timer: 2000,
          timerProgressBar: true,
          confirmButtonText: '확인'
        })
      }else{

        Swal.fire({
          icon: 'warning',
          text: r,
          confirmButtonText: '확인'
        })

      }

    })
    .catch(e=>{

      Swal.fire({
        icon: 'error',
        text: `SMS 발송중에 오류가 발생하였습니다.
잠시 후에 다시 시도하여 주십시오
문의 1588-4321`,
        confirmButtonText: '확인'
      })

      console.error(e);
    })
}

/**
 * bootstrap from validator 표시
 * @param input {HTMLInputElement}
 * @param valid {boolean=true}
 * @param message {string?} - 에러 메시지 valid가 true이고 message가 x이면 valid, invalid 모두 삭제
 */
function markingInvalid(input, valid=true, message){

  const feedbackEl = input.parentElement.querySelector('.invalid-feedback');

  if(!valid){
    input.classList.remove('is-valid', 'is-invalid', 'animate__animated', 'animate__headShake');
    input.classList.add('is-invalid', 'animate__animated', 'animate__headShake');

    //input.readOnly = false;

    window.navigator.vibrate?.([200])
    console.log(' window.navigator.vibrate',  window.navigator.vibrate)

    if(message){
      if(feedbackEl){
        feedbackEl.textContent = message;
      }
    }

    input.focus()

  }else{

    if(message === 'x'){

      input.classList.remove('is-invalid', 'animate__animated', 'animate__headShake', 'is-valid');

    }else{

      input.classList.remove('is-invalid', 'animate__animated', 'animate__headShake');
      input.classList.add('is-valid');
    }


    //if (feedbackEl) feedbackEl.remove();

    //input.readOnly = 'readonly';
    //input.inputmask?.remove();

  }

}
