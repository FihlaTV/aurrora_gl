uniform sampler2D tPos;

#require(antimatter.glsl)

void main() {
    vec4 decodedPos = texture2D(tPos, position.xy);
    vec3 pos = decodedPos.xyz;
    float size = 0.02;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}