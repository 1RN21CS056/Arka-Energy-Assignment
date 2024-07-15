let scene, camera, renderer;
let plane, gridHelper;
let vertices = [];
let polygons = [];
let currentPolygon = null;

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set background color to white
    renderer.setClearColor(0xffffff, 1);

    // Create ground plane
    const planeGeometry = new THREE.PlaneGeometry(100, 100);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Create grid
    gridHelper = new THREE.GridHelper(100, 100, 0x000000, 0x000000);
    gridHelper.position.y = 0.01; // Slightly above the plane to avoid z-fighting
    scene.add(gridHelper);

    camera.position.set(0, 50, 50);
    camera.lookAt(0, 0, 0);

    // Event listeners
    document.addEventListener('click', onMouseClick, false);
    document.getElementById('completeBtn').addEventListener('click', completePolygon);
    document.getElementById('copyBtn').addEventListener('click', copyPolygon);
    document.getElementById('resetBtn').addEventListener('click', resetScene);

    // Debug button events
    console.log('Event listeners added');
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function onMouseClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(plane);
    if (intersects.length > 0) {
        const intersect = intersects[0];
        vertices.push(intersect.point);

        const dotGeometry = new THREE.Geometry();
        dotGeometry.vertices.push(intersect.point);
        const dotMaterial = new THREE.PointsMaterial({ size: 5, sizeAttenuation: false, color: 0xff0000 });
        const dot = new THREE.Points(dotGeometry, dotMaterial);
        scene.add(dot);

        if (currentPolygon) {
            scene.remove(currentPolygon);
        }

        const lineGeometry = new THREE.Geometry();
        lineGeometry.vertices = vertices.concat(vertices[0]); // Close the loop
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
        currentPolygon = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(currentPolygon);
    }
}

function completePolygon() {
    console.log('Complete Polygon button clicked');
    if (vertices.length > 2) {
        const shape = new THREE.Shape(vertices.map(v => new THREE.Vector2(v.x, v.z)));
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        polygons.push(mesh);
        vertices = [];
        scene.remove(currentPolygon);
        currentPolygon = null;
    }
}

function copyPolygon() {
    console.log('Copy Polygon button clicked');
    if (polygons.length > 0) {
        const lastPolygon = polygons[polygons.length - 1];
        const newPolygon = lastPolygon.clone();
        newPolygon.position.x += 10; // Offset the position slightly
        scene.add(newPolygon);
        polygons.push(newPolygon);
    }
}

function resetScene() {
    console.log('Reset button clicked');
    for (let polygon of polygons) {
        scene.remove(polygon);
    }
    polygons = [];
    vertices = [];
    if (currentPolygon) {
        scene.remove(currentPolygon);
        currentPolygon = null;
    }
}
