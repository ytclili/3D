import React, { useEffect } from 'react';
import * as THREE from 'three';
import WebGPU from 'three/examples/jsm/capabilities/WebGPU';
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer';
import { toneMapping } from 'three/examples/jsm/nodes/Nodes';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import miKu from './models/Miku.glb';
import heart from './models/heart.glb';

const Virtual = () => {
    useEffect(() => {
        if (WebGPU.isAvailable() === false) {
            document.body.appendChild(WebGPU.getErrorMessage());
            throw new Error('No WebGPU support');
        }

        init();
    }, []);

    let camera, renderer, scene, clock, controls, modalLoader;
    function init() {
        clock = new THREE.Clock();
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
        camera.position.set(0, 10, 10);
        camera.lookAt(0, 0, 0);
        scene = new THREE.Scene();
        scene.background = new THREE.Color('lightblue');
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        camera.add(spotLight);
        scene.add(camera);

        renderer = new WebGPURenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        // renderer.toneMappingNode = toneMapping(THREE.LinearToneMapping, 0.15);
        // 替代了animate
        renderer.setAnimationLoop(animate);
        document.body.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        window.addEventListener('resize', onWindowResize, false);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 0, 0);
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
        dirLight.position.set(20, 20, 20);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // virtual miKu
        modalLoader = new GLTFLoader();
        modalLoader.load(miKu, (gltf) => {
            scene.add(gltf.scene);
        });

        // heart
        modalLoader.load(heart, (gltf) => {
            gltf.scene.traverse((child) => {
                console.log(child.name);
                if (child.isMesh) {
                    child.material.color = new THREE.Color(0xfe3f47);
                }
            });
            gltf.scene.scale.set(0.005, 0.005, 0.005);

            scene.add(gltf.scene);
        });
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        const delta = clock.getDelta();
        renderer.render(scene, camera);
        controls.update(delta);
    }

    return <div className="gpu-virtual"></div>;
};
export default Virtual;
