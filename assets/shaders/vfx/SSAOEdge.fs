uniform vec2 uResolution;

#require(edgedetection.fs)

void main() {
    vec4 edge = 1.0 - getEdge(tDiffuse, vUv, uResolution);
    gl_FragColor = edge;
}