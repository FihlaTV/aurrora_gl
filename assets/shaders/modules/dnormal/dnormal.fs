vec3 getDNormal(vec3 viewPos) {
    vec3 dfx = vec3(0.0);
    vec3 dfy = vec3(0.0);

    dfx.x = dFdx(viewPos.x);
    dfx.y = dFdx(viewPos.y);
    dfx.z = dFdx(viewPos.z);

    dfy.x = dFdy(viewPos.x);
    dfy.y = dFdy(viewPos.y);
    dfy.z = dFdy(viewPos.z);

    return normalize(cross(dfx, dfy));
}