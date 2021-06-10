#!ATTRIBUTES

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
}