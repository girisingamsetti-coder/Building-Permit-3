"use client";

import * as React from "react";
import * as THREE from "three";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Eye,
  Layers,
  Scissors,
  Ruler,
  Camera,
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  Compass,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type { BimModelData, BimScrutinyRule } from "@/data/mock-bim-data";

interface BimViewer3DProps {
  model: BimModelData;
  activeViolation?: BimScrutinyRule | null;
  onClearViolation?: () => void;
  className?: string;
}

export function BimViewer3D({
  model,
  activeViolation,
  onClearViolation,
  className = "",
}: BimViewer3DProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Viewer state
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"shaded" | "ghost" | "scrutiny">("scrutiny");
  const [selectedFloor, setSelectedFloor] = React.useState<string>("all");
  const [clipHeight, setClipHeight] = React.useState<number>(20);
  const [measureMode, setMeasureMode] = React.useState(false);
  const [measuredDistance, setMeasuredDistance] = React.useState<number | null>(null);
  const [selectedElement, setSelectedElement] = React.useState<{
    name: string;
    guid: string;
    type: string;
    storey: string;
    dimensions: string;
    material: string;
    fireRating: string;
  } | null>(null);

  // References to Three.js instances
  const sceneRef = React.useRef<THREE.Scene | null>(null);
  const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
  const buildingGroupRef = React.useRef<THREE.Group | null>(null);
  const violationMarkerRef = React.useRef<THREE.Group | null>(null);
  const frontWallMeshRef = React.useRef<THREE.Mesh | null>(null);
  const eastColumnMeshRef = React.useRef<THREE.Mesh | null>(null);

  // Mouse interaction state
  const isDraggingRef = React.useRef(false);
  const previousMousePositionRef = React.useRef({ x: 0, y: 0 });
  const mouseButtonRef = React.useRef<number>(0);
  const sphericalRef = React.useRef({ radius: 36, theta: Math.PI / 4, phi: Math.PI / 3.2 });
  const cameraTargetRef = React.useRef(new THREE.Vector3(0, 5, 0));

  // Initialize Three.js scene
  React.useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0c101c"); // Sleek dark slate
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff8ee, 1.4);
    dirLight1.position.set(30, 45, 30);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8bc34a, 0.3);
    dirLight2.position.set(-20, 20, -20);
    scene.add(dirLight2);

    const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x112233, 0.6);
    scene.add(hemiLight);

    // 5. Site Ground & Setback Boundaries
    createSiteEnvironment(scene);

    // 6. Procedural Multi-storey BIM Model Elements
    const buildingGroup = new THREE.Group();
    buildingGroupRef.current = buildingGroup;
    scene.add(buildingGroup);

    generateBimGeometry(buildingGroup);

    // 7. Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Gentle floating pulse for violation marker if active
      if (violationMarkerRef.current) {
        violationMarkerRef.current.rotation.y += 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Update camera from spherical coords
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    const target = cameraTargetRef.current;

    cameraRef.current.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = target.y + radius * Math.cos(phi);
    cameraRef.current.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(target);
  };

  // Generate Site Boundaries & Grid
  const createSiteEnvironment = (scene: THREE.Scene) => {
    // Ground plot
    const groundGeo = new THREE.PlaneGeometry(50, 50);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x121726,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid helper
    const grid = new THREE.GridHelper(50, 50, 0x2a3650, 0x1b2336);
    grid.position.y = 0.01;
    scene.add(grid);

    // Cadastral Plot Boundary (Yellow outline)
    const plotBoundaryGeo = new THREE.BufferGeometry();
    const plotCorners = [
      new THREE.Vector3(-14, 0.05, -14),
      new THREE.Vector3(14, 0.05, -14),
      new THREE.Vector3(14, 0.05, 14),
      new THREE.Vector3(-14, 0.05, 14),
      new THREE.Vector3(-14, 0.05, -14),
    ];
    plotBoundaryGeo.setFromPoints(plotCorners);
    const plotLine = new THREE.Line(
      plotBoundaryGeo,
      new THREE.LineBasicMaterial({ color: 0xeab308, linewidth: 2 })
    );
    scene.add(plotLine);

    // Required Setback Envelope (Cyan dotted line: Front 6m, Rear 4m, Sides 3m)
    const setbackBoundaryGeo = new THREE.BufferGeometry();
    const setbackCorners = [
      new THREE.Vector3(-11, 0.06, -10),
      new THREE.Vector3(11, 0.06, -10),
      new THREE.Vector3(11, 0.06, 8),
      new THREE.Vector3(-11, 0.06, 8),
      new THREE.Vector3(-11, 0.06, -10),
    ];
    setbackBoundaryGeo.setFromPoints(setbackCorners);
    const setbackLine = new THREE.Line(
      setbackBoundaryGeo,
      new THREE.LineDashedMaterial({
        color: 0x06b6d4,
        dashSize: 0.6,
        gapSize: 0.3,
      })
    );
    setbackLine.computeLineDistances();
    scene.add(setbackLine);
  };

  // Generate Multi-storey Building Geometry
  const generateBimGeometry = (group: THREE.Group) => {
    // Clear previous
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    const floors = 4;
    const floorHeight = 3.6;
    const buildingWidth = 18;
    const buildingDepth = 15;

    // Materials
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.2,
    });
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.9,
      ior: 1.5,
    });
    const normalWallMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
    });

    // Failing front wall material (Red highlight for scrutiny violation)
    const failingWallMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4,
      roughness: 0.4,
    });

    // 1. Slabs and Storeys
    for (let f = 0; f <= floors; f++) {
      const y = f * floorHeight;

      // Concrete Slab
      const slabGeo = new THREE.BoxGeometry(buildingWidth, 0.4, buildingDepth);
      const slabMesh = new THREE.Mesh(slabGeo, slabMat);
      slabMesh.position.set(0, y, 0);
      slabMesh.castShadow = true;
      slabMesh.receiveShadow = true;
      slabMesh.userData = {
        name: f === 0 ? "IfcSlab_GroundFloor" : f === floors ? "IfcSlab_Roof" : `IfcSlab_Level_${f}`,
        guid: `2O2$SLAB_000${f}`,
        type: "IfcSlab",
        storey: f === 0 ? "Ground Floor" : `Level ${f}`,
        dimensions: `${buildingWidth}m x ${buildingDepth}m x 0.4m`,
        material: "Reinforced Concrete M25",
        fireRating: "2 Hours",
      };
      group.add(slabMesh);

      if (f < floors) {
        // Columns (Grid of 3 x 4)
        for (let cx = -buildingWidth / 2 + 1; cx <= buildingWidth / 2 - 1; cx += (buildingWidth - 2) / 2) {
          for (let cz = -buildingDepth / 2 + 1; cz <= buildingDepth / 2 - 1; cz += (buildingDepth - 2) / 3) {
            const colGeo = new THREE.BoxGeometry(0.5, floorHeight - 0.4, 0.5);
            const isEastCol = cx > 6 && cz === 0 && f === 0;
            const colMesh = new THREE.Mesh(colGeo, isEastCol ? failingWallMat : columnMat);
            colMesh.position.set(cx, y + (floorHeight - 0.4) / 2 + 0.2, cz);
            colMesh.castShadow = true;
            colMesh.userData = {
              name: `IfcColumn_C_${cx > 0 ? "E" : "W"}_${f}`,
              guid: `COL_${cx}_${cz}_${f}`,
              type: "IfcColumn",
              storey: `Level ${f}`,
              dimensions: "500mm x 500mm",
              material: "High Strength Concrete",
              fireRating: "3 Hours",
            };
            group.add(colMesh);

            if (isEastCol) {
              eastColumnMeshRef.current = colMesh;
            }
          }
        }

        // Exterior Glass Curtain Facade (Sides and Rear)
        const rearGlassGeo = new THREE.PlaneGeometry(buildingWidth - 1, floorHeight - 0.5);
        const rearGlass = new THREE.Mesh(rearGlassGeo, glassMat);
        rearGlass.position.set(0, y + floorHeight / 2, -buildingDepth / 2 + 0.1);
        group.add(rearGlass);

        // Front Wall (Infringing on Front Setback at Level 0 and 1)
        const frontWallGeo = new THREE.BoxGeometry(buildingWidth - 2, floorHeight - 0.4, 0.4);
        const isFailingFrontWall = f <= 1 && model.status === "BIM_SCRUTINY_FAILED";
        const frontWall = new THREE.Mesh(
          frontWallGeo,
          isFailingFrontWall ? failingWallMat : normalWallMat
        );
        frontWall.position.set(0, y + (floorHeight - 0.4) / 2 + 0.2, buildingDepth / 2 - 0.2);
        frontWall.castShadow = true;
        frontWall.userData = {
          name: `IfcWall_Exterior_Front_L${f}`,
          guid: `2O2$O$tVn0$xW_000${f}`,
          type: "IfcWallStandardCase",
          storey: f === 0 ? "Ground Floor" : `Level ${f}`,
          dimensions: `${buildingWidth - 2}m x ${floorHeight - 0.4}m x 230mm`,
          material: "AAC Block Masonry with Plaster",
          fireRating: "2 Hours",
        };
        group.add(frontWall);

        if (f === 0) {
          frontWallMeshRef.current = frontWall;
        }

        // Side Walls
        const leftWallGeo = new THREE.BoxGeometry(0.3, floorHeight - 0.4, buildingDepth - 2);
        const leftWall = new THREE.Mesh(leftWallGeo, normalWallMat);
        leftWall.position.set(-buildingWidth / 2 + 0.15, y + (floorHeight - 0.4) / 2 + 0.2, 0);
        leftWall.userData = {
          name: `IfcWall_West_L${f}`,
          guid: `WALL_W_L${f}`,
          type: "IfcWallStandardCase",
          storey: `Level ${f}`,
          dimensions: "230mm Solid Brick",
          material: "Brick Masonry",
          fireRating: "2 Hours",
        };
        group.add(leftWall);
      }
    }

    // Parapet Wall on Roof
    const parapetGeo = new THREE.BoxGeometry(buildingWidth, 1.2, buildingDepth);
    const parapetMesh = new THREE.Mesh(
      parapetGeo,
      new THREE.MeshStandardMaterial({ color: 0x334155, wireframe: false })
    );
    parapetMesh.position.set(0, floors * floorHeight + 0.6, 0);
    parapetMesh.scale.set(0.98, 1, 0.98);
    group.add(parapetMesh);
  };

  // Fly camera to violation target when clicked
  React.useEffect(() => {
    if (!activeViolation || !sceneRef.current) return;

    // Remove existing violation marker
    if (violationMarkerRef.current && sceneRef.current) {
      sceneRef.current.remove(violationMarkerRef.current);
      violationMarkerRef.current = null;
    }

    const targetPos = activeViolation.cameraTarget || { x: 0, y: 3.5, z: 8 };

    // Create 3D Callout Beacon at the violation spot
    const markerGroup = new THREE.Group();
    markerGroup.position.set(targetPos.x, targetPos.y, targetPos.z);

    // Glowing red diamond marker
    const octaGeo = new THREE.OctahedronGeometry(0.8, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const diamond = new THREE.Mesh(octaGeo, octaMat);
    diamond.position.y = 1.5;
    markerGroup.add(diamond);

    // Vertical leader line down to the ground
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const line = new THREE.Line(
      lineGeo,
      new THREE.LineBasicMaterial({ color: 0xef4444, linewidth: 2 })
    );
    markerGroup.add(line);

    // Expanding ground ring
    const ringGeo = new THREE.RingGeometry(0.4, 1.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    markerGroup.add(ring);

    sceneRef.current.add(markerGroup);
    violationMarkerRef.current = markerGroup;

    // Smooth camera transition towards target
    cameraTargetRef.current.set(targetPos.x, targetPos.y, targetPos.z);
    sphericalRef.current = {
      radius: 20,
      theta: targetPos.z > 0 ? 0.3 : Math.PI + 0.3,
      phi: Math.PI / 3.4,
    };
    updateCameraPosition();
  }, [activeViolation]);

  // Handle Mouse controls for Orbit / Pan / Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    mouseButtonRef.current = e.button;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    if (mouseButtonRef.current === 0) {
      // Rotate / Orbit
      sphericalRef.current.theta -= deltaX * 0.008;
      sphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2.05, sphericalRef.current.phi - deltaY * 0.008)
      );
    } else if (mouseButtonRef.current === 2) {
      // Pan
      const panSpeed = 0.03;
      cameraTargetRef.current.x -= deltaX * panSpeed;
      cameraTargetRef.current.y += deltaY * panSpeed;
    }

    updateCameraPosition();
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(
      8,
      Math.min(80, sphericalRef.current.radius + e.deltaY * 0.04)
    );
    updateCameraPosition();
  };

  // Raycasting for element click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !buildingGroupRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    const intersects = raycaster.intersectObjects(buildingGroupRef.current.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData && hit.userData.name) {
        setSelectedElement(hit.userData as any);

        if (measureMode) {
          setMeasuredDistance(parseFloat((intersects[0].distance).toFixed(2)));
        }
      }
    } else {
      setSelectedElement(null);
    }
  };

  // Reset view to default isometric angle
  const resetCamera = () => {
    cameraTargetRef.current.set(0, 5, 0);
    sphericalRef.current = { radius: 36, theta: Math.PI / 4, phi: Math.PI / 3.2 };
    updateCameraPosition();
    if (onClearViolation) onClearViolation();
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-[#0a0d18] shadow-2xl ${className}`}
      style={{ height: isFullscreen ? "100vh" : "580px" }}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onContextMenu={(e) => e.preventDefault()}
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Control Bar */}
      <div className="absolute left-3 top-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Model & Schema Badge */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 backdrop-blur-md shadow-lg">
            <Building className="size-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">{model.activeFileName}</span>
            <Badge variant="outline" className="border-cyan-500/40 text-[10px] text-cyan-300">
              v{model.currentVersion} • {model.schema}
            </Badge>
          </div>

          {activeViolation && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-950/80 px-3 py-1.5 text-xs text-red-200 backdrop-blur-md animate-pulse">
              <AlertCircle className="size-4 text-red-400" />
              <span className="font-semibold">{activeViolation.title}:</span>
              <span>{activeViolation.observedValue} (Req: {activeViolation.requiredValue})</span>
              <button
                onClick={onClearViolation}
                className="ml-1 rounded hover:bg-red-800/50 p-0.5"
                title="Reset Focus"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <Button
            size="sm"
            variant="outline"
            className="h-8 border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white backdrop-blur-md"
            onClick={resetCamera}
            title="Reset Camera View"
          >
            <RotateCcw className="size-3.5 mr-1" /> Reset View
          </Button>

          <Button
            size="sm"
            variant="outline"
            className={`h-8 border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white backdrop-blur-md ${
              measureMode ? "border-cyan-500 text-cyan-400" : ""
            }`}
            onClick={() => setMeasureMode(!measureMode)}
            title="Laser Distance Measurement"
          >
            <Ruler className="size-3.5 mr-1" /> Measure
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="size-8 border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white backdrop-blur-md"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen 3D Viewer"}
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Floating Measurement Indicator */}
      {measureMode && (
        <div className="absolute top-14 left-3 rounded-lg border border-cyan-500/50 bg-cyan-950/90 p-2.5 text-xs text-cyan-200 backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1.5 font-semibold">
            <Ruler className="size-4 text-cyan-400" /> Measurement Tool Active
          </div>
          <p className="text-[11px] text-cyan-300/80 mt-1">
            Click on any structural face to read coordinate clearance.
          </p>
          {measuredDistance !== null && (
            <div className="mt-1.5 text-sm font-bold text-white">
              Direct Ray Clearance: <span className="text-cyan-300">{measuredDistance} m</span>
            </div>
          )}
        </div>
      )}

      {/* Left Bottom: Legend & Setback Reference */}
      <div className="absolute left-3 bottom-3 rounded-lg border border-slate-800 bg-slate-950/80 p-2.5 text-[11px] text-slate-400 backdrop-blur-md space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-yellow-500 ring-1 ring-yellow-400/50"></span>
          <span>Cadastral Plot Boundary (DCR Baseline)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-cyan-500 ring-1 ring-cyan-400/50"></span>
          <span>Required Setback Envelope (6m / 4m / 3m)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-red-500 ring-1 ring-red-400/50 animate-pulse"></span>
          <span>Infringing Exterior Facade (Setback Fail)</span>
        </div>
      </div>

      {/* Right Bottom: Floating Element Property Inspector */}
      {selectedElement && (
        <div className="absolute right-3 bottom-3 w-80 rounded-xl border border-slate-700 bg-slate-900/95 p-4 text-xs text-slate-300 shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-semibold text-white">
              <Info className="size-4 text-cyan-400" />
              <span className="truncate">{selectedElement.name}</span>
            </div>
            <button
              onClick={() => setSelectedElement(null)}
              className="text-slate-400 hover:text-white rounded p-0.5"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">IFC Class:</span>
              <span className="font-mono text-cyan-300 font-semibold">{selectedElement.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Global ID:</span>
              <span className="font-mono text-slate-400 truncate max-w-[150px]">{selectedElement.guid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Storey Level:</span>
              <span className="text-slate-200">{selectedElement.storey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dimensions:</span>
              <span className="text-slate-200">{selectedElement.dimensions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Material:</span>
              <span className="text-slate-200">{selectedElement.material}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fire Resistance:</span>
              <span className="text-emerald-400 font-medium">{selectedElement.fireRating}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Help overlay */}
      <div className="absolute right-3 top-14 text-[10px] text-slate-500 bg-slate-950/60 rounded px-2 py-1 pointer-events-none backdrop-blur-sm">
        Left Click + Drag: Orbit • Right Click + Drag: Pan • Scroll: Zoom
      </div>
    </div>
  );
}
