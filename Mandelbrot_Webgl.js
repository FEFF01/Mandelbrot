document.documentElement.style.cssText =
  "width:100%;height:100%;overflow:auto;";
document.body.style.cssText = "margin:0;overflow:hidden;min-height:100%;";
let canvas = document.createElement("canvas");
canvas.className = "main-scene";
canvas.style.cssText = "position:absolute;width:100%;height:100%;";
document.body.appendChild(canvas);

function createProgram(gl, vshader, fshader) {
  let program = gl.createProgram();
  let vertexShader = gl.createShader(gl.VERTEX_SHADER);
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(vertexShader, vshader);
  gl.shaderSource(fragmentShader, fshader);
  gl.compileShader(vertexShader);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}

(() => {
  let gl = canvas.getContext("webgl");
  let program = createProgram(
    gl,
    mb_vertex_shader.innerHTML,
    mb_fragment_shader.innerHTML
  );
  gl.useProgram(program);
  let position_lLocation = gl.getAttribLocation(program, "v2_position");
  let buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1, -1]),
    gl.STATIC_DRAW
  );
  gl.vertexAttribPointer(position_lLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(position_lLocation);

  let zoom_factor = gl.getUniformLocation(program, "v2_zoom");
  let center_point = gl.getUniformLocation(program, "v2_center");
  //gl.uniform2fv(center_point,new Float64Array([-1.25,0.004]));
  gl.uniform2fv(center_point, new Float64Array([-1.25, 0.004]));
  let width, height;

  let zoom = 1;
  (window.onresize = () => {
    width = canvas.width = canvas.clientWidth * 4;
    height = canvas.height = canvas.clientHeight * 4;
    gl.viewport(0, 0, width, height);
    gl.uniform2fv(
      zoom_factor,
      new Float64Array([
        Math.max(width / height, 1) * 2 * zoom,
        Math.max(height / width, 1) * 2 * zoom
      ])
    );
    /*gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);*/
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  })();
})();
