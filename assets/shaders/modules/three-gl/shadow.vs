vNormal = normalMatrix * normal;

vec4 worldPosition = modelMatrix * vec4(position, 1.0);
#chunk(shadowmap_vertex);