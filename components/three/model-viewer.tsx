"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

type ModelViewerProps = {
  isPlaying: boolean;
  resetToken: number;
  rotationRequest: { direction: -1 | 1; token: number };
};

type RotationTarget = { x: number; y: number };

function disposeModel(model: THREE.Object3D) {
  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

export default function ModelViewer({ isPlaying, resetToken, rotationRequest }: ModelViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const playingRef = useRef(isPlaying);
  const lastRotationTokenRef = useRef(rotationRequest.token);
  const targetRotationRef = useRef<RotationTarget>({ x: -0.08, y: 0 });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (rotationRequest.token === lastRotationTokenRef.current) return;
    lastRotationTokenRef.current = rotationRequest.token;
    targetRotationRef.current.y += Math.PI / 4 * rotationRequest.direction;
  }, [rotationRequest]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      const errorFrame = window.requestAnimationFrame(() => setStatus("error"));
      return () => window.cancelAnimationFrame(errorFrame);
    }

    let disposed = false;
    let animationFrame = 0;
    let previousTime = 0;
    let dragging = false;
    let previousPointer = { x: 0, y: 0 };
    let loadedModel: THREE.Object3D | null = null;
    const targetRotation = targetRotationRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 1000);
    const canvas = renderer.domElement;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x000000, 0);
    canvas.className = "creator-model-canvas";
    canvas.setAttribute("aria-label", "Interactive 3D model. Drag to rotate or use the arrow keys.");
    canvas.tabIndex = 0;
    Object.assign(canvas.style, {
      cursor: "grab",
      display: "block",
      height: "100%",
      inset: "0",
      position: "absolute",
      touchAction: "none",
      width: "100%",
    });
    mount.appendChild(canvas);

    scene.add(new THREE.HemisphereLight(0xf4f8ff, 0x8793a1, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
    keyLight.position.set(-4, 6, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb8d7ff, 1.5);
    fillLight.position.set(5, 1, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
    rimLight.position.set(1, 5, -6);
    scene.add(rimLight);

    const resize = () => {
      const { width } = mount.getBoundingClientRect();
      if (!width) return;
      const height = width * 270 / 620;
      mount.style.height = `${height}px`;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();
    const initialResizeFrame = window.requestAnimationFrame(resize);
    window.addEventListener("resize", resize);

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      previousPointer = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      targetRotation.y += (event.clientX - previousPointer.x) * 0.009;
      targetRotation.x = THREE.MathUtils.clamp(targetRotation.x + (event.clientY - previousPointer.y) * 0.007, -0.85, 0.85);
      previousPointer = { x: event.clientX, y: event.clientY };
    };

    const endPointer = (event: PointerEvent) => {
      dragging = false;
      canvas.style.cursor = "grab";
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const rotations: Record<string, [number, number]> = {
        ArrowDown: [0.12, 0],
        ArrowLeft: [0, -0.16],
        ArrowRight: [0, 0.16],
        ArrowUp: [-0.12, 0],
      };
      const rotation = rotations[event.key];
      if (!rotation) return;
      event.preventDefault();
      targetRotation.x = THREE.MathUtils.clamp(targetRotation.x + rotation[0], -0.85, 0.85);
      targetRotation.y += rotation[1];
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("keydown", onKeyDown);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/vendor/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      "/3D-model/model3d.glb",
      (gltf) => {
        if (disposed) {
          disposeModel(gltf.scene);
          return;
        }

        const model = gltf.scene;
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3();
        model.traverse((object) => {
          if (!(object instanceof THREE.Mesh) || !object.visible) return;
          for (let ancestor: THREE.Object3D | null = object; ancestor; ancestor = ancestor.parent) {
            if (!ancestor.visible) return;
          }
          bounds.union(new THREE.Box3().setFromObject(object));
        });
        if (bounds.isEmpty()) bounds.setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const largestDimension = Math.max(size.x, size.y, size.z);

        if (!Number.isFinite(largestDimension) || largestDimension <= 0) {
          setStatus("error");
          return;
        }

        model.position.sub(center);
        model.scale.setScalar(2.4 / largestDimension);
        modelRef.current = model;
        loadedModel = model;
        scene.add(model);

        const fieldOfView = THREE.MathUtils.degToRad(camera.fov);
        const fitDistance = (2.4 / (2 * Math.tan(fieldOfView / 2))) * 1.45;
        camera.position.set(0, 0, fitDistance * 0.52);
        camera.lookAt(0, 0, 0);
        setStatus("ready");
      },
      undefined,
      () => {
        if (!disposed) setStatus("error");
      },
    );

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = (time: number) => {
      animationFrame = window.requestAnimationFrame(animate);
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;

      if (loadedModel) {
        if (playingRef.current && !dragging && !reducedMotion) targetRotation.y += delta * 0.22;
        loadedModel.rotation.x += (targetRotation.x - loadedModel.rotation.x) * 0.12;
        loadedModel.rotation.y += (targetRotation.y - loadedModel.rotation.y) * 0.12;
      }

      renderer.render(scene, camera);
    };

    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(initialResizeFrame);
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endPointer);
      canvas.removeEventListener("pointercancel", endPointer);
      canvas.removeEventListener("keydown", onKeyDown);
      if (loadedModel) disposeModel(loadedModel);
      modelRef.current = null;
      dracoLoader.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    targetRotationRef.current.x = -0.08;
    targetRotationRef.current.y = 0;
    model.rotation.set(-0.08, 0, 0);
  }, [resetToken]);

  return (
    <div className="creator-model-viewer" ref={mountRef} style={{ position: "relative", width: "100%" }}>
      {status !== "ready" && (
        <div className={`creator-model-status${status === "error" ? " is-error" : ""}`} role={status === "error" ? "alert" : "status"}>
          {status === "error" ? "Unable to load 3D model" : "Loading 3D model..."}
        </div>
      )}
    </div>
  );
}