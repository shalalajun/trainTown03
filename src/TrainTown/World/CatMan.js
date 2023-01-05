import * as THREE from 'three' 
import TrainTown from "../TrainTown.js";
import toonVert from '../../shaders/vert.glsl'
import toonFrag from '../../shaders/frag.glsl'
import FlipBookAni from '../Utils/FlipBookAni.js';


export default class CatMan{
    constructor()
    {
        this.trainTown = new TrainTown()
        this.scene = this.trainTown.scene
        this.resources = this.trainTown.resources
        this.time = this.trainTown.time
        this.resource = this.resources.items.catman

        this.catManHeadTex = this.resources.items.catHead
        this.catManHeadTex.encoding = THREE.sRGBEncoding
        this.catManHeadTex.flipY = false;
        this.catManHeadTex.needsUpdate = true;

        this.spriteTex = this.resources.items.catFace
        this.spriteTex.flipY = false

        this.setBook()
 
       // this.spriteTex.repeat.set( 1, 1 );
        this.spriteTex.encoding = THREE.sRGBEncoding
        this.spriteTex.needsUpdate = true
        // this.spriteTex.warpS = THREE.RepeatWrapping;
        // this.spriteTex.warpT = THREE.RepeatWrapping;
        // this.spriteTex.repeat.set(1,1)

        this.catManBodyTex = this.resources.items.catBody
        this.catManBodyTex.encoding = THREE.sRGBEncoding
        this.catManBodyTex.flipY = false;
        this.catManBodyTex.needsUpdate = true;

        this.debug = this.trainTown.debug

       
        
        this.rampTex = this.resources.items.gradientTex

        this.params = {
           u_ramp : {value: this.rampTex},
           u_rimColor : {value:new THREE.Vector3(0.5,0.1,0.0)},
           u_resolution : {value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
           u_shadowPower : {value: 0.3},
           u_topColor : {value: new THREE.Color(0.925,0.560,0.042)},
           u_bottomColor : {value: new THREE.Color(1.000,0.656,0.860)},
           u_texture : [{value: this.spriteTex },{value: this.catManBodyTex }],
           u_ambient : {value: 0.09},
           u_shadowColor : {value: new THREE.Color('#10237e')}
        }

        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('cat')
        }
     
        this.setModel()
       
        this.flipBookAni = new FlipBookAni(this.spriteTex, 5, 5)
        this.flipBookAni.loop([0,1,2,3,4,5,6,7,11,12,13,14,15,16,17,18,19,20,21,22,23,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 3.8)
       // this.setAnimation()
    }

    setModel()
    {
        this.model = this.resource.scene
        this.model.scale.set(30, 30, 30)
        //console.log(this.model)
        this.scene.add(this.model)
        console.log(this.model)



        this.catManHeadMaterial = new THREE.MeshStandardMaterial({
             map:this.spriteTex,
             roughness: 0.4,
             defines : {
                LINE: false,
                RAMP: false,
                HEIGHT:false,
                HEIGHTNIGHT:false,
                SMOOTHTOON:true,
                SIMPLETOON:false,
                NOISE:false
            }
        });

        this.catManBodyMaterial = new THREE.MeshStandardMaterial(
            {map:this.catManBodyTex,
            roughness: 0.4,
            defines : {
                LINE: false,
                RAMP: false,
                HEIGHT:false,
                HEIGHTNIGHT:false,
                SMOOTHTOON:true,
                SIMPLETOON:false,
                NOISE:false
               }
            });
        

        this.catManHeadMaterial.onBeforeCompile = (shader) => {
           
            shader.uniforms.u_ramp = this.params.u_ramp;
            shader.uniforms.u_rimColor = this.params.u_rimColor;
            shader.uniforms.u_resolution = this.params.u_resolution;
            shader.uniforms.u_shadowPower = this.params.u_shadowPower;
            shader.uniforms.u_topColor = this.params.u_topColor;
            shader.uniforms.u_bottomColor = this.params.u_bottomColor;
            shader.uniforms.u_texture = this.params.u_texture[0];
            shader.uniforms.u_ambient = this.params.u_ambient;
            shader.uniforms.u_shadowColor = this.params.u_shadowColor;

            shader.vertexShader = shader.vertexShader.replace(
                "#define STANDARD",
                `#define STANDARD
                  //varying vec2 vUv;
                 
                `
            )

            shader.vertexShader = shader.vertexShader.replace(
                "#include <clipping_planes_vertex>",
                `#include <clipping_planes_vertex>
                 
                  //vUv = uv;
                  
                `
              )

            shader.fragmentShader = shader.fragmentShader.replace(
                "#define STANDARD",
                `
                #define STANDARD

               // varying vec2 vUv;
                uniform sampler2D u_texture;
                uniform sampler2D u_ramp;

                uniform vec3 u_rimColor;
                uniform vec2 u_resolution;
                uniform vec3 u_topColor;
                uniform vec3 u_bottomColor;

                uniform vec3 u_shadowColor;

                uniform float u_shadowPower;
                uniform float u_ambient;
                
           

                vec3 fresnel(in vec3 f0, in float product)
                {
                    //// 0(max fres) ~ 1(min fres)
                    return mix(f0, vec3(1.0), pow(1.0 - product, 5.0));
                } //에너지 보존 스넬

                `
            )

         
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <output_fragment>",
                `
                #ifdef OPAQUE
                diffuseColor.a = 1.0;
                #endif
                // https://github.com/mrdoob/three.js/pull/22425
                #ifdef USE_TRANSMISSION
                diffuseColor.a *= material.transmissionAlpha + 0.1;
                #endif

                //-------Base
                vec3 N = geometry.normal;
                vec3 L = normalize(directLight.direction);
                vec3 C = normalize(geometry.viewDir);
                vec3 H = normalize( directLight.direction + geometry.viewDir );
                float NdL = max(0.0,dot(N,L));

                //---specular

                float HdN = max(0.0,dot(H,N)); 
                float shiness = 100.0;
                vec3 specCol = u_topColor;
                vec3 specular = u_bottomColor;  


                // -----physic specular

                vec3 pSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;

                //---------fresnel 에너지보존

                float CdH = dot(C, H); // 0(max fres) ~ 1(min fres)
                vec3 fres = fresnel(vec3(0.2), CdH);

                
                
                //-----------------dot toon ----------------------

                vec2 st = gl_FragCoord.xy/u_resolution.xy;
                vec2 v;
                float f,s,g;
                float dotDiffuse = clamp(NdL,0.0,1.0);
                vec3 dotFinal;
            

                //-------rim

                float rim = dot(C,N);
                rim = 1.0 - rim;
                rim = rim*0.8;

                //-------texture, shadow
               // vec2 newUv = vUv / 5.0;
                vec4 tex = texture2D(u_texture,vUv);
                vec4 rampLight = texture2D(u_ramp,vec2(NdL,0.5));
                vec3 tempShadow = reflectedLight.directDiffuse * 0.6;



                DirectionalLightShadow directionalShadowTemp = directionalLightShadows[0];
                
                float shadow = getShadow(
                    directionalShadowMap[0],
                    directionalShadowTemp.shadowMapSize,
                    directionalShadowTemp.shadowBias,
                    directionalShadowTemp.shadowRadius,
                    vDirectionalShadowCoord[0]
                  );
          
                #ifdef SMOOTHTOON

             
                float toonNdL = NdL * shadow;

                //shadowColr 를 더해준다.

                vec3 toonNdLShadow = mix(u_shadowColor, vec3(1.0,1.0,1.0), toonNdL) + u_ambient;
                
                vec3 toonDiffuse = toonNdLShadow * tex.rgb;

                gl_FragColor = vec4( toonDiffuse , diffuseColor.a );
                
                #endif

                // gl_FragColor = vec4( outgoingLight, diffuseColor.a );

            `
            )

        }

        this.catManBodyMaterial.onBeforeCompile = (shader) => {
           
            shader.uniforms.u_ramp = this.params.u_ramp;
            shader.uniforms.u_rimColor = this.params.u_rimColor;
            shader.uniforms.u_resolution = this.params.u_resolution;
            shader.uniforms.u_shadowPower = this.params.u_shadowPower;
            shader.uniforms.u_topColor = this.params.u_topColor;
            shader.uniforms.u_bottomColor = this.params.u_bottomColor;
            shader.uniforms.u_texture = this.params.u_texture[1];
            shader.uniforms.u_ambient = this.params.u_ambient;
            shader.uniforms.u_shadowColor = this.params.u_shadowColor;

            shader.vertexShader = shader.vertexShader.replace(
                "#define STANDARD",
                `#define STANDARD
                  //varying vec2 vUv;
                 
                `
            )

            shader.vertexShader = shader.vertexShader.replace(
                "#include <clipping_planes_vertex>",
                `#include <clipping_planes_vertex>
                 
                  //vUv = uv;
                  
                `
              )

            shader.fragmentShader = shader.fragmentShader.replace(
                "#define STANDARD",
                `
                #define STANDARD

               // varying vec2 vUv;
                uniform sampler2D u_texture;
                uniform sampler2D u_ramp;

                uniform vec3 u_rimColor;
                uniform vec2 u_resolution;
                uniform vec3 u_topColor;
                uniform vec3 u_bottomColor;

                uniform vec3 u_shadowColor;

                uniform float u_shadowPower;
                uniform float u_ambient;
                
           

                vec3 fresnel(in vec3 f0, in float product)
                {
                    //// 0(max fres) ~ 1(min fres)
                    return mix(f0, vec3(1.0), pow(1.0 - product, 5.0));
                } //에너지 보존 스넬

                `
            )

         
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <output_fragment>",
                `
                #ifdef OPAQUE
                diffuseColor.a = 1.0;
                #endif
                // https://github.com/mrdoob/three.js/pull/22425
                #ifdef USE_TRANSMISSION
                diffuseColor.a *= material.transmissionAlpha + 0.1;
                #endif

                //-------Base
                vec3 N = geometry.normal;
                vec3 L = normalize(directLight.direction);
                vec3 C = normalize(geometry.viewDir);
                vec3 H = normalize( directLight.direction + geometry.viewDir );
                float NdL = max(0.0,dot(N,L));

                //---specular

                float HdN = max(0.0,dot(H,N)); 
                float shiness = 100.0;
                vec3 specCol = u_topColor;
                vec3 specular = u_bottomColor;  


                // -----physic specular

                vec3 pSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;

                //---------fresnel 에너지보존

                float CdH = dot(C, H); // 0(max fres) ~ 1(min fres)
                vec3 fres = fresnel(vec3(0.2), CdH);

                
                
                //-----------------dot toon ----------------------

                vec2 st = gl_FragCoord.xy/u_resolution.xy;
                vec2 v;
                float f,s,g;
                float dotDiffuse = clamp(NdL,0.0,1.0);
                vec3 dotFinal;
            

                //-------rim

                float rim = dot(C,N);
                rim = 1.0 - rim;
                rim = rim*0.8;

                //-------texture, shadow
               // vec2 newUv = vUv / 5.0;
                vec4 tex = texture2D(u_texture,vUv);
                vec4 rampLight = texture2D(u_ramp,vec2(NdL,0.5));
                vec3 tempShadow = reflectedLight.directDiffuse * 0.6;



                DirectionalLightShadow directionalShadowTemp = directionalLightShadows[0];
                
                float shadow = getShadow(
                    directionalShadowMap[0],
                    directionalShadowTemp.shadowMapSize,
                    directionalShadowTemp.shadowBias,
                    directionalShadowTemp.shadowRadius,
                    vDirectionalShadowCoord[0]
                  );
          
                #ifdef SMOOTHTOON

             
                float toonNdL = NdL * shadow;

                //shadowColr 를 더해준다.

                vec3 toonNdLShadow = mix(u_shadowColor, vec3(1.0,1.0,1.0), toonNdL) + u_ambient;
                
                vec3 toonDiffuse = toonNdLShadow * tex.rgb;

                gl_FragColor = vec4( toonDiffuse , diffuseColor.a );
                
                #endif

                // gl_FragColor = vec4( outgoingLight, diffuseColor.a );

            `
            )

        }

        this.model.traverse((child)=>
        {
            if(child instanceof THREE.Mesh && child.name == "Head")
            {
                child.material = this.catManHeadMaterial
                child.castShadow = true
                child.receiveShadow = true
                child.material.needsUpdate = true

                console.log(child.material)
            }
        })

        this.model.traverse((child)=>
        {
            if(child instanceof THREE.Mesh && child.name == "Body")
            {
                child.material = this.catManBodyMaterial
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        /**
         * 디버그
         */

        if(this.debug.active)
        {
            this.debugFolder
                .add(this.params.u_ambient,'value')
                .min(0.0)
                .max(1.0)
                .step(0.01)
                .name('u_ambient')
            
           
            this.debugFolder
                .addColor(this.params.u_shadowColor, "value")
                .name('u_shadowColor')
        }

      


    }

    setAnimation()
    {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {}
        // gltf 객체에 scene에는 모델링이 있고 animation에 animation 이 있기때문에 리소스에서 끄집어 내야한다.
        this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
        //this.animation.actions.idle.play()

        //애니가 여러개 있을때 참고
        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()
    }

    update()
    {
        this.flipBookAni.update(this.time.delta * 0.003)
        //this.catManHeadMaterial.uniforms.uMedSmooth = this.params.uMedSmooth
        //console.log(this.customUniforms.uMedSmooth)
       // this.animation.mixer.update(this.time.delta * 0.001)
    }


    setBook()
    {
       
        const currentTile = 24;
        const tileHoriz = 5;
        const tileVert = 5;

        this.spriteTex.magFilter = THREE.NearestFilter
        this.spriteTex.repeat.set(1/tileHoriz, 1/tileVert);
        const offsetX = (currentTile % tileHoriz) / tileHoriz
        const offsetY = (tileVert + Math.floor(currentTile / tileHoriz) - tileHoriz) /  tileVert
        
        this.spriteTex.offset.x = offsetX;
        this.spriteTex.offset.y = offsetY;

        console.log(offsetX, offsetY)
    }

}