const gsapLib = window.gsap;
const ScrollTriggerLib = window.ScrollTrigger;
const THREE = window.THREE;
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

const topbar = document.querySelector(".topbar");
const currentYear = document.querySelector("[data-year]");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

initAnchorScrolling();
initTopbarState();
initHeroScene();

if (gsapLib && ScrollTriggerLib) {
  gsapLib.registerPlugin(ScrollTriggerLib);
  initScrollProgress();

  if (!prefersReducedMotion) {
    initHeroEntrance();
    initRevealAnimations();
    initParallaxMotion();
    initEditorialMotion();
  }
}

function initAnchorScrolling() {
  const anchors = document.querySelectorAll('a[href^="#"]');

  anchors.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });
}

function initTopbarState() {
  if (!topbar) {
    return;
  }

  const syncState = () => {
    topbar.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  syncState();
  window.addEventListener("scroll", syncState, { passive: true });
}

function initScrollProgress() {
  const progressBar = document.querySelector(".scroll-progress__bar");

  if (!progressBar) {
    return;
  }

  gsapLib.to(progressBar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      start: 0,
      end: "max",
      scrub: 0.25,
    },
  });
}

function initHeroEntrance() {
  const hero = document.querySelector(".hero");

  if (!hero) {
    return;
  }

  gsapLib.from(".hero__eyebrow", {
    y: 24,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
  });

  gsapLib.from(".hero__title-line", {
    yPercent: 70,
    opacity: 0,
    duration: 1.15,
    stagger: 0.08,
    ease: "power3.out",
  });

  gsapLib.from(
    [".hero__lead", ".hero__support", ".hero__actions", ".hero__summary"],
    {
      y: 26,
      opacity: 0,
      duration: 0.95,
      stagger: 0.1,
      delay: 0.22,
      ease: "power2.out",
    }
  );

  gsapLib.from(".hero__portrait", {
    y: 30,
    opacity: 0,
    duration: 1.1,
    delay: 0.28,
    ease: "power2.out",
  });

  gsapLib.from(".hero__note", {
    y: 20,
    opacity: 0,
    duration: 0.9,
    stagger: 0.1,
    delay: 0.45,
    ease: "power2.out",
  });

  gsapLib.to(".hero__copy", {
    yPercent: -4,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsapLib.to(".hero-canvas", {
    opacity: 0.14,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

function initRevealAnimations() {
  const revealElements = gsapLib.utils.toArray("[data-reveal]");

  revealElements.forEach((element) => {
    gsapLib.from(element, {
      y: 28,
      opacity: 0,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 88%",
        once: true,
      },
    });
  });
}

function initParallaxMotion() {
  const layers = gsapLib.utils.toArray("[data-parallax]");

  layers.forEach((layer) => {
    const depth = Number.parseFloat(layer.dataset.parallax || "0.05");

    gsapLib.to(layer, {
      yPercent: depth * -40,
      ease: "none",
      scrollTrigger: {
        trigger: layer.closest(".hero, .chapter") || layer,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  if (!hasFinePointer) {
    return;
  }

  const hero = document.querySelector(".hero");
  const layersInHero = document.querySelectorAll(".hero .layer");

  if (!hero || !layersInHero.length) {
    return;
  }

  hero.addEventListener(
    "pointermove",
    (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;

      layersInHero.forEach((layer) => {
        const depth = Number.parseFloat(layer.dataset.parallax || "0.05");

        gsapLib.to(layer, {
          x: x * depth * 36,
          y: y * depth * 30,
          duration: 0.9,
          overwrite: "auto",
          ease: "power2.out",
        });
      });
    },
    { passive: true }
  );

  hero.addEventListener("pointerleave", () => {
    layersInHero.forEach((layer) => {
      gsapLib.to(layer, {
        x: 0,
        y: 0,
        duration: 0.85,
        overwrite: "auto",
        ease: "power2.out",
      });
    });
  });
}

function initEditorialMotion() {
  gsapLib.utils
    .toArray(".timeline-item, .step-card, .work-note, .capability-item")
    .forEach((item) => {
      gsapLib.to(item, {
        yPercent: -2.5,
        ease: "none",
        scrollTrigger: {
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });

  const image = document.querySelector(".case-study__image");

  if (image) {
    gsapLib.to(image, {
      scale: 1.08,
      ease: "none",
      scrollTrigger: {
        trigger: ".case-study__visual",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  }
}

function initHeroScene() {
  const canvas = document.getElementById("hero-canvas");
  const hero = document.querySelector(".hero");

  if (!canvas || !hero || !THREE) {
    return;
  }

  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    const group = new THREE.Group();
    group.position.set(1.8, 0.2, 0);
    scene.add(group);

    const core = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.55, 0.33, 180, 28),
      new THREE.MeshStandardMaterial({
        color: 0xb36a42,
        emissive: 0xd9a37f,
        emissiveIntensity: 0.16,
        metalness: 0.15,
        roughness: 0.7,
        transparent: true,
        opacity: 0.34,
      })
    );

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.1, 1),
      new THREE.MeshBasicMaterial({
        color: 0x8a9aa4,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      })
    );

    group.add(core);
    group.add(shell);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 720;
    const positions = new Float32Array(particleCount * 3);

    for (let index = 0; index < particleCount; index += 1) {
      const stride = index * 3;
      const radius = 3.8 + Math.random() * 2.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[stride] = radius * Math.sin(phi) * Math.cos(theta);
      positions[stride + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[stride + 2] = radius * Math.cos(phi);
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x8a9aa4,
        size: 0.03,
        transparent: true,
        opacity: 0.22,
        sizeAttenuation: true,
      })
    );

    group.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));

    const warmLight = new THREE.PointLight(0xd59a74, 1.2, 18);
    warmLight.position.set(3.8, 2.4, 5.5);
    scene.add(warmLight);

    const coolLight = new THREE.PointLight(0xa4b7c2, 0.6, 16);
    coolLight.position.set(-3.5, -1.8, 3.8);
    scene.add(coolLight);

    const pointer = { x: 0, y: 0 };
    const scrollState = { progress: 0 };
    const clock = new THREE.Clock();

    const resize = () => {
      const { width, height } = hero.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);

    if (hasFinePointer) {
      hero.addEventListener(
        "pointermove",
        (event) => {
          const rect = hero.getBoundingClientRect();
          pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        },
        { passive: true }
      );

      hero.addEventListener("pointerleave", () => {
        pointer.x = 0;
        pointer.y = 0;
      });
    }

    if (gsapLib && ScrollTriggerLib) {
      gsapLib.to(scrollState, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    const render = () => {
      const elapsed = clock.getElapsedTime();
      const motionMultiplier = prefersReducedMotion ? 0.35 : 1;

      group.rotation.y = elapsed * 0.1 * motionMultiplier + pointer.x * 0.14;
      group.rotation.x = elapsed * 0.04 * motionMultiplier + pointer.y * 0.08;
      group.position.y = -scrollState.progress * 0.7;

      core.rotation.x = elapsed * 0.18 * motionMultiplier;
      core.rotation.y = elapsed * 0.22 * motionMultiplier;
      shell.rotation.x = -elapsed * 0.04 * motionMultiplier;
      shell.rotation.y = elapsed * 0.06 * motionMultiplier;
      particles.rotation.y = -elapsed * 0.03 * motionMultiplier;

      renderer.render(scene, camera);
      window.requestAnimationFrame(render);
    };

    render();
  } catch (error) {
    canvas.style.display = "none";
    console.warn("Unable to initialize hero canvas.", error);
  }
}
