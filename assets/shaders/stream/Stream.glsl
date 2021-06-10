#!ATTRIBUTES

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
}