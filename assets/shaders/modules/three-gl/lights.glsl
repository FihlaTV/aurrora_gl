vec3 worldLight(vec3 pos) {
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vec4 worldPosition = viewMatrix * vec4(pos, 1.0);
    return worldPosition.xyz - mvPos.xyz;
}

vec3 worldLight(vec3 lightPos, vec3 localPos) {
    vec4 mvPos = modelViewMatrix * vec4(localPos, 1.0);
    vec4 worldPosition = viewMatrix * vec4(lightPos, 1.0);
    return worldPosition.xyz - mvPos.xyz;
}

vec3 transformNormal(vec4 orientation) {
    vec3 n = normal;
    vec3 ncN = cross(orientation.xyz, n);
    n = ncN * (2.0 * orientation.w) + (cross(orientation.xyz, ncN) * 2.0 + n);
    return n;
}