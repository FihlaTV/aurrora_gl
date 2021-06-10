#!ATTRIBUTES
attribute vec3 offset;
attribute vec3 attribs;

#!UNIFORMS
uniform sampler2D tFluid;
uniform float uTime;
uniform vec3 uColors[4];

#!VARYINGS
varying vec2 vUv;
varying vec2 vUv2;
varying vec3 vAttribs;

#!SHADER: Aurora.vs

#require(transformUV.glsl)

void main() {
    vUv = rotateUV(uv, uTime*0.1 + radians(5.0 * attribs.x));
    vUv = scaleUV(vUv, vec2(1.1));
    vUv2 = uv;
    vAttribs = attribs;

    vec3 pos = position;
    pos += offset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

#!SHADER: Aurora.fs

#require(rgb2hsv.fs)
#require(range.glsl)

vec3 calculateGradient(float n) {
    vec3 color = mix(uColors[0], uColors[1], pow(n, 1.2));
    return color;
}

void main() {
    vec4 fluid = texture2D(tFluid, vUv);

    vec3 color = rgb2hsv(calculateGradient(fluid.r));
    color.x += 0.01 * fluid.g;
    color.x += 0.35 * (1.0 - vAttribs.x);
    color = hsv2rgb(color);

    float dist = length(vUv2 - vec2(0.5));
    float mask = crange(dist, 0.3, 0.5, 1.0, 0.0);

    gl_FragColor = vec4(color * 0.85, fluid.r * mask);
}