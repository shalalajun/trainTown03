import * as THREE from 'three' 
import TrainTown from "../TrainTown.js";
import KeyControl from '../Utils/KeyControls.js';

export default class Girl{
    constructor()
    {
        this.clock = new THREE.Clock()
        this.trainTown = new TrainTown()
        this.scene = this.trainTown.scene
        this.resources = this.trainTown.resources
        this.time = this.trainTown.time
        this.resource = this.resources.items.girl
        this.player = new THREE.Object3D() 
        this.animation = {}
        this.debug = this.trainTown.debug
       
        
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('girl')
        }

        this.keycontrol = new KeyControl(this.player, this.animation)
        this.setModel()
        this.setAnimation()
        //this.addControl()
    }

    setModel()
    {
        this.model = this.resource.scene
        this.model.scale.set(0.1, 0.1, 0.1)
        this.player.add(this.model)
        //this.player.userData.move = { forward: this.forward, turn: this.turn }; 
        this.scene.add(this.player)

        this.model.traverse((child)=>
        {
            if(child instanceof THREE.Mesh)
            {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
    }

    setAnimation()
    {
        
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {}
        // gltf 객체에 scene에는 모델링이 있고 animation에 animation 이 있기때문에 리소스에서 끄집어 내야한다.
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[7])
        this.animation.actions.walk = this.animation.mixer.clipAction(this.resource.animations[17])
        this.animation.actions.run = this.animation.mixer.clipAction(this.resource.animations[12])
      
        //this.animation.actions.idle.play()

        //애니가 여러개 있을때 참고

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

      
        
        this.animation.play = (name) =>
        {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, 0.4)

            this.animation.actions.current = newAction
        }   
    
        
        if(this.debug.active)
        {
            const debugObject = {
                playIdle: () => { this.animation.play('idle')},
                playWalking: () => { this.animation.play('walk')},
                playRunning: () => { this.animation.play('run')}
            }

            this.debugFolder.add(debugObject,'playIdle')
            this.debugFolder.add(debugObject,'playWalking')
            this.debugFolder.add(debugObject,'playRunning')
        }
    }

    update()
    {
        this.animation.mixer.update(this.time.delta * 0.001)
        this.keycontrol.updateAction()
    }

    
   
}