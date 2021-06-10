void main() {
    vec2 uv = getUV();
    vec3 pos = getData(tInput, uv);
    pos += 0.01;
    gl_FragColor = vec4(pos, 1.0);
}