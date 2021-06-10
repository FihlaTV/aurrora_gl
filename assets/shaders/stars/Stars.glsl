#!ATTRIBUTES
attribute vec3 attribs;

#!UNIFORMS
uniform sampler2D tMap;
uniform sampler2D tFlare;
uniform sampler2D tCenter;
uniform float uSize;

#!VARYINGS
varying vec3 vAttribs;
varying vec3 vColor;

#!SHADER: Stars.vs

#require(range.glsl)

vec2 getUVFromPos() {
    vec2 uv;
    uv.x = range(position.x, -1.0, 1.0, 0.0, 1.0);
    uv.y = range(position.y, -1.0, 1.0, 0.0, 1.0);
    return uv;
}

void main() {
    vColor = texture2D(tMap, getUVFromPos()).rgb;
    vAttribs = attribs;

    float scale = range(attribs.x, 0.0, 1.0, 0.8, 1.2);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = (uSize * scale) * (1000.0 / length(mvPosition.xyz));
}

#!SHADER: Stars.fs

#require(range.glsl)

void main() {
    vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);

    vec3 color = texture2D(tFlare, uv).rgb * vColor;
    color += texture2D(tCenter, uv).rgb * 0.5;

    float alpha = range(vAttribs.y, 0.0, 1.0, 0.5, 1.0);

    gl_FragColor = vec4(color, alpha);
}