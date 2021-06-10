uniform vec2 px;
varying vec2 vUv;

precision highp float;

void main(){
    vUv = vec2(0.5)+(position.xy)*0.5;
    gl_Position = vec4(position, 1.0);
}