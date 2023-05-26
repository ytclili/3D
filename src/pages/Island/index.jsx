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
import * as TWEEN from '../../../node_modules/three/examples/jsm/libs/tween.module';
import Animations from '../../assets/utils/Animations'

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
        const stats = new Stats();
        document.body.appendChild(stats.dom);
        let controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.maxPolarAngle = 1.5;
        controls.minDistance = 50;
        controls.maxDistance = 1200;

        const axesHelper = new THREE.AxesHelper(500);
        axesHelper.position.set(0, 20, 0);
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
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();
        scene.environment = pmremGenerator.fromScene(sky).texture;

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

        const raycaster = new THREE.Raycaster();
        const points = [
            {
                position: new THREE.Vector3(10, 46, 0),
                element: document.querySelector('.point-0'),
            },
            {
                position: new THREE.Vector3(-10, 8, 24),
                element: document.querySelector('.point-1'),
            },
            {
                position: new THREE.Vector3(30, 10, 70),
                element: document.querySelector('.point-2'),
            },
            {
                position: new THREE.Vector3(-100, 50, -300),
                element: document.querySelector('.point-3'),
            },
            {
                position: new THREE.Vector3(-120, 50, -100),
                element: document.querySelector('.point-4'),
            },
        ];

        document.querySelectorAll(".point").forEach((point, index) => {
            point.addEventListener('click', (event) => {
                let className  = event.target.classList[event.target.classList.length - 1]
                console.log(className)
                switch(className) {
                    case 'label-0': 
                        return Animations.animateCamera(camera, controls,new THREE.Vector3  (-15, 86, 60), new THREE.Vector3(0, 0, 0), 1000,()=>{});
                        case 'label-1': 
                        return Animations.animateCamera(camera, controls,new THREE.Vector3  (-20,10,60), new THREE.Vector3(0, 0, 0), 1000,()=>{});
                        case 'label-2': 
                        return Animations.animateCamera(camera, controls,new THREE.Vector3  (30,10,100), new THREE.Vector3(0, 0, 0), 1000,()=>{});
                        case 'label-3': 
                      default:
                        return Animations.animateCamera(camera, controls,new THREE.Vector3  (0,40,140), new THREE.Vector3(0, 0, 0), 1000,()=>{});
                }
            })
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
            TWEEN && TWEEN.update();
            for(let point of points) {
                   // 获取2D屏幕位置
          const screenPosition = point.position.clone();
          // 设置光线的起点和方向  比如 眼睛就是摄像机 数据和目标对象就是方向
          raycaster.setFromCamera(screenPosition, camera);
          // 检测场景里面所有的对象是否有视线遮挡
          const intersects = raycaster.intersectObjects(scene.children, true);
        //   可以将点的三维坐标转换为屏幕上的二维坐标，以便在渲染场景时将该点绘制在正确的屏幕位置上。这通常用于在屏幕上绘制交互元素、进行鼠标拾取操作或其他需要将三维坐标转换为屏幕坐标的场景处理
          screenPosition.project(camera);
          if(intersects.length === 0){
            point.element.classList.add("visible")
          }else {
            const intersectsDistance = intersects[0].distance;
            const pointDistance = point.position.distanceTo(camera.position);
            // 如果射线范围内 数字前面有遮挡物则隐藏数字 否则显示数字
            intersectsDistance > pointDistance ? point.element.classList.add("visible") : point.element.classList.remove("visible")
          }
          const translateX = screenPosition.x * window.innerWidth * 0.5;
            const translateY =- screenPosition.y * window.innerHeight * 0.5;
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
            }
        };
        animate();
    };

    return (
        <div className="island">
            <canvas className="canvas"> </canvas>
            <a
                className="github"
                href="https://github.com/ytclili/3D"
                target="_blank"
                rel="noreferrer"
            >
                <svg
                    height="36"
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="36"
                    data-view-component="true"
                >
                    <path
                        fill="#FFFFFF"
                        fillRule="evenodd"
                        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                    ></path>
                </svg>
                <span className="author">@SUN_YI_FEI</span>
            </a>
            <div className="point point-0">
                <div className="label label-0">1</div>
                <div className="text">灯塔：矗立在海岸的岩石之上，白色的塔身以及红色的塔屋，在湛蓝色的天空和深蓝色大海的映衬下，显得如此醒目和美丽。</div>
            </div>
            <div className="point point-1">
                <div className="label label-1">2</div>
                <div className="text">小船：梦中又见那宁静的大海，我前进了，驶向远方，我知道我是船，只属于远方。这一天，我用奋斗作为白帆，要和明天一起飘扬，呼喊。</div>
            </div>
            <div className="point point-2">
                <div className="label label-2">3</div>
                <div className="text">沙滩：宇宙展开的一小角。不想说来这里是暗自疗伤，那过于矫情，只想对每一粒沙子，每一朵浪花问声你们好吗</div>
            </div>
            <div className="point point-3">
                <div className="label label-3">4</div>
                <div className="text">飞鸟：在苍茫的大海上，狂风卷集着乌云。在乌云和大海之间，海燕像黑色的闪电，在高傲地飞翔。</div>
            </div>
            <div className="point point-4">
                <div className="label label-4">5</div>
                <div className="text">礁石：寂寞又怎么样？礁石都不说话，但是水流过去之后，礁石留下。</div>
            </div>
        </div>
    );
};

export default Island;
