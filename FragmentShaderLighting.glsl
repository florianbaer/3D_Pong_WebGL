precision mediump float;

uniform bool uEnableTexture;
uniform bool uEnableLighting;

uniform vec3 uLightPosition;
uniform vec3 uLightColor;

varying vec3 vNormalEye;
varying vec3 vVertexPositionEye3;

varying vec3 vColor;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;


const float ambientFactor = 0.1;
const float shininess = 30.0;
const vec3 specularMaterialColor = vec3(1, 1, 1);

void main() {
    vec3 baseColor = vColor;
    if (uEnableTexture) {
        baseColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t)).rgb;
    }

    if (uEnableLighting) {
        // calculate light direction as seen from the vertex position
        vec3 lightDirectionEye = normalize(uLightPosition - vVertexPositionEye3);
        vec3 normal = normalize(vNormalEye);

        // ambient lighting
        vec3 ambientColor = ambientFactor * baseColor.rgb;

        // diffuse lighting
        float cosAngle = clamp(dot(normal, lightDirectionEye), 0.0, 1.0);
        vec3 diffuseColor = cosAngle * baseColor.rgb * uLightColor;

        // specular lighting
        vec3 specularColor = vec3(0, 0, 0);
        if (cosAngle > 0.0) {
            vec3 reflectionDir =  normalize(reflect(-lightDirectionEye, normal));
            vec3 eyeDir = normalize(-1.0 * vVertexPositionEye3);
            float cosPhi = clamp(dot(reflectionDir, eyeDir), 0.0 , 1.0);
            cosPhi = pow(cosPhi, shininess);
            specularColor = cosPhi * specularMaterialColor * uLightColor * cosPhi;
        }
        vec3 color = ambientColor + diffuseColor + specularColor;
        gl_FragColor = vec4(color, 1.0);
    }
}

/*

precision mediump float;

uniform bool uEnableTexture;
uniform bool uEnableLighting;

uniform vec3 uLightPosition;
uniform vec3 uLightColor;

varying vec3 vNormalEye;
varying vec3 vVertexPositionEye3;

varying vec3 vColor;
varying vec2 vTextureCoord;
uniform sampler2D uSampler;


const float ambientFactor = 0.1;
const float shininess = 30.0;
const vec3 specularMaterialColor = vec3(1, 1, 1);


vec3 calculateLighting(vec3 lightColor, vec3 lightPosition) {
    // calculate light direction as seen from the vertex position
    vec3 lightVectorEye = lightPosition - vVertexPositionEye3;
    vec3 lightDirectionEye = normalize(vVertexPositionEye3);
    vec3 normal = normalize(vNormalEye);

    // calculate light attenuation
    float distance = length(lightVectorEye);
    float attenuationFactor = 1.0 / (distance *distance*distance);

    // diffuse lighting
    float diffuseFactor = max(dot(normal,lightDirectionEye),0.0);
    vec3 diffuseColor = diffuseFactor * vColor * lightColor * attenuationFactor;

    // specular lighting
    vec3 specularColor = vec3(0, 0, 0);
    if (diffuseFactor > 0.0) {
        vec3 reflectionDir = normalize(reflect(-lightDirectionEye, normal));
        vec3 eyeDir = -normalize(vVertexPositionEye3);
        float cosPhi = max(dot(reflectionDir, eyeDir), 0.0);
        float specularFactor = pow(cosPhi, shininess);
        specularColor = specularFactor * specularMaterialColor * lightColor * attenuationFactor;
    }
    return diffuseColor + specularColor;
}

void main() {

    // ambient lighting
    vec3 ambientColor = ambientFactor * vColor;
    vec3 color = ambientColor;

    if (uEnableLighting) {
        color += calculateLighting(uLightColor, uLightPosition);
    }
    gl_FragColor = vec4(color, 1.0);
}
*/
