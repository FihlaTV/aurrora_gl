#chunk(common);
#chunk(bsdfs);
#chunk(packing);
#chunk(lights_pars);
#chunk(shadowmap_pars_fragment);

varying vec3 vNormal;


float getShadowValue() {
    float shadow = 1.0;
//    #ifdef USE_SHADOWMAP

    #if ( NUM_POINT_LIGHTS > 0 )

	    PointLight pointLight;

	    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		    pointLight = pointLights[ i ];

		    float shadowValue = getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ] );
		    shadowValue += 1.0 - step(0.002, dot(pointLight.position, vNormal));
		    shadowValue = clamp(shadowValue, 0.0, 1.0);
		    shadow *= shadowValue;

	    }

    #endif

    #if ( NUM_DIR_LIGHTS > 0 )

        IncidentLight directLight;
        DirectionalLight directionalLight;

        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

            directionalLight = directionalLights[ i ];

            float shadowValue = getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] );
            shadowValue += (1.0 - step(0.002, dot(directionalLight.direction, vNormal))) * clamp(length(vNormal), 0.0, 1.0);
            shadowValue = clamp(shadowValue, 0.0, 1.0);
            shadow *= shadowValue;
        }

    #endif

//    #endif

    return shadow;
}