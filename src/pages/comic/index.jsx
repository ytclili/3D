import * as THREE from "three";
import * as TWEEN from '../../../node_modules/three/examples/jsm/libs/tween.module';
import Animations from '../../assets/utils/animations';
import layer_0 from './images/layer_0.png';
import layer_1 from './images/layer_1.png';
import layer_2 from './images/layer_2.png';
import layer_3 from './images/layer_3.png';
import layer_4 from './images/layer_4.png';
import layer_5 from './images/layer_5.png';
import layer_6 from './images/layer_6.png';
import layer_7 from './images/layer_7.png';
import background from './images/background.png';
import boomImage from './images/boom.png';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import { useEffect } from "react";

const ComicPage =  () => {

    useEffect(()=>{
        init()
    },[])

    let container,light,layerGroup = new THREE.Group(),animateLayer,step = 0;
    let layers = [layer_0, layer_1, layer_2, layer_3, layer_4, layer_5, layer_6, layer_7];
    function init() {
        container = document.querySelector('.container');
        const renderer = new THREE.WebGLRenderer({ antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        scene.background = new THREE.TextureLoader().load(background);
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(-12, 0, 0);
        camera.lookAt(0, 0, 0);
        // scene.add(camera);
  

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        // 垂直旋转角度限制
        controls.minPolarAngle = 1.2;
        controls.maxPolarAngle = 1.8;
        // 水平旋转角度限制
        controls.minAzimuthAngle = -.6;
        controls.maxAzimuthAngle = .6;


        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.001, 0.001), new THREE.MeshLambertMaterial({}));
        cube.position.set(0, 0, 0,);
        light = new THREE.DirectionalLight(0xffffff, 1);
        light.intensity = .2        ;
        light.position.set(10, 10, 30);
        light.castShadow = true;
        light.target = cube;
        light.shadow.mapSize.width = 512 * 12;
        light.shadow.mapSize.height = 512 * 12;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = - 50;
        light.shadow.camera.left = - 50;
        light.shadow.camera.right = 100;
     
        scene.add(light);

        const ambientLight = new THREE.AmbientLight(0xdddddd);
        scene.add(ambientLight);

        let aspect = 18;
        for(let i = 0 ; i < layers.length ; i++){
            let layer = new THREE.TextureLoader().load(layers[i]);
            let layerMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.41, 16), new THREE.MeshPhysicalMaterial({map:layer,transparent:true,side:THREE.DoubleSide}));
            layerMesh.position.set(0,0,i);
            layerMesh.scale.set(1 - (i / aspect), 1 - (i / aspect), 1 - (i / aspect));

            if(i === 5){
                layerMesh.material.opacity = 0.9;
                layerMesh.material.metalness = 0.6; 
                layerMesh.material.emissive = new THREE.Color(0x55cfff);
                layerMesh.material.emissiveIntensity = 1.6;
            }
            if(i === 6){
                layerMesh.scale.set(1.5,1.5,1.5)
                animateLayer = layerMesh
            }
            layerGroup.add(layerMesh)

        }
        const boom = new THREE.Mesh(new THREE.PlaneGeometry(36.76, 27.05), new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load(boomImage),
            transparent: true,
            shininess: 160,
            specular: new THREE.Color(0xff6d00),
            opacity: .7
          }));
          boom.scale.set(.8, .8, .8);
      boom.position.set(0, 0, -3);
        layerGroup.add(boom)  
        scene.add(layerGroup);
        Animations.animateCamera(camera, controls, { x: 0, y: 0, z: 20 }, { x: 0, y: 0, z: 0 }, 3600, () => { });
        

        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });


        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            TWEEN && TWEEN.update()
            controls && controls.update();
            step+=0.01
            animateLayer.position.x = Math.cos(step) + 2.4
            animateLayer.position.y = .4 + Math.abs(Math.sin(step))
        }
        animate();
    }

    return <div className="container"></div>



}
export default ComicPage;