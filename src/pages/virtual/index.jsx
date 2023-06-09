import React, { useEffect } from 'react';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import miku from './models/miku.glb';
import heart from './models/heart.glb';

const Virtual = () => {
    useEffect(() => {
        init();
    }, []);

    let renderer,
        camera,
        scene,
        container,
        gltfLoader,
        light,
        miKu,
        mixer,
        clock,
        rayCrashObject = [];
    function init() {
        clock = new THREE.Clock();
        container = document.querySelector('.gl-virtual');
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
        scene.add(camera);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        // const cubeGeometry = new THREE.BoxGeometry(0.001, 0.001, 0.001);
        // const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        // const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        light = new THREE.DirectionalLight(0xb5b1c1, 1);
        light.intensity = 1.4;
        light.position.set(20, 20, 20);
        light.castShadow = true;
        // light.target = cube;
        light.shadow.mapSize.width = 512 * 12;
        light.shadow.mapSize.height = 512 * 12;
        light.shadow.camera.top = 130;
        light.shadow.camera.bottom = -80;
        light.shadow.camera.left = -70;
        light.shadow.camera.right = 80;
        scene.add(light);

        gltfLoader = new GLTFLoader();
        gltfLoader.load(miku, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    rayCrashObject.push(child);
                }
            });
            scene.add(gltf.scene);
            miKu = gltf;
            miKuPlayAnimation(5);
        });

        gltfLoader.load(heart, (gltf) => {
            gltf.scene.scale.set(0.01, 0.01, 0.01);
            scene.add(gltf.scene);
        });

        function miKuPlayAnimation(index) {
            let miKuAnimation = miKu.animations[index];
            mixer = new THREE.AnimationMixer(miKu.scene);
            mixer.clipAction(miKuAnimation).play();
        }

        function rayCast() {
            var raycaster = new THREE.Raycaster();
            renderer.domElement.addEventListener('click', (event) => {
                const x = (event.offsetX / window.innerWidth) * 2 - 1;
                const y = -(event.offsetY / window.innerHeight) * 2 + 1;
                raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
                const intersects = raycaster.intersectObjects(rayCrashObject);
                console.log(intersects, 'intersects', rayCrashObject);
                if (intersects.length > 0) {
                    console.log(intersects[0]);
                }
            });
        }
        rayCast();

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize, false);

        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
            mixer && mixer.update(clock.getDelta());
        }
        animate();
    }

    return <div className="gl-virtual"></div>;
};
export default Virtual;
