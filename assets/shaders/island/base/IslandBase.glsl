#!ATTRIBUTES

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
}