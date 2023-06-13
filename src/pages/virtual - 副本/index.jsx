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

    let camera,
        renderer,
        scene,
        clock,
        controls,
        modalLoader,
        miKuModal,
        mixer,
        interactableMeshes = [];
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
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    interactableMeshes.push(child);
                }
            });
            miKuModal = gltf;
            playAnimation(5);
        });

        modalLoader.load(heart, (gltf) => {
            gltf.scene.scale.set(0.01, 0.01, 0.01);
            scene.add(gltf.scene);
        });

        function playAnimation(animationIndex) {
            let meshAnimation = miKuModal.animations[animationIndex];
            mixer = new THREE.AnimationMixer(miKuModal.scene);
            mixer.clipAction(meshAnimation).play();
        }

        function initRaycaster() {
            // 增加点击事件，声明raycaster和mouse变量
            let raycaster = new THREE.Raycaster();
            renderer.domElement.addEventListener(
                'click',
                (event) => {
                    // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
                    let x = (event.clientX / window.innerWidth) * 2 - 1;
                    let y = -(event.clientY / window.innerHeight) * 2 + 1;
                    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
                    raycaster.setFromCamera({ x, y }, camera);
                    // 获取raycaster直线和所有模型相交的数组集合
                    let intersects = raycaster.intersectObjects(interactableMeshes);
                    console.log(intersects);
                    playAnimation(Math.floor(Math.random() * (5 - 0 + 1)) + 0);
                },
                false,
            );
        }
        initRaycaster();

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animation() {
            requestAnimationFrame(animation);
            renderer.render(scene, camera);
            mixer && mixer.update(clock.getDelta(clock.getDelta()));
        }
        animation();
    }

    return <div className="gpu-virtual"></div>;
};
export default Virtual;
