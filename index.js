import {
    Group,
    PlaneGeometry,
    ShaderMaterial,
    InstancedBufferGeometry,
    InstancedMesh,
    InstancedBufferAttribute,
} from 'three'
import { vertex, fragment } from './shaders.js'
import { createNoise2D } from './simplex-noise.js'

const clamp = (num, min, max) => (num <= min ? min : num >= max ? max : num)
const lerp = (a, b, n) => a * (1 - n) + b * n

class RecSub {
    static defaultOptions = {
        size: [1, 1],
        depth: 4,
        strength: 0.8,
        animate: true,
        speed: 1,
        frequency: 0.5,
        vertexShader: vertex,
        fragmentShader: fragment,
    }

    constructor(opts = {}) {
        const {
            size = [1, 1],
            depth = 4,
            strength = 0.8,
            animate = true,
            speed = 1,
            frequency = 0.5,
            vertexShader,
            fragmentShader,
        } = { ...RecSub.defaultOptions, ...opts }

        // Assign properties
        this.size = size
        this.width = size[0]
        this.height = size[1]

        // Powers of 2 make a better composition
        this.depth = Math.max(depth, 1)
        this.instanceCount = Math.pow(2, this.depth)

        this.strength = clamp(strength, 0, 1)
        this.animate = animate
        this.speed = speed
        this.frequency = Math.max(0, frequency)

        // Shaders
        this.vertex = vertexShader
        this.fragment = fragmentShader

        this.time = 0
        this.noise = createNoise2D()

        this.setup()
    }

    setup = () => {
        // Make a quad that goes from 0 to 1 in both x and y directions
        const geometry = new PlaneGeometry()
        const positionArray = geometry.attributes.position.array
        for (let i = 0; i < positionArray.length; i += 3) {
            positionArray[i] += 0.5
            positionArray[i + 1] += 0.5
        }

        this.dummy = new Group()
        this.instanceTop = 0

        this.material = new ShaderMaterial({
            vertexShader: this.vertex,
            fragmentShader: this.fragment,
            uniforms: {
                uTime: { value: 0 },
            },
            depthTest: false,
            depthWrite: false,
        })

        this.geometry = new InstancedBufferGeometry().copy(geometry)
        this.mesh = new InstancedMesh(this.geometry, this.material, this.instanceCount)

        this.setBuffers()
    }

    setBuffers = () => {
        const indexArray = new Float32Array(this.instanceCount)

        for (let i = 0; i < this.instanceCount; i++) {
            indexArray[i] = i
        }

        this.geometry.setAttribute('aIndex', new InstancedBufferAttribute(indexArray, 1))
    }

    rect = (x, y, w, h) => {
        this.dummy.scale.set(w, h, 1)
        this.dummy.position.set(x, y, 0)
        this.dummy.updateMatrix()
        this.mesh.setMatrixAt(this.instanceTop++, this.dummy.matrix)
    }

    move = (x) => {
        // Whatever way you're creating the motion, values
        // have to be between [0, 1] to look like a grid
        // example: Math.sin(x + this.time) * 0.5 + 0.5
        // or noise like here
        const n = this.noise2D(x, 0, this.frequency) * 0.5 + 0.5

        return n
    }

    makeTree = (left, top, right, bottom, depth = 0, seed = 0) => {
        if (depth >= this.depth) {
            this.rect(left, top, right - left, bottom - top)
            return
        }

        depth++

        let splitRatio = this.move(seed + depth + this.time) * this.strength + (1 - this.strength) * 0.5

        if (depth % 2 === 1) {
            // Odd: horizontal split
            let split = lerp(left, right, splitRatio)
            this.makeTree(left, top, split, bottom, depth, seed + 1.5)
            this.makeTree(split, top, right, bottom, depth, seed)
        } else {
            // Even: vertical split
            let split = lerp(top, bottom, splitRatio)
            this.makeTree(left, top, right, split, depth, seed)
            this.makeTree(left, split, right, bottom, depth, seed + 1.5)
        }
    }

    noise2D(x, y, fr = 1) {
        return this.noise(x * fr, y * fr)
    }

    update = (t = performance.now() / 1000) => {
        if (this.animate) {
            this.time = t * this.speed
            this.material.uniforms.uTime.value = t
            this.mesh.instanceMatrix.needsUpdate = true
        }

        this.instanceTop = 0
        this.makeTree(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2)
    }
}

export { RecSub }
