import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import miKu from './models/Miku.glb';
import heart from './models/heart.glb';

const Virtual = () => {
    useEffect(() => {
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
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

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

        modalLoader = new GLTFLoader();
        modalLoader.load(miKu, (gltf) => {
            scene.add(gltf.scene);
        });

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animation() {
            requestAnimationFrame(animation);
            renderer.render(scene, camera);
        }
        animation();
    }

    return <div className="gpu-virtual"></div>;
};
export default Virtual;
