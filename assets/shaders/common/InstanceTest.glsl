#!ATTRIBUTES
attribute vec3 offset;

#!UNIFORMS

#!VARYINGS

#!SHADER: InstanceTest.vs
void main() {
    vec3 pos = position;
    pos += offset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

#!SHADER: InstanceTest.fs
void main() {
    gl_FragColor = vec4(1.0);
}