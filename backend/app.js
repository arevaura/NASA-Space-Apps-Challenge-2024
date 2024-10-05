// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth * 0.75, window.innerHeight); // Adjust size for the panel
document.getElementById("solar-system").appendChild(renderer.domElement);

// Add lighting (Sunlight)
const light = new THREE.PointLight(0xffffff, 2, 1000);
light.position.set(0, 50, 50);  // Place the light slightly above the scene
scene.add(light);

// Create the Sun (Sphere)
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Planets array to store planet objects
const planets = [];

// Function to create a planet with orbiting behavior
function createPlanet(size, color, distance, speed) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color });
    const planet = new THREE.Mesh(geometry, material);

    // Set initial position on the X axis
    planet.position.set(distance, 0, 0);

    // Store the planet with its orbit parameters
    planets.push({ mesh: planet, distance, speed, angle: 0 }); // Add 'angle' to track orbit angle
    scene.add(planet);
}

// Create the eight planets with their respective sizes, colors, distances, and speeds
createPlanet(0.5, 0xaaaaaa, 7, 0.04);  // Mercury (gray)
createPlanet(0.9, 0xffdd44, 10, 0.03);  // Venus (yellow)
createPlanet(1, 0x1E90FF, 15, 0.02);    // Earth (blue)
createPlanet(0.8, 0xFF4500, 20, 0.01);  // Mars (red)
createPlanet(1.2, 0xADD8E6, 30, 0.008); // Jupiter (light blue)
createPlanet(1.1, 0xFFD700, 40, 0.007); // Saturn (golden)
createPlanet(1, 0x4682B4, 50, 0.006);   // Uranus (light blue)
createPlanet(1, 0x00008B, 60, 0.005);   // Neptune (dark blue)

// Adjust camera position for a bird's-eye view
camera.position.set(0, 100, 0);  // Move the camera up above the solar system
camera.lookAt(0, 0, 0);  // Make the camera look towards the Sun (center)

// Animation loop to simulate the orbits of planets around the sun
function animate() {
    requestAnimationFrame(animate);

    // Rotate each planet around the sun in a circular orbit on the X-Z plane
    planets.forEach(planet => {
        planet.angle += planet.speed; // Increment the planet's angle
        planet.mesh.position.x = planet.distance * Math.cos(planet.angle);  // Calculate X position
        planet.mesh.position.z = planet.distance * Math.sin(planet.angle);  // Calculate Z position
    });

    // Render the scene
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth * 0.75;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
