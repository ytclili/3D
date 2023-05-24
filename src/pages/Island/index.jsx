import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import React, { useEffect, useRef } from 'react';
import Stats from 'three/examples/jsm/libs/stats.module';
import { Water } from 'three/examples/jsm/objects/Water';
import { Sky } from 'three/examples/jsm/objects/Sky';
import waterTexture from './images/waternormals.jpg';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import lensflareTexture0 from './images/lensflare0.png';
import lensflareTexture1 from './images/lensflare1.png';
import islandModel from './models/island.glb';
import flamingoModel from './models/flamingo.glb';
import vertexShader from './shaders/rainbow/vertex.glsl';
import fragmentShader from './shaders/rainbow/fragment.glsl';

import './index.css';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const Island = () => {
    useEffect(() => {
        init();
    }, []);

    const init = () => {
        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('canvas.canvas'),
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // renderer.toneMapping = THREE.ACESFilmicToneMapping;
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
        camera.position.set(0, 40, 140);
        scene.add(camera);

        // 性能检测
        console.log(Stats());
        const stats = new Stats();
        document.body.appendChild(stats.dom);
        let controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);

        // 添加环境光  环境光的作用并不是照亮整个canvas而是照亮里面的物体 不要以为添加了环境光整个canvas就会变亮
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(-1, 1.75, 1);
        // 查看效果
        dirLight.position.multiplyScalar(30);
        scene.add(dirLight);

        // 点光源
        const pointLight = new THREE.PointLight(0xffffff, 1.2, 2000);
        // 查看效果
        pointLight.color.setHSL(0.995, 0.5, 0.9);
        pointLight.position.set(0, 45, -2000);

        //
        const manage = new THREE.LoadingManager();
        manage.onLoad = () => {};

        // 岛屿
        const loader = new GLTFLoader(manage);
        loader.load(islandModel, (mesh) => {
            mesh.scene.scale.set(33, 33, 33);
            scene.add(mesh.scene);
        });

        // 海
        const oceanGeometry = new THREE.PlaneGeometry(10000, 10000);
        const water = new Water(oceanGeometry, {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader(manage).load(waterTexture, function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x0072ff,
            distortionScale: 4,
            fog: scene.fog !== undefined,
        });
        water.rotation.x = -Math.PI / 2;
        scene.add(water);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const animate = () => {
            requestAnimationFrame(animate);
            stats && stats.update();
            controls && controls.update();
            renderer.render(scene, camera);
        };
        animate();
    };

    return (
        <div className="island">
            <canvas className="canvas"> </canvas>
        </div>
    );
};

export default Island;
