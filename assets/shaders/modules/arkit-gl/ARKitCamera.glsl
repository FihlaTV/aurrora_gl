#!ATTRIBUTES

#!UNIFORMS
uniform sampler2D tLum;
uniform sampler2D tChroma;

#!VARYINGS
varying vec2 vUv;

#!SHADER: ARKitCamera.vs
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARKitCameraLandscapeLeft.fs

#require(ARKitCommon.fs)

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    gl_FragColor = getRGB(uv);

}

#!SHADER: ARKitCameraLandscapeRight.fs

#require(ARKitCommon.fs)

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = 1.0 - c.x;
    uv.y = 1.0 - c.y;

    gl_FragColor = getRGB(uv);

}

#!SHADER: ARKitCameraPortrait.fs

#require(ARKitCommon.fs)

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = c.y;
    uv.y = 1.0 - c.x;

    gl_FragColor = getRGB(uv);

}

#!SHADER: ARKitCameraPortraitUpsideDown.fs

#require(ARKitCommon.fs)

void main() {
    vec2 uv = vUv;
    uv.y = 1.0 - uv.y;

    vec2 c = uv;
    uv.x = 1.0 - c.y;
    uv.y = c.x;

    gl_FragColor = getRGB(uv);

}