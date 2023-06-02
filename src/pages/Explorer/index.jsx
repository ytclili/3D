import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect } from 'react';
import foxModel from './models/Fox.glb';
import Shelter from './models/Shelter.glb';
import heightMapImage from './images/Heightmap.png';
import snowflakeTexture from './images/snowflake.png';
import { img2matrix, randnum } from '../../assets/utils/utils';
import CANNON from 'cannon';
import CannonHelper from './scripts/CannonHelper';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import JoyStick from './scripts/JoyStick';

const Explorer = () => {
    useEffect(() => {
        init();
    }, []);
    const init = () => {
        const clock = new THREE.Clock();
        const shelterPosition = { x: 93, y: -2, z: 25.5 };
        const playPosition = {
            x: 0,
            y: -0.05,
            z: 0,
        };
        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('.explorer canvas'),
            alpha: true,
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const scene = new THREE.Scene();
        // 背景设置成了黑色 地形图开始也没有颜色导致看不见地形图了
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100000);
        camera.position.set(1, 1, -1);
        // camera.lookAt(scene.position)
        // scene.add(camera);

        // 创建辅助坐标系
        const axesHelper = new THREE.AxesHelper(1000);
        scene.add(axesHelper);

        // 第三人称视角控制器导致方向不对
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(1, 1, 1).normalize();
        scene.add(dirLight);

        //CANNON物理引擎
        const world = new CANNON.World();
        const cannonHelper = new CannonHelper(scene);
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.gravity.set(0, -10, 0);
        world.defaultContactMaterial.friction = 0;
        const groundMaterial = new CANNON.Material('groundMaterial');
        const wheelMaterial = new CANNON.Material('wheelMaterial');
        const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
            friction: 0,
            restitution: 0,
            contactEquationStiffness: 1000,
        });
        // 给世界添加 contactMaterial
        world.addContactMaterial(wheelGroundContactMaterial);

        // target 有啥用？
        var geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        geometry.translate(0, 0.5, 0);
        const target = new THREE.Mesh(
            geometry,
            new THREE.MeshNormalMaterial({
                transparent: true,
                opacity: 0,
            }),
        );
        scene.add(target);

        // 星空粒子
        const textureloader = new THREE.TextureLoader();
        const imgsrc = textureloader.load(snowflakeTexture);
        const shaderPoint = THREE.ShaderLib.points;
        const uniforms = THREE.UniformsUtils.clone(shaderPoint.uniforms);
        uniforms.map.value = imgsrc;
        const sparkGeometry = new THREE.BufferGeometry();
        const sparkVertices = [];
        for (let i = 0; i < 1000; i++) {
            sparkVertices.push(randnum(-500, 500), randnum(30, 40), randnum(-500, 500));
        }
        sparkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sparkVertices, 3));
        const sparks = new THREE.Points(
            sparkGeometry,
            new THREE.PointsMaterial({
                size: 2,
                color: new THREE.Color(0xffffff),
                map: uniforms.map.value,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true,
                opacity: 0.75,
            }),
        );
        scene.add(sparks);

        // 地形
        let sizeX = 128,
            sizeY = 128,
            minHeight = 0,
            maxHeight = 60,
            check = null;
        Promise.all([img2matrix.fromUrl(heightMapImage, sizeX, sizeY, minHeight, maxHeight)()]).then((res) => {
            let material = res[0];
            const terrainShape = new CANNON.Heightfield(material, { elementSize: 10 });
            const terrainBody = new CANNON.Body({ mass: 0 });
            terrainBody.addShape(terrainShape);
            terrainBody.position.set((-sizeX * terrainShape.elementSize) / 2, -10, (sizeY * terrainShape.elementSize) / 2);
            terrainBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
            // 把图转为刚体 添加到世界中
            world.add(terrainBody);
            cannonHelper.addVisual(terrainBody, 'landscape');
            let raycastHelperGeometry = new THREE.CylinderGeometry(0, 1, 5, 1.5);
            raycastHelperGeometry.translate(0, 0, 0);
            raycastHelperGeometry.rotateX(Math.PI / 2);
            var raycastHelperMesh = new THREE.Mesh(raycastHelperGeometry, new THREE.MeshNormalMaterial());
            scene.add(raycastHelperMesh);
            check = () => {
                var raycaster = new THREE.Raycaster(target.position, new THREE.Vector3(0, -1, 0));
                var intersects = raycaster.intersectObject(terrainBody.threemesh.children[0]);
                if (intersects.length > 0) {
                    raycastHelperMesh.position.set(0, 0, 0);
                    raycastHelperMesh.lookAt(intersects[0].face.normal);
                    raycastHelperMesh.position.copy(intersects[0].point);
                }
                // 将模型放置在地形上
                target.position.y = intersects && intersects[0] ? intersects[0].point.y + 0.1 : 30;
                // 标志基地
                var raycaster2 = new THREE.Raycaster(shelterLocation.position, new THREE.Vector3(0, -1, 0));
                var intersects2 = raycaster2.intersectObject(terrainBody.threemesh.children[0]);
                shelterLocation.position.y = intersects2 && intersects2[0] ? intersects2[0].point.y + 0.5 : 30;
                shelterLight.position.y = shelterLocation.position.y + 50;
                shelterLight.position.x = shelterLocation.position.x + 5;
                shelterLight.position.z = shelterLocation.position.z;
            };
        });

        // 基地
        const gltfLoader = new GLTFLoader();
        const shelterGeometry = new THREE.BoxGeometry(0.15, 2, 0.15);
        shelterGeometry.translate(0, 1, 0); // 移动几何体的位置
        const shelterLocation = new THREE.Mesh(
            shelterGeometry,
            new THREE.MeshNormalMaterial({
                transparent: true,
                opacity: 0,
            }),
        );
        shelterLocation.position.set(shelterPosition.x, shelterPosition.y, shelterPosition.z);
        shelterLocation.rotateY(Math.PI);
        scene.add(shelterLocation);
        gltfLoader.load(Shelter, (mesh) => {
            mesh.scene.traverse((child) => {
                child.castShadow = true;
            });
            mesh.scene.scale.set(50, 50, 50);
            mesh.scene.position.y = -0.5;
            scene.add(mesh.scene);
            shelterLocation.add(mesh.scene);
        });
        // 基地点光源
        var shelterPointLight = new THREE.PointLight(0x1089ff, 2);
        shelterPointLight.position.set(0, 0, 0);
        shelterLocation.add(shelterPointLight);
        var shelterLight = new THREE.DirectionalLight(0xffffff, 0);
        shelterLight.position.set(0, 0, 0);
        shelterLight.castShadow = true;
        shelterLight.target = shelterLocation;
        scene.add(shelterLight);

        var directionalLight = new THREE.DirectionalLight(new THREE.Color(0xffffff), 0.5);
        directionalLight.position.set(0, 1, 0);
        directionalLight.castShadow = true;
        directionalLight.target = target;
        target.add(directionalLight);

        //狐狸
        let mixers = [],
            clip1,
            clip2;
        gltfLoader.load(foxModel, (mesh) => {
            mesh.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.material.side = THREE.DoubleSide;
                }
            });

            let player = mesh.scene;
            player.position.set(playPosition.x, playPosition.y, playPosition.z);
            player.scale.set(0.008, 0.008, 0.008);
            target.add(player);
            var mixer = new THREE.AnimationMixer(player);
            clip1 = mixer.clipAction(mesh.animations[0]);
            clip2 = mixer.clipAction(mesh.animations[1]);
            clip2.timeScale = 1.6;
            mixers.push(mixer);
        });

        // 轮盘控制器
        const setUpController = {
            forward: 0,
            turn: 0,
        };
        let turnSpeed = 1;
        new JoyStick({
            onMove: (forward, turn) => {
                setUpController.forward = forward;
                setUpController.turn = -turn;
            },
        });

        const updateDrive = (forward = setUpController.forward, turn = setUpController.turn) => {
            let maxSteerVal = 0.05;
            let maxForce = 0.15;
            let force = maxForce * forward;
            let steer = maxSteerVal * turn;
            if (forward !== 0) {
                target.translateZ(force);
                clip2 && clip2.play();
                clip1 && clip1.stop();
            } else {
                clip2 && clip2.stop();
                clip1 && clip1.play();
            }
            target.rotateY(steer);
        };

        // const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
        // planeGeometry.rotateX(-Math.PI / 2);
        // scene.add(new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })));

        const followCamera = new THREE.Object3D();
        followCamera.position.copy(camera.position);
        console.log(followCamera.position);
        scene.add(followCamera);
        followCamera.parent = target;

        const updateCamera = () => {
            if (followCamera) {
                camera.position.lerp(followCamera.getWorldPosition(new THREE.Vector3()), 0.1);
                camera.lookAt(target.position.x, target.position.y + 0.5, target.position.z);
            }
        };

        const handleKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    setUpController.forward = 1;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    setUpController.turn = turnSpeed;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    setUpController.forward = -1;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    setUpController.turn = -turnSpeed;
                    break;
                case 'Space':
                    break;
            }
        };

        const handleKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'KeyW':
                    setUpController.forward = 0;
                    break;

                case 'ArrowLeft':
                case 'KeyA':
                    setUpController.turn = 0;
                    break;

                case 'ArrowDown':
                case 'KeyS':
                    setUpController.forward = 0;
                    break;

                case 'ArrowRight':
                case 'KeyD':
                    setUpController.turn = 0;
                    break;
                case 'Space':
                    break;
            }
        };

        const handleKeyboard = () => {
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
        };
        handleKeyboard();

        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.updateProjectionMatrix();
            camera.aspect = window.innerWidth / window.innerHeight;
        });

        let fixedTimeStep = 1.0 / 60.0;
        let lastTime;
        function animation() {
            requestAnimationFrame(animation);
            controls.update();
            renderer.render(scene, camera);
            mixers && mixers.forEach((mixer) => mixer.update(clock.getDelta()));
            updateDrive();
            let now = Date.now();
            lastTime === undefined && (lastTime = now);
            let dt = (Date.now() - lastTime) / 1000.0;
            lastTime = now;
            world.step(fixedTimeStep, dt);
            cannonHelper.updateBodies(world);
            updateCamera();
            check && check();
        }
        animation();
    };
    return (
        <div className="explorer">
            <canvas></canvas>
        </div>
    );
};
export default Explorer;
