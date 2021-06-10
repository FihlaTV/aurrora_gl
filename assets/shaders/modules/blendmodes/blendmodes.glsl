const vec3 white = vec3(1.0);

#require(rgb2hsv.fs)

#define BlendColorDodgef(base, blend) 	((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0))
#define BlendColorBurnf(base, blend) 	((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0))
#define BlendVividLightf(base, blend) 	((blend < 0.5) ? BlendColorBurnf(base, (2.0 * blend)) : BlendColorDodgef(base, (2.0 * (blend - 0.5))))
#define Blend(base, blend, funcf) 		vec4(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b), 1.0)
#define BlendVividLight(base, blend) 	Blend(base, blend, BlendVividLightf)
#define BlendOverlayf(base, blend) 		(base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))
#define BlendOverlay(base, blend) 		Blend(base, blend, BlendOverlayf)
#define BlendAddf(base, blend) 			min(base + blend, 1.0)
#define BlendSubstractf(base, blend) 	max(base + blend - 1.0, 0.0)
#define BlendLinearLightf(base, blend) 	(blend < 0.5 ? BlendLinearBurnf(base, (2.0 * blend)) : BlendLinearDodgef(base, (2.0 * (blend - 0.5))))
#define BlendLinearDodgef 				BlendAddf
#define BlendLinearBurnf 				BlendSubstractf
#define BlendLinearLight(base, blend) 	Blend(base, blend, BlendLinearLightf)
#define BlendVividLightf(base, blend) 	((blend < 0.5) ? BlendColorBurnf(base, (2.0 * blend)) : BlendColorDodgef(base, (2.0 * (blend - 0.5))))
#define BlendHardMixf(base, blend) 		((BlendVividLightf(base, blend) < 0.5) ? 0.0 : 1.0)
#define BlendHardMix(base, blend) 		Blend(base, blend, BlendHardMixf)
#define BlendReflectf(base, blend) 		((blend == 1.0) ? blend : min(base * base / (1.0 - blend), 1.0))
#define BlendReflect(base, blend) 		Blend(base, blend, BlendReflectf)
#define BlendGlow(base, blend) 			BlendReflect(blend, base)

vec3 blendScreen(vec3 base, vec3 blend) {
    return white - ((white - blend) * (white - base));
}

vec3 blendSoftLight(vec3 base, vec3 blend) {
    return 2.0 * base * blend + base * base - 2.0 * base * base * blend;
}

vec3 blendSubtract(vec3 base, vec3 blend) {
    return base - blend;
}

vec3 blendVividLight(vec3 base, vec3 blend) {
    return BlendVividLight(vec4(base, 1.0), vec4(blend, 1.0)).rgb;
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return BlendOverlay(vec4(base, 1.0), vec4(blend, 1.0)).rgb;
}

vec3 blendLum(vec3 base, vec3 blend) {
    vec3 baseHSL = rgb2hsv(base);
    return hsv2rgb(vec3(baseHSL.r, baseHSL.g, rgb2hsv(blend).b));
}

vec3 blendPhoenix(vec3 base, vec3 blend) {
    return (min(base, blend) - max(base, blend) + white);
}

vec3 blendLinearLight(vec3 base, vec3 blend) {
    return Blend(vec4(base, 1.0), vec4(blend, 1.0), BlendLinearLightf).rgb;
}

vec3 blendLinearBurn(vec3 base, vec3 blend) {
    return max(base + blend - 1.0, 0.0);
}

vec3 blendLighten(vec3 base, vec3 blend) {
    return max(base, blend);
}

vec3 blendInverseDifference(vec3 base, vec3 blend) {
    return white - abs(white - base - blend);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
    return white - (white - base) / blend;
}

vec3 blendHardMix(vec3 base, vec3 blend) {
    return BlendHardMix(vec4(base, 1.0), vec4(blend, 1.0)).rgb;
}

vec3 blendGlow(vec3 base, vec3 blend) {
    return BlendGlow(vec4(base, 1.0), vec4(blend, 1.0)).rgb;
}