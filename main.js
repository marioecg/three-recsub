import { WebGLRenderer, PerspectiveCamera, Scene, Clock, InstancedBufferAttribute } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RecSub } from 'https://cdn.jsdelivr.net/npm/three-recsub@1.0.0/+esm'
import { vertex, fragment } from './shaders.js'

let renderer
let camera, controls
let scene, subdiv
let clock,
    time = 0

init()
animate()

function init() {
    renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
    })
    renderer.setClearColor(0x000000, 1)
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement)

    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 2

    controls = new OrbitControls(camera, renderer.domElement)

    scene = new Scene()
    clock = new Clock()

    subdiv = new RecSub({
        depth: 6,
        strength: 1,
        speed: 0.75,
        frequency: 0.5,
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
            uFrequency: { value: 1.5 },
        },
    })

    // Add attributes to InstancedMesh inside subdiv
    let count = subdiv.mesh.count
    let geometry = subdiv.geometry

    let randomIndexArray = new Float32Array(count)

    for (let i = 0; i < count; i += 3) {
        let val = Math.random()
        randomIndexArray[i + 0] = val
        randomIndexArray[i + 1] = val
        randomIndexArray[i + 2] = val
    }

    let randomIndexAttribute = new InstancedBufferAttribute(randomIndexArray, 1)
    geometry.setAttribute('aRIndex', randomIndexAttribute)

    let phaseArray = new Float32Array(count * 3)

    for (let i = 0; i < count * 3; i += 3) {
        phaseArray[i + 0] = Math.random() * 0.1
        phaseArray[i + 1] = Math.random() * 0.2
        phaseArray[i + 2] = Math.random() * 0.3
    }

    let phaseAttribute = new InstancedBufferAttribute(phaseArray, 3)
    geometry.setAttribute('aPhase', phaseAttribute)

    scene.add(subdiv.mesh)

    onWindowResize()
    window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize() {
    let width = window.innerWidth
    let height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}

function animate() {
    requestAnimationFrame(animate)

    time = clock.getElapsedTime()
    subdiv.update(time)

    render()
}

function render() {
    renderer.render(scene, camera)
}
