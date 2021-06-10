#!ATTRIBUTES

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
}