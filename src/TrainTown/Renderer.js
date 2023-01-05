import * as THREE from 'three'
import TrainTown from "./TrainTown.js";

export default class Renderer
{
    constructor()
    {
        this.trainTown = new TrainTown()
        this.canvas = this.trainTown.canvas
        this.sizes = this.trainTown.sizes
        this.scene = this.trainTown.scene
        this.camera = this.trainTown.camera

        this.setInstance()
    }

    setInstance()
    {
        this.instance = new THREE.WebGLRenderer(
            {
                canvas : this.canvas,
                antialias : true
            })

            this.instance.physicallyCorrectLights = true
            this.instance.outputEncoding = THREE.sRGBEncoding
            this.instance.toneMapping = THREE.CineonToneMapping
            this.instance.toneMappingExposure = 1.75
            this.instance.shadowMap.enabled = true
            this.instance.shadowMap.type = THREE.PCFSoftShadowMap
            this.instance.physicallyCorrectLights = true;
            this.instance.setClearColor('#211d20')
            this.instance.setSize(this.sizes.width, this.sizes.height)
            this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }

    resize()
    {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(Math.min(this.sizes.pixelRatio, 2))
    }
    
    update()
    {
        this.instance.render(this.scene, this.camera.instance)
    }
}