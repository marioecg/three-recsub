const vertex = /* glsl */ `
attribute float aRIndex;
attribute vec3 aPhase;

varying float vRIndex;
varying vec2 vUv;
varying vec3 vPhase;

void main() {
    vRIndex = aRIndex;
    vUv = uv;
    vPhase = aPhase;
    
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    
    gl_Position = projectionMatrix *  mvPosition;
}
`

const fragment = /* glsl */ `
#define PI  3.141592653589793238462643383279
#define TAU 6.283185307179586476925286766559

uniform float uTime;

varying float vRIndex;
varying vec2 vUv;
varying vec3 vPhase;

vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b * cos(6.283185 * (c * t + d));
}

void main() {
    float dir = mix(-1.0, 1.0, step(vRIndex, 0.5));
    float t = uTime * dir + vRIndex * TAU;
    float gradient = mix(vUv.x, vUv.y, step(vRIndex, 0.5));
    float x = cos(gradient + t) * 0.5 + 0.5;

    vec3 color = palette(
        x,
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(1.0, 1.0, 1.0),
        vPhase
    );

    gl_FragColor = vec4(color, 1.0);
}
`

export { vertex, fragment }
