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
    const mixers = [];
    const clock = new THREE.Clock();
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
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
        controls.enablePan = false;
        controls.maxPolarAngle = 1.5;
        controls.minDistance = 50;
        controls.maxDistance = 1200;

        const axesHelper = new THREE.AxesHelper(500);
        scene.add(axesHelper);

        // 添加环境光  环境光的作用并不是照亮整个canvas而是照亮里面的物体 不要以为添加了环境光整个canvas就会变亮
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
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
        const textureLoader = new THREE.TextureLoader();
        const textureFlare0 = textureLoader.load(lensflareTexture0);
        const textureFlare1 = textureLoader.load(lensflareTexture1);
        //镜头光晕
        const lensflare = new Lensflare();
        lensflare.addElement(new LensflareElement(textureFlare0, 600, 0, pointLight.color));
        lensflare.addElement(new LensflareElement(textureFlare1, 60, 0.6));
        lensflare.addElement(new LensflareElement(textureFlare1, 70, 0.7));
        lensflare.addElement(new LensflareElement(textureFlare1, 120, 0.9));
        lensflare.addElement(new LensflareElement(textureFlare1, 70, 1));
        pointLight.add(lensflare);
        scene.add(pointLight);

        //
        const manage = new THREE.LoadingManager();
        manage.onLoad = () => {};

        // 岛屿
        const loader = new GLTFLoader(manage);
        loader.load(islandModel, (mesh) => {
            mesh.scene.traverse((child) => {
                if (child.isMesh) {
                    child.material.roughness = 0.5;
                    child.material.metalness = 0.5;
                }
            });
            mesh.scene.scale.set(33, 33, 33);
            scene.position.set(0, -2, 0);
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

        // 修改流动速度
        water.rotation.x = -Math.PI / 2;
        water.position.y = 2;
        scene.add(water);

        // 天空
        const sky = new Sky();
        sky.scale.setScalar(10000);
        const skyUniforms = sky.material.uniforms;
        skyUniforms['turbidity'].value = 20;
        skyUniforms['rayleigh'].value = 2;
        skyUniforms['mieCoefficient'].value = 0.005;
        skyUniforms['mieDirectionalG'].value = 0.8;
        scene.add(sky);

        // 太阳
        const sun = new THREE.Vector3();
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        // 将角度值转换为弧度值，存储在phi和theta变量中
        const phi = THREE.MathUtils.degToRad(88);
        const theta = THREE.MathUtils.degToRad(180);
        sun.setFromSphericalCoords(1, phi, theta);
        sky.material.uniforms['sunPosition'].value.copy(sun);

        //彩虹
        const rainbowMaterial = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {},
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
        });
        const rainbowGeometry = new THREE.TorusGeometry(200, 10, 50, 100);
        const rainbow = new THREE.Mesh(rainbowGeometry, rainbowMaterial);
        rainbow.material.opacity = 0.1;
        rainbow.position.set(0, -50, -400);
        scene.add(rainbow);

        // 鸟
        loader.load(flamingoModel, (mesh) => {
            console.log(mesh);
            mesh.scene.scale.set(0.35, 0.35, 0.35);
            mesh.scene.position.set(-100, 80, -300);
            scene.add(mesh.scene);
            let bird2 = mesh.scene.clone();
            bird2.position.set(150, 80, -500);
            scene.add(bird2);

            const mixer = new THREE.AnimationMixer(mesh.scene);
            mixer.clipAction(mesh.animations[0]).setDuration(1.2).play();
            mixers.push(mixer);

            const mixer1 = new THREE.AnimationMixer(bird2);
            mixer1.clipAction(mesh.animations[0]).setDuration(1.8).play();
            mixers.push(mixer1);
        });

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
            const delta = clock.getDelta();
            mixers && mixers.forEach((mixer) => mixer.update(delta));
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
