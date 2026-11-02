"use client";

import { useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import ModelViewer from "@/components/three/model-viewer";

const MODEL_ITEMS = [
  { name: "360 Bio Pod", meta: "48k Poly · PBR", style: "bio" },
  { name: "The Wild Robot", meta: "120k Poly · Rigged", style: "robot" },
  { name: "Aether Drone V4", meta: "86k Poly · SubD", style: "drone" },
  { name: "Cyber Visor X-1", meta: "64k Poly · Glass", style: "visor" },
  { name: "Quantum Maglev", meta: "95k Poly · Quad", style: "maglev" },
];

const TEXTURE_ITEMS = [
  { name: "Satin ceramic", meta: "4K · Roughness 0.24", style: "bio" },
  { name: "Graphite alloy", meta: "2K · Metallic 0.82", style: "robot" },
  { name: "Arctic composite", meta: "4K · Subsurface", style: "drone" },
  { name: "Prismatic glass", meta: "4K · Transmission", style: "visor" },
  { name: "Brushed titanium", meta: "2K · Anisotropic", style: "maglev" },
];

export default function ModelCreator() {
  const [light, setLight] = useState(40);
  const [color, setColor] = useState("#f18a31");
  const [temperature, setTemperature] = useState(34);
  const [temperatureMode, setTemperatureMode] = useState("Wind");
  const [activeTab, setActiveTab] = useState<"3D Models" | "Textures">("3D Models");
  const [activeModel, setActiveModel] = useState("Aether Drone V4");
  const [search, setSearch] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const [resetToken, setResetToken] = useState(0);
  const [rotationRequest, setRotationRequest] = useState({ direction: 1 as -1 | 1, token: 0 });
  const items = activeTab === "3D Models" ? MODEL_ITEMS : TEXTURE_ITEMS;
  const visibleItems = items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  const gaugeAngle = Math.PI - (light / 100) * Math.PI;
  const gaugeX = 90 + 70 * Math.cos(gaugeAngle);
  const gaugeY = 82 - 70 * Math.sin(gaugeAngle);
  const setLightFromPointer = (clientX: number, bounds: DOMRect) => {
    const position = ((clientX - bounds.left) / bounds.width) * 180;
    setLight(Math.round(Math.min(100, Math.max(0, ((position - 20) / 140) * 100))));
  };
  const handleLightPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setLightFromPointer(event.clientX, event.currentTarget.getBoundingClientRect());
  };
  const handleLightPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.buttons !== 1) return;
    setLightFromPointer(event.clientX, event.currentTarget.getBoundingClientRect());
  };
  const handleLightKeyDown = (event: ReactKeyboardEvent<SVGSVGElement>) => {
    const adjustments: Record<string, number> = { ArrowDown: -5, ArrowLeft: -5, ArrowRight: 5, ArrowUp: 5 };
    if (event.key === "Home") {
      event.preventDefault();
      setLight(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setLight(100);
    } else if (event.key in adjustments) {
      event.preventDefault();
      setLight((value) => Math.min(100, Math.max(0, value + adjustments[event.key])));
    }
  };

  return (
    <section className="model-creator" aria-label="3D Model Creator workspace">
      <div className="creator-reference-layout">
        <aside className="creator-reference-left" aria-label="Scene ambience controls">
          <section className="creator-reference-card creator-ambience-card">
            <header className="creator-reference-card-heading">
              <h2>Customizable Ambience</h2>
              <span className="creator-reference-tag">PBR LIGHT</span>
            </header>
            <svg
              aria-label="Lighting intensity"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={light}
              aria-valuetext={`${light}% lumen`}
              className="creator-light-gauge"
              onKeyDown={handleLightKeyDown}
              onPointerDown={handleLightPointerDown}
              onPointerMove={handleLightPointerMove}
              role="slider"
              tabIndex={0}
              viewBox="0 0 180 110"
            >
              <path className="creator-gauge-track" d="M20 82a70 70 0 0 1 140 0" />
              <path className="creator-gauge-fill" d="M20 82a70 70 0 0 1 140 0" pathLength="100" style={{ strokeDasharray: `${light} 100` }} />
              <circle cx="20" cy="82" r="4" className="creator-gauge-cap" />
              <circle cx="160" cy="82" r="4" className="creator-gauge-cap" />
              <circle cx={gaugeX} cy={gaugeY} r="8" className="creator-gauge-knob" style={{ fill: color }} />
            </svg>
            <div className="creator-lumen-readout"><strong>{light}%</strong><span>LUMEN</span></div>
            <div className="creator-ambience-colors" aria-label="Ambience color">
              {["#eef1f4", "#e94d95", "#f18a31", "#5476d6"].map((swatch) => (
                <button aria-label={`Set ambience color ${swatch}`} aria-pressed={color === swatch} className={color === swatch ? "is-active" : ""} key={swatch} onClick={() => setColor(swatch)} style={{ "--swatch": swatch } as CSSProperties} type="button" />
              ))}
            </div>
            <p className="creator-reference-caption">DIFFUSE RAY TRACE AMBIENCE</p>
          </section>

          <section className="creator-reference-card creator-temperature-card">
            <header className="creator-reference-card-heading">
              <h2>Set Temperature</h2>
              <span className="creator-reference-tag">THERMAL V2</span>
            </header>
            <div className="creator-temperature-dial">
              <span className="creator-temperature-indicator" />
              <strong>{temperature}°C</strong>
              <span>SAMPLING</span>
            </div>
            <div className="creator-temperature-modes" role="group" aria-label="Temperature mode">
              {[{ label: "Cool", value: 18, icon: "❄" }, { label: "Wind", value: 34, icon: "≋" }, { label: "Denoise", value: 26, icon: "☷" }].map((mode) => (
                <button aria-pressed={temperatureMode === mode.label} className={temperatureMode === mode.label ? "is-active" : ""} key={mode.label} onClick={() => { setTemperature(mode.value); setTemperatureMode(mode.label); }} type="button">
                  <span aria-hidden="true">{mode.icon}</span><small>{mode.label}</small>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <main className="creator-reference-stage" aria-label="3D preview" style={{ flex: "0 0 460px", minHeight: 460 }}>
          <div className="creator-stage-hardware" aria-hidden="true"><span /></div>
          <header className="creator-stage-header">
            <span className="creator-stage-runtime"><i /> NEURAL 3D RUNTIME</span>
            <h1>DREAMFRAME</h1>
            <span className="creator-stage-fps">60 FPS</span>
          </header>
          <span className="creator-orbit-status"><i>◉</i> 360° ORBIT ACTIVE</span>
          <div className="creator-model-art">
            <ModelViewer isPlaying={isPlaying} resetToken={resetToken} rotationRequest={rotationRequest} />
          </div>
          <div className="creator-model-toolbar" aria-label="Model display controls">
            <button type="button"><span aria-hidden="true">▤</span> Wireframe</button>
            <i />
            <button type="button"><span aria-hidden="true">◉</span> PBR</button>
            <i />
            <button aria-label="Reset model view" onClick={() => setResetToken((value) => value + 1)} type="button"><span aria-hidden="true">↻</span></button>
          </div>
          <div className="creator-stage-copy">
            <h2>360 POD</h2>
            <p>Experience 3D generation like never before. The 360 POD redefines asset creation with cutting-edge neural diffusion designed to transport your concepts directly into production-ready meshes.</p>
          </div>
        </main>

        <aside className="creator-reference-right" aria-label="Model library and playback">
          <div className="creator-library-tools">
            <label className="creator-model-search">
              <span className="sr-only">{activeTab === "3D Models" ? "Search 3D models" : "Search textures"}</span>
              <input onChange={(event) => setSearch(event.target.value)} placeholder={activeTab === "3D Models" ? "Search 3D models..." : "Search textures..."} value={search} />
              <span aria-hidden="true">⌕</span>
            </label>
            <button className="creator-library-icon" type="button" aria-label="Model library">⬡</button>
            <button className="creator-library-avatar" type="button" aria-label="Account menu">M</button>
          </div>
          <section className="creator-reference-card creator-library-card">
            <div className="creator-library-tabs" role="tablist" aria-label="Library type">
              {(["3D Models", "Textures"] as const).map((tab) => (
                <button aria-selected={activeTab === tab} className={activeTab === tab ? "is-active" : ""} key={tab} onClick={() => { setActiveTab(tab); setSearch(""); }} role="tab" type="button">
                  <span aria-hidden="true">{tab === "3D Models" ? "▣" : "▦"}</span>{tab}
                </button>
              ))}
            </div>
            <div className="creator-library-list">
              {visibleItems.map((item) => (
                <button aria-pressed={activeModel === item.name} className={activeModel === item.name ? "creator-library-item is-selected" : "creator-library-item"} key={item.name} onClick={() => setActiveModel(item.name)} type="button">
                  <span className={`creator-model-thumb creator-model-thumb--${item.style}`} aria-hidden="true"><i /><b /></span>
                  <span className="creator-library-item-copy"><strong>{item.name}</strong><small>{item.meta}</small></span>
                  {activeModel === item.name && <i className="creator-library-selected-dot" />}
                </button>
              ))}
              {visibleItems.length === 0 && <p className="creator-library-no-results">No matching assets</p>}
            </div>
            <div className="creator-library-pagination" aria-label="Library page 1 of 4"><span className="is-active" /><i /><i /><i /></div>
          </section>
          <section className="creator-reference-card creator-playback-card" aria-label="Model playback">
            <strong>{activeModel}</strong>
            <div className="creator-playback-timeline" aria-hidden="true"><i /></div>
            <div className="creator-playback-controls">
              <button aria-label="Previous model" onClick={() => setActiveModel(MODEL_ITEMS[(MODEL_ITEMS.findIndex((item) => item.name === activeModel) + MODEL_ITEMS.length - 1) % MODEL_ITEMS.length].name)} type="button">|◀</button>
              <button aria-label="Rotate model left" onClick={() => setRotationRequest((request) => ({ direction: -1, token: request.token + 1 }))} type="button">↶</button>
              <button aria-label={isPlaying ? "Pause preview" : "Play preview"} className="creator-play-button" onClick={() => setIsPlaying(!isPlaying)} type="button">{isPlaying ? "Ⅱ" : "▶"}</button>
              <button aria-label="Rotate model right" onClick={() => setRotationRequest((request) => ({ direction: 1, token: request.token + 1 }))} type="button">↷</button>
              <button aria-label="Next model" onClick={() => setActiveModel(MODEL_ITEMS[(MODEL_ITEMS.findIndex((item) => item.name === activeModel) + 1) % MODEL_ITEMS.length].name)} type="button">▶|</button>
            </div>
          </section>
        </aside>
        </div>
    </section>
  );
}