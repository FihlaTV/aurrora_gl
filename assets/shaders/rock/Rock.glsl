#!ATTRIBUTES

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
}