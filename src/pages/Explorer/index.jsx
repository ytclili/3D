import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect } from 'react';

const Explorer = () => {
    useEffect(() => {
        init();
    }, []);
    const init = () => {
        const renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('.explorer canvas'),
            alpha: true,
            antialias: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000);
        camera.position.set(0, 10, 0);
        scene.add(camera);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.updateProjectionMatrix();
            camera.aspect = window.innerWidth / window.innerHeight;
        });

        function animation() {
            requestAnimationFrame(animation);
            controls.update();
            renderer.render(scene, camera);
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
