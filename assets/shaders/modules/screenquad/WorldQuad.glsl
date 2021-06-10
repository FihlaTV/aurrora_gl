#!ATTRIBUTES

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
}