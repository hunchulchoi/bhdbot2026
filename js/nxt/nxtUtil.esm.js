import Pica from 'https://cdn.jsdelivr.net/npm/pica@9.0.1/+esm'


export default {

  /**
   * 주민번호 형식 체크
   * @param rrno {string}
   * @return {boolean}
   */
  validateSsn(rrno) {

    const ssnPattern = /^\d{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])([1-8])\d{6}$/;

    /* 유효한 날짜인지 체크해야 되는데 momemnts.js가 필요함
     if(ssnPattern.test(rrno)){
       const i7 = rrno.substring(6,7)

       let birthYear = Number(rrno.substring(0, 2));

       switch(i7){
         case '1', '2', '5', '6':
           birthYear += 1900;
         case '3', '4', '7', '8':
           birthYear += 2000;
       }
     }
     else return false;*/

    const b = ssnPattern.test(rrno);

    if (!b) console.error('validateSsn', rrno, '->', b)

    return b;
  },

  /**
   * 주민번호를 가지고 생년월일, 보험 나이와 성별을 계산한다.
   * 보험나이 기준연도 - 생년 - (생월이 6월 이후이면 1년을 더 빼줌 자녀인경우는 제외)
   * 주민번호가 falsy하거나 형식에 맞지 않는 경우 모든값이 undefined로 반환된다.
   * @param rrno {string} - 주민번호
   * @param [bseYr=new Date().getFullYear()] {string|number} - 기준연도
   * @param isChild {boolean=false} - 자녀여부
   * @return {{bornYear: number, tgrSxClCd: (string), tgrAg: number, birthday: string}}
   */
  calcSsn(rrno, bseYr = new Date().getFullYear(), isChild = false) {

    let bornYear, tgrSxClCd, tgrAg, birthday;

    if (!rrno || !this.validateSsn(rrno)) return { bornYear, tgrSxClCd, tgrAg, birthday };

    const typeNumber = rrno.substring(6, 7);
    bornYear = Number(rrno.substring(0, 2)) + (['1', '2', '5', '6'].includes(typeNumber) ? 1900 : 2000);
    const bornMonth = Number(rrno.substring(2, 4));

    tgrSxClCd = Number(typeNumber) % 2 ? '1' : '2';

    tgrAg = parseInt(bseYr)
      - bornYear
      - ((!isChild && bornMonth > 6) ? 1 : 0);

    birthday = `${bornYear}-${bornMonth}-${rrno.substring(4, 6)}`;

    return { bornYear, tgrSxClCd, tgrAg, birthday };
  },



  /**
   * 성명 형식 체크
   * 한글 2~23자 공백 허용 '한 글' '한 이름' 같이 앞에 한글자 + 공백 + 한글은 안됨
   * 영문 2~45자 공백 -'. 허용
   * @param name {string}
   * @return {boolean}
   */
  validateName: (name) => {
    //const namePattern = /^[가-힣 ]{2,25}|[a-zA-Z ]{2,45}$/
    const namePattern = /^(?! )(?!^[가-힣] [가-힣]+$)(?:[가-힣 ]{2,25}|[a-zA-Z-'. ]{2,45})(?<! )$/


    return namePattern.test(name);
  },

  /**
   * 핸드폰 번호 형식 체크
   * @param mobileNo {string} -  핸드폰 번호
   * @return {boolean}
   */
  validateMobileNum: (mobileNo) => {
    const ssnPattern = /^(01[016789]{1})-?\d{3,4}-?\d{4}$/

    return ssnPattern.test(mobileNo);
  },

  /**
   * 주민번호 뒷자리 마스크
   * 000000-1****** 혹은 000000-0000000
   * @param rrno {string} - 주민번호
   * @param [needMask=true] {boolean} - 뒷자리 마스크 할건지
   * @return {string} - 000000-1****** 혹은 000000-0000000
   */
  formatSsn(rrno, needMask = true) {

    if (!rrno) return '';

    rrno = rrno.replace(/\D/g, '');

    if (!this.validateSsn(rrno)) return rrno;

    return `${rrno.substring(0, 6)}-${needMask ? rrno.substring(6, 7) + '******' : rrno.substring(6)}`;
  },

  /**
   * 주민번호나 휴대폰 번호를 마스킴하고 언마스킹 아이콘과 함께 보여준다.
   * @param {Object} options - 옵션 객체
   * @param {string} options.valueObj   - 표시할 값(필수)
   * @param {'ssn'|'mobile'} [options.type='ssn']  - 식별자 타입 (기본값: 'ssn')
   * @param {'info'|'warning'|'danger'} [options.color='info']  - 색상 (기본값: 'info')
   * @param {string} [options.bi='eye']          - 아이콘 이름 (기본값: 'eye')
   * @param {number} [options.delay=2000]        - 지연 시간(ms) (기본값: 2000)
   * @return {HTML}
   */
  printMaskWithEyes({ valueObj, type = 'ssn', color = 'info', bi = 'eye', delay = 2000 }) {

    if (!valueObj || !`${valueObj}`) return '';

    console.log('valueObj', valueObj, (typeof valueObj), 'type', type, 'color', color, 'bi', bi, 'delay', delay)

    let mask, unmask, titleName;

    switch (type) {
      case "ssn":
        titleName = '주민번호'
        mask = `formatSsn(${valueObj}, true)`;
        unmask = `formatSsn(${valueObj}, false)`;
        break;
      case "mobile":
        titleName = '전화번호'
        mask = `formatMobileNo(${valueObj}, true)`;
        unmask = `formatMobileNo(${valueObj}, false)`;
    }

    return `
<div class="col" style="cursor:pointer" x-show="${valueObj}"
  @click.throttle="()=>{
//console.log($el)

      const _span = $el.querySelector('span.me-2')
      _span.classList.add('box')
      setTimeout(()=>{
          _span.innerText = ${unmask}
          _span.classList.add('in')
       }, 30)
      setTimeout(()=>{
          _span.classList.remove('box', 'in')
          _span.innerText = ${mask}
       }, ${delay})
    }">
    <span class="me-2" x-text="${mask}" style="font-family: Consolas, monospace, monospace"></span>
    <em class="bi bi-${bi} text-${color}" title="${titleName} 확인"></em>
</div>`;
  },

  getHashIdsHelper(token) {
    return new HashidsHelper(token);
  },

  /**
   * base64를 byte array롷
   * @param base64
   * @return {Uint8Array}
   */
  base64ToByte(base64) {
    return base64 && Uint8Array.from(atob(base64), m => m.codePointAt(0));
  },

  /**
   * 이미지 리사이즈 함수
   * @param {File} file - 원본 이미지 파일
   * @param {number} maxWidth - 최대 너비 (기본값: 1920)
   * @param {number} maxHeight - 최대 높이 (기본값: 1080)
   * @param {number} quality - 이미지 품질 (기본값: 0.8)
   * @return {Promise<File>} 리사이즈된 이미지 파일
   */
  async imageResize(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = async () => {
        try {
          // 원본 이미지 크기
          const { width: originalWidth, height: originalHeight } = img;

          // 리사이즈할 크기 계산 (비율 유지)
          let { width: newWidth, height: newHeight } = this.calculateAspectRatioFit(
            originalWidth,
            originalHeight,
            maxWidth,
            maxHeight
          );

          console.debug('originalWidth', originalWidth)

          // 원본 크기가 maxWidth, maxHeight보다 작으면 리사이즈하지 않음
          if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            resolve(file);
            return;
          }

          // 캔버스 크기 설정
          canvas.width = newWidth;
          canvas.height = newHeight;

          // pica 인스턴스 생성
          const picaInstance = new Pica();

          // 임시 캔버스에 원본 이미지 그리기
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = originalWidth;
          tempCanvas.height = originalHeight;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(img, 0, 0);

          console.debug('document', document)
          console.debug('tempCanvas', tempCanvas)
          console.debug('canvas', canvas)
          console.debug('pica', picaInstance)

          try {

            // pica를 사용하여 고품질 리사이즈
            const resizedCanvas = await picaInstance.resize(tempCanvas, canvas, {
              quality: 3, // pica 품질 설정 (1-3)
              alpha: true,
              unsharpAmount: 80,
              unsharpRadius: 0.6,
              unsharpThreshold: 2
            });

            console.debug('resizedCanvas', resizedCanvas)
          } catch (error) {
            console.error('error', error)
            console.debug('tempCanvas', tempCanvas)
            console.debug('canvas', canvas)
            console.debug('pica', picaInstance)
          }


          // 리사이즈된 이미지를 Blob으로 변환
          resizedCanvas.toBlob((blob) => {
            if (blob) {
              // 새로운 File 객체 생성
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('이미지 리사이즈 실패'));
            }
          }, file.type, quality);

        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * 비율을 유지하면서 크기 조정 계산
   * @param {number} srcWidth - 원본 너비
   * @param {number} srcHeight - 원본 높이
   * @param {number} maxWidth - 최대 너비
   * @param {number} maxHeight - 최대 높이
   * @return {{width: number, height: number}} 새로운 크기
   */
  calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
      width: Math.round(srcWidth * ratio),
      height: Math.round(srcHeight * ratio)
    };
  },

  async imagePreview(files, previewEL, needInfo = true) {
    previewEL.innerHTML = '';
    const processedFiles = [];

    for (const originalFile of files) {
      let fileToPreview = originalFile;
      try {
        if (originalFile.type.startsWith('image/')) {


          // pica를 사용한 이미지 리사이즈
          //fileToPreview = await this.imageResize(originalFile);

          const img = document.createElement('img');
          img.src = URL.createObjectURL(fileToPreview);
          img.title = `${fileToPreview.name} - ${readableKb(fileToPreview.size)}`;
          img.onload = () => {

            console.log('img', img)

            if (needInfo) {
              const infoDiv = document.createElement('div');
              infoDiv.classList.add('row', 'my-3', 'p-3', 'bg-info-subtle', 'rounded-2');
              infoDiv.innerHTML = `${fileToPreview.name} - ${readableKb(fileToPreview.size)}<br>크기: ${img.naturalWidth} X ${img.naturalHeight}`;
              previewEL.prepend(infoDiv);
            }
            URL.revokeObjectURL(img.src);
          };
          img.onerror = () => URL.revokeObjectURL(img.src);
          previewEL.appendChild(img);
        } else if (originalFile.type.endsWith('/pdf')) {
          const pdfDiv = document.createElement('div');
          pdfDiv.classList.add('row');
          pdfDiv.innerHTML = `<div class="col text-truncate"><span class="bi bi-file-pdf text-danger"></span>${originalFile.name}  - ${readableKb(originalFile.size)}</div>`;
          previewEL.appendChild(pdfDiv);
        } else {
          const otherDiv = document.createElement('div');
          otherDiv.classList.add('row');
          otherDiv.innerHTML = `<div class="row"><span class="bi bi-file-check text-success"></span>${originalFile.name}  - ${readableKb(originalFile.size)}</div>`;
          previewEL.appendChild(otherDiv);
        }
        processedFiles.push(fileToPreview);
      } catch (error) {
        console.error('Error processing file:', originalFile.name, error);
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('row', 'my-3', 'p-3', 'bg-danger-subtle', 'text-danger-emphasis', 'rounded-2');
        errorDiv.innerText = `${originalFile.name} 처리 중 오류 발생`;
        previewEL.appendChild(errorDiv);
        processedFiles.push(originalFile);
      }
    }
    return processedFiles;
  },

  sxClNm(sxClCd) {
    return sxClCd === '1' ? '남' : '여';
  },

}// end of export default



const readableKb = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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


