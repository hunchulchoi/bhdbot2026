

test("hashidsHelper test", ()=>{
  const hashidsHelper = new HashidsHelper("12345");
  
  console.log("7711112111111", hashidsHelper.encode("7711112111111"))
  console.log("9911112111111", hashidsHelper.encode("9911112111111"))
  console.log("0611113111111", hashidsHelper.encode("0611113111111"))
  console.log("0911113111111", hashidsHelper.encode("0911113111111"))
})
