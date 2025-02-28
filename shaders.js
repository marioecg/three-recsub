const vertex = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    
    gl_Position = projectionMatrix *  mvPosition;
}
`

const fragment = /*glsl*/ `
uniform float uTime;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
}
`

export { vertex, fragment }
