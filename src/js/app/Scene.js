import Utils from './module/Utils.js';
import vertexSource from './shaders/vertex.vert';
import fragmentSource from './shaders/fragment.frag';

// 加载页对象
export default class End {
    constructor () {
        this.$page = document.querySelector('.m-scene');
        this.planeNum = 50;
        this.permitCameraMove = false;
        this.isInit = false;
    }

    show () {
        Utils.fadeIn(this.$page);
    }

    hide () {
        Utils.fadeOut(this.$page);
    }

    async init () {
        if (this.isInit === true) {
            return;
        }

        this.buildScene();
        this.addLight();
        this.initPerspectiveCamera();
        this.texture = await this.addTexture(require('../../img/thumb.jpg'));
        this.addLine();
        this.addPlane();
        this.rebuildPlane();
        this.addSphere();
        this.render();
        this.bindEvent();
        // this.addGui();

        if (!this.permitCameraMove) {
            this.addControls();
        }

        this.isInit = true;
    }

    buildScene () {
        if (window.innerWidth > window.innerHeight) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        } else {
            this.width = window.innerHeight;
            this.height = window.innerWidth;
        }
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            precision: 'highp',
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // this.renderer.toneMapping = THREE.LinearToneMapping;
        // this.renderer.toneMappingExposure = 0.8;
        this.$page.appendChild(this.renderer.domElement);
    }

    initPerspectiveCamera () {
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);

        let distance = 30;
        this.camera.position.set(0, distance, distance);
        // this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    initOrthographicCamera () {
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    }

    addControls () {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.dampingFactor = 1;
        // this.controls.noPan = true;
        console.log(this.controls);
    }

    addLight () {
        const light = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(light);
    }

    addTexture (url) {
        return new Promise(resolve => {
            new THREE.TextureLoader().load(url, (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                resolve(texture);
            });
        });
    }

    addSphere () {
        const geometry = new THREE.SphereBufferGeometry(0.3, 16, 16);
        const material = new THREE.MeshBasicMaterial(0xffffff);
        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);

        this.sphere = sphere;
    }

    addPlane () {
        var geometry = new THREE.PlaneBufferGeometry(2, 2, 1);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: {
                    value: this.texture
                },
                distortion: {
                    value: 0
                },
                loaded: {
                    value: 0
                },
                lionAspect: {
                    value: 500 / 500
                }
            },
            vertexShader: `\n        
                varying vec2 vUv;\n        
                void main(){\n          
                    vUv = uv;\n          
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position , 1.0);\n        
                }\n      
            `,
            fragmentShader: `\n
                varying vec2 vUv;\n\n        
                uniform sampler2D uTexture;\n        
                uniform float distortion;\n        
                uniform float loaded;\n        
                uniform float lionAspect;\n\n        
                void main()
                {\n          
                    vec4 tColor = vec4(1.0);\n          
                    vec4 lionColor = vec4(1.0);\n\n          
                    vec2 newUV = vUv;\n          
                    vec2 lionUV = vUv;\n\n  \t\t\t\t// 
                    newUV -= vec2(0.5,0.5);\n  \t\t\t\t// 
                    newUV *= vec2(pow(length(newUV),distortion));\n          
                    // newUV += vec2(0.5,0.5);\n          \n          
                    float alpha = 1.0;\n          
                    if(loaded == 1.) {\n            \n            
                        lionColor = texture2D(uTexture , lionUV);\n\n          
                    } \n\n          
                    if(lionColor.r == 1.){\n            
                        tColor.a = 0.0;\n          
                    }\n          \n          
                    gl_FragColor = lionColor;\n          \n        
                }\n      
            `,
            transparent: !0
        });

        // const material2 = new THREE.MeshBasicMaterial({
        //     map: this.texture,
        //     side: THREE.DoubleSide
        // });

        this.planeList = [];
        for (let i = 0; i < this.planeNum; i++) {
            const material = new THREE.MeshBasicMaterial({
                map: this.texture,
                side: THREE.DoubleSide
            });
            const plane = new THREE.Mesh(geometry, material);
            this.scene.add(plane);
            // let x = (Math.random() - 0.5) * 40;
            // let y = (Math.random() - 0.5) * 40;
            // let z = (Math.random() - 0.5) * 40;
            // let alpha = Math.abs((z + 20) / 40);
            // plane.position.set(x, y, z);
            // plane.material.opacity = alpha;
            // plane.material.transparent = true;
            plane.material.opacity = 0.5;
            plane.material.transparent = true;
            this.planeList.push(plane);
        }
    }

    rebuildPlane () {
        let position = new THREE.Vector3();
        let tangent = new THREE.Vector3();
        let rotateMatrix = new THREE.Matrix4().makeRotationZ(Math.PI / 2);
        let quaternion = new THREE.Quaternion();

        let index = 0;

        this.planeList.forEach(plane => {
            position = this.curve.getPointAt(index / this.planeNum);
            tangent = this.curve.getTangentAt(index / this.planeNum);
            plane.position.copy(position);
            plane.lookAt(tangent.add(position));

            // plane.applyMatrix(rotateMatrix);
            // plane.quaternion.setFromRotationMatrix(rotateMatrix);

            // quaternion.setFromAxisAngle(tangent, Math.PI / 2);
            // plane.setRotationFromQuaternion(quaternion);

            this.createLineFromVector(position, tangent);
            this.createLineFromPoint(position);

            console.log(position.normalize(), tangent);

            index++;
        });
    }

    createLineFromVector (startPoint, vector) {
        const points = [];
        points.push(startPoint);
        points.push(vector);

        const line = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: 0x0000ff })
        );
        this.scene.add(line);
    }

    createLineFromPoint (point) {
        const points = [];
        points.push(new THREE.Vector3(0, 0, 0));
        points.push(point);

        const line = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: 0xff0000 })
        );
        this.scene.add(line);
    }

    addLine () {
        const size = 10;
        const curveHandles = [];
        const initialPoints = [
            { x: 1 * size, y: 0, z: -1 * size },
            { x: 1 * size, y: 1 * size, z: 1 * size },
            { x: -1 * size, y: 0, z: 1 * size },
            { x: -1 * size, y: 0, z: -1 * size }
        ];

        // const boxGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        // const boxMaterial = new THREE.MeshBasicMaterial(0x99ff99);
        // for (const handlePos of initialPoints) {
        //     const handle = new THREE.Mesh(boxGeometry, boxMaterial);
        //     handle.position.copy(handlePos);
        //     curveHandles.push(handle);
        //     this.scene.add(handle);
        // }

        const curve = new THREE.CatmullRomCurve3(
            // curveHandles.map((handle) => handle.position)
            initialPoints.map((point) => new THREE.Vector3(point.x, point.y, point.z))
        );
        curve.curveType = 'chordal';
        curve.closed = true;

        const points = curve.getPoints(this.planeNum);
        const line = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: 0x00ff00 })
        );

        this.curve = curve;

        this.scene.add(line);
    }

    getPoint (p) {
        const points = this.curve.getPoints(this.planeNum);

        let position = new THREE.Vector3();
        this.curve.getPointAt(p, position);
        return position;
    }

    getTangent (p) {
        const points = this.curve.getPoints(this.planeNum);

        let tangent = this.curve.getTangentAt(p);
        return tangent;
    }

    moveCamera (position, lookAt) {
        this.camera.position.copy(position);
        this.camera.lookAt(lookAt);
    }

    addGui () {
        let params = {
        };
        const gui = new dat.GUI();

        gui.open();
    }

    render () {
        const looptime = 10 * 1000;

        const animate = () => {
            requestAnimationFrame(animate);
            this.renderer.render(this.scene, this.camera);

            let time = Date.now();
            let t = (time % looptime) / looptime;
            let point = this.getPoint(t);
            let tangent = this.getTangent(t);

            // point.multiplyScalar(2.0);

            if (this.permitCameraMove) {
                this.moveCamera(point, tangent.add(point));
            } else {
                this.controls && this.controls.update();
            }

            let quaternion = new THREE.Quaternion(tangent, Math.PI / 2);
            let rotateMatrix = new THREE.Matrix4().makeRotationZ(-Math.PI / 2);
            // quaternion.multiply(rotateMatrix);
            // this.camera.setRotationFromQuaternion(quaternion);

            // this.camera.matrix.lookAt(this.camera.position, quaternion);
            // this.camera.quaternion.setFromRotationMatrix(this.camera.matrix);

            // point.multiplyScalar(0.5);
            this.sphere.position.copy(point);

            // this.uniforms.time.value += 1 / 60 * this.uniforms.speed.value;
        };
        requestAnimationFrame(animate);
    }

    bindEvent () {
        document.querySelector('.btn-switch-view').addEventListener('click', () => {
            if (this.permitCameraMove) {
                this.permitCameraMove = false;
                this.controls.enabled = true;

                let distance = 30;
                this.camera.position.set(0, distance, distance);
            } else {
                this.permitCameraMove = true;
                this.controls.enabled = false;
            }
        });
    }
};
