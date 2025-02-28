# three-recsub

A recursive subdivision using `InstancedMesh`, with support for custom shaders and uniforms. I’ve been exploring this structure to create animations and generative artworks—like [here](https://www.instagram.com/p/DGWGRKmvG9R/?igsh=OHI5NHdtc294YjAy), [here](https://www.instagram.com/p/DGTgNLWPBhI/?igsh=OGRwNDJhcG94aHp3), and [here](https://www.instagram.com/p/DGa8BHux9p1/?igsh=MXEwMXJ2ejRzZmlxYw==). Since I couldn’t find many examples of this algorithm in Three.js, I decided to create my own, with help from Michael Schlachter (thrax 🎱).

Hope it’s useful for anyone interested in exploring or building upon it!

## Settings

By default, instantiating the class creates a recursive subdivision displaying the UV coordinates of each quad. If you'd like to tweak it further, here are the available parameters:

| Parameter        | Type      | Default  | Description                                |
| ---------------- | --------- | -------- | ------------------------------------------ |
| `size`           | `Array`   | `[1, 1]` | Dimensions of the base quad.               |
| `depth`          | `Number`  | `4`      | Number of subdivision iterations.          |
| `strength`       | `Number`  | `0.8`    | How much the quads vary in size (max `1`). |
| `animate`        | `Boolean` | `true`   | Whether the subdivision moves over time.   |
| `speed`          | `Number`  | `1`      | Animation speed.                           |
| `frequency`      | `Number`  | `0.5`    | Frequency of movement variations.          |
| `vertexShader`   | `String`  | `null`   | Custom vertex shader (optional).           |
| `fragmentShader` | `String`  | `null`   | Custom fragment shader (optional).         |
| `uniforms`       | `Object`  | `{}`     | Custom uniforms (optional).                |

## Usage

```js
import { WebGLRenderer, PerspectiveCamera, Scene, Clock, InstancedBufferAttribute } from 'three'
import { RecSub } from 'three-recsub'

let renderer, camera
let scene, subdiv
let clock,
    time = 0

init()
render()

function init() {
    renderer = new WebGLRenderer({ antialias: true })
    renderer.setClearColor(0x000000, 1)
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement)

    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 2

    scene = new Scene()
    clock = new Clock()

    subdiv = new RecSub()
    scene.add(subdiv.mesh)

    onWindowResize()
    window.addEventListener('resize', onWindowResize)
}

function onWindowResize() {
    let width = window.innerWidth
    let height = window.innerHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}

function render() {
    requestAnimationFrame(render)

    time = clock.getElapsedTime()
    subdiv.update(time)

    renderer.render(scene, camera)
}
```
