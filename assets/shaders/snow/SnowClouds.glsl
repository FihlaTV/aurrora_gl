#!ATTRIBUTES
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
}