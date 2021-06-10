const mat3 yuv2rgb = mat3(
                          1, 0, 1.2802,
                          1, -0.214821, -0.380589,
                          1, 2.127982, 0
                          );

vec4 getRGB(vec2 uv) {
    vec4 lum = texture2D(tChroma, uv);
    vec4 chroma = texture2D(tLum, uv);

    vec3 yuv = vec3(
                        1.1643 * (lum.r - 0.0625),
                        chroma.r - 0.5,
                        chroma.a - 0.5
                        );

    vec3 rgb = yuv * yuv2rgb;
    return vec4(rgb, 1.0);
}