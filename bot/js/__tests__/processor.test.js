import {jest} from '@jest/globals'

jest.unstable_mockModule('../chat.js', ()=>({
  alertMessage: jest.fn(),
  chat: jest.fn(),
  confirmMessage: jest.fn(),
  customConfirmMessage: jest.fn(),
  Question: class Question {
    /**
     * @param short_title {string} - 짧은 제목
     * @param message {string} - 질문내용
     * @param options {QuestionOption} - 질문 옵션에 넣을 항목들
     * @param optionFunc {function} - 옵션 생성용 function
     * @param data {object} - 데이터
     * @param onRenderd {function?} - 채팅 창 생성후 실행할 함수
     *
     */
    constructor({short_title, message, options, optionFunc, data}) {
      this.short_title = short_title;
      this.message = message;
      this.options = options;
      this.optionFunc = optionFunc;
      this.data = data;
    }
  }
}))

const {processor}  = await import("../processor.js")

//const {processor} = require('../script')
//const {processor} =  require("../script")

console.log('bootstrap', bootstrap)


describe('자녀 보험 선택', ()=>{

  const spy =  jest.fn(processor)

  it('test', ()=>{
    console.log(spy)
  })

})