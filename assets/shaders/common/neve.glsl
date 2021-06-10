vec2 getReflectionUV(vec3 worldPos) {
    vec2 uv = vec2(0.0);
    uv.x = range(worldPos.x, -1.0, 1.0, 0.0, 1.0);
    uv.y = range(worldPos.z, -1.0, 1.0, 0.0, 1.0);
    return uv;
}