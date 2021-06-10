vec2 processParallaxMap( in vec3 V, vec2 uv, float pScale, float pMinLayers,  float pMaxLayers, sampler2D displacementMap) {

    // Determine number of layers from angle between V and N
    float numLayers = mix( pMaxLayers, pMinLayers, abs( dot( vec3( 0.0, 0.0, 1.0 ), V ) ) );

    float layerHeight = 1.0 / numLayers;
    float currentLayerHeight = 0.0;
    // Shift of texture coordinates for each iteration
    vec2 dtex = pScale * V.xy / V.z / numLayers;

    vec2 currentTextureCoords = uv;

    float heightFromTexture = texture2D( displacementMap, currentTextureCoords ).r;

    // while ( heightFromTexture > currentLayerHeight )
    // Infinite loops are not well supported. Do a "large" finite
    // loop, but not too large, as it slows down some compilers.
    for ( int i = 0; i < 30; i += 1 ) {
        if ( heightFromTexture <= currentLayerHeight ) {
            break;
        }
        currentLayerHeight += layerHeight;
        // Shift texture coordinates along vector V
        currentTextureCoords -= dtex;
        heightFromTexture = texture2D( displacementMap, currentTextureCoords ).r;
    }

    vec2 deltaTexCoord = dtex / 2.0;
    float deltaHeight = layerHeight / 2.0;

    // Return to the mid point of previous layer
    currentTextureCoords += deltaTexCoord;
    currentLayerHeight -= deltaHeight;

    // Binary search to increase precision of Steep Parallax Mapping
    const int numSearches = 5;
    for ( int i = 0; i < numSearches; i += 1 ) {

        deltaTexCoord /= 2.0;
        deltaHeight /= 2.0;
        heightFromTexture = texture2D( displacementMap, currentTextureCoords ).r;
        // Shift along or against vector V
        if( heightFromTexture > currentLayerHeight ) { // Below the surface

            currentTextureCoords -= deltaTexCoord;
            currentLayerHeight += deltaHeight;

        } else { // above the surface

            currentTextureCoords += deltaTexCoord;
            currentLayerHeight -= deltaHeight;

        }

    }
    return currentTextureCoords;

}

vec2 parallaxMap( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition, vec2 uv, float scale, float minLayers, float maxLayers, sampler2D displacementMap ) {

    vec2 texDx = dFdx( uv );
    vec2 texDy = dFdy( uv );

    vec3 vSigmaX = dFdx( surfPosition );
    vec3 vSigmaY = dFdy( surfPosition );
    vec3 vR1 = cross( vSigmaY, surfNormal );
    vec3 vR2 = cross( surfNormal, vSigmaX );
    float fDet = dot( vSigmaX, vR1 );

    vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );
    vec3 vProjVtex;
    vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;
    vProjVtex.z = dot( surfNormal, viewPosition );

    return processParallaxMap( vProjVtex, uv, scale, minLayers, maxLayers, displacementMap );

} //mvPosition.xyz, normal, normalize(-mvPosition), vUv, scale, minLayers, maxLayers, displacementMap

vec3 unpackParallaxNormal( vec3 eye_pos, vec3 surf_norm, sampler2D normalMap, vec2 uv ) {

    vec3 q0 = dFdx( eye_pos.xyz );
    vec3 q1 = dFdy( eye_pos.xyz );
    vec2 st0 = dFdx( vUv.st );
    vec2 st1 = dFdy( vUv.st );

    vec3 S = normalize( q0 * st1.t - q1 * st0.t );
    vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
    vec3 N = normalize( surf_norm );

    vec3 mapN = texture2D( normalMap, uv ).xyz * 2.0 - 1.0;
//    vec3 mapN = texture2D( normalMap, vUv ).xyz * 2.0 - 1.0;
//    mapN.xy = normalScale * mapN.xy;
    mapN.xy = 1.0 * mapN.xy;
    mat3 tsn = mat3( S, T, N );
    return normalize( tsn * mapN );

} //mvPosition.xyz, normal, normalMap, parallaxMapUV
