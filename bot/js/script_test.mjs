
export const unboxingToken = (token, TgrInfo, Question)=>{

  const myData = JSON.parse(pako.inflate(base64ToByte(token), {to: 'string'}));

console.log(myData)

  const pseInfo = new TgrInfo(myData.pseInfo.pseFnm, myData.pseInfo.pseRrno, myData.pseInfo.wlfInstCd, myData.pseInfo.instNm, myData.pseInfo.sxClCd, myData.pseInfo.pseAg);

  const {wlfInst} = myData;

  const questions = myData.rtnList.map(d => new Question(d.isrPrdNm,
    `${d.isrPrdNm} 보험을 선택해 주세요`
    , [...d.dtlCdList.map(dd => ({
      'text': dd.isrDtlNm,
      getSbcAmt: (sxClCd) => sxClCd === '1' ? dd.mIsrSbcAmt : dd.fIsrSbcAmt,
      pseInfo: pseInfo
    }))]
    , d));
  const breadCurmbs = myData.rtnList.map(d => d.isrPrdNm);

  return {pseInfo, questions, breadCurmbs, wlfInst}

}