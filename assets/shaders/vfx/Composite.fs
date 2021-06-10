uniform sampler2D tSSAO;
uniform sampler2D tGlobe;
uniform vec2 uResolution;
uniform float uSSAOBlend;
uniform float uFresnel;

#require(range.glsl)
#require(transformUV.glsl)
#require(rgbshift.fs)

void main() {
//    texel *= crange(texture2D(tSSAO, vUv).r, uSSAOBlend, 1.0, 0.0, 1.0);

    vec3 globe = texture2D(tGlobe, vUv).rgb;
    float reflection = globe.r;

    float fAmt = crange(globe.g, 0.5, 1.0, 0.0, 1.0);
    float scale = 1.0 + (fAmt*uFresnel);
    vec2 duv = vUv - vec2(0.5);
    float angle = atan(duv.y, duv.x);
    float strength = fAmt * 0.001;
    vec2 uv = scaleUV(vUv, vec2(scale));
    vec4 texel = getRGB(tDiffuse, uv, angle, strength);

    texel += reflection * 0.1;
    gl_FragColor = texel;
}