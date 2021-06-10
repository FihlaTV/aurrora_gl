{@}Aurora.glsl{@}#!ATTRIBUTES
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
}{@}InstanceTest.glsl{@}#!ATTRIBUTES
attribute vec3 offset;

#!UNIFORMS

#!VARYINGS

#!SHADER: InstanceTest.vs
void main() {
    vec3 pos = position;
    pos += offset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

#!SHADER: InstanceTest.fs
void main() {
    gl_FragColor = vec4(1.0);
}{@}TestMove.fs{@}void main() {
    vec2 uv = getUV();
    vec3 pos = getData(tInput, uv);
    pos += 0.01;
    gl_FragColor = vec4(pos, 1.0);
}{@}neve.glsl{@}vec2 getReflectionUV(vec3 worldPos) {
    vec2 uv = vec2(0.0);
    uv.x = range(worldPos.x, -1.0, 1.0, 0.0, 1.0);
    uv.y = range(worldPos.z, -1.0, 1.0, 0.0, 1.0);
    return uv;
}{@}Crystals.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tNormal;
uniform sampler2D tRough;

#!VARYINGS
varying vec2 vUv;
varying vec3 vPos;

#!SHADER: Crystals.vs
void main() {
    vUv = uv;
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

#!SHADER: Crystals.fs

#require(conditionals.glsl)

void main() {
    vec3 normal = texture2D(tNormal, vUv).rgb;
    normal.z = texture2D(tRough, vUv).r;
    normal *= 1.0 - when_lt(vPos.y, -0.2);

    gl_FragColor = vec4(normal, 1.0);
}{@}Dome.glsl{@}#!ATTRIBUTES

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
}{@}addForce.fs{@}precision highp float;

uniform vec2 force;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
varying vec2 vUv;

void main(){
    float dist = 1.0-min(length((vUv-center)/scale), 1.0);
    gl_FragColor = vec4(force*dist, 0.0, 1.0);

}
{@}advect.fs{@}precision highp float;
uniform sampler2D source;
uniform sampler2D velocity;
uniform float dt;
uniform float scale;
uniform vec2 px1;
varying vec2 vUv;

void main(){
    gl_FragColor = texture2D(source, vUv-texture2D(velocity, vUv).xy*dt*px1)*scale;
}
{@}copy.fs{@}precision highp float;
uniform sampler2D source;
varying vec2 vUv;

void main(){
    gl_FragColor = texture2D(source, vUv);
}
{@}cursor.vs{@}precision highp float;

//attribute vec3 position;
uniform vec2 center;
uniform vec2 px;
varying vec2 vUv;


void main(){
    vUv = clamp(position.xy+center, vec2(-1.0+px*2.0), vec2(1.0-px*2.0));
    gl_Position = vec4(vUv, 0.0, 1.0);
}
{@}divergence.fs{@}precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 px;
varying vec2 vUv;

void main(){
    float x0 = texture2D(velocity, vUv-vec2(px.x, 0)).x;
    float x1 = texture2D(velocity, vUv+vec2(px.x, 0)).x;
    float y0 = texture2D(velocity, vUv-vec2(0, px.y)).y;
    float y1 = texture2D(velocity, vUv+vec2(0, px.y)).y;
    float divergence = (x1-x0 + y1-y0)*0.5;
    gl_FragColor = vec4(divergence);
}
{@}jacobi.fs{@}precision highp float;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform float alpha;
uniform float beta;
uniform vec2 px;
varying vec2 vUv;

void main(){
    float x0 = texture2D(pressure, vUv-vec2(px.x, 0)).r;
    float x1 = texture2D(pressure, vUv+vec2(px.x, 0)).r;
    float y0 = texture2D(pressure, vUv-vec2(0, px.y)).r;
    float y1 = texture2D(pressure, vUv+vec2(0, px.y)).r;
    float d = texture2D(divergence, vUv).r;
    float relaxed = (x0 + x1 + y0 + y1 + alpha * d) * beta;
    gl_FragColor = vec4(relaxed);
}
{@}kernel.vs{@}uniform vec2 px;
varying vec2 vUv;

precision highp float;

void main(){
    vUv = vec2(0.5)+(position.xy)*0.5;
    gl_Position = vec4(position, 1.0);
}{@}subtractPressureGradient.fs{@}precision highp float;
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform float alpha;
uniform float beta;
uniform float scale;
uniform vec2 px;
varying vec2 vUv;

void main(){
    float x0 = texture2D(pressure, vUv-vec2(px.x, 0)).r;
    float x1 = texture2D(pressure, vUv+vec2(px.x, 0)).r;
    float y0 = texture2D(pressure, vUv-vec2(0, px.y)).r;
    float y1 = texture2D(pressure, vUv+vec2(0, px.y)).r;
    vec2 v = texture2D(velocity, vUv).xy;
    gl_FragColor = vec4((v-(vec2(x1, y1)-vec2(x0, y0))*0.5)*scale, 1.0, 1.0);
}
{@}visualize.fs{@}precision highp float;
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
{@}Globe.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tRefl;

#!VARYINGS
varying vec3 vRefl;
varying vec3 vPos;

#!SHADER: Globe.vs

#require(refl.vs)

void main() {
    vRefl = transformDirection(position, modelMatrix);
    vPos = position;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}

#!SHADER: Globe.fs

#require(refl.fs)
#require(range.glsl)

void main() {
    float reflection = envColorEqui(tRefl, vRefl).r;

    vec2 edge = vec2(length(vPos.xy) / 1.5);
    gl_FragColor = vec4(reflection, edge, 1.0);
}{@}IslandBase.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tSoil0;
uniform sampler2D tSoil1;
uniform sampler2D tSoilNormal0;
uniform sampler2D tSoilNormal1;
uniform sampler2D tIceNormal;
uniform sampler2D tIceRef;
uniform sampler2D tSky;
uniform sampler2D tAurora;
uniform vec3 uSoilColor0;
uniform vec3 uSoilColor1;
uniform vec3 uMagma0;
uniform vec3 uMagma1;
uniform vec2 uResolution;
uniform float uAtmosphereBlend;

#!VARYINGS
varying vec3 vPos;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vWorldPosition;

#!SHADER: IslandBase.vs

#require(lights.glsl)

void main() {
    vec3 pos = position;
    pos.y = mix(pos.y, 0.43, step(0.43, pos.y));

    vUv = uv;
    vPos = pos;
    vNormal = normalMatrix * normal;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vLightPos = normalize(worldLight(lightPos[0]));
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
}

#!SHADER: IslandBase.fs

#require(range.glsl)
#require(dnormal.fs)
#require(simplex3d.glsl)
#require(neve.glsl)
#require(lights.fs)
#require(refl.fs)
#require(desaturate.fs)
#require(phong.fs)
#require(normalmap.glsl)

vec4 sampleSoil(sampler2D tSoil, sampler2D tNormal) {
    vec3 normal = getDNormal(vViewPosition);
    vec4 diffuse = texture2D(tSoil, vUv * 6.0) * 2.0;
    diffuse.rgb = desaturate(diffuse.rgb, 1.0);

    float volume = max(0.0, dot(normal, vLightPos));

    vec3 color0 = mix(uSoilColor0, diffuse.rgb * uSoilColor0, 0.5);
    vec3 color1 = mix(uSoilColor1, diffuse.rgb * uSoilColor1, 0.5);
    vec3 color = mix(color0, color1, volume);

    return vec4(color, 1.0);
}

vec4 getSoil() {
    float noise = snoise(vPos * 3.0);
    vec4 soil0 = sampleSoil(tSoil0, tSoilNormal0);
    vec4 soil1 = sampleSoil(tSoil1, tSoilNormal1);
    vec4 rock = mix(soil0, soil1, range(noise, -1.0, 1.0, 1.0, 0.3));
    vec4 soil = mix(soil1, soil0, range(noise, -1.0, 1.0, 1.0, 0.3));
    return mix(rock, soil, step(0.0, vPos.y + noise*0.1));
}

vec4 getIce(vec3 dNormal) {
    vec3 normal = texture2D(tIceNormal, vUv * 10.0).xyz;
//    vec3 rVec = refraction(vWorldPosition, normal, 0.96);
    vec2 uv = gl_FragCoord.xy / uResolution;
    uv.x += normal.x * 0.7;
    uv.y -= normal.y * 0.7;
    uv.xy += vViewPosition.xy;

    vec3 reflected = texture2D(tIceRef, uv).rgb;
    reflected *= range(abs(vPos.x), 0.0, 0.5, 1.0, 3.6) * 2.2;
    return vec4(reflected, 1.0);
}

vec4 getMagma() {
    float amt = range(vPos.y, -0.5, 0.1, 0.0, 1.0);
    return vec4(mix(uMagma1, uMagma0, amt), 1.0) * 1.3;
}

vec4 getColor() {
    vec3 normal = getDNormal(vViewPosition);
    vec4 soil = getSoil();
    vec4 ice = getIce(normal);
    vec4 magma = getMagma();

    float magMix = crange(vPos.y, -0.5, 0.2, 0.5, 0.0);
    soil = mix(soil, magma, magMix);

    float noise = snoise(vPos * 0.7);
    vec4 color = mix(soil, ice, step(0.25, vPos.y + noise*0.1));

    float volume = dot(normal, vLightPos);
    color.rgb *= range(volume, 0.0, 1.0, 0.2, 1.0);

    vec2 rUV = getReflectionUV(vWorldPosition);
    color.rgb *= mix(texture2D(tSky, rUV).rgb, vec3(1.0), uAtmosphereBlend);

    return color;
}

void main() {
    gl_FragColor = getColor();
}{@}IslandSnow.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMask;
uniform sampler2D tNormal;
uniform sampler2D tDiffuse;
uniform sampler2D tNoise;
uniform samplerCube tCube;
uniform float uTime;
uniform sampler2D tSky;
uniform sampler2D tAurora;
uniform float uAuroraStrength;
uniform float uAtmosphereBlend;

#!VARYINGS
varying vec2 vUv;
varying vec2 vUv2;
varying vec3 vPos;
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec3 vLightPos;
varying vec3 vWorldPosition;

#!SHADER: IslandSnow.vs

#require(transformUV.glsl)
#require(range.glsl)
#require(simplex3d.glsl)
#require(lights.glsl)

void main() {
    vec2 vuv = translateUV(uv, vec2(0.02, 0.02));
    vuv = scaleUV(vuv, vec2(1.02));

    vec2 mask = texture2D(tMask, vuv).rg;

    float offset = uTime*0.2 * 0.0;

    vec3 pos = position;
    pos.y *= mask.g * mask.r;

    vUv = uv;
    vUv2 = vuv;

    vUv = uv;
    vPos = pos;
    vNormal = normalMatrix * normal;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vLightPos = normalize(worldLight(vec3(70.0, 300.0, 100.0)));
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
}

#!SHADER: IslandSnow.fs

#require(normalmap.glsl)
#require(range.glsl)
#require(refl.fs)
#require(neve.glsl)
#require(blendmodes.glsl)

float getLight(vec3 normal) {
    float volume = max(0.0, dot(vLightPos, normal));
    return volume;
}

void main() {
    float mask = texture2D(tMask, vUv2).r;
    if (mask <= 0.01) discard;

    vec3 normal = unpackNormal(-vViewPosition, vNormal, tNormal, 1.0, 5.0, vUv);
    float noise = texture2D(tNoise, 5.0 * vUv).r;
    float n = range(noise, 0.0, 1.0, 0.8, 1.0);

    vec3 diffuse = texture2D(tDiffuse, 2.0 * vUv).rgb;
    float reflectNoise = clamp(range(diffuse.r, 0.87, 1.0, 0.0, 1.0), 0.0, 1.0);

    vec3 reflectVec = reflection(vWorldPosition, normal);
    vec3 sky = envColor(tCube, reflectVec).rgb;

    float light = getLight(normal);

    vec3 color = diffuse * n * light;
    color += sky * 0.5 * reflectNoise;

    vec2 rUV = getReflectionUV(vWorldPosition);
    color *= mix(texture2D(tSky, rUV).rgb, vec3(1.0), uAtmosphereBlend);
    color = mix(color, blendScreen(color, texture2D(tAurora, rUV).rgb), uAuroraStrength);

    gl_FragColor = vec4(color, 1.0);
}{@}AntimatterCopy.fs{@}uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(tDiffuse, vUv);
}{@}AntimatterCopy.vs{@}varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}{@}AntimatterPass.vs{@}void main() {
    gl_Position = vec4(position, 1.0);
}{@}AntimatterPosition.vs{@}uniform sampler2D tPos;

#require(antimatter.glsl)

void main() {
    vec4 decodedPos = texture2D(tPos, position.xy);
    vec3 pos = decodedPos.xyz;
    float size = 0.02;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}{@}antimatter.glsl{@}vec3 getData(sampler2D tex, vec2 uv) {
    return texture2D(tex, uv).xyz;
}

vec4 getData4(sampler2D tex, vec2 uv) {
    return texture2D(tex, uv);
}{@}ARCoreCamera.glsl{@}#!ATTRIBUTES

#!UNIFORMS

#!VARYINGS
varying vec2 vUv;

#!SHADER: ARCoreCameraPortrait.vs
void main() {
    vUv = uv;
    vUv.x = 1.0 - uv.y;
    vUv.y = 1.0 - uv.x;

    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARCoreCameraPortraitUpsideDown.vs
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARCoreCameraLandscapeLeft.vs
void main() {
    vUv = uv;
    vUv.x = uv.x;
    vUv.y = 1.0 - uv.y;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARCoreCameraLandscapeRight.vs
void main() {
    vUv = uv;
    vUv.x = 1.0 - uv.x;
    vUv.y = 1.0 - (1.0 - uv.y);
    gl_Position = vec4(position, 1.0);
}


#!SHADER: ARCoreCamera.fs
uniform samplerExternalOES tMap;

void main() {
    gl_FragColor = texture2D(tMap, vUv);
}{@}ARCoreCameraCopy.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;

#!VARYINGS
varying vec2 vUv;

#!SHADER: ARCoreCopy.vs
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARCoreCopy.fs
void main() {
    gl_FragColor = texture2D(tMap, vUv);
}{@}ARKitCamera.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tLum;
uniform sampler2D tChroma;

#!VARYINGS
varying vec2 vUv;

#!SHADER: ARKitCamera.vs
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARKitCameraLandscapeLeft.fs

#require(ARKitCommon.fs)

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    gl_FragColor = getRGB(uv);

}

#!SHADER: ARKitCameraLandscapeRight.fs

#require(ARKitCommon.fs)

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = 1.0 - c.x;
    uv.y = 1.0 - c.y;

    gl_FragColor = getRGB(uv);

}

#!SHADER: ARKitCameraPortrait.fs

#require(ARKitCommon.fs)

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = c.y;
    uv.y = 1.0 - c.x;

    gl_FragColor = getRGB(uv);

}

#!SHADER: ARKitCameraPortraitUpsideDown.fs

#require(ARKitCommon.fs)

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = 1.0 - c.y;
    uv.y = c.x;

    gl_FragColor = getRGB(uv);

}{@}ARKitCameraCopy.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;
uniform vec2 uScale;

#!VARYINGS
varying vec2 vUv;

#!SHADER: ARKitCameraCopy.vs
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARKitCameraCopy.fs

#require(transformUV.glsl)

void main() {
    gl_FragColor = texture2D(tMap, scaleUV(vUv, uScale));
}{@}ARKitCommon.fs{@}const mat3 yuv2rgb = mat3(
                          1, 0, 1.2802,
                          1, -0.214821, -0.380589,
                          1, 2.127982, 0
                          );

vec4 getRGB(vec2 uv) {
    vec4 lum = texture2D(tChroma, uv);
    vec4 chroma = texture2D(tLum, uv);

    vec3 yuv = vec3(
                        1.1643 * (lum.r - 0.0625),
                        chroma.r - 0.5,
                        chroma.a - 0.5
                        );

    vec3 rgb = yuv * yuv2rgb;
    return vec4(rgb, 1.0);
}{@}blendmodes.glsl{@}const vec3 white = vec3(1.0);

#require(rgb2hsv.fs)

#define BlendColorDodgef(base, blend) 	((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0))
#define BlendColorBurnf(base, blend) 	((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0))
#define BlendVividLightf(base, blend) 	((blend < 0.5) ? BlendColorBurnf(base, (2.0 * blend)) : BlendColorDodgef(base, (2.0 * (blend - 0.5))))
#define Blend(base, blend, funcf) 		vec4(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b), 1.0)
#define BlendVividLight(base, blend) 	Blend(base, blend, BlendVividLightf)
#define BlendOverlayf(base, blend) 		(base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))
#define BlendOverlay(base, blend) 		Blend(base, blend, BlendOverlayf)
#define BlendAddf(base, blend) 			min(base + blend, 1.0)
#define BlendSubstractf(base, blend) 	max(base + blend - 1.0, 0.0)
#define BlendLinearLightf(base, blend) 	(blend < 0.5 ? BlendLinearBurnf(base, (2.0 * blend)) : BlendLinearDodgef(base, (2.0 * (blend - 0.5))))
#define BlendLinearDodgef 				BlendAddf
#define BlendLinearBurnf 				BlendSubstractf
#define BlendLinearLight(base, blend) 	Blend(base, blend, BlendLinearLightf)
#define BlendVividLightf(base, blend) 	((blend < 0.5) ? BlendColorBurnf(base, (2.0 * blend)) : BlendColorDodgef(base, (2.0 * (blend - 0.5))))
#define BlendHardMixf(base, blend) 		((BlendVividLightf(base, blend) < 0.5) ? 0.0 : 1.0)
#define BlendHardMix(base, blend) 		Blend(base, blend, BlendHardMixf)
#define BlendReflectf(base, blend) 		((blend == 1.0) ? blend : min(base * base / (1.0 - blend), 1.0))
#define BlendReflect(base, blend) 		Blend(base, blend, BlendReflectf)
#define BlendGlow(base, blend) 			BlendReflect(blend, base)

vec3 blendScreen(vec3 base, vec3 blend) {
    return white - ((white - blend) * (white - base));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
    return 2.0 * base * blend + base * base - 2.0 * base * base * blend;
}

vec3 blendSubtract(vec3 base, vec3 blend) {
    return base - blend;
}

vec3 blendVividLight(vec3 base, vec3 blend) {
    return BlendVividLight(vec4(base, 1.0), vec4(blend, 1.0)).rgb;
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return BlendOverlay(vec4(base, 1.0), vec4(blend, 1.0)).rgb;
}

vec3 blendLum(vec3 base, vec3 blend) {
    vec3 baseHSL = rgb2hsv(base);
    return hsv2rgb(vec3(baseHSL.r, baseHSL.g, rgb2hsv(blend).b));
}

vec3 blendPhoenix(vec3 base, vec3 blend) {
    return (min(base, blend) - max(base, blend) + white);
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
    return Blend(vec4(base, 1.0), vec4(blend, 1.0), BlendLinearLightf).rgb;
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
    return max(base + blend - 1.0, 0.0);
}

vec3 blendLighten(vec3 base, vec3 blend) {
    return max(base, blend);
}

vec3 blendInverseDifference(vec3 base, vec3 blend) {
    return white - abs(white - base - blend);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
    return white - (white - base) / blend;
}

vec3 blendHardMix(vec3 base, vec3 blend) {
    return BlendHardMix(vec4(base, 1.0), vec4(blend, 1.0)).rgb;
}

vec3 blendGlow(vec3 base, vec3 blend) {
    return BlendGlow(vec4(base, 1.0), vec4(blend, 1.0)).rgb;
}{@}conditionals.glsl{@}vec4 when_eq(vec4 x, vec4 y) {
  return 1.0 - abs(sign(x - y));
}

vec4 when_neq(vec4 x, vec4 y) {
  return abs(sign(x - y));
}

vec4 when_gt(vec4 x, vec4 y) {
  return max(sign(x - y), 0.0);
}

vec4 when_lt(vec4 x, vec4 y) {
  return max(sign(y - x), 0.0);
}

vec4 when_ge(vec4 x, vec4 y) {
  return 1.0 - when_lt(x, y);
}

vec4 when_le(vec4 x, vec4 y) {
  return 1.0 - when_gt(x, y);
}

vec3 when_eq(vec3 x, vec3 y) {
  return 1.0 - abs(sign(x - y));
}

vec3 when_neq(vec3 x, vec3 y) {
  return abs(sign(x - y));
}

vec3 when_gt(vec3 x, vec3 y) {
  return max(sign(x - y), 0.0);
}

vec3 when_lt(vec3 x, vec3 y) {
  return max(sign(y - x), 0.0);
}

vec3 when_ge(vec3 x, vec3 y) {
  return 1.0 - when_lt(x, y);
}

vec3 when_le(vec3 x, vec3 y) {
  return 1.0 - when_gt(x, y);
}

vec2 when_eq(vec2 x, vec2 y) {
  return 1.0 - abs(sign(x - y));
}

vec2 when_neq(vec2 x, vec2 y) {
  return abs(sign(x - y));
}

vec2 when_gt(vec2 x, vec2 y) {
  return max(sign(x - y), 0.0);
}

vec2 when_lt(vec2 x, vec2 y) {
  return max(sign(y - x), 0.0);
}

vec2 when_ge(vec2 x, vec2 y) {
  return 1.0 - when_lt(x, y);
}

vec2 when_le(vec2 x, vec2 y) {
  return 1.0 - when_gt(x, y);
}

float when_eq(float x, float y) {
  return 1.0 - abs(sign(x - y));
}

float when_neq(float x, float y) {
  return abs(sign(x - y));
}

float when_gt(float x, float y) {
  return max(sign(x - y), 0.0);
}

float when_lt(float x, float y) {
  return max(sign(y - x), 0.0);
}

float when_ge(float x, float y) {
  return 1.0 - when_lt(x, y);
}

float when_le(float x, float y) {
  return 1.0 - when_gt(x, y);
}

vec4 and(vec4 a, vec4 b) {
  return a * b;
}

vec4 or(vec4 a, vec4 b) {
  return min(a + b, 1.0);
}

vec4 not(vec4 a) {
  return 1.0 - a;
}

vec3 and(vec3 a, vec3 b) {
  return a * b;
}

vec3 or(vec3 a, vec3 b) {
  return min(a + b, 1.0);
}

vec3 not(vec3 a) {
  return 1.0 - a;
}

vec2 and(vec2 a, vec2 b) {
  return a * b;
}

vec2 or(vec2 a, vec2 b) {
  return min(a + b, 1.0);
}


vec2 not(vec2 a) {
  return 1.0 - a;
}

float and(float a, float b) {
  return a * b;
}

float or(float a, float b) {
  return min(a + b, 1.0);
}

float not(float a) {
  return 1.0 - a;
}{@}curl.glsl{@}#require(simplex3d.glsl)

vec3 snoiseVec3( vec3 x ){
    
    float s  = snoise(vec3( x ));
    float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));
    float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));
    vec3 c = vec3( s , s1 , s2 );
    return c;
    
}


vec3 curlNoise( vec3 p ){
    
    const float e = 1e-1;
    vec3 dx = vec3( e   , 0.0 , 0.0 );
    vec3 dy = vec3( 0.0 , e   , 0.0 );
    vec3 dz = vec3( 0.0 , 0.0 , e   );
    
    vec3 p_x0 = snoiseVec3( p - dx );
    vec3 p_x1 = snoiseVec3( p + dx );
    vec3 p_y0 = snoiseVec3( p - dy );
    vec3 p_y1 = snoiseVec3( p + dy );
    vec3 p_z0 = snoiseVec3( p - dz );
    vec3 p_z1 = snoiseVec3( p + dz );
    
    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
    float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
    float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;
    
    const float divisor = 1.0 / ( 2.0 * e );
    return normalize( vec3( x , y , z ) * divisor );
}{@}desaturate.fs{@}vec3 desaturate(vec3 color, float amount) {
    vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), color));
    return vec3(mix(color, gray, amount));
}{@}dnormal.fs{@}vec3 getDNormal(vec3 viewPos) {
    vec3 dfx = vec3(0.0);
    vec3 dfy = vec3(0.0);

    dfx.x = dFdx(viewPos.x);
    dfx.y = dFdx(viewPos.y);
    dfx.z = dFdx(viewPos.z);

    dfy.x = dFdy(viewPos.x);
    dfy.y = dFdy(viewPos.y);
    dfy.z = dFdy(viewPos.z);

    return normalize(cross(dfx, dfy));
}{@}edgedetection.fs{@}vec4 getEdge(sampler2D tDiffuse, vec2 vUv, vec2 uResolution) {
    vec2 texel = vec2( 1.0 / uResolution.x, 1.0 / uResolution.y );

    // kernel definition (in glsl matrices are filled in column-major order)

    const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 ); // x direction kernel
    const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 ); // y direction kernel

    // fetch the 3x3 neighbourhood of a fragment

    // first column

    float tx0y0 = texture2D( tDiffuse, vUv + texel * vec2( -1, -1 ) ).r;
    float tx0y1 = texture2D( tDiffuse, vUv + texel * vec2( -1,  0 ) ).r;
    float tx0y2 = texture2D( tDiffuse, vUv + texel * vec2( -1,  1 ) ).r;

    // second column

    float tx1y0 = texture2D( tDiffuse, vUv + texel * vec2(  0, -1 ) ).r;
    float tx1y1 = texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) ).r;
    float tx1y2 = texture2D( tDiffuse, vUv + texel * vec2(  0,  1 ) ).r;

    // third column

    float tx2y0 = texture2D( tDiffuse, vUv + texel * vec2(  1, -1 ) ).r;
    float tx2y1 = texture2D( tDiffuse, vUv + texel * vec2(  1,  0 ) ).r;
    float tx2y2 = texture2D( tDiffuse, vUv + texel * vec2(  1,  1 ) ).r;

    // gradient value in x direction

    float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 +
        Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 +
        Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2;

    // gradient value in y direction

    float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 +
        Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 +
        Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2;

    // magnitute of the total gradient

    float G = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );

    return vec4( vec3( G ), 1 );
}{@}gaussianblur.fs{@}vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture2D(image, uv) * 0.1964825501511404;
  color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}

vec4 blur5(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3333333333333333) * direction;
  color += texture2D(image, uv) * 0.29411764705882354;
  color += texture2D(image, uv + (off1 / resolution)) * 0.35294117647058826;
  color += texture2D(image, uv - (off1 / resolution)) * 0.35294117647058826;
  return color;
}

vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture2D(image, uv) * 0.2270270270;
  color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}{@}normalmap.glsl{@}vec3 unpackNormal( vec3 eye_pos, vec3 surf_norm, sampler2D normal_map, float intensity, float scale, vec2 uv ) {
    surf_norm = normalize(surf_norm);
    
    vec3 q0 = dFdx( eye_pos.xyz );
    vec3 q1 = dFdy( eye_pos.xyz );
    vec2 st0 = dFdx( uv.st );
    vec2 st1 = dFdy( uv.st );
    
    vec3 S = normalize( q0 * st1.t - q1 * st0.t );
    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
    vec3 N = normalize( surf_norm );
    
    vec3 mapN = texture2D( normal_map, uv * scale ).xyz * 2.0 - 1.0;
    mapN.xy *= intensity;
    mat3 tsn = mat3( S, T, N );
    return normalize( tsn * mapN );
}

//mvPosition.xyz, normalMatrix * normal, normalMap, scale, uv{@}parallaxmap.fs{@}vec2 processParallaxMap( in vec3 V, vec2 uv, float pScale, float pMinLayers,  float pMaxLayers, sampler2D displacementMap) {

    // Determine number of layers from angle between V and N
    float numLayers = mix( pMaxLayers, pMinLayers, abs( dot( vec3( 0.0, 0.0, 1.0 ), V ) ) );

    float layerHeight = 1.0 / numLayers;
    float currentLayerHeight = 0.0;
    // Shift of texture coordinates for each iteration
    vec2 dtex = pScale * V.xy / V.z / numLayers;

    vec2 currentTextureCoords = uv;

    float heightFromTexture = texture2D( displacementMap, currentTextureCoords ).r;

    // while ( heightFromTexture > currentLayerHeight )
    // Infinite loops are not well supported. Do a "large" finite
    // loop, but not too large, as it slows down some compilers.
    for ( int i = 0; i < 30; i += 1 ) {
        if ( heightFromTexture <= currentLayerHeight ) {
            break;
        }
        currentLayerHeight += layerHeight;
        // Shift texture coordinates along vector V
        currentTextureCoords -= dtex;
        heightFromTexture = texture2D( displacementMap, currentTextureCoords ).r;
    }

    vec2 deltaTexCoord = dtex / 2.0;
    float deltaHeight = layerHeight / 2.0;

    // Return to the mid point of previous layer
    currentTextureCoords += deltaTexCoord;
    currentLayerHeight -= deltaHeight;

    // Binary search to increase precision of Steep Parallax Mapping
    const int numSearches = 5;
    for ( int i = 0; i < numSearches; i += 1 ) {

        deltaTexCoord /= 2.0;
        deltaHeight /= 2.0;
        heightFromTexture = texture2D( displacementMap, currentTextureCoords ).r;
        // Shift along or against vector V
        if( heightFromTexture > currentLayerHeight ) { // Below the surface

            currentTextureCoords -= deltaTexCoord;
            currentLayerHeight += deltaHeight;

        } else { // above the surface

            currentTextureCoords += deltaTexCoord;
            currentLayerHeight -= deltaHeight;

        }

    }
    return currentTextureCoords;

}

vec2 parallaxMap( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition, vec2 uv, float scale, float minLayers, float maxLayers, sampler2D displacementMap ) {

    vec2 texDx = dFdx( uv );
    vec2 texDy = dFdy( uv );

    vec3 vSigmaX = dFdx( surfPosition );
    vec3 vSigmaY = dFdy( surfPosition );
    vec3 vR1 = cross( vSigmaY, surfNormal );
    vec3 vR2 = cross( surfNormal, vSigmaX );
    float fDet = dot( vSigmaX, vR1 );

    vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );
    vec3 vProjVtex;
    vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;
    vProjVtex.z = dot( surfNormal, viewPosition );

    return processParallaxMap( vProjVtex, uv, scale, minLayers, maxLayers, displacementMap );

} //mvPosition.xyz, normal, normalize(-mvPosition), vUv, scale, minLayers, maxLayers, displacementMap

vec3 unpackParallaxNormal( vec3 eye_pos, vec3 surf_norm, sampler2D normalMap, vec2 uv ) {

    vec3 q0 = dFdx( eye_pos.xyz );
    vec3 q1 = dFdy( eye_pos.xyz );
    vec2 st0 = dFdx( vUv.st );
    vec2 st1 = dFdy( vUv.st );

    vec3 S = normalize( q0 * st1.t - q1 * st0.t );
    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
    vec3 N = normalize( surf_norm );

    vec3 mapN = texture2D( normalMap, uv ).xyz * 2.0 - 1.0;
//    vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
//    mapN.xy = normalScale * mapN.xy;
    mapN.xy = 1.0 * mapN.xy;
    mat3 tsn = mat3( S, T, N );
    return normalize( tsn * mapN );

} //mvPosition.xyz, normal, normalMap, parallaxMapUV
{@}phong.fs{@}#define saturate(a) clamp( a, 0.0, 1.0 )

float dPhong(float shininess, float dotNH) {
    return (shininess * 0.5 + 1.0) * pow(dotNH, shininess);
}

vec3 schlick(vec3 specularColor, float dotLH) {
    float fresnel = exp2((-5.55437 * dotLH - 6.98316) * dotLH);
    return (1.0 - specularColor) * fresnel + specularColor;
}

vec3 calcBlinnPhong(vec3 specularColor, float shininess, vec3 normal, vec3 lightDir, vec3 viewDir) {
    vec3 halfDir = normalize(lightDir + viewDir);
    
    float dotNH = saturate(dot(normal, halfDir));
    float dotLH = saturate(dot(lightDir, halfDir));
    
    vec3 F = schlick(specularColor, dotLH);
    float G = 0.85;
    float D = dPhong(shininess, dotNH);
    
    return F * G * D;
}

vec3 phong(float amount, vec3 diffuse, vec3 specular, float shininess, float attenuation, vec3 normal, vec3 lightDir, vec3 viewDir) {
    float cosineTerm = saturate(dot(normal, lightDir));
    vec3 brdf = calcBlinnPhong(specular, shininess, normal, lightDir, viewDir);
    return brdf * amount * diffuse * attenuation * cosineTerm;
}

vec3 phong(float amount, vec3 diffuse, vec3 specular, float shininess, float attenuation, vec3 normal, vec3 lightDir, vec3 viewDir, float minThreshold) {
    float cosineTerm = saturate(range(dot(normal, lightDir), 0.0, 1.0, minThreshold, 1.0));
    vec3 brdf = calcBlinnPhong(specular, shininess, normal, lightDir, viewDir);
    return brdf * amount * diffuse * attenuation * cosineTerm;
}

//viewDir = -mvPosition.xyz
//lightDir = normalize(lightPos){@}range.glsl{@}float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}

float crange(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    return clamp(range(oldValue, oldMin, oldMax, newMin, newMax), min(newMax, newMin), max(newMin, newMax));
}{@}refl.fs{@}vec3 reflection(vec3 worldPosition, vec3 normal) {
    vec3 cameraToVertex = normalize(worldPosition - cameraPosition);
    
    return reflect(cameraToVertex, normal);
}

vec3 refraction(vec3 worldPosition, vec3 normal, float rRatio) {
    vec3 cameraToVertex = normalize(worldPosition - cameraPosition);
    
    return refract(cameraToVertex, normal, rRatio);
}

vec4 envColor(samplerCube map, vec3 vec) {
    float flipNormal = 1.0;
    return textureCube(map, flipNormal * vec3(-1.0 * vec.x, vec.yz));
}

vec4 envColorEqui(sampler2D map, vec3 direction) {
    vec2 uv;
    uv.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * 0.31830988618 + 0.5;
    uv.x = atan( direction.z, direction.x ) * 0.15915494 + 0.5;
    return texture2D(map, uv);
}{@}refl.vs{@}vec3 inverseTransformDirection(in vec3 normal, in mat4 matrix) {
    return normalize((matrix * vec4(normal, 0.0) * matrix).xyz);
}

vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
    return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}

vec3 reflection(vec4 worldPosition) {
    vec3 transformedNormal = normalMatrix * normal;
    vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);
    vec3 worldNormal = inverseTransformDirection(transformedNormal, viewMatrix);
    
    return reflect(cameraToVertex, worldNormal);
}

vec3 refraction(vec4 worldPosition, float refractionRatio) {
    vec3 transformedNormal = normalMatrix * normal;
    vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);
    vec3 worldNormal = inverseTransformDirection(transformedNormal, viewMatrix);
    
    return refract(cameraToVertex, worldNormal, refractionRatio);
}{@}rgb2hsv.fs{@}vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}{@}rgbshift.fs{@}vec4 getRGB(sampler2D tDiffuse, vec2 uv, float angle, float amount) {
    vec2 offset = vec2(cos(angle), sin(angle)) * amount;
    vec4 r = texture2D(tDiffuse, uv + offset);
    vec4 g = texture2D(tDiffuse, uv);
    vec4 b = texture2D(tDiffuse, uv - offset);
    return vec4(r.r, g.g, b.b, g.a);
}{@}rotate.glsl{@}mat4 rotationMatrix(vec3 axis, float angle)
{
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec2 rotate2d(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}
{@}ScreenQuad.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;

#!VARYINGS
varying vec2 vUv;

#!SHADER: ScreenQuad.vs
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ScreenQuad.fs
void main() {
    gl_FragColor = texture2D(tMap, vUv);
}{@}WorldQuad.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;

#!VARYINGS
varying vec2 vUv;

#!SHADER: WorldQuad.vs
void main() {
    vUv = uv;
    vec3 pos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

#!SHADER: WorldQuad.fs
void main() {
    gl_FragColor = texture2D(tMap, vUv);
//    gl_FragColor = vec4(1.0);
}{@}simplenoise.glsl{@}const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;

float getNoise(vec2 uv, float time) {
    float x = uv.x * uv.y * time * 1000.0;
    x = mod(x, 13.0) * mod(x, 123.0);
    float dx = mod(x, 0.01);
    float amount = clamp(0.1 + dx * 100.0, 0.0, 1.0);
    return amount;
}

highp float random(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = dot(co.xy, vec2(a, b));
    highp float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}{@}simplex2d.glsl{@}//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    
    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    
    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                     + i.x + vec3(0.0, i1.x, 1.0 ));
    
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    
    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
    
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    
    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    
    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}{@}simplex3d.glsl{@}// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

    i = mod289(i);
    vec4 p = permute( permute( permute(
          i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

//float surface(vec3 coord) {
//    float n = 0.0;
//    n += 1.0 * abs(snoise(coord));
//    n += 0.5 * abs(snoise(coord * 2.0));
//    n += 0.25 * abs(snoise(coord * 4.0));
//    n += 0.125 * abs(snoise(coord * 8.0));
//    float rn = 1.0 - n;
//    return rn * rn;
//}{@}lights.fs{@}vec3 worldLight(vec3 pos, vec3 vpos) {
    vec4 mvPos = modelViewMatrix * vec4(vpos, 1.0);
    vec4 worldPosition = viewMatrix * vec4(pos, 1.0);
    return worldPosition.xyz - mvPos.xyz;
}{@}lights.glsl{@}vec3 worldLight(vec3 pos) {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vec4 worldPosition = viewMatrix * vec4(pos, 1.0);
    return worldPosition.xyz - mvPos.xyz;
}

vec3 worldLight(vec3 lightPos, vec3 localPos) {
    vec4 mvPos = modelViewMatrix * vec4(localPos, 1.0);
    vec4 worldPosition = viewMatrix * vec4(lightPos, 1.0);
    return worldPosition.xyz - mvPos.xyz;
}

vec3 transformNormal(vec4 orientation) {
    vec3 n = normal;
    vec3 ncN = cross(orientation.xyz, n);
    n = ncN * (2.0 * orientation.w) + (cross(orientation.xyz, ncN) * 2.0 + n);
    return n;
}{@}shadow.fs{@}#chunk(common);
#chunk(bsdfs);
#chunk(packing);
#chunk(lights_pars);
#chunk(shadowmap_pars_fragment);

varying vec3 vNormal;


float getShadowValue() {
    float shadow = 1.0;
//    #ifdef USE_SHADOWMAP

    #if ( NUM_POINT_LIGHTS > 0 )

	    PointLight pointLight;

	    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		    pointLight = pointLights[ i ];

		    float shadowValue = getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] );
		    shadowValue += 1.0 - step(0.002, dot(pointLight.position, vNormal));
		    shadowValue = clamp(shadowValue, 0.0, 1.0);
		    shadow *= shadowValue;

	    }

    #endif

    #if ( NUM_DIR_LIGHTS > 0 )

        IncidentLight directLight;
        DirectionalLight directionalLight;

        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

            directionalLight = directionalLights[ i ];

            float shadowValue = getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] );
            shadowValue += (1.0 - step(0.002, dot(directionalLight.direction, vNormal))) * clamp(length(vNormal), 0.0, 1.0);
            shadowValue = clamp(shadowValue, 0.0, 1.0);
            shadow *= shadowValue;
        }

    #endif

//    #endif

    return shadow;
}{@}shadow.vs{@}vNormal = normalMatrix * normal;

vec4 worldPosition = modelMatrix * vec4(position, 1.0);
#chunk(shadowmap_vertex);{@}shadowparam.vs{@}#chunk(shadowmap_pars_vertex);

varying vec3 vNormal;{@}transformUV.glsl{@}vec2 transformUV(vec2 uv, float a[9]) {

    // Convert UV to vec3 to apply matrices
	vec3 u = vec3(uv, 1.0);

    // Array consists of the following
    // 0 translate.x
    // 1 translate.y
    // 2 skew.x
    // 3 skew.y
    // 4 rotate
    // 5 scale.x
    // 6 scale.y
    // 7 origin.x
    // 8 origin.y

    // Origin before matrix
    mat3 mo1 = mat3(
        1, 0, -a[7],
        0, 1, -a[8],
        0, 0, 1);

    // Origin after matrix
    mat3 mo2 = mat3(
        1, 0, a[7],
        0, 1, a[8],
        0, 0, 1);

    // Translation matrix
    mat3 mt = mat3(
        1, 0, -a[0],
        0, 1, -a[1],
    	0, 0, 1);

    // Skew matrix
    mat3 mh = mat3(
        1, a[2], 0,
        a[3], 1, 0,
    	0, 0, 1);

    // Rotation matrix
    mat3 mr = mat3(
        cos(a[4]), sin(a[4]), 0,
        -sin(a[4]), cos(a[4]), 0,
    	0, 0, 1);

    // Scale matrix
    mat3 ms = mat3(
        1.0 / a[5], 0, 0,
        0, 1.0 / a[6], 0,
    	0, 0, 1);

	// apply translation
   	u = u * mt;

	// apply skew
   	u = u * mh;

    // apply rotation relative to origin
    u = u * mo1;
    u = u * mr;
    u = u * mo2;

    // apply scale relative to origin
    u = u * mo1;
    u = u * ms;
    u = u * mo2;

    // Return vec2 of new UVs
    return u.xy;
}

vec2 rotateUV(vec2 uv, float r) {
    float a[9];
    a[0] = 0.0;
    a[1] = 0.0;
    a[2] = 0.0;
    a[3] = 0.0;
    a[4] = r;
    a[5] = 1.0;
    a[6] = 1.0;
    a[7] = 0.5;
    a[8] = 0.5;

    return transformUV(uv, a);
}

vec2 translateUV(vec2 uv, vec2 translate) {
    float a[9];
    a[0] = translate.x;
    a[1] = translate.y;
    a[2] = 0.0;
    a[3] = 0.0;
    a[4] = 0.0;
    a[5] = 1.0;
    a[6] = 1.0;
    a[7] = 0.5;
    a[8] = 0.5;

    return transformUV(uv, a);
}

vec2 scaleUV(vec2 uv, vec2 scale) {
    float a[9];
    a[0] = 0.0;
    a[1] = 0.0;
    a[2] = 0.0;
    a[3] = 0.0;
    a[4] = 0.0;
    a[5] = scale.x;
    a[6] = scale.y;
    a[7] = 0.5;
    a[8] = 0.5;

    return transformUV(uv, a);
}
vec2 scaleUV(vec2 uv, vec2 scale, vec2 origin) {
    float a[9];
    a[0] = 0.0;
    a[1] = 0.0;
    a[2] = 0.0;
    a[3] = 0.0;
    a[4] = 0.0;
    a[5] = scale.x;
    a[6] = scale.y;
    a[7] = origin.x;
    a[8] = origin.x;

    return transformUV(uv, a);
}{@}Mountain.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMask;
uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tSnow;
uniform sampler2D tNoise;
uniform sampler2D tSnowNormal;
uniform samplerCube tSnowCube;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform sampler2D tSky;
uniform sampler2D tAurora;
uniform float uAtmosphereBlend;
uniform float uAuroraStrength;

#!VARYINGS
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vLightPos;
varying vec3 vPos;
varying vec3 vWorldPosition;

#!SHADER: Mountain.vs

#require(simplex3d.glsl)
#require(range.glsl)
#require(lights.glsl)

vec2 getUV() {
    vec2 uv = vec2(0.0);
    uv.x = range(position.x, -1.0, 1.0, 0.0, 1.0);
    uv.y = range(position.z, -1.0, 1.0, 0.0, 1.0);
    return uv;
}

void main() {
    vec2 uv = getUV();
    vec3 pos = position;
    float noise = range(snoise(position * 5.0), -1.0, 1.0, 0.0, 1.0);
    float mask = texture2D(tMask, uv).r;

    vUv = uv;
    pos.y += noise * 0.4 * mask;
    vPos = pos;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;

    vLightPos = normalize(worldLight(lightPos[0]));
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
}

#!SHADER: Mountain.fs

#require(dnormal.fs)
#require(desaturate.fs)
#require(range.glsl)
#require(normalmap.glsl)
#require(simplex3d.glsl)
#require(blendmodes.glsl)
#require(refl.fs)
#require(neve.glsl)

vec3 getSnow(vec3 pNormal) {
    vec3 normal = unpackNormal(-vViewPosition, pNormal, tSnowNormal, 1.0, 5.0, vUv);
    float noise = texture2D(tNoise, 5.0 * vUv).r;
    float n = range(noise, 0.0, 1.0, 0.8, 1.0);
    vec3 diffuse = texture2D(tSnow, vUv * 10.0).rgb;
    float reflectNoise = clamp(range(diffuse.r, 0.87, 1.0, 0.0, 1.0), 0.0, 1.0);

    vec3 reflectVec = reflection(vWorldPosition, normal);
    vec3 sky = envColor(tSnowCube, reflectVec).rgb;

    vec3 color = diffuse;
    color += sky * 0.5 * reflectNoise;

    return color;
}

void main() {
    vec4 mask = texture2D(tMask, vUv);
    if (mask.r < 0.1) discard;

    vec3 normal = getDNormal(vViewPosition);
    float volume = dot(normal, vLightPos);

    vec3 diffuse = texture2D(tDiffuse, vUv * 10.0).rgb;
    diffuse = desaturate(diffuse, 1.0);

    vec3 color0 = mix(uColor0, diffuse * uColor0, 0.25);
    vec3 color1 = mix(uColor1, diffuse * uColor1, 0.25);

    vec3 color = mix(color0, color1, volume);

    vec3 snow = getSnow(normal);
    float snowAmt = step(0.2, vPos.y + snoise(vPos * 4.0)*0.08);
    color = mix(color, snow, snowAmt);

    vec2 rUV = getReflectionUV(vWorldPosition);
    color *= mix(texture2D(tSky, rUV).rgb, vec3(1.0), uAtmosphereBlend);

    color *= range(volume, 0.0, 1.0, 0.4, 1.0);
    color = mix(color, blendScreen(color, texture2D(tAurora, rUV).rgb), uAuroraStrength);

    gl_FragColor = vec4(color, 1.0);
}

#!SHADER: MountainOcclusion.fs
void main() {
    vec4 mask = texture2D(tMask, vUv);
    if (mask.r < 0.1) discard;

    gl_FragColor = vec4(vec3(0.0), 1.0);
}{@}Rock.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tDiffuse;
uniform sampler2D tSnow;
uniform sampler2D tNoise;
uniform sampler2D tSnowNormal;
uniform samplerCube tSnowCube;
uniform vec3 uColor0;
uniform vec3 uColor1;

#!VARYINGS
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vPos;
varying vec3 vLightPos;
varying vec2 vUv;

#!SHADER: Rock.vs

#require(lights.glsl)

void main() {
    vec3 pos = position;
    vUv = uv;
    vPos = pos;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    vLightPos = normalize(worldLight(lightPos[0]));
}

#!SHADER: Rock.fs

#require(dnormal.fs)
#require(rgb2hsv.fs)
#require(desaturate.fs)
#require(range.glsl)
#require(simplex3d.glsl)
#require(normalmap.glsl)
#require(refl.fs)

vec3 getSnow(vec3 pNormal) {
    vec3 normal = unpackNormal(-vViewPosition, pNormal, tSnowNormal, 1.0, 5.0, vUv);
    float noise = texture2D(tNoise, 5.0 * vUv).r;
    float n = range(noise, 0.0, 1.0, 0.8, 1.0);
    vec3 diffuse = texture2D(tSnow, vUv * 10.0).rgb;
    float reflectNoise = clamp(range(diffuse.r, 0.87, 1.0, 0.0, 1.0), 0.0, 1.0);

    vec3 reflectVec = reflection(vWorldPosition, normal);
    vec3 sky = envColor(tSnowCube, reflectVec).rgb;

    vec3 color = diffuse;
    color += sky * 0.5 * reflectNoise;

    return color;
}

void main() {
    vec3 normal = getDNormal(vViewPosition);
    float volume = dot(normal, vLightPos);

    vec3 diffuse = texture2D(tDiffuse, vUv * 40.0).rgb;
    diffuse = desaturate(diffuse, 1.0);

    vec3 color0 = mix(uColor0, diffuse * uColor0, 0.25);
    vec3 color1 = mix(uColor1, diffuse * uColor1, 0.25);

    vec3 color = mix(color0, color1, volume);

    vec3 snow = getSnow(normal);
    float snowAmt = step(0.04, vPos.y);
    color = mix(color, snow, snowAmt);

    color *= range(volume, 0.0, 1.0, 0.5, 1.0);

    gl_FragColor = vec4(color, 1.0);
}{@}SnowClouds.glsl{@}#!ATTRIBUTES
attribute vec3 offset;
attribute vec3 attribs;

#!UNIFORMS
uniform vec4 uQuaternion;
uniform sampler2D tMap;
uniform float uTime;

#!VARYINGS
varying vec2 vUv;
varying vec3 vAttribs;

#!SHADER: SnowClouds.vs

#require(transformUV.glsl)
#require(lights.glsl)
#require(range.glsl)

void main() {
    vec3 pos = position;
    pos *= range(attribs.y, 0.0, 1.0, 1.8, 1.2);

    vec3 vcv = cross(uQuaternion.xyz, pos);
    pos = vcv * (2.0 * uQuaternion.w) + (cross(uQuaternion.xyz, vcv) * 2.0 + pos);
    pos += offset;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vUv = rotateUV(uv, radians(attribs.x * 360.0 + uTime*0.7));
    vAttribs = attribs;
    gl_Position = projectionMatrix * mvPosition;
}

#!SHADER: SnowClouds.fs

#require(range.glsl)
#require(transformUV.glsl)

void main() {
    float cloud = texture2D(tMap, vUv).r;
    float alpha = 0.02 * range(vAttribs.x, 0.0, 1.0, 0.8, 1.2);

    float noise = texture2D(tMap, rotateUV(vUv, uTime*0.25 * range(vAttribs.z, 0.0, 1.0, -1.0, 1.0))).r;

    alpha *= noise;

    gl_FragColor = vec4(vec3(1.0), cloud * alpha);
}{@}SnowFall.fs{@}uniform sampler2D tOrigin;
uniform sampler2D tAttributes;
uniform float uGravity;
uniform float uCurlScale;
uniform float uCurlSpeed;

#require(range.glsl)
#require(curl.glsl)

void main() {
    vec2 uv = getUV();
    vec4 attribs = getData4(tAttributes, uv);
    vec3 pos = getData(tInput, uv);

    pos.y -= uGravity * 0.015 * range(attribs.x, 0.0, 1.0, 0.8, 1.2);

    vec3 curl = curlNoise(pos * uCurlScale) * uCurlSpeed * 0.01 * range(attribs.y, 0.0, 1.0, 0.8, 1.2);
    curl.y *= 0.5;
    pos += curl;

    if (attribs.y > 0.7) pos.x = 99999.0;

    if (pos.y < -0.1) {
        pos = getData(tOrigin, uv);
        pos.y = 1.0;
    }

    gl_FragColor = vec4(pos, 1.0);
}{@}SnowParticles.glsl{@}#!ATTRIBUTES
attribute vec4 attribs;

#!UNIFORMS
uniform sampler2D tPos;
uniform sampler2D tMap;
uniform float uScale;

#!VARYINGS
varying float vAlpha;

#!SHADER: SnowParticles.vs

#require(antimatter.glsl)
#require(range.glsl)

void main() {
    vec3 pos = texture2D(tPos, position.xy).xyz;
    float size = 0.01 * range(attribs.x, 0.0, 1.0, 0.8, 1.2) * uScale;

    vAlpha = range(attribs.w, 0.0, 1.0, 0.5, 1.0);
    vAlpha *= crange(pos.y, 1.0, 0.8, 0.0, 1.0);
    vAlpha *= crange(pos.y, 0.05, -0.0, 1.0, 0.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}

#!SHADER: SnowParticles.fs

#require(range.glsl)

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    gl_FragColor = texture2D(tMap, uv);
    gl_FragColor *= vAlpha;
}{@}Stars.glsl{@}#!ATTRIBUTES
attribute vec3 attribs;

#!UNIFORMS
uniform sampler2D tMap;
uniform sampler2D tFlare;
uniform sampler2D tCenter;
uniform float uSize;

#!VARYINGS
varying vec3 vAttribs;
varying vec3 vColor;

#!SHADER: Stars.vs

#require(range.glsl)

vec2 getUVFromPos() {
    vec2 uv;
    uv.x = range(position.x, -1.0, 1.0, 0.0, 1.0);
    uv.y = range(position.y, -1.0, 1.0, 0.0, 1.0);
    return uv;
}

void main() {
    vColor = texture2D(tMap, getUVFromPos()).rgb;
    vAttribs = attribs;

    float scale = range(attribs.x, 0.0, 1.0, 0.8, 1.2);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (uSize * scale) * (1000.0 / length(mvPosition.xyz));
}

#!SHADER: Stars.fs

#require(range.glsl)

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);

    vec3 color = texture2D(tFlare, uv).rgb * vColor;
    color += texture2D(tCenter, uv).rgb * 0.5;

    float alpha = range(vAttribs.y, 0.0, 1.0, 0.5, 1.0);

    gl_FragColor = vec4(color, alpha);
}{@}Stream.glsl{@}#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tIceNormal;
uniform samplerCube tIceCube;
uniform float uTime;

#!VARYINGS
varying vec3 vViewPosition;
varying vec3 vLightPos;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vNormal;

#!SHADER: Stream.vs

#require(range.glsl)
#require(lights.glsl)

void main() {
    vec3 pos = position;
    pos.y *= crange(length(pos), 0.05, 0.3, 0.0, 1.0);

    vUv = uv;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;
    vLightPos = normalize(worldLight(lightPos[0]));
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
    vNormal = normalMatrix * normal;
}

#!SHADER: Stream.fs

#require(refl.fs)
#require(normalmap.glsl)
#require(dnormal.fs)
#require(range.glsl)
#require(phong.fs)

vec4 getIce() {
    vec2 uv = vUv;
    vec3 normal = unpackNormal(-vViewPosition, vNormal, tIceNormal, 1.0, 5.0, uv);
    vec3 rVec = refraction(vWorldPosition, normal, 0.96);
    vec3 reflected = envColor(tIceCube, rVec).rgb * 2.0;

//    reflected *= range(length(-vViewPosition.xy), 0.0, 0.5, 1.0, 3.6);

    vec3 lightDir = vLightPos;
    lightDir.xy *= -1.0;
    reflected += phong(1.0, vec3(1.0), vec3(1.0), 1.0, 1.0, normal, lightDir, vViewPosition) * 0.3;

    return vec4(reflected, 1.0);
}

void main() {
    gl_FragColor = getIce();
}{@}Trees.glsl{@}#!ATTRIBUTES
attribute vec3 offset;
attribute vec3 attribs;

#!UNIFORMS
uniform sampler2D tMask;
uniform sampler2D tDiffuse;
uniform sampler2D tSnow;
uniform sampler2D tNoise;
uniform sampler2D tSnowNormal;
uniform samplerCube tSnowCube;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform sampler2D tSky;
uniform sampler2D tAurora;
uniform float uAtmosphereBlend;
uniform float uAuroraStrength;

#!VARYINGS
varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vPos;
varying vec3 vLightPos;
varying vec2 vUv;
varying vec3 vAttribs;

#!SHADER: Trees.vs

#require(range.glsl)
#require(rotate.glsl)
#require(lights.glsl)

vec2 getUV() {
    vec2 uv = vec2(0.0);
    uv.x = range(offset.x, -0.5, 0.5, 0.0, 1.0);
    uv.y = range(offset.z, -0.5, 0.5, 0.0, 1.0);
    return uv;
}

void main() {
    vec2 tuv = getUV();
    float hide = texture2D(tMask, tuv).r * 9999999.0;

    vUv = uv;

    vec3 pos = position;
    pos = (vec4(pos, 1.0) * rotationMatrix(vec3(0.0, 1.0, 0.0), radians(attribs.z * 360.0))).xyz;
    pos = (vec4(pos, 1.0) * rotationMatrix(vec3(0.0, 0.0, 1.0), radians(range(attribs.x, 0.0, 1.0, -5.0, 5.0)))).xyz;
    pos.xz *= range(attribs.y, 0.0, 1.0, 0.9, 1.1);
    pos *= range(attribs.x, 0.0, 1.0, 1.0, 1.4);
    pos += offset + hide;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vViewPosition = -mvPosition.xyz;
    vPos = pos;
    vLightPos = normalize(worldLight(lightPos[0]));
    vAttribs = attribs;
    vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
}

#!SHADER: Trees.fs

#require(dnormal.fs)
#require(desaturate.fs)
#require(range.glsl)
#require(simplex3d.glsl)
#require(normalmap.glsl)
#require(blendmodes.glsl)
#require(neve.glsl)
#require(refl.fs)

vec3 getSnow(vec3 pNormal) {
     vec3 normal = unpackNormal(-vViewPosition, pNormal, tSnowNormal, 1.0, 5.0, vUv);
     float noise = texture2D(tNoise, 5.0 * vUv).r;
     float n = range(noise, 0.0, 1.0, 0.8, 1.0);
     vec3 diffuse = texture2D(tSnow, vUv * 10.0).rgb;
     float reflectNoise = clamp(range(diffuse.r, 0.87, 1.0, 0.0, 1.0), 0.0, 1.0);

     vec3 reflectVec = reflection(vWorldPosition, normal);
     vec3 sky = envColor(tSnowCube, reflectVec).rgb;

     vec3 color = diffuse;
     color += sky * 0.5 * reflectNoise;

     return color;
 }

void main() {
    vec3 normal = getDNormal(vViewPosition);
    float volume = dot(normal, vLightPos);

    vec3 diffuse = texture2D(tDiffuse, vUv * 40.0).rgb;
    diffuse = desaturate(diffuse, 1.0);

    vec3 color0 = mix(uColor0, diffuse * uColor0, 0.25);
    vec3 color1 = mix(uColor1, diffuse * uColor1, 0.25);

    vec3 color = mix(color0, color1, volume);

    color = rgb2hsv(color);
    color.x += vAttribs.y * 0.1;
    color.y += vAttribs.x * 0.05;
    color.y -= 0.1;
    color = hsv2rgb(color);

    vec3 snow = getSnow(normal);
    float snowAmt = step(0.06, vPos.y + snoise(vPos + vAttribs.x * 4.0)*0.04);
    color = mix(color, snow, snowAmt);

    vec2 rUV = getReflectionUV(vWorldPosition);
    color *= mix(texture2D(tSky, rUV).rgb, vec3(1.0), uAtmosphereBlend);
    color = mix(color, blendScreen(color, texture2D(tAurora, rUV).rgb), uAuroraStrength);

    color *= range(volume, 0.0, 1.0, 0.7, 1.0);

    gl_FragColor = vec4(color, 1.0);
}{@}Composite.fs{@}uniform sampler2D tSSAO;
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
}{@}SSAOBlur.fs{@}uniform vec2 resolution;
uniform vec2 dir;

#require(gaussianblur.fs)

void main() {
    gl_FragColor = blur13(tDiffuse, vUv, resolution, dir);
}{@}SSAOEdge.fs{@}uniform vec2 uResolution;

#require(edgedetection.fs)

void main() {
    vec4 edge = 1.0 - getEdge(tDiffuse, vUv, uResolution);
    gl_FragColor = edge;
}