import * as THREE from 'three'
import TrainTown from "../TrainTown.js";
import Floor from './Floor.js';
import Environment from './Environment.js';
import CatMan from './CatMan.js';
import Girl from './Girl.js';
import Grass from './Grass.js';
import CurlCreature from './CurlCreature.js';



export default class World 
{
    constructor()
    {
        this.trainTown = new TrainTown()
        this.scene = this.trainTown.scene
        this.resources = this.trainTown.resources
        this.resources.on('ready',()=>
        {
            // 리소스가 모두 로드되고 환경을 인스턴스한다.
            //console.log('ready')
           // this.catMan = new CatMan()
         //   this.girl = new Girl()
            this.floor = new Floor()   
            
           //this.cat = new Cat()
            
            this.grass = new Grass()
           
            this.environment = new Environment()

            this.curlCreature = new CurlCreature()
        })

       
       
    }

   

    update()
    {
       
        if(this.cat)
        {
            this.cat.update()
        }
        if(this.girl)
        {
            this.girl.update()
        }
        if(this.floor)
        {
            this.floor.update()
        }

        if(this.catMan)
        {
            this.catMan.update()
        }

        if(this.grass)
        {
            this.grass.update()
        }
    }
}