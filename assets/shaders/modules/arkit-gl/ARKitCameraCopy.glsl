#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tMap;
uniform vec2 uScale;

#!VARYINGS
varying vec2 vUv;

#!SHADER: ARKitCameraCopy.vs
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARKitCameraCopy.fs

#require(transformUV.glsl)

void main() {
    gl_FragColor = texture2D(tMap, scaleUV(vUv, uScale));
}