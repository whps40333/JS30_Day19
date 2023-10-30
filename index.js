const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");
const ckRedEffect = document.querySelector(".controls [name=redEffect]");
const ckScreenSplit = document.querySelector(".controls [name=rgbSplit]");
const ckGreenScreen = document.querySelector(".controls [name=greenScreen]");

/**
 * 啟動 webcam
 */
function getVideo() {
  // 取得user的視訊裝置
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    // 把回傳的 MediaStream 寫進 html 的 video tag 中並播放
    .then((localMediaStream) => {
      //console.log(localMediaStream);
      video.src = window.URL.createObjectURL(localMediaStream);
      video.play();
    })
    .catch((err) => {
      console.error(`OH NO!!!`, err);
    });
}

// function getVideo(){
//   navigator.mediaDevices
//   .getUserMedia({video:true, audio:false})
//   .then(localMediaStream =>{
//     video.src = window.URL.createObjectURL(localMediaStream);
//     video.play();
//   })
//   .catch(
//     err=>{
//       console.error(`OH NO!!!`,err);
//     }
//   )
// }

/**
 * 將 webcam 拍攝影像繪製到 canvas 上
 */
function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  // const width = video.videoWidth;
  // const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;
  // canvas.width = width;
  // canvas.height = height;
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // ctx.drawImage(video, 0, 0, width, height);

    // take the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);
    // let pixels = ctx.getImageData(0,0,width,height);
    //console.log(pixels);

    // mess with them
    if (ckRedEffect.checked) pixels = redEffect(pixels);
    // if(ckRedEffect.checked) pixels = redEffect(pixels);

    if (ckScreenSplit.checked) pixels = rgbSplit(pixels);
    // if(ckScreenSplit.checked) pixels = rgbSplit(pixels);

    // globalAlpha 透明度
    //ctx.globalAlpha = 0.5;
    if (ckGreenScreen.checked) pixels = greenScreen(pixels);
    // if(ckGreenScreen.checked) pixels = greenScreen(pixels);

    // 重置分割畫面
    ctx.putImageData(pixels, 0, 0);
    // ctx.putImageData(pixels,0 ,0);
  }, 16);
}

/**
 * 攝像頭截圖
 */
function takePhoto() {
  // played the sound
  snap.currentTime = 0;
  snap.play();

  // snap.currentTime = 0;
  // snap.play();

  // take the data out of the canvas
  const data = canvas.toDataURL("image/jpeg");
  // const data = canvas.toDataURL("image/jpeg");
  const link = document.createElement("a");
  // const link = document.createElement("a");
  // 設置連結位置為轉圖檔後的base64位置
  link.href = data;
  // link.herf = data;
  // 設置連結為下載並設定預設下載檔名
  link.setAttribute("download", "handsome");
  // link.setAttribute("download","handsome");
  link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  // link.innerHTML = `<img src="${data}" alt="Handsome Man" />`;
  // strip.firsChild 永遠為 null 因為 strip 為 const 所以無法得到最新的資料
  strip.insertBefore(link, null);
  // strip.insertBefore(link,null);
}

/**
 * 紅色濾鏡效果
 * @param {*} pixels
 */
function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  }
  // for(let i=0; i<pixels.data.length;i+=4){
  //   pixels.data[i + 0] = pixels.data[i + 0] + 200; // RED
  //   pixels.data[i + 1] = pixels.data[i + 1] - 50; // GREEN
  //   pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // Blue
  // }
  return pixels;
}

/**
 * 畫面分割
 * @param {*} pixels
 */
function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // RED
    pixels.data[i + 500] = pixels.data[i + 1]; // GREEN
    pixels.data[i - 550] = pixels.data[i + 2]; // Blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener("canplay", paintToCanvas);
