import React, { useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import miKu from './models/Miku.glb';
import heart from './models/heart.glb';
import logo from './models/logo.glb';
import video from './videos/demo.mp4';
import './index.scss';

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
        camera.position.set(0, 0, 10);
        camera.lookAt(0, 0, 0);
        scene = new THREE.Scene();
        const spotLight = new THREE.SpotLight(0xffffff, 1);
        camera.add(spotLight);
        scene.add(camera);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.querySelector('.miku').appendChild(renderer.domElement);

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
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    interactableMeshes.push(child);
                }
            });
            gltf.scene.scale.set(5, 5, 5);
            gltf.scene.position.set(0, -5, 0);
            scene.add(gltf.scene);

            miKuModal = gltf;
            playAnimation(5);
        });

        modalLoader.load(heart, (gltf) => {
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    if (child.name === 'mesh_0') {
                        child.material.metalness = 0.6;
                        child.material.roughness = 0.4;
                        child.material.color = new THREE.Color(0xfe3f47);
                        child.material.emissiveIntensity = 1.6;
                    }
                }
            });
            gltf.scene.scale.set(0.05, 0.05, 0.05);
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(document.querySelector('.heart').offsetWidth, document.querySelector('.heart').offsetHeight);
            document.querySelector('.heart').appendChild(renderer.domElement);
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(50, document.querySelector('.heart').offsetWidth / document.querySelector('.heart').offsetHeight, 0.1, 10000);
            camera.position.set(0, 0, 10);
            camera.lookAt(0, 0, 0);
            scene.add(camera);
            const ambientLight = new THREE.AmbientLight(0xffffff, 1);
            scene.add(ambientLight);
            scene.add(gltf.scene);

            const animation = () => {
                requestAnimationFrame(animation);
                renderer.render(scene, camera);
                gltf.scene.rotation.y += 0.04;
            };
            animation();
        });

        modalLoader.load(logo, (gltf) => {
            // alpha true 透明背景
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(document.querySelector('.logo').offsetWidth, document.querySelector('.logo').offsetHeight);
            document.querySelector('.logo').appendChild(renderer.domElement);
            const scene = new THREE.Scene();
            scene.background;
            const camera = new THREE.PerspectiveCamera(50, document.querySelector('.logo').offsetWidth / document.querySelector('.logo').offsetHeight, 0.1, 10000);
            camera.position.set(0, 10, 10);
            camera.lookAt(0, 0, 0);
            scene.add(camera);

            gltf.scene.scale.set(0.01, 0.01, 0.01);
            scene.add(gltf.scene);
            const ambientLight = new THREE.AmbientLight(0xffffff, 1);
            scene.add(ambientLight);
            const animation = () => {
                requestAnimationFrame(animation);
                renderer.render(scene, camera);
                gltf.scene.rotation.y += 0.008;
            };
            animation();
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

    return (
        <div className="gpu-virtual">
            <div className="video">
                <video
                    src={video}
                    muted
                    autoPlay
                    loop
                ></video>
            </div>
            <div className="logo"></div>
            <div className="heart"></div>
            <div className="miku"></div>
            <div className="decorate">
                <i className="live_icon">LIVE</i>
                <div className="live_banner">
                    <i className="icon"></i>
                    <div className="title">
                        <span className="text">慢直播：香港夜景是世界三大夜景之一，其中维多利亚港夜景、太平山顶夜景景色最为壮观动人。</span>
                    </div>
                </div>
            </div>
            <div className="input_zone">
                <div className="tips">
                    <b>1566</b>人正在看，已填装<b>8896</b>条弹幕！
                </div>
                {/* <input
                            className="input"
                            placeholder="输入“慢直播、虚拟主播、初音未来、安可、元宇宙、卡哇伊 ❤”等字样可以触发彩蛋哦！"
                            onChange={this.handleInputChange.bind(this)}
                            onKeyPress={this.handleInputKeypress.bind(this)}
                            value={this.state.inputValue}
                            variant="contained"
                        />
                        <button
                            className="send_button"
                            onClick={this.handleSend}
                            variant="contained"
                        >
                            发送
                        </button> */}
            </div>
            <div className="decorate">
                <i className="live_icon">LIVE</i>
                <div className="live_banner">
                    <i className="icon"></i>
                    <div className="title">
                        <span className="text">慢直播：香港夜景是世界三大夜景之一，其中维多利亚港夜景、太平山顶夜景景色最为壮观动人。</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Virtual;
