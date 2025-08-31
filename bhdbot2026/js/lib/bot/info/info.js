const notice = {
  IL0001: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
    <h5><b class="text-black">생명/상해보험:</b> 필수가입</h5>
    <ul class="py-1">
      <li class="mb-2">단체보험 생명/상해 상품은 개인보험 생명/상해에 가입되어 있어도 중복보상 가능</li>
      <li class="mb-2">부부공무원의 경우, 본인의 생명/상해 보험에 가입하는 것을 원칙으로 함</li>
    </ul>
  <div class="row mt-3">
    <dl>
      <dt class="mb-2 fs-6">가입금액</dt>
      <dd>
        <ul>
          <li>3천만원~2억원 중 개인별 선택</li>
        </ul>
      </dd>
      <dt class="mb-2 fs-6">보장내용</dt>
      <dd>
        <ul>
          <li>기왕증자 현증자 보장 및 타제도에 의한 보상과 관계없이 중복 보상
              <ul class="py-1" style="padding-left: 1em">
                <li class="mb-2">상해 사망(상해 80%이상 고도 후유장해 포함) 시: 가입금액 보장</li>
                <li class="mb-2">질병 사망(질병 80%이상 고도 후유장해 포함) 시: 가입금액 보장</li>
                <li class="mb-2">상해&middot;질병으로 인한 후유장해(3%~79%) 발생시: 가입금액 X 지급율(3%~79%) 보장</li>
              </ul>
            </ul>
          </li>
      </dd>
  </dl>
  </div>  
</div>`
  },
  IL0002: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
<h5><b class="text-black">의료비 보장(실손):</b> 기관선택시 소속직원 필수가입</h5>
<div class="fw-bold mb-2 ms-2">※ 개인의료비 보장(실손)가입 시 미가입 가능</div>
 <ul class="py-1">
      <li class="pb-2">단체 의료비 보장(실손) 상품은 개인 의료비 보장(실손)에 가입되어 있을 경우 <b>중복보상 불가</b></li>
      <li class="pb-2">개인 의료비 보장(실손)이 있거나, 국가 유공자 등 국가의료보호 대상자인 경우에는 미가입 가능</li>
      <li class="pb-2">부부공무원의 경우, 의료비 보장(실손)은 본인이 선택하는 것을 원칙으로 함</li>
      <li class="pb-2">개인 의료비 보장(실손) 가입여부 조회방법
        <ul>
        <li>한국 신용정보원 본인신용정보 열람서비스(<a href="https://m.site.naver.com/1o2Wv" target="_blank" title="본인신용정보 열람서비스 홈페이지 바로가기" 
  class="link-opacity-50-hover" >https://m.site.naver.com/1o2Wv </a>)
→ 로그인 후 조회(<b>회원가입 필수</b>)<br>
<span class="text-danger">* 비회원 접속 시 조회되지 않음</span></li>
      </ul></li>
    </ul>
    
  <div class="row mt-3 ms-1 p-0 rounded-3 overflow-hidden"> 
    <table class="table table-bordered table-sm table-striped table-hover">
      <thead class="table-info  rounded-top">
        <th colspan="2" scope="col" class="text-center">보장범위</th>
      </thead>
      <tbody>
        <tr>
          <th rowspan="2" scope="row" class="align-middle">급여</th>
          <td>상해 3천만원(통원 1회당 15만원)</td>
        </tr>
        <tr>
          <td>질병 3천만원(통원 1회당 15만원)</td>
        </tr>
        <tr>
          <th rowspan="2" scope="row" class="align-middle">비급여</th>
          <td>상해 3천만원(통원 1회당 15만원, 100회 限)</td>
        </tr>
        <tr>
          <td>질병 3천만원(통원 1회당 15만원, 100회 限)</td>
        </tr>
        <tr>
          <th rowspan="3" scope="row" class="align-middle">3대 비급여 특약</th>
          <td>비급여 도수치료 등(350만원, 50회 限)</td>
        </tr>
        <tr>
          <td>비급여 주사료 등(250만원, 50회 限)</td>
        </tr>
        <tr>
          <td>비급여 자기공명영상진단(300만원)</td>
        </tr>
      </tbody>
    </table>     
  </div>
  <div class="fs-5 mt-3">
    📢 보험선택 기간 이후 의료비보장 조정기간은 주어지지 않으며, 의료비보장 제외는 <mark>중지신청</mark>으로만 가능합니다.
  </div>
</div>
`
  },

  IL0010: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
      <h5><b class="text-black">특정질병 진단비:</b> 기관 선택시 소속기관 직원 필수 가입 </h5>
    <div class="row mt-3">  
      <dl>
        <dt class="mb-2 fs-6">가입금액</dt>
        <dd>
          <ul>  
            <li>1천만원, 2천만원 중 기관별 선택</li>  
          </ul>
        </dd>
        <dt class="mb-2 fs-6">보장내용</dt>
        <dd>
          <ul>
            <li class="mt-2">(암 진단)확정 시(최초 1회에 한함) 아래 보험금 지급 비율에 따라 보장
            <div class="row p-0 rounded-3 overflow-hidden mb-0">
              <table class="table table-bordered table-sm table-striped table-hover mb-0 pb-0">
              <caption class="sr-only d-none">보험금 지급비율</caption>
              <thead class="table-info text-center">
                <th scope="col">구분</th>
                <th scope="col">지급비율</th>
              </thead>
              <tbody>
                <tr>
                  <td>일반 암</td>
                  <td>가입금액 보장</td>
                </tr>
                <tr>
                  <td>갑상선암, 경계성 종양</td>
                  <td>가입금액의 30%</td>
                </tr>
                <tr>
                  <td>제자리암(상피내암), 기타피부암</td>
                  <td>가입금액의 10%</td>
                </tr>            
              </tbody>
            </table>
            </div>
            <div class="mt-0"><small><b>※ 전이암 재발암은 보장하지 않으며, 면책 일(日)수 없음</small></b></div>
            </li>
            <li class="mt-4">(급성심근경색&middot;뇌졸증)진단 확정  시(각 항목별 1회 한함) 가입금액보장
              <div class="mt-0"><small><b>※ 보험 가입기간 중 진단된 경우에 한하며(최초 1회 진단만 보장하며, 재진단은 보장하지 않음) 면책 일(日)수 없음</small></b></div>
            </li>
          </ul>
          
        </dd> 
      </dl>
    </div>
</div>.`
  },
  IL0011: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
<h5><b class="text-black">순직사망:</b> 기관 선택시 소속기관 직원 필수 가입</h5>
 <ul class="py-1" style="padding-left: 1em">
    <li>
      <dl>
        <dt>가입금액</dt>
        <dd>5천만원, 1억원, 2억원<small>(경찰)</small> 中 기관별 선택</dd>
      </dl>
    </li>
    <li>
      <dl>
        <dt>보장내용</dt>
        <dd>순직사망 시<small>(공무수행 또는 업무상으로 인하여 보험기간 중 사망한 경우)</small> 가입금액 보장
          <ul style="padding-left: 1em">
            <li class="mt-2">순직사망 여부는 공무원 재해보상법 공무원재해보상심의회 또는 산업재해보상 보험법 결정에 따름</li>
            <li class="mt-2">가입자가 보험 가입기간 중에 사망한 경우 계약기간 종료 후 순직이 결정되어도 순직사망 보험금을 지급함</li>
            <li class="mt-2">공무원/비공무원 보험료는 차등하지 않음(단, 경찰공무원, 소방공무원은 별도)</li>            
          </ul>
        </dd>
        
      </dl>
        
    </li>
 </ul> 
</div>.`
  },
  IL0017: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
      <h5><b class="text-black">배우자_암 진단비:</b> 기관 선택시 소속기관 직원 필수 가입 </h5>
    <div class="row mt-3">  
      <dl>
        <dt class="mb-2 fs-6">가입금액</dt>
        <dd>
          <ul>  
            <li>2천만원</li>  
          </ul>
        </dd>
        <dt class="mb-2 fs-6">보장내용</dt>
        <dd>
          <ul>
            <li class="mt-2">(암 진단)확정 시(최초 1회에 한함) 아래 보험금 지급 비율에 따라 보장
            <div class="row p-0 rounded-3 overflow-hidden mb-0">
              <table class="table table-bordered table-sm table-striped table-hover mb-0 pb-0">
              <caption class="sr-only d-none">보험금 지급비율</caption>
              <thead class="table-info text-center">
                <th scope="col">구분</th>
                <th scope="col">지급비율</th>
              </thead>
              <tbody>
                <tr>
                  <td>일반 암</td>
                  <td>가입금액 보장</td>
                </tr>
                <tr>
                  <td>갑상선암, 경계성 종양</td>
                  <td>가입금액의 30%</td>
                </tr>
                <tr>
                  <td>제자리암(상피내암), 기타피부암</td>
                  <td>가입금액의 10%</td>
                </tr>            
              </tbody>
            </table>
            </div>
            <div class="mt-0"><small><b>※ 전이암 재발암은 보장하지 않으며, 면책 일(日)수 없음</small></b></div>
            </li>
          </ul>
          
        </dd> 
      </dl>
    </div>
</div>.`
  },
  IL0033: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
  <h5><b class="text-black">배우자 생명/상해:</b> 기관 선택 시 소속기관 직원 필수가입</h5>
 <div class="row mt-3">
    <dl>  
      <dt class="mb-2 fs-6">가입금액</dt>
      <dd>
        <ul>
          <li>1억원</li>
        </ul>
      </dd>
      <dt>보장내용</dt>
      <dd>
        <ul>
          <li>기왕증자 현증자 보장 및 타제도에 의한 보상과 관계없이 중복 보상
              <ul class="py-1" style="padding-left: 1em">
                <li class="pb-2">상해 사망(상해 80%이상 고도 후유장해 포함) 시: 가입금액 보장</li>
                <li class="pb-2">질병 사망(질병 80%이상 고도 후유장해 포함) 시: 가입금액 보장</li>
                <li class="pb-2">상해&middot;질병으로 인한 후유장해(3%~79%) 발생시: 가입금액 X 지급율(3%~79%)</li>
              </ul>
            </ul>
          </li>
      </dd>
  </dl>
  </div>
</div>.`
  },
  IL0034: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container mt-3">
<h5><b class="text-black">배우자 의료비 보장:</b> 소속기관에서 해당 상품을 선택한 경우, 가입여부 선택 가능 </h5>
<div class="row mt-3">
    <dl>
      <dt>가입금액 및 보장내용</dt>
      <dd>
      <div class="row mt-3 ms-1 p-0 rounded-3 overflow-hidden">
    <table class="table table-bordered table-sm table-striped table-hover">
      <caption class="sr-only d-none">가입금액 및 보장내용</caption>
      <colgroup>
      <col>
      <col>
      <col style="width: 4em">
      </colgroup>
      <thead class="table-info  rounded-top">
        <th colspan="2" scope="col" class="text-center">보장범위</th>
        <th scope="col" class="text-center">대상</th>
      </thead>
      <tbody>
        <tr>
          <th rowspan="2" scope="row" class="align-middle text-center">급여</th>
          <td>상해 3천만원(통원 1회당 15만원)</td>
          <td rowspan="7" class="align-middle">직원<br>배우자<br>자녀</td>
        </tr>
        <tr>
          <td>질병 3천만원(통원 1회당 15만원)</td>
        </tr>
        <tr>
          <th rowspan="2" scope="row" class="align-middle text-center">비급여</th>
          <td>상해 3천만원(통원 1회당 15만원, 100회 限)</td>
        </tr>
        <tr>
          <td>질병 3천만원(통원 1회당 15만원, 100회 限)</td>
        </tr>
        <tr>
          <th rowspan="3" scope="row" class="align-middle text-center">3대 비급여 특약</th>
          <td>비급여 도수치료 등(350만원, 50회 限)</td>
        </tr>
        <tr>
          <td>비급여 주사료 등(250만원, 50회 限)</td>
        </tr>
        <tr>
          <td>비급여 자기공명영상진단(300만원)</td>
        </tr>
      </tbody>
    </table>
    </div>
      </dd>
  </dl>
  </div>
</div>.`
  },
  IL0035: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
<h5><b class="text-black">자녀 의료비 보장:</b> 소속기관에서 해당 상품을 선택한 경우, 가입여부 선택 가능 </h5>
 <div class="row mt-3">
    <dl>
      <dt class="my-2 fs-6">가입금액 및 보장내용</dt>
      <dd>
      <div class="row mt-1 p-0 rounded-3 overflow-hidden">
    <table class="table table-bordered table-sm table-striped table-hover">
      <caption class="sr-only d-none">가입금액 및 보장내용</caption>
      <colgroup>
        <col>
        <col>
      </colgroup>
      <thead class="table-info  rounded-top">
        <th colspan="2" scope="col" class="text-center">보장범위</th>
      </thead>
      <tbody>
        <tr>
          <th rowspan="2" scope="row" class="align-middle text-center">급여</th>
          <td>상해 3천만원(통원 1회당 15만원)</td>
        </tr>
        <tr>
          <td>질병 3천만원(통원 1회당 15만원)</td>
        </tr>
        <tr>
          <th rowspan="2" scope="row" class="align-middle text-center">비급여</th>
          <td>상해 3천만원(통원 1회당 15만원, 100회 限)</td>
        </tr>
        <tr>
          <td>질병 3천만원(통원 1회당 15만원, 100회 限)</td>
        </tr>
        <tr>
          <th rowspan="3" scope="row" class="align-middle text-center">3대 비급여 특약</th>
          <td>비급여 도수치료 등(350만원, 50회 限)</td>
        </tr>
        <tr>
          <td>비급여 주사료 등(250만원, 50회 限)</td>
        </tr>
        <tr>
          <td>비급여 자기공명영상진단(300만원)</td>
        </tr>
      </tbody>
    </table>
    </div>
      </dd>
  </dl>
  </div>
</div>.`
  },
  IL0036: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
<h5><b class="text-black">대상포진 진단비:</b> 기관 선택시 개인이 가입여부 선택 가능</h5>
      <dl class="mt-3">
        <dt class="mb-2 fs-6">가입금액</dt>
        <dd>
          <ul>
            <li>1백만원</li>
          </ul>
        </dd>
        <dt class="mb-2 fs-6">보장내용</dt>
        <dd>
          <ul>
            <li class="mt-2">대상포진 진단 확정 시 가입금액 보장
              <div class="mt-0"><small><b>※ 보험기간 중 진단된 경우에 한함(최초 1회 진단만 보장하며, 재진단은 보장하지 않음</small></b></div>
            </li>            
          </ul>
        </dd> 
</div>`
  },
  IL0039: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
<h5><b class="text-black">수술비 및 입원비:</b> 기관 선택시 개인이 가입여부 선택 가능</h5>

  <h5 class="fw-bold text-black mt-4 mb-2">입원일당 보장보험</h5>
  <div class="border border-secondary-subtle rounded p-2">
    <dl>
      <dt class="m-2 fs-6">가입금액</dt>
      <dd>
        <ul>  
          <li>1일당 3만원<small>(입원 1일부터 지급, 180일 한도)</small></li>  
        </ul>
      </dd>
    </dl>
    <dl>
      <dt class="m-2 fs-6">보장내용</dt>
      <dd>
        <ul>  
          <li>상해 또는 질병(임신, 출산, 치과질환 제외)으로 입원 시 입원 1일당 가입금액 지급 </li>  
        </ul>
      </dd>
    </dl>
  </div>

 <h5 class="fw-bold text-black mt-4 mb-2">수술비 보험</h5>
 <div class="border border-secondary-subtle rounded p-2">
    <dl>
      <dt class="m-2 fs-6">가입금액</dt>
      <dd>
        <ul>  
          <li>50만원</li>  
        </ul>
      </dd>
    </dl>
    <dl>
      <dt class="m-2 fs-6">보장내용</dt>
      <dd>
        <ul>  
          <li>가입기간 중 진단확정 된 질병 또는 상해의 치료를 직접적인 목적으로 '수술분류표'에서 정하는 수술을 받은경우 1회당 가입금액 지급</li>  
        </ul> 
      </dd>
    </dl>
 </div>
</div>.`
  },
  IL0040: {
    title: '보험상품 선택시 보장내용 및 유의 사항',
    content: `<div class="container">
  <h5><b class="text-black">치아보험:</b> 기관 선택 시 소속기관 직원 필수 가입</h5>
 <div class="row mt-3">
      <dl>
        <dt>가입금액 및 보장내용</dt>
        <dd>
          <div class="row mt-3 ms-1 p-0 rounded-3 overflow-hidden">
           <table class="table table-bordered table-sm table-striped table-hover">
              <caption class="sr-only d-none">가입금액 및 보장내용</caption>
              <colgroup class="align-middle">
                <col style="min-width: 66px">
                <col>
                <col style="min-width: 55px">
                <col style="min-width: 55px">
                <col style="min-width: 40px">
              </colgroup>
              <thead class="table-info text-center align-middle">
                <th scope="col" colspan="2">보장항목</th>
                <th scope="col"><small>보장형태</small></th>
                <th scope="col"><small>보장금액</smll></th>
                <th scope="col">한도</th>
              </thead>
              <tbody class="align-middle text-center">
                <tr>
                  <th scope="row">보존치료</th>
                  <td class="text-start">크라운, 인레이, 온레이, 레진<br>
                    <small>(아말감 등 급여항목 제외)</small>
                  </td>
                  <td>정액</td>
                  <td>5만원</td>
                  <td class="p-0 p-md-2"><small>연 3개</small></td>
                </tr>
                <tr>
                  <th scope="row" rowspan="3">보철치료</th>
                  <td class="text-start">가철성의치(틀니)</td>
                  <td>정액</td>
                  <td>30만원</td>
                  <td class="p-0 p-md-2"><small>연 1개</small></td>
                </tr>
                <tr>
                  <td class="text-start">고정성가공의치(브릿지)</td>
                  <td>정액</td>
                  <td>30만원</td>
                  <td class="p-0 p-md-2"><small>연 3개</small></td>
                </tr>
                <tr>
                  <td class="text-start">임플란트</td>
                  <td>정액</td>
                  <td>30만원</td>
                  <td class="p-0 p-md-2"><small>연 3개</small></td>
                </tr> 
              </tbody>
            </table>
            </div>
            <div class="mt-0"><small><b>※ 치아마모(k03) 보장 포함하며, 가입일부터 보장 개시</small></b></div>
        </dd>
      </dl>
  </div>
</div>.`
  },
};


const privacyNotice = {

  step0: {
    title: '【보험선택 후 변경 불가 안내】',
    content: (bseYr) => `
        <div class="container mt-3">
          <ul style="padding-left: 1em;">   
            <li>${bseYr}년도 보험은 보험선택 기간이 지나면 선택결과를 변경할 수 없으니, <mark>반드시 기간 내에 보험선택을 완료</mark>하여 주시기 바랍니다.</li>             
            <li class="fw-bold">기간 내에 보험을 선택하지 않은 경우에는 <dfn><a href="#g1">공무원후생복지에 관한 규정 제7조제5항 <sup>[1]</sup></a></dfn>에 따라 기관최저보장보험(기본보험)으로 가입됩니다.<br>
              <hr>
              <blockquote id="g1"><abbr title="공무원후생복지에 관한 규정 제7조제5항">[1]</abbr> 운영기관의 장은 소속공무원이 지정한 기간내에 기본항목 및 이에 따른 선택안을 선택하지 아니하는 때에는 최저수준에 해당하는 선택안을 선택한 것으로 보아 처리할 수 있다.</blockquote>
            </li>
          </ul> 
        </div>
    <div class="mt-2 fw-bold text-center">
        관련 내용을 숙지하였습니다.
    </div>
    <div class="mt-3 text-center" id="offcanvasFooter"></div>
</div>`,
  },

  step1: {
    title: '【개인정보의 수집・이용 및 제3자 제공에 대한 동의서】',
    content: () => `<div class="container">
            <h5>공무원연금공단은 재직자 단체보험 운영과 관련하여 아래와 같이 개인 정보를 수집・이용 및 제3자 제공하고자 하오니 확인 후 동의 여부를 결정하여 주십시오.</h5>

            <div class="form-check form-switch form-check-reverse px-5 py-3 me-4 fs-4 fw-bold">
                <label for="agreeAll" class="form-check-label">전체동의</label>
                <input type="checkbox" id="agreeAll" class="form-check-input form-control-md focus-ring" role="switch" autofocus
                    
                    onchange="((check)=>{
                      
                      let btnPrivacy = document.querySelector('#btnPrivacy');
                      
console.log('btnPrivacy', btnPrivacy)                      
                      
                      if(check.checked){
                        
                        check.classList.remove('is-invalid');
                        check.classList.add('is-valid');
                        
                        // 동의 버튼 다 켜기
                        document.querySelectorAll('input[type=checkbox][name=checkAgree]').forEach(el=>{
                            if(!el.checked)el.click();
                        });
                        
                        // 확인 버튼 활성화
                        btnPrivacy.classList.remove('disabled');
                        btnPrivacy.disabled = false;
                        
                        btnPrivacy.focus();
                        
                        btnPrivacy.scrollIntoView(true)
                      }else {
                                                  
                        check.classList.remove('is-valid');
                          
                        // 동의 버튼 다 끄기
                        document.querySelectorAll('input[type=checkbox][name=checkAgree]').forEach(el=>{
                            if(el.checked)el.click();
                        });
                        
                        // 확인 버튼 비 활성화
                        btnPrivacy.classList.add('disabled');
                        btnPrivacy.disabled = true;
                        
                      }
                  })(this)"/>
            </div>
                        
            <div class="mt-4">
              <h6 class="fw-bold text-dark">■ 개인정보 수집 및 이용에 관한 사항</h6>
              <div class="border border-primary rounded p-2 pe-3">
                <ul>
                  <li>개인정보 수집 및 이용목적</li>
                    <ul style="padding-left: 1em">
                      <li>공무원 단체보험 계약의 체결, 유지, 관리등에 관한 업무</li>
                    </ul>
                  <li>수집 및 이용 항목
                    <ul style="padding-left: 1em">
                      <li class="txid05"> 개인정보 : 성명, 휴대전화번호, 외국인등록번호</li>
                    </ul>
                  <li>보유기간
                    <ul style="padding-left: 1em">
                      <li class="fw-bold">보험기간 만료일로부터 5년 간</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div class="mt-1 fw-bold">
                <div>귀하는 개인정보 수집·이용 동의에 거절할 권리가 있습니다. 다만, 동의에 거절할 경우 단체보험에 가입할 수 없습니다.<br/>
                위와 같이 개인정보를 수집·이용하는 것에 동의하시겠습니까?</div>
                 <div class="form-check form-switch form-check-reverse px-5 py-3 me-4 fs-5">
                    <label for="agreeAll" class="form-check-label">동의</label>
                   <input type="checkbox" name="checkAgree" data-essYn="Y" class="form-check-input form-control-md is-invalid" role="switch"
                        onchange="((check)=>{
                          if(check.checked){
                            check.classList.remove('is-invalid');
                            check.classList.add('is-valid');
                          }else{
                            check.classList.remove('is-valid');
                            check.classList.add('is-invalid');
                          }
                            
                          // 동의 다 켜진 경우 전체 동의 켜기
                          const notCheck = Array.from(document.querySelectorAll('input[type=checkbox][name=checkAgree]:not(:checked)'));
                          const agreeAll = document.querySelector('#agreeAll');
                          
                          if(notCheck?.length){
                            agreeAll.checked = false;
                            const btnPrivacy = document.querySelector('#btnPrivacy');
                            
                            if(notCheck.find(el=>el.dataset.essyn==='Y')){
                              // 확인 버튼 비 활성화
                              btnPrivacy.classList.add('disabled');
                              btnPrivacy.disabled = true;
                            }else{
                              // 확인 버튼 비 활성화
                              btnPrivacy.classList.remove('disabled');
                              btnPrivacy.disabled = false;
                            }
                            
                          }else{
                            if(!agreeAll.checked) agreeAll.click();
                          }
                      })(this)"/>
                    <div class="invalid-feedback" style="font-size: 0.7em">동의하지 않을 경우 보험선택이 불가합니다.</div>
                </div>
            </div>
            
            <div class="mt-4">
                <h6 class="fw-bold text-dark">■ 개인정보(개인신용정보) 제3자 제공 및 활용에 관한 사항</h6>
                <div class="border border-primary rounded p-2 pe-3">
                    <table class="table table-bordered table-sm m-1">
                        <colgroup>
                            <col style="width: 8em" class="table-info">
                            <col>
                        </colgroup>
                        <tbody class="align-middle">
                            <tr>
                                <th scope="row" class="table-info">제공받는 자</th>
                                <td class="fw-bold">계약보험사</td>
                            </tr>
                            <tr>
                                <th scope="row" class="table-info">목적</th>
                                <td class="fw-bold">
                                · 보험가입대상확인<br>
                                · 보험 상담<br>
                                · 보험금지급<br>
                                · 본인 실손가입여부 조회
                              </td>
                            </tr>
                            <tr>
                                <th scope="row" class="table-info">제공하는 항목</th>
                                <td class="fw-bold">· 성명, 외국인등록번호</td>
                            </tr>
                            <tr>
                                <th scope="row" class="table-info">보유기간</th>
                                <td class="fw-bold">보험기간 만료일로부터 5년간</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="mt-1 fw-bold">
                <div>귀하는 개인정보를 제3자에게 제공하는 것에 거절할 권리가 있습니다. 다만, 동의에 거절할 경우 단체보험에 가입할 수 없습니다.
                  <br />위와 같이 개인정보를 제3자에게 제공하는 것에 동의하시겠습니까?
                </div>
                 <div class="form-check form-switch form-check-reverse px-5 py-3 me-4 fs-5">
                    <label for="agreeAll" class="form-check-label">동의</label>
                    <input type="checkbox" name="checkAgree" data-essYn="Y" class="form-check-input form-control-md is-invalid" role="switch"
                       onchange="((check)=>{
                          if(check.checked){
                            check.classList.remove('is-invalid');
                            check.classList.add('is-valid');
                          }else{
                            check.classList.remove('is-valid');
                            check.classList.add('is-invalid');
                          }
                            
                          // 동의 다 켜진 경우 전체 동의 켜기
                          const notCheck = Array.from(document.querySelectorAll('input[type=checkbox][name=checkAgree]:not(:checked)'));
                          const agreeAll = document.querySelector('#agreeAll');
                          
                          if(notCheck?.length){
                            agreeAll.checked = false;
                            const btnPrivacy = document.querySelector('#btnPrivacy');
                            
                            if(notCheck.find(el=>el.dataset.essyn==='Y')){
                              // 확인 버튼 비 활성화
                              btnPrivacy.classList.add('disabled');
                              btnPrivacy.disabled = true;
                            }else{
                              // 확인 버튼 비 활성화
                              btnPrivacy.classList.remove('disabled');
                              btnPrivacy.disabled = false;
                            }
                            
                          }else{
                            if(!agreeAll.checked) agreeAll.click();
                          }
                      })(this)"/>
                    <div class="invalid-feedback" style="font-size: 0.7em">동의하지 않을 경우 보험선택이 불가합니다.</div>
                </div>
            </div>

<div class="mt-4">
              <h6 class="fw-bold text-dark">■ 민감정보 수집 및 이용에 관한 사항</h6>
              <div class="border border-primary rounded p-2 pe-3">
                <ul>
                  <li>수집 및 이용 목적</li>
                    <ul style="padding-left: 1em">
                      <li>단체보험 계약 시 장애 관련사항에 관한 업무</li>
                    </ul>
                  <li>수집 및 이용 항목
                    <ul style="padding-left: 1em">
                      <li class="fw-bold"> 민감정보 : 장애증명 관련 복지카드, 장애인 증명서의 개인식별정보(장애정도, 장애등급, 장애내용)</li>
                    </ul>
                  <li>보유기간
                    <ul style="padding-left: 1em">
                      <li>보험기간 만료일로부터 5년 간</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
            <div class="mt-1 fw-bold">
                <div>귀하는 민감정보 수집·이용 동의에 거절할 권리가 있습니다. 다만, 동의에 거절할 경우 단체보험 가입에 제한이 있을 수 있습니다.
                  <br />위와 같이 민감정보를 수집·이용하는 것에 동의하시겠습니까?
                </div>
                 <div class="form-check form-switch form-check-reverse px-5 py-3 me-4 fs-5">
                    <label for="agreeAll" class="form-check-label">동의</label>
                   <input type="checkbox" name="checkAgree" data-essYn="N" class="form-check-input form-control-md is-invalid" role="switch"
                         onchange="((check)=>{
                          if(check.checked){
                            check.classList.remove('is-invalid');
                            check.classList.add('is-valid');
                          }else{
                            check.classList.remove('is-valid');
                            check.classList.add('is-invalid');
                          }
                            
                         // 동의 다 켜진 경우 전체 동의 켜기
                          const notCheck = Array.from(document.querySelectorAll('input[type=checkbox][name=checkAgree]:not(:checked)'));
                          const agreeAll = document.querySelector('#agreeAll');
                          
                          if(notCheck?.length){
                            agreeAll.checked = false;
                            const btnPrivacy = document.querySelector('#btnPrivacy');
                            
                            if(notCheck.find(el=>el.dataset.essyn==='Y')){
                              // 확인 버튼 비 활성화
                              btnPrivacy.classList.add('disabled');
                              btnPrivacy.disabled = true;
                            }else{
                              // 확인 버튼 비 활성화
                              btnPrivacy.classList.remove('disabled');
                              btnPrivacy.disabled = false;
                            }
                            
                          }else{
                            if(!agreeAll.checked) agreeAll.click();
                          }
                      })(this)"/>
                    <!--<div class="invalid-feedback" style="font-size: 0.7em">동의하지 않을 경우 보험선택이 불가합니다.</div>-->
                </div>
            </div>
            
            <div class="mt-4">
              <h6 class="fw-bold text-dark">■ 기타 고지사항</h6>
              <div class="border border-primary rounded p-2 pe-3">
                <div class="fw-bold">개인정보보호법 제24조의2에 따라 정보주체의 동의 없이 개인정보를 수집 이용 및 제3자에게 제공합니다.</div>
                <li class="mt-3 mb-1">고유식별정보 수집 및 이용에 관한 사항</li>
                <div>
                  <table class="table table-bordered table-sm m-1">
                    <colgroup>
                      <col style="width: 8em" class="table-info">
                      <col>
                    </colgroup>
                    <tbody class="align-middle">
                      <tr>
                        <th scope="row" class="table-info">수집 이용항목</th>
                        <td class="fw-bold">주민등록번호</td>
                      </tr>
                      <tr>
                        <th scope="row" class="table-info">수집 이용 목적</th>
                        <td class="fw-bold">
                          공무원 단체보험 계약의 체결, 유지, 관리등에 관한 업무
                        </td>
                      </tr>
                      <tr>
                          <th scope="row" class="table-info">수집 이용 근거</th>
                          <td class="fw-bold">
                            공무원연금법시행령 제96조<br>
                            보험업법시행령 제102조
                          </td>
                      </tr>
                      <tr>
                          <th scope="row" class="table-info">보유기간</th>
                          <td class="fw-bold">보험기간 만료일로부터 5년간</td>
                      </tr>
                    </tbody>
                  </table>                
                </div>
                <li class="mt-3 mb-1">고유식별정보 제3자 제공내역</li>
                <div>
                  <table class="table table-bordered table-sm m-1">
                    <colgroup>
                      <col style="width: 7em" class="table-info">
                      <col>
                    </colgroup>
                    <tbody class="align-middle">
                      <tr>
                        <th scope="row" class="table-info">제공받는자</th>
                        <td class="fw-bold">계약보험사</td>
                      </tr>
                      <tr>
                        <th scope="row" class="table-info">제공목적</th>
                        <td class="fw-bold">
                          공무원 단체보험 계약의 체결, 유지, 관리에 등에 관한 업무
                        </td>
                      </tr>
                      <tr>
                          <th scope="row" class="table-info">제공항목</th>
                          <td class="fw-bold">
                            주민등록번호
                          </td>
                      </tr>
                      <tr>
                          <th scope="row" class="table-info">제공근거</th>
                          <td class="fw-bold">보험업법시행령 제102조</td>
                      </tr>
                      <tr>
                          <th scope="row" class="table-info">보유기간</th>
                          <td class="fw-bold">보험기간 만료일로부터 5년간</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                                  
              </div>
            </div>
                        
          </div>
         <div class="mt-3 text-center" id="offcanvasFooter"></div>`
  },



  step2: {
    title: '【개인 의료비 보장(실손)과 단체 의료비 보장(실손) 중복가입 해소 방안 안내】',
    content: () => `<div class="mt-3">
            <ol style="padding-left: 1em;max-width: 1000px">
            <!--1-->
              <li class="mt-4"> 
               <dl>
                <dt>개인 의료비 보장(실손) 중지</dt>
                <dd>재직중에는 개인 의료비 보장(실손) 보험을 중지하고, 단체 의료비 보장(실손) 보험에 가입했다가 퇴직 후 개인 의료비 보장(실손) 보험을 재개하는 방법</dd>
               </dl> 
               <div class="border border-primary-subtle p-2 p-md-4 rounded-3">
<table class="table table-sm table-bordered table-hover table-striped rounded-2">
  <caption class="sr-only d-none">개인 의료비 보장(실손) 중지 안내</caption>
  <colgroup>
    <col style="width: 3em" >
    <col style="width: 6em">
    <col class="p-1 p-md-2">
  </colgroup>
  <thead class="table-info text-center">
    <tr>
      <th scope="col" colspan="2">구분</th>
      <th scope="col">세부기준</th>
    </tr>
  </thead>
  <tbody class="align-middle">
    <tr>
      <th scope="row" class="text-center" rowspan="2" style="border-bottom: 3px solid var(--bs-border-color)">중지</th>
      <td class="text-center">신청방법</td>
      <td>본인이 개인 의료비 보장(실손)에 가입한 보험사에 직접 신청
  <blockquote>*중지 신청일로부터 15일 이내 중지 철회 가능</blockquote> </td>
    </tr>
    <tr>
      <td class="text-center" style="border-bottom: 3px solid var(--bs-border-color)">신청조건</td>
      <td style="border-bottom: 3px solid var(--bs-border-color)">개인 의료비 보장(실손) 가입 후 1년 이상 유지한 계약에 한하여 단체 의료비 보장(실손)과 중복되는 개인 의료비 보장(실손) 항목만 중지 가능 </td>
    </tr>
    <tr>
      <th scope="row" class="text-center" rowspan="4">재개</th>
      <td class="text-center">신청방법</td>
      <td>본인이 개인 의료비 보장(실손) 중지 신청했던 보험사에 직접 신청</td>
    </tr>
    <tr>
      <td class="text-center">재개조건</td>
      <td>단체 의료비 보장(실손) 종료 후 1개월 이내 신청 시 무심사 재개
        <blockquote>* 단, 개인 및 단체 의료비 보장(실손) 모두 미가입한 기간이 1회당 1개월, 누적 3월 초과 시 보험사 인수지침에 따라 재개가 거절될 수 있음</blockquote>
      </td>
    </tr>
    <tr>
      <td class="text-center">재개상품</td>
      <td>재개시점에 판매중인 상품 또는 개인 의료비 보장(실손) 중지 당시 본인이 가입한 상품 중 선택하여 재개 가능
        <blockquote> * 단, ’13.4월 이후 판매된 상품 등으로서 보장내용 변경주기(5~15년)가 경과하여 신규상품으로 재가입이 불가피한 경우에는 재개시점에 판매중인 상품으로 재개됨</blockquote>
      </td>
    </tr>
    <tr>
      <td class="text-center">재개불가</td>
      <td>주계약이 아닌 특약으로 가입한 개인 의료비 보장(실손) 중지 후 주계약을 해지하면 중지된 개인 의료비 보장(실손)도 같이 해지되어 재개 불가
      </td>
    </tr>
    
  </tbody>
</table>
              </div> 
             </li>
             <!--2-->
             <li class="mt-4"> 
               <dl>
                <dt>단체 의료비 보장(실손) 중지</dt>
                <dd>중복으로 신청한 단체 의료비 보장(실손) 보험을 일시적으로 중지하는 방법</dd>
               </dl> 
               <div class="border border-primary-subtle p-2 p-md-4 rounded-3">
<table class="table table-sm table-bordered table-hover table-striped rounded-2">
  <caption class="sr-only d-none">단체 의료비 보장(실손) 중지 안내</caption>
  <colgroup>
    <col style="width: 6em">
    <col class="p-1 p-md-2">
  </colgroup>
  <thead class="table-info text-center">
    <tr>
      <th scope="col">구분</th>
      <th scope="col">세부내용</th>
    </tr>
  </thead>
  <tbody class="align-middle">
    <tr>
      <th scope="row" class="text-center">신청방법</th>
      <td>맞춤형복지포털을 통해 개인이 직접 신청<br>
  <blockquote>* 개인 의료비 보장(실손) 보험 증빙서류 첨부 필수</blockquote> </td>
    </tr>
    <tr>
      <th scope="row" class="text-center">신청기간</th>
      <td>본인 재직기관의 맞춤형복지점수 배정 이후부터 11월 30일 까지
        <blockquote>* 단, 기관 사정에 따라 신청기간을 별도로 지정할 수 있음</blockquote></td>
    </tr>
    <tr>
      <th scope="row" class="text-center">중지적용</th>
      <td>중지 신청일부터 당해연도 12월 31일까지</td>
    </tr>
    <tr>
      <th scope="row" class="text-center">중지환급금</th>
      <td>중지신청일로부터 일할 계산하여 맞춤형복지점수로 환급 </td>
    </tr>
    <tr>
      <th scope="row" class="text-center">유의사항</th>
      <td>
        <ul>
        <li>중지신청 이후 취소 불가</li>
        <li>중지신청은 보험 계약기간(1년) 내 1회에 한 해 가능하며, 계약기간 내 재가입은 불가함(다음연도 가입은 가능)</li>
          <blockquote>* 중지신청 이후 신분변동(전출, 전입, 휴직, 복직 등)이 있어도 단체 의료비 보장(실손) 가입 불가</blockquote>
        </li>
        <li>임신 및 출산 등 예상 가능한 항목에 대해 보험금을 기 수령한 경우, 단체 의료비 보장(실손) 중지 불가(중지 신청 후 확인될 경우 중지취소 및 복지점수 환수)</li>
</ul>
        
      </td>
    </tr>
    
  </tbody>
</table>
              </div> 
             </li>
             
               <!--3-->
             <li class="mt-4">
               <dl>
                <dt>단체 의료비 보장(실손) 보험의 개인 의료비 보장(실손) 보험으로의 전환</dt>
                <dd>재직 중 단체 의료비 보장(실손) 보험에 가입한 경우 퇴직 후에 개인 의료비 보장(실손) 보험으로 전환하는 방법</dd>
               </dl> 
               <div class="border border-primary-subtle p-2 p-md-4 rounded-3">
<table class="table table-sm table-bordered table-hover table-striped rounded-2">
  <caption class="sr-only d-none">단체 의료비 보장(실손) 보험의 개인 의료비 보장(실손) 보험으로의 전환 안내</caption>
  <colgroup>
    <col style="width: 5em">
    <col class="p-1 p-md-2">
  </colgroup>
  <thead class="table-info text-center">
    <tr>
      <th scope="col">구분</th>
      <th scope="col">세부내용</th>
    </tr>
  </thead>
  <tbody class="align-middle">
    <tr>
      <th scope="row" class="text-center">전환대상</th>
      <td>전환신청 전 5년간 계속하여 단체 의료비 보장(실손) 보험을 가입한 사람 중 개인 의료비 보장(실손) 보험에 가입 가능한 자(65세 이하)<br>
  <blockquote>* 단, 단체 의료비 보장(실손) 보험 미가입 기간이 1회당 1개월, 누적 3개월 이내인 경우에는 계속하여 가입한 것으로 인정</blockquote> </td>
    </tr>
    <tr>
      <th scope="row" class="text-center">신청방법</th>
      <td>개인이 퇴직 등으로 단체 의료비 보장(실손) 보험 종료 후 1개월 이내, 직전 단체 의료비 보장(실손) 보험 가입 보험사에 직접 신청</td>
    </tr>
    <tr>
      <th scope="row" class="text-center">전환심사</th>
      <td>직전 5년간 단체 의료비 보장(실손) 보험금을 200만원 이하로 수령하고, 10대 중대질환(암, 백혈병, 고혈압, 협심증, 심근경색, 심장판막증, 간경화증, 뇌졸중증, 당뇨병, 에이즈) 치료 이력이 없는 경우 무심사 전환. 해당사항이 있을 경우 보험사에서 전환 가능여부 확인을 위한 심사 필요</td>
    </tr>
    <tr>
      <th scope="row" class="text-center">전환상품</th>
      <td>전환시점에 해당 보험회사가 판매중인 개인 의료비 보장(실손) 보험으로 전환되고, <span class="text-decoration-underline"> &middot;보장종목 &middot;보장금액 &middot;자기부담금</span> 등의 세부 조건은 전환 직전 단체 의료비 보장(실손) 보험과 동일 또는 유사하게 적용
        <blockquote>* 전환 시 보장종목 추가, 보장금액 증액 등을 요청하면 보험회사의 인수 심사를 거쳐 보장확대 여부 결정</blockquote>
       </td>
    </tr>   
        
  </tbody>
</table>
              </div> 
             </li>
</ol>
</div>
</div>
    <div class="mt-2 fw-bold text-center">
        관련 내용을 숙지하였습니다.
    </div>
    <div class="mt-3 text-center" id="offcanvasFooter"></div>`,
  },


}; // end of privacy


export {notice, privacyNotice}
