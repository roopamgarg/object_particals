import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import { TimelineLite, TweenLite, Expo, Back } from "gsap";
var site = site || {};
site.window = $(window);
site.document = $(document);
site.Width = site.window.width();
site.Height = site.window.height();

var Background = function () {};

Background.headparticle = function () {
  if (!Modernizr.webgl) {
    alert("Your browser dosent support WebGL");
  }

  var camera, scene, renderer, mesh;
  const raycaster = new THREE.Raycaster();

  var mouseX = 0,
    mouseY = 0;
  var p;

  var windowHalfX = site.Width / 2;
  var windowHalfY = site.Height / 2;

  Background.camera = new THREE.PerspectiveCamera(
    35,
    site.Width / site.Height,
    1,
    2000
  );
  Background.camera.position.z = 300;

  // scene
  Background.scene = new THREE.Scene();

  // texture
  var manager = new THREE.LoadingManager();
  manager.onProgress = function (item, loaded, total) {
    //console.log('webgl, twice??');
    //console.log( item, loaded, total );
  };

  // particles
  var p_geom = new THREE.Geometry();
  let p_geom_copy;
  var p_material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1,
    opacity: 0.1,
  });

  // model

  var loader = new GLTFLoader(manager);
  loader.load("/src/assets/spaceman-30k.glb", function (object) {
    console.log(object);
    object.scene.children[0].traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        // child.material.map = texture;
        var scale = 0.5;
        const geometry = new THREE.Geometry().fromBufferGeometry(
          child.geometry
        );
        $(geometry.vertices).each(function () {
          p_geom.vertices.push(
            new THREE.Vector3(this.x * scale + Math.random(), this.y * scale + Math.random(), this.z * scale + Math.random())
          );
        });
      }
    });
    p_geom_copy = p_geom.clone();
    Background.scene.add(p);
  });
  p = new THREE.Points(p_geom, p_material);

  Background.renderer = new THREE.WebGLRenderer({ alpha: true });
  Background.renderer.setSize(site.Width, site.Height);
  Background.renderer.setClearColor(0x000000, 0);

  // Event Handlers

  $(".particlehead").append(Background.renderer.domElement);
  $(".particlehead").on("mousemove", raycast);
  //$(".particlehead").on("mouseout", onDocumentMouseOut);

  site.window.on("resize", onWindowResize);

  function onWindowResize() {
    windowHalfX = site.Width / 2;
    windowHalfY = site.Height / 2;
    //console.log(windowHalfX);

    Background.camera.aspect = site.Width / site.Height;
    Background.camera.updateProjectionMatrix();

    Background.renderer.setSize(site.Width, site.Height);
  }

  function raycast(e) {
    mouseX = (e.clientX - windowHalfX) / 2;
    mouseY = (e.clientY - windowHalfY) / 2;
    // // console.log(p);

    var mouse = new THREE.Vector2();

    mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    // update the picking ray with the camera and mouse position

    raycaster.setFromCamera(mouse, Background.camera);
    raycaster.params.Points.threshold = 15;

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObject(Background.scene.children[0]);
    p_geom.verticesNeedUpdate = true;
    intersects.forEach(({ index }) => {
      TweenLite.to(p.geometry.vertices[index], 1, {
        x: p_geom.vertices[index].x * 1.2 ,
        y: p_geom.vertices[index].y * 1.2,
        z: p_geom.vertices[index].z * 1.2,
        ease: Expo.easeOut,

        onComplete: () => {
          TweenLite.to(p.geometry.vertices[index], 1, {
            x: p_geom_copy.vertices[index].x,
            y: p_geom_copy.vertices[index].y,
            z: p_geom_copy.vertices[index].z,
            ease: Expo.easeOut,
          });
        },
      });
    });
  }

  Background.animate = function () {
    Background.ticker = TweenMax.ticker;
    Background.ticker.addEventListener("tick", Background.animate);

    render();
  };

  function render() {
    Background.camera.position.x +=
      (mouseX * 1 - Background.camera.position.x) * 0.05;
    Background.camera.position.y +=
      (-(mouseY * 1) - Background.camera.position.y) * 0.05;

    Background.camera.lookAt(Background.scene.position);

    Background.renderer.render(Background.scene, Background.camera);
  }

  render();

  Background.animate();
};

Background.headparticle();
