const canvas = document.getElementById("bg");
const fallback = document.getElementById("fallback");

let renderer, scene, camera, material, mesh;
let start = performance.now();

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && c.getContext("webgl"));
  } catch {
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
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
    },
    vertexShader: `void main(){ gl_Position=vec4(position,1.); }`,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uRes;
      void main(){
        vec2 uv=gl_FragCoord.xy/uRes;
        float w=sin(uv.x*4.+uTime*.2)+sin(uv.y*6.-uTime*.15);
        vec3 c=vec3(.07,.05,.04)+w*.03;
        gl_FragColor=vec4(c,1.);
      }
    `
  });

  mesh = new THREE.Mesh(new THREE.PlaneGeometry(2,2), material);
  scene.add(mesh);

  window.addEventListener("resize", onResize);

  gsap.from(".hero-content h1", { y:40, opacity:0, duration:1.5 });
}

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  material.uniforms.uRes.value.set(window.innerWidth, window.innerHeight);
}

function animate(time) {
  material.uniforms.uTime.value = (time - start) * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

/* WORKS BUTTON */
const worksBtn = document.getElementById("worksBtn");
const worksSection = document.getElementById("works");

worksBtn.addEventListener("click", () => {
  worksSection.classList.toggle("hidden");
  worksSection.scrollIntoView({ behavior: "smooth" });
});

