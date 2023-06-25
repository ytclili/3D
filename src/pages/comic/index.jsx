import * as THREE from "three";
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

    let container,light,layerGroup = new THREE.Group();
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
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(-12, 0, 0);
        camera.lookAt(0, 0, 0);
        scene.add(camera);
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;


        const cube = new THREE.Mesh(new THREE.BoxGeometry(0.001, 0.001, 0.001), new THREE.MeshLambertMaterial({}));
        cube.position.set(0, 0, 0,);
        light = new THREE.DirectionalLight(0xffffff, 1);
        light.intensity = .2;
        light.position.set(10, 10, 30);
        light.castShadow = true;
        light.target = cube;
        scene.add(light);

        let aspect = 18;
        for(let i = 0 ; i < layers.length ; i++){
            let layer = new THREE.TextureLoader().load(layers[i]);
            let layerMesh = new THREE.Mesh(new THREE.PlaneGeometry(10.41, 16), new THREE.MeshPhysicalMaterial({map:layer,transparent:true,side:THREE.DoubleSide}));
            layerMesh.position.set(0,0,i);
            layerMesh.scale.set(1 - (i / aspect), 1 - (i / aspect), 1 - (i / aspect));
            // scene.add(layerMesh);
            layerGroup.add(layerMesh)

            if(i === 5){
                layerMesh.material.opacity = 0.9;
                layerMesh.material.metalness = 0.6; 
                layerMesh.material.emissive = new THREE.Color(0x55cfff);
                layerMesh.material.emissiveIntensity = 1.6;
            }



            scene.add(layerGroup);
        }








        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });


        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    }

    return <div className="container"></div>



}
export default ComicPage;