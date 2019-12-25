function str2Blob(bstr, type) {
  var l = bstr.length,
    u8arr = new Uint8Array(l);
  while (l--) {
    u8arr[l] = bstr.charCodeAt(l);
  }
  return new Blob([u8arr], {
    type: type || "mime"
  });
}

document.documentElement.style.cssText =
  "width:100%;height:100%;overflow:auto;";
document.body.style.cssText = "margin:0;overflow:hidden;min-height:100%;";
let canvas = document.createElement("canvas");
canvas.className = "main-scene";
canvas.style.cssText = "position:absolute;width:100%;height:100%;";
document.body.appendChild(canvas);

(canvas => {
  let width = (canvas.width = canvas.clientWidth);
  let height = (canvas.height = canvas.clientHeight);
  let ctx = canvas.getContext("2d");
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  function get_color(cr, ci) {
    let zr = cr * cr - ci * ci + cr,
      zi = 2 * cr * ci + ci,
      lzr = cr,
      lzi = ci;
    let count = 1,
      max = 8192 / 8;
    let escape = 1,
      distance = (lzr - zr) ** 2 + (lzi - zi) ** 2 + Number.MIN_VALUE;
    for (; count < max; count++) {
      lzr = zr * zr - zi * zi + cr;
      lzi = 2 * zr * zi + ci;
      if (lzr * lzr + lzi * lzi > 4) {
        return -count;
      } 
      escape /=
        distance /
        (distance = (lzr - zr) ** 2 + (lzi - zi) ** 2 + Number.MIN_VALUE);
      zr = lzr;
      zi = lzi;
    }
    return escape * max;
  }
  function get_area(sr, si, w, h, grain) {
    let reslut = [];
    for (let cr = sr, _w = w; _w--; cr += grain) {
      for (let ci = si, _h = h; _h--; ci += grain) {
        reslut.push(get_color(cr, ci));
      }
    }
    return reslut;
  }
  let WORKER_URL = URL.createObjectURL(
    str2Blob(
      get_color.toString() +
      get_area.toString() +
      `onmessage = event => {
        let { sr, si, w, h, grain } = event.data;
        postMessage(get_area(sr, si, w, h, grain));
        };`,
      "JavaScript"
    )
  );
  function render(or, oi, scope, worker_count = 1) {
    let step = (scope * 2) / Math.min(width, height);
    let pw = (width / worker_count) | 0,
      ph = height;
    let _mx = 1 + Math.max(0, (width - height) / height),
      _my = 1 + Math.max(0, (height - width) / width);
    let pr = (scope * 2 * _mx) / worker_count,
      pl = scope * 2 * _my;
    let sr = or - scope * _mx,
      si = -oi - scope * _my;
    Promise.all(
      new Array(worker_count).fill(0).map(
        (val, index) =>
          new Promise((resolve, reject) => {
            let cx = 0 + pw * index,
              cy = 0;
            let worker = new Worker(WORKER_URL);
            worker.onmessage = ({ data }) => {
              //const image = ctx.createImageData(pw, py);
              for (let x = 0; x < pw; x++) {
                for (let y = 0; y < ph; y++) {
                  let value = data[x * ph + y];
                  ctx.fillStyle =
                    value < 0
                      ? `hsl(60,${(100 * Math.tanh(-value / 100)) | 0}%,60%)`
                      : `hsl(${(90 + 210 * Math.tanh(value / 900)) |
                      0},100%,50%)`;
                  //"#" + ((0x1000000 + Math.random() * 0xffffff) | 0).toString(16).slice(1)
                  ctx.fillRect(cx + x, cy + y, 1, 1);
                }
              }
              resolve();
            };
            worker.postMessage({
              sr: sr + pr * index,
              si,
              w: pw,
              h: ph,
              grain: step
            });
          })
      )
    ).finally(() => {
      console.log(333);
    });
  }
  //render(0, 0, 2, 16);
  //render(-1, 0, 2, 16);
  //render(-1.25000000036, 0.003998999387, 2 / 100000000000, 16); //2/10000000000000
  render(-0.098899819998929, 0.649000000899805, 2 / 10000000000000, 16); //2 / 80000000000000
  //render(0, 0, 2, 16);
  //render(-0.6, 0, 2, 16);
  //render(-0.098, 0.649, 0.009, 16);
  //render(-0.0988998, 0.649, 0.0000009, 16);
})(canvas);
