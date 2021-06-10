#!ATTRIBUTES

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
}