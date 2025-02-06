attribute vec3 aVertex;
attribute vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

const vec3 light = vec3(-0.75, -0.75, -1.0);

varying vec3 vNormal;
varying vec3 vLightDirectionView;
varying vec3 vPos;

void main ()
{
    // Model transforms.
    vec4 v = uView * uModel * vec4(aVertex, 1.0);
    gl_Position = uProjection * v;
    vPos = v.xyz;
    
    // Normal transforms.
    vec4 n = normalize(uView * uModel * vec4(aNormal, 0.0));
    vNormal = n.xyz;

    vLightDirectionView = (uView * vec4(light, 0.0)).xyz;
}
