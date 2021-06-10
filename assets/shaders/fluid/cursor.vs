precision highp float;

//attribute vec3 position;
uniform vec2 center;
uniform vec2 px;
varying vec2 vUv;


void main(){
    vUv = clamp(position.xy+center, vec2(-1.0+px*2.0), vec2(1.0-px*2.0));
    gl_Position = vec4(vUv, 0.0, 1.0);
}
