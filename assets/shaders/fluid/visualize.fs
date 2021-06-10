precision highp float;
uniform sampler2D velocity;
uniform sampler2D pressure;

uniform vec3 color1;
uniform vec3 color2;
varying vec2 vUv;

#require(rgb2hsv.fs)
#require(range.glsl)

void main(){
    float r = (texture2D(pressure, vUv)*1.2+0.1).x+(texture2D(pressure, vUv)*1.1+0.1).y;
    float g = (texture2D(velocity, vUv)*1.3+0.1).y+(texture2D(pressure, vUv)*1.3+0.1).x;
    float b = (texture2D(velocity, vUv)*1.5+0.1).x+(texture2D(pressure, vUv)*1.5+0.1).y;

    vec3 vColor = vec3(r, g, b);
    vec3 hsv = rgb2hsv(vColor);
    //hsv.y *= 0.9;
    hsv.z *= crange(hsv.z, 0.2, 1.0, 0.0, 1.0);
    //hsv.z *= crange(hsv.z, 0.6, 1.0, 0.0, 1.0);
    vColor = hsv2rgb(hsv);

    gl_FragColor = vec4(vColor, 1.0);
}
