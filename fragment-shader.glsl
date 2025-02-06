precision mediump float;

uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vLightDirectionView;
varying vec3 vPos;

const float ambientFactor = 0.075;
const float shininess = 64.0;
const vec3 lightColor = vec3(1.0, 1.0, 0.923);

void main ()
{
    vec3 ambientColor = ambientFactor * uColor;

    vec3 normal = normalize(vNormal);
    vec3 pos = normalize(-vPos);
    
    vec3 lightEyeDirection = normalize(-vLightDirectionView);
    
    float diffuseFactor = max(0.0, dot(normal, lightEyeDirection));
    vec3 diffuseColor = diffuseFactor * uColor;

    vec3 halfway = normalize(pos + lightEyeDirection);
    float specularFactor = pow(max(0.0, dot(normal, halfway)), shininess);
    vec3 specularColor = lightColor * specularFactor;

    vec3 color = ambientColor + diffuseColor + specularColor;
    gl_FragColor = vec4(color, 1.0);
}
