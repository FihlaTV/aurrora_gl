#!ATTRIBUTES
attribute vec4 attribs;

#!UNIFORMS
uniform sampler2D tPos;
uniform sampler2D tMap;
uniform float uScale;

#!VARYINGS
varying float vAlpha;

#!SHADER: SnowParticles.vs

#require(antimatter.glsl)
#require(range.glsl)

void main() {
    vec3 pos = texture2D(tPos, position.xy).xyz;
    float size = 0.01 * range(attribs.x, 0.0, 1.0, 0.8, 1.2) * uScale;

    vAlpha = range(attribs.w, 0.0, 1.0, 0.5, 1.0);
    vAlpha *= crange(pos.y, 1.0, 0.8, 0.0, 1.0);
    vAlpha *= crange(pos.y, 0.05, -0.0, 1.0, 0.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (1000.0 / length(mvPosition.xyz));
    gl_Position = projectionMatrix * mvPosition;
}

#!SHADER: SnowParticles.fs

#require(range.glsl)

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    gl_FragColor = texture2D(tMap, uv);
    gl_FragColor *= vAlpha;
}