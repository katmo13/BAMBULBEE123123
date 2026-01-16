const canvas = document.getElementById("bg");
const fallback = document.getElementById("fallback");

let renderer, scene, camera, material, mesh;
let start = performance.now();

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

if (!webglAvailable()) {
  fallback.style.display = "block";
} else {
  init();
  animate();
}

function init() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();

  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uRes;

      float rand(vec2 co){
        return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uRes;

        float wave =
          sin(uv.x * 4.0 + uTime * 0.2) +
          sin(uv.y * 6.0 - uTime * 0.15);

        vec3 color = vec3(
          0.07,
          0.05,
          0.04
        ) + wave * 0.03;

        // warm accent glow
        float glow = smoothstep(0.3, 0.0, distance(uv, vec2(0.6, 0.4)));
        color += glow * vec3(0.15, 0.11, 0.05);

        // dither / grain
        float grain = rand(uv * uTime) * 0.05;
        color += grain;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  const geo = new THREE.PlaneGeometry(2, 2);
  mesh = new THREE.Mesh(geo, material);
  scene.add(mesh);

  window.addEventListener("resize", onResize);

  // GSAP entrance
  gsap.from(".hero-content h1", {
    y: 40,
    opacity: 0,
    duration: 1.5,
    ease: "power3.out"
  });

  gsap.from(".hero-content p, .tagline", {
    y: 20,
    opacity: 0,
    stagger: 0.2,
    delay: 0.3,
    duration: 1.2,
    ease: "power3.out"
  });
}

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uRes.value.set(
    window.innerWidth,
    window.innerHeight
  );
}

function animate(time) {
  material.uniforms.uTime.value = (time - start) * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
