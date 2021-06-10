#!ATTRIBUTES

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
}