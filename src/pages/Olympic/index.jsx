import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Animations from "../../assets/utils/Animations";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import landModel from "./models/land.glb";
import treeModel from "./models/tree.gltf";
import bingdwendwenModel from "./models/bingdwendwen.glb";
import xuerongrongModel from "./models/xuerongrong.glb";
import flagModel from "./models/flag.glb";
import skyTexture from "./images/sky.jpg";
import snowTexture from "./images/snow.png";
import treeTexture from "./images/tree.png";
import flagTexture from "./images/flag.png";
import { useEffect } from "react";

let container,
  camera,
  renderer,
  scene,
  light,
  controls,
  meshes = [];
const Olympic = () => {
  function initTree() {
    init();
    animate();
  }

  function init() {
    container = document.querySelector(".container");
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.TextureLoader().load(skyTexture);
    // scene.fog = new THREE.Fog(0xffffff, 10, 100);
    // ...
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    // 创建camera助手
    const cameraHelper = new THREE.CameraHelper(camera);
    // scene.add(cameraHelper)
    camera.position.set(0, 30, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    const cubeGeometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);
    const cubeGeometryMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeGeometryMaterial);
    cube.position.set(0, 0, 0);
    scene.add(cube);

    light = new THREE.DirectionalLight(0xffffff, 1);
    // 创建light助手
    const lightHelper = new THREE.DirectionalLightHelper(light);
    scene.add(lightHelper);
    light.intensity = 1;
    light.position.set(16, 16, 8);
    light.castShadow = true;
    // 让光源照向立方体
    light.target = cube;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    //...
    scene.add(light);

    let ambientLight = new THREE.AmbientLight(0xcfffff, 1);
    scene.add(ambientLight);

    const manage = new THREE.LoadingManager();
    manage.onStart = function (url, loaded, total) {};
    manage.onLoad = function () {
      console.log("加载完成");
    };
    manage.onProgress = function (url, loaded, total) {
      if ((loaded / total) * 100 === 100) {
        Animations.animateCamera(
          camera,
          controls,
          { x: 0, y: -1, z: 20 },
          { x: 0, y: 0, z: 5 },
          3600,
          () => {}
        );
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
          if (child.name === "Mesh_2") {
            meshes.push(child);
            child.material.metalness = 0.1;
            child.material.roughness = 0.8;
          }
        }
      });
    });

    loader.load(flagModel, function (mesh) {
      mesh.scene.traverse(function (child) {
        meshes.push(child);
        child.castShadow = true;
        if (child.name === "mesh_0001") {
          child.material.metalness = 0.1;
          child.material.roughness = 0.1;
          child.material.map = new THREE.TextureLoader().load(flagTexture);
        }
        if (child.name === "柱体") {
          child.material.metalness = 0.6;
          child.material.roughness = 0;
          // 通过设置 refractionRatio 属性为 1，你将材质的折射率设置为 1。折射率为 1 表示光线在进入该材质时不会发生弯曲，即不会发生折射。
          child.material.refractionRatio = 1;
          child.material.color = new THREE.Color(0xeeeeee);
        }
      });
      mesh.scene.rotation.y = Math.PI / 2;
      mesh.scene.scale.set(4, 4, 4);
      mesh.scene.position.set(-2, 10, -50);
      scene.add(mesh.scene);
    });

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    controls.update();
  }

  useEffect(() => {
    initTree();
  }, []);
  return <div className="container"></div>;
};

export default Olympic;
