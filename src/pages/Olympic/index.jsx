import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as TWEEN from '../../../node_modules/three/examples/jsm/libs/tween.module';
import Animations from '../../assets/utils/Animations';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import landModel from './models/land.glb';
import treeModel from './models/tree.gltf';
import bingdwendwenModel from './models/bingdwendwen.glb';
import xuerongrongModel from './models/xuerongrong.glb';
import flagModel from './models/flag.glb';
import skyTexture from './images/sky.jpg';
import snowTexture from './images/snow.png';
import treeTexture from './images/tree.png';
import flagTexture from './images/flag.png';
import { useEffect } from 'react';

let container,
    camera,
    renderer,
    scene,
    light,
    controls,
    meshes = [],
    clock = new THREE.Clock(),
    fiveCyclesGroup = new THREE.Group(),
    snowPoints,
    entirety = [],
    mixer;
const Olympic = () => {
    function initTree() {
        init();
        animate();
    }

    function init() {
        container = document.querySelector('.container');
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;

        container.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.background = new THREE.TextureLoader().load(skyTexture);
        scene.fog = new THREE.Fog(0xffffff, 10, 100);
        // ...
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        // 创建camera助手
        const cameraHelper = new THREE.CameraHelper(camera);
        scene.add(cameraHelper);

        camera.position.set(0, 30, 100);
        camera.lookAt(new THREE.Vector3(0, 20, -20));
        scene.add(camera);

        const cubeGeometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
        const cubeGeometryMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeGeometryMaterial);
        cube.position.set(0, 20, -20);
        // scene.add(cube);

        light = new THREE.DirectionalLight(0xffffff, 1);

        light.intensity = 1;
        light.position.set(16, 46, 8);
        light.castShadow = true;
        // 让光源照向立方体
        light.target = cube;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.top = 40;
        light.shadow.camera.bottom = -40;
        light.shadow.camera.left = -40;
        light.shadow.camera.right = 40;

        //...
        scene.add(light);
        // 添加完光之后，再添加光的辅助线
        const lightHelper = new THREE.DirectionalLightHelper(light, 1, 'red');
        scene.add(lightHelper);

        const lightCameraHelper = new THREE.CameraHelper(light.shadow.camera);
        scene.add(lightCameraHelper);

        let ambientLight = new THREE.AmbientLight(0xcfffff, 1);
        ambientLight.intensity = 1;
        scene.add(ambientLight);

        const manage = new THREE.LoadingManager();
        manage.onStart = function (url, loaded, total) {};
        manage.onLoad = function () {
            console.log('加载完成');
        };
        manage.onProgress = function (url, loaded, total) {
            if ((loaded / total) * 100 === 100) {
                // { x: -10, y: 20, z: 20 }相机位置 { x: 0, y: 20, z: 5 } 控制点位置
                Animations.animateCamera(camera, controls, { x: -15, y: 20, z: 10 }, { x: 0, y: 20, z: -15 }, 3600, () => {});
            } else {
                console.log(`loading model... ${(loaded / total) * 100}%`);
            }
        };

        let loader = new GLTFLoader(manage);
        loader.load(landModel, function (gltf) {
            scene.add(gltf.scene);
            gltf.scene.traverse(function (child) {
                console.log(child.name);
                if (child.isMesh) {
                    if (child.name === 'Mesh_2') {
                        meshes.push(child);
                        child.material.metalness = 0.1;
                        child.material.roughness = 0.8;
                        child.receiveShadow = true;
                    }
                }
            });
        });

        loader.load(flagModel, function (mesh) {
            mesh.scene.traverse(function (child) {
                meshes.push(child);
                child.castShadow = true;
                if (child.name === 'mesh_0001') {
                    child.material.metalness = 0.1;
                    child.material.roughness = 0.1;
                    child.material.map = new THREE.TextureLoader().load(flagTexture);
                }
                if (child.name === '柱体') {
                    child.material.metalness = 0.6;
                    child.material.roughness = 0;
                    // 通过设置 refractionRatio 属性为 1，你将材质的折射率设置为 1。折射率为 1 表示光线在进入该材质时不会发生弯曲，即不会发生折射。
                    child.material.refractionRatio = 1;
                    child.material.color = new THREE.Color(0xeeeeee);
                }
            });
            mesh.scene.rotation.y = Math.PI / 2;
            mesh.scene.scale.set(4, 4, 4);
            mesh.scene.position.set(5, 20, -5);

            //动画
            let meshAnimation = mesh.animations[0];
            mixer = new THREE.AnimationMixer(mesh.scene);
            let animationClip = meshAnimation;
            let clipAction = mixer.clipAction(animationClip).play();
            animationClip = clipAction.getClip();
            scene.add(mesh.scene);
        });

        // 创建坐标系辅助对象
        var axesHelper = new THREE.AxesHelper(210);
        scene.add(axesHelper);

        // 冰墩墩
        loader.load(bingdwendwenModel, function (mesh) {
            mesh.scene.traverse(function (child) {
                meshes.push(child);
                child.castShadow = true;
                if (child.name === '皮肤') {
                    child.material.metalness = 0.3;
                    child.material.roughness = 0.8;
                }
                if (child.name == '外壳') {
                    child.material.transparent = true;
                    child.material.opacity = 0.4;
                    child.material.refractionRatio = 1.6;
                    child.material.metalness = 0.4;
                    child.material.roughness = 0;
                    child.material.envMap = new THREE.TextureLoader().load(skyTexture);
                    child.material.envMapIntensity = 1;
                }

                if (child.name === '围脖') {
                    child.material.transparent = true;
                    child.material.opacity = 0.6;
                    child.material.metalness = 0.4;
                    child.material.roughness = 0.6;
                }
            });
            mesh.scene.rotation.y = -Math.PI / 4;
            mesh.scene.scale.set(24, 24, 24);
            mesh.scene.position.set(0, 10, 0);
            entirety.push({ name: '冰墩墩', scene: mesh.scene });
            scene.add(mesh.scene);
        });

        //雪融融
        loader.load(xuerongrongModel, function (mesh) {
            mesh.scene.traverse((child) => {
                meshes.push(child);
                child.castShadow = true;
            });
            mesh.scene.position.set(-15, 12, -20);
            mesh.scene.scale.set(12, 12, 12);
            scene.add(mesh.scene);
        });

        // 树
        let treeMaterial = new THREE.MeshPhysicalMaterial({
            map: new THREE.TextureLoader().load(treeTexture),
            transparent: true,
            side: THREE.DoubleSide,
            metalness: 0.2,
            roughness: 0.8,
            depthTest: true,
            depthWrite: false,
            skinning: false,
            fog: false,
            reflectivity: 0.1,
            refractionRatio: 0,
        });
        let treeCustomDepthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
            map: new THREE.TextureLoader().load(treeTexture),
            alphaTest: 0.5,
        });
        loader.load(treeModel, (mesh) => {
            mesh.scene.traverse((child) => {
                meshes.push(child);
                child.material = treeMaterial;
                child.custromMaterial = treeCustomDepthMaterial;
            });
            mesh.scene.position.set(14, 10, -30);
            mesh.scene.scale.set(16, 16, 16);
            scene.add(mesh.scene);

            let tree2 = mesh.scene.clone();
            tree2.position.set(16, 10, -15);
            tree2.scale.set(18, 18, 18);
            scene.add(tree2);

            let tree3 = mesh.scene.clone();
            tree3.position.set(0, 10, -30);
            scene.add(tree3);
        });

        // 五环
        const fiveCycles = [
            { key: 'cycle_0', color: 0x0885c2, position: { x: -250, y: 0, z: 0 } },
            { key: 'cycle_1', color: 0x000000, position: { x: -10, y: 0, z: 1 } },
            { key: 'cycle_2', color: 0xed334e, position: { x: 230, y: 0, z: 0 } },
            { key: 'cycle_3', color: 0xfbb132, position: { x: -125, y: -100, z: -5 } },
            { key: 'cycle_4', color: 0x1c8b3c, position: { x: 115, y: -100, z: 10 } },
        ];

        fiveCycles.forEach((item) => {
            let geometry = new THREE.TorusGeometry(100, 10, 10, 50);
            let material = new THREE.MeshLambertMaterial({ color: item.color, side: THREE.DoubleSide });
            let torus = new THREE.Mesh(geometry, material);
            torus.position.set(item.position.x, item.position.y, item.position.z);
            torus.castShadow = true;
            meshes.push(torus);
            fiveCyclesGroup.add(torus);
        });
        fiveCyclesGroup.scale.set(0.036, 0.036, 0.036);
        fiveCyclesGroup.position.set(10, 30, -20);

        scene.add(fiveCyclesGroup);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // 雪花
        // 创建雪花
        let texture = new THREE.TextureLoader().load(snowTexture);
        let geometry = new THREE.BufferGeometry();
        let pointsMaterial = new THREE.PointsMaterial({
            size: 1,
            transparent: true,
            opacity: 0.8,
            map: texture,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthTest: false,
        });

        let range = 100;
        let numParticles = 1500;

        let positions = new Float32Array(numParticles * 3);
        let velocitiesY = new Float32Array(numParticles);
        let velocitiesX = new Float32Array(numParticles);

        for (let i = 0; i < numParticles; i++) {
            let x = Math.random() * range - range / 2;
            let y = Math.random() * range * 1.5;
            let z = Math.random() * range - range / 2;

            let index = i * 3;
            positions[index] = x;
            positions[index + 1] = y;
            positions[index + 2] = z;

            velocitiesY[i] = 0.1 + Math.random() / 3;
            velocitiesX[i] = (Math.random() - 0.5) / 3;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocityY', new THREE.BufferAttribute(velocitiesY, 1));
        geometry.setAttribute('velocityX', new THREE.BufferAttribute(velocitiesX, 1));

        snowPoints = new THREE.Points(geometry, pointsMaterial);
        snowPoints.position.y = -30;
        scene.add(snowPoints);
    }

    function updateSnow() {
        let positions = snowPoints.geometry.getAttribute('position').array;
        let velocitiesY = snowPoints.geometry.getAttribute('velocityY').array;
        let velocitiesX = snowPoints.geometry.getAttribute('velocityX').array;

        for (let i = 0; i < 1500; i++) {
            let index = i * 3;
            positions[index + 1] -= velocitiesY[i];
            positions[index] -= velocitiesX[i];

            if (positions[index + 1] <= 0) positions[index + 1] = 60;
            if (positions[index] <= -20 || positions[index] >= 20) velocitiesX[i] *= -1;
        }
        snowPoints.geometry.attributes.position.needsUpdate = true;
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        controls.update();
        fiveCyclesGroup && (fiveCyclesGroup.rotation.y += 0.01);

        TWEEN && TWEEN.update();
        updateSnow();
        let time = clock.getDelta();
        mixer && mixer.update(time);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const rotateObject = (object) => {
        const rotationDuration = 1000; // 旋转动画的持续时间（毫秒）

        new TWEEN.Tween(object.rotation)
            .to({ y: object.rotation.y + Math.PI * 2 }, rotationDuration)
            .easing(TWEEN.Easing.Linear.None) // 缓动函数（线性）
            .start();
    };

    const returnEntiretyReflect = (name) => {
        switch (name) {
            case '皮肤':
            case '围脖':
            case '外壳':
                return entirety.filter((item) => item.name === '冰墩墩')[0];
        }
    };

    //首先，创建了一个Raycaster对象，用于在场景中进行光线投射和碰撞检测。
    let raycaster = new THREE.Raycaster();
    // 创建一个Vector2对象mouse，用于存储鼠标点击位置的归一化坐标。
    let mouse = new THREE.Vector2();
    const mouseClick = () => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        let intersects = raycaster.intersectObjects(meshes);
        if (intersects.length > 0) {
            if (intersects[0].object.name) {
                for (let i = 0; i < meshes.length; i++) {
                    if (meshes[i].name === intersects[0].object.name) {
                        let currentCube = returnEntiretyReflect(meshes[i].name);
                        rotateObject(currentCube.scene);
                    }
                }
            }
        }
    };
    // 监测哪个物体被点击
    window.addEventListener('click', mouseClick, false);

    useEffect(() => {
        initTree();
    }, []);
    return <div className="container"></div>;
};

export default Olympic;
