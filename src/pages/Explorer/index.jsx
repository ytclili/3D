import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect } from 'react';
import foxModel from './models/Fox.glb';
import Shelter from './models/Shelter.glb';
import heightMapImage from './images/Heightmap.png';
import snowflakeTexture from './images/snowflake.png';
import { img2matrix, randnum } from '../../assets/utils/utils';
import CANNON from 'cannon';
// import CannonHelper from './scripts/CannonHelper';
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

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
        camera.position.set(0, 10, 10);
        scene.add(camera);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(1, 1, 1).normalize();
        scene.add(dirLight);

        //CANNON物理引擎
        const world = new CANNON.World();
        // const cannonHelper = new CannonHelper(scene);
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.gravity.set(0, -10, 0);
        world.defaultContactMaterial.friction = 0;

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
        // let sizeX = 128, sizeY = 128, minHeight = 0, maxHeight = 60, check = null;
        // Promise.all([img2matrix.fromUrl(heightMapImage, sizeX, sizeY, minHeight, maxHeight)()]).then((res) => {
        //     let material = res[0]
        //     const terrainShape = new CANNON.Heightfield(material, {elementSize: 10});
        //     const terrainBody = new CANNON.Body({ mass: 0 });
        //     terrainBody.addShape(terrainShape);
        //     terrainBody.position.set(-sizeX * terrainShape.elementSize / 2, -10, sizeY * terrainShape.elementSize / 2);
        //     terrainBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        //     world.add(terrainBody);
        //     cannonHelper.addVisual(terrainBody, 'landscape');

        // });

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
            scene.scale.set(5, 5, 5);
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

        // target 有啥用？
        var geometry = new THREE.BoxBufferGeometry(0.5, 1, 0.5);
        geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0.5, 0));
        const target = new THREE.Mesh(
            geometry,
            new THREE.MeshNormalMaterial({
                transparent: true,
                opacity: 0,
            }),
        );
        scene.add(target);

        //狐狸
        let mixers = [],
            clip1,
            clip2;
        const foxLoader = gltfLoader.load(foxModel, (mesh) => {
            scene.add(mesh.scene);
            mesh.scene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.material.side = THREE.DoubleSide;
                }
            });
            let player = mesh.scene;
            player.position.set(playPosition.x, playPosition.y, playPosition.z);
            player.scale.set(0.08, 0.08, 0.08);
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

        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.updateProjectionMatrix();
            camera.aspect = window.innerWidth / window.innerHeight;
        });

        function animation() {
            requestAnimationFrame(animation);
            controls.update();
            renderer.render(scene, camera);
            mixers && mixers.forEach((mixer) => mixer.update(clock.getDelta()));
            updateDrive();
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
