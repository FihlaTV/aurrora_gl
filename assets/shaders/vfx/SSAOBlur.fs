uniform vec2 resolution;
uniform vec2 dir;

#require(gaussianblur.fs)

void main() {
    gl_FragColor = blur13(tDiffuse, vUv, resolution, dir);
}