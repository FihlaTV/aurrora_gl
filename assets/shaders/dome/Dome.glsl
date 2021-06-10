#!ATTRIBUTES

#!UNIFORMS
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uTime;
uniform float uHueOffset;
uniform float uDark;
uniform vec3 uColor;
uniform sampler2D tCamera;
uniform sampler2D tGlobe;
uniform vec2 uResolution;
uniform float uFresnel;

#!VARYINGS
varying vec3 vPos;
varying vec2 vUv;

#!SHADER: Dome.vs
void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

#!SHADER: Dome.fs

#require(simplex3d.glsl)
#require(simplenoise.glsl)
#require(blendmodes.glsl)
#require(range.glsl)
#require(transformUV.glsl)

void main() {
    float noise = range(snoise(uTime * uNoiseSpeed + vPos * uNoiseScale), -1.0, 1.0, 0.0, 1.0);

    vec3 color0 = rgb2hsv(uColor);
    color0.x += uHueOffset;
    color0 = hsv2rgb(color0);

    vec3 color1 = rgb2hsv(uColor);
    color1.x -= uHueOffset;
    color1 = hsv2rgb(color1);

    vec3 color = mix(color0, color1, noise);
    color *= uDark;

    color *= range(getNoise(vUv, uTime), 0.0, 1.0, 0.5, 1.0);

    vec2 suv = gl_FragCoord.xy / uResolution;

    vec3 globe = texture2D(tGlobe, suv).rgb;
    float fAmt = range(globe.g, 0.5, 1.0, 0.0, 1.0);
    float scale = 1.0 + (fAmt*uFresnel);
    vec3 camera = texture2D(tCamera, scaleUV(suv, vec2(scale))).rgb;

    color = mix(color, blendLum(color, camera), 0.3);

    gl_FragColor = vec4(color, 1.0);
}