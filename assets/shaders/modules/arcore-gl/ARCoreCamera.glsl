#!ATTRIBUTES

#!UNIFORMS

#!VARYINGS
varying vec2 vUv;

#!SHADER: ARCoreCameraPortrait.vs
void main() {
    vUv = uv;
    vUv.x = 1.0 - uv.y;
    vUv.y = 1.0 - uv.x;

    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARCoreCameraPortraitUpsideDown.vs
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARCoreCameraLandscapeLeft.vs
void main() {
    vUv = uv;
    vUv.x = uv.x;
    vUv.y = 1.0 - uv.y;
    gl_Position = vec4(position, 1.0);
}

#!SHADER: ARCoreCameraLandscapeRight.vs
void main() {
    vUv = uv;
    vUv.x = 1.0 - uv.x;
    vUv.y = 1.0 - (1.0 - uv.y);
    gl_Position = vec4(position, 1.0);
}


#!SHADER: ARCoreCamera.fs
uniform samplerExternalOES tMap;

void main() {
    gl_FragColor = texture2D(tMap, vUv);
}