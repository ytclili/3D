import React, { useEffect } from 'react';
import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import kas from './models/kas.glb'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '../../../node_modules/three/examples/jsm/libs/tween.module';

let container,renderer,scene,camera,controls,clock = new THREE.Clock(),pointLight;
const Shadow = ()=>{


    useEffect(()=>{
        init()
        animate()
    },[])


    const init = ()=>{
        container = document.querySelector('.shadow');
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);


        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        scene.add(camera);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // const amibientLight = new THREE.AmbientLight(0xffffff);
        // scene.add(amibientLight);

        const directionLight = new THREE.DirectionalLight(0xffffff, 1);
        directionLight.position.set(-100, 0, -100);
        const directionHelper = new THREE.DirectionalLightHelper(directionLight);
        scene.add(directionLight, directionHelper);

        pointLight = new THREE.PointLight(0x88ffee, 2.7, 4, 3);
        pointLight.position.set(0, 3, 1.8);
        const pointHelper = new THREE.PointLightHelper(pointLight);
        scene.add(pointLight, pointHelper);


        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('libs/draco/');
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);
        gltfLoader.load(kas, (gltf)=>{
            console.log(gltf)
            gltf.scene.traverse((child)=>{
                if(child.isMesh){
                    gltf.scene.scale.set(1,1,1)
                }
            })
            scene.add(gltf.scene);
        })
    }
    
    let previousTime = 0
    let cursor = {x:0,y:0}

    document.addEventListener('mousemove', (event) => {
        event.preventDefault()
        cursor.x = event.clientX / window.innerWidth - 0.5
        cursor.y = event.clientY / window.innerHeight - 0.5
        // handleCursor(event)
      }, false)

    const animate = ()=>{
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls && controls.update();
        TWEEN &&  TWEEN.update()
        const elapsedTime = clock.getElapsedTime()
        const deltaTime = elapsedTime - previousTime
        previousTime = elapsedTime
        const parallaxY = cursor.y
        pointLight.position.y -= (parallaxY * 9 + pointLight.position.y - 2) * deltaTime
        const parallaxX = cursor.x
        pointLight.position.x += (parallaxX * 8 - pointLight.position.x) * 2 * deltaTime
        console.log(pointLight.position.x,pointLight.position.y)
    }


    return <div className="shadow"></div>

}
export default Shadow;