#!ATTRIBUTES
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
}