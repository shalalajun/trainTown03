import * as THREE from 'three'
import TrainTown from "../TrainTown.js";
import { createNoise3D } from 'simplex-noise';
import vertex from '../../shaders/Curl/vert.glsl'
import fragment from '../../shaders/Curl/frag.glsl'




export default class CurlCreature
{
    constructor()
    {
        this.simplex3D = createNoise3D();
       

        this.computeCurl(0,0,0);
     

        this.trainTown = new TrainTown()
   
        this.floor = this.trainTown.world.floor
      
        this.scene = this.trainTown.scene
        this.resources = this.trainTown.resources
        this.time = this.trainTown.time
        this.camera = this.trainTown.camera.instance

        this.mouse = new THREE.Vector2()
        this.eMouse = new THREE.Vector2()
        this.elasticMouse = new THREE.Vector2(0,0)
        this.elasticMouseVel = new THREE.Vector2(0,0)
        
        this.raycaster = new THREE.Raycaster()
        this.document = document.querySelector('canvas.webgl')

        this.setMesh()
        this.setRayCast()
       

    }

    setRayCast()
    {
        this.sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.2,10),
            new THREE.MeshBasicMaterial({color:0xa8e6cf})
        )
        this.scene.add(this.sphere)

       


        
        this.document.addEventListener('mousemove',(event)=>{

            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
         
            this.raycaster.setFromCamera(this.mouse, this.camera)

           // console.log(this.floor)
            const intersects = this.raycaster.intersectObjects([this.floor.mesh])
            if(intersects.length>0)
            {
                let p = intersects[0].point
                this.sphere.position.copy(p)
            }    
        })

    

    }

    computeCurl(x, y, z){
        var eps = 0.0001;
      
        var curl = new THREE.Vector3();
      
        //Find rate of change in YZ plane
        var n1 = this.simplex3D(x, y + eps, z); 
        var n2 = this.simplex3D(x, y - eps, z); 
        //Average to find approximate derivative
        var a = (n1 - n2)/(2 * eps);
        var n1 = this.simplex3D(x, y, z + eps); 
        var n2 = this.simplex3D(x, y, z - eps); 
        //Average to find approximate derivative
        var b = (n1 - n2)/(2 * eps);
        curl.x = a - b;
      
        //Find rate of chanthis.simplex3D
        n1 = this.simplex3D(x, y, z + eps); 
        n2 = this.simplex3D(x, y, z - eps); 
        a = (n1 - n2)/(2 * eps);
        n1 = this.simplex3D(x + eps, y, z); 
        n2 = this.simplex3D(x - eps, y, z); 
        b = (n1 - n2)/(2 * eps);
        curl.y = a - b;
      
        //Find rate of change in XY plane
        n1 = this.simplex3D(x + eps, y, z); 
        n2 = this.simplex3D(x - eps, y, z); 
        a = (n1 - n2)/(2 * eps);
        n1 = this.simplex3D(x, y + eps, z); 
        n2 = this.simplex3D(x, y - eps, z); 
        b = (n1 - n2)/(2 * eps);
        curl.z = a - b;
      
        return curl;
      }

      setMesh()
      {
        this.material = new THREE.ShaderMaterial(
            {
                extensions: 
                {
                    derivatives: "#extension GL_OES_standard_derivatives : enable"
                },
                side: THREE.DoubleSide,
                uniforms: 
                {
                    time: { value: 0},
                    resolution: { value: new THREE.Vector4()},
                },

                vertexShader: vertex,
                fragmentShader: fragment
            }
        )

        //this.geometry = new THREE.PlaneGeometry(10, 10, 10, 10)


        for(let i=0; i < 200; i++)
        {

            let path = new THREE.CatmullRomCurve3(
                this.setCurve(new THREE.Vector3(
                    Math.random()-0.5,
                    Math.random()-0.5,
                    Math.random()-0.5,
                    )
                ));
            let geometry = new THREE.TubeGeometry(path,600,0.005,8,false)

            let curve = new THREE.Mesh(geometry, this.material)
            this.scene.add(curve)
                
        }

      }

      setCurve(start)
      {
        let scale = 3
        let points = []
        points.push(start)

        let currentPoint = start.clone()



        //let start = new THREE.Vector3(0,0,0)

        for(let i=0; i <600; i++)
        {
            let v = this.computeCurl(currentPoint.x/scale, currentPoint.y/scale, currentPoint.z/scale)
          
            currentPoint.addScaledVector(v,0.001)
            points.push(currentPoint.clone())
           
       
        }
        return points
      }

}