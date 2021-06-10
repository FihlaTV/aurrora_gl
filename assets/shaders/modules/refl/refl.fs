vec3 reflection(vec3 worldPosition, vec3 normal) {
    vec3 cameraToVertex = normalize(worldPosition - cameraPosition);
    
    return reflect(cameraToVertex, normal);
}

vec3 refraction(vec3 worldPosition, vec3 normal, float rRatio) {
    vec3 cameraToVertex = normalize(worldPosition - cameraPosition);
    
    return refract(cameraToVertex, normal, rRatio);
}

vec4 envColor(samplerCube map, vec3 vec) {
    float flipNormal = 1.0;
    return textureCube(map, flipNormal * vec3(-1.0 * vec.x, vec.yz));
}

vec4 envColorEqui(sampler2D map, vec3 direction) {
    vec2 uv;
    uv.y = asin( clamp( direction.y, - 1.0, 1.0 ) ) * 0.31830988618 + 0.5;
    uv.x = atan( direction.z, direction.x ) * 0.15915494 + 0.5;
    return texture2D(map, uv);
}