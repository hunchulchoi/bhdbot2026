import {jest} from '@jest/globals'

//const {processor} = require('../script')
//const {processor} =  require("../script")
import {processor} from "../script";

describe('jest test', ()=>{

  const spy =  jest.fn(processor)

  it('test', ()=>{
    console.log(spy)
  })
})