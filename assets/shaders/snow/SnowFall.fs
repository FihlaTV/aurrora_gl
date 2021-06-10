uniform sampler2D tOrigin;
uniform sampler2D tAttributes;
uniform float uGravity;
uniform float uCurlScale;
uniform float uCurlSpeed;

#require(range.glsl)
#require(curl.glsl)

void main() {
    vec2 uv = getUV();
    vec4 attribs = getData4(tAttributes, uv);
    vec3 pos = getData(tInput, uv);

    pos.y -= uGravity * 0.015 * range(attribs.x, 0.0, 1.0, 0.8, 1.2);

    vec3 curl = curlNoise(pos * uCurlScale) * uCurlSpeed * 0.01 * range(attribs.y, 0.0, 1.0, 0.8, 1.2);
    curl.y *= 0.5;
    pos += curl;

    if (attribs.y > 0.7) pos.x = 99999.0;

    if (pos.y < -0.1) {
        pos = getData(tOrigin, uv);
        pos.y = 1.0;
    }

    gl_FragColor = vec4(pos, 1.0);
}