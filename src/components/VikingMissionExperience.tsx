import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Compass,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  HelpCircle,
  Maximize2,
  Move,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { ChryseTerrainScene } from './ChryseTerrainScene';
import { VikingEvidenceBoard } from './VikingEvidenceBoard';
import {
  VIKING_DISCOVERIES,
  type VikingDiscoveryNode,
} from '../data/vikingForensicData';
import { getChryseTerrainHeight } from '../utils/chryseTerrainSampler';

interface VikingMissionExperienceProps {
  onExit?: () => void;
  onMissionComplete?: () => void;
}

/**
 * 1976 Mechanical Facsimile Scan Simulator (Docked PiP Monitor)
 * Emulates the nodding-mirror column-by-column vertical scan of Cameras 1 & 2.
 */
function FacsimileScanMonitor({
  active,
  onClose,
}: {
  active: boolean;
  onClose: () => void;
}) {
  const [scanColumn, setScanColumn] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const totalColumns = 80;

  useEffect(() => {
    if (!isScanning) return;
    const timer = setInterval(() => {
      setScanColumn((prev) => (prev >= totalColumns ? 0 : prev + 1));
    }, 45);
    return () => clearInterval(timer);
  }, [isScanning]);

  if (!active) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 110,
        right: 30,
        width: 320,
        background: '#10252BEF',
        border: '1px solid #00F0FF88',
        borderRadius: 8,
        color: '#E0F8FF',
        padding: 14,
        zIndex: 6,
        boxShadow: '0 8px 32px rgba(0, 240, 255, 0.18)',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #00F0FF44',
          paddingBottom: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: '#00F0FF',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Camera size={14} /> 1976 FACSIMILE MONITOR · SOL 0
        </span>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#00F0FF', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Cathode / Scanner Screen Frame */}
      <div
        style={{
          height: 120,
          background: '#071518',
          border: '1px solid #00F0FF33',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background Scan Lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.05), rgba(0, 240, 255, 0.05) 1px, transparent 1px, transparent 4px)',
            pointerEvents: 'none',
          }}
        />

        {/* Footpad & Big Joe Silhouette Graphic */}
        <svg
          viewBox="0 0 320 120"
          style={{ width: '100%', height: '100%', opacity: 0.75 }}
        >
          <rect x="0" y="70" width="320" height="50" fill="#2E1C14" />
          {/* Footpad #3 */}
          <ellipse cx="65" cy="85" rx="35" ry="14" fill="#6B655B" />
          <rect x="62" y="45" width="6" height="40" fill="#8C8578" />
          {/* Big Joe Boulder */}
          <polygon
            points="210,80 230,55 265,58 285,82 250,88"
            fill="#3E2723"
          />
        </svg>

        {/* Progressive Vertical Scan Sweep */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${(scanColumn / totalColumns) * 100}%`,
            width: 3,
            background: '#00F0FF',
            boxShadow: '0 0 10px #00F0FF, 0 0 20px #00F0FF',
          }}
        />

        {/* Scan Status Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 6,
            left: 8,
            fontSize: 9,
            color: '#00F0FF',
            fontFamily: 'monospace',
          }}
        >
          AZ: {((scanColumn / totalColumns) * 300).toFixed(1)}° | LINE: {scanColumn * 12}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
          fontSize: 11,
        }}
      >
        <span style={{ color: '#88C0D0' }}>
          Rate: 1 vertical strip / 125 ms
        </span>
        <button
          onClick={() => setIsScanning((v) => !v)}
          style={{
            background: '#00F0FF22',
            border: '1px solid #00F0FF',
            color: '#00F0FF',
            borderRadius: 4,
            padding: '3px 8px',
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          {isScanning ? 'PAUSE' : 'RESUME'}
        </button>
      </div>

      <div
        style={{
          fontSize: 10,
          color: '#7098A5',
          marginTop: 8,
          borderTop: '1px solid #00F0FF22',
          paddingTop: 6,
        }}
      >
        Source Citation: NASA JPL PIA00381 (First Photo from Mars Surface) & PIA00393 ("Big Joe" Panorama).
      </div>
    </div>
  );
}

/**
 * Viking 1 Interactive Master Simulation Experience
 */
export function VikingMissionExperience({
  onExit,
  onMissionComplete,
}: VikingMissionExperienceProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);
  const [scrubberProgress, setScrubberProgress] = useState<number>(0.0); // 0.0 to 1.0
  const [isPlayingScrubber, setIsPlayingScrubber] = useState<boolean>(false);
  const [showEvidenceBoard, setShowEvidenceBoard] = useState<boolean>(false);
  const [showFacsimileMonitor, setShowFacsimileMonitor] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'orbit' | 'surface'>('orbit');
  const [showFAQ, setShowFAQ] = useState<number | null>(null);

  const selectedNode = VIKING_DISCOVERIES.find((d) => d.id === selectedNodeId);
  const allDiscovered = VIKING_DISCOVERIES.every((d) => discoveredIds.includes(d.id));

  // Auto-play time scrubber loop if triggered
  useEffect(() => {
    if (!isPlayingScrubber) return;
    const interval = setInterval(() => {
      setScrubberProgress((prev) => {
        if (prev >= 1.0) {
          setIsPlayingScrubber(false);
          return 1.0;
        }
        return Math.min(1.0, prev + 0.015);
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isPlayingScrubber]);

  const handleSelectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    setShowFAQ(null);
    if (!discoveredIds.includes(id)) {
      setDiscoveredIds((prev) => [...prev, id]);
    }
    // Auto-open facsimile monitor if node 2 selected
    if (id === '2_FACSIMILE_CAMERAS') {
      setShowFacsimileMonitor(true);
    }
  }, [discoveredIds]);

  const handleCompleteMission = () => {
    setShowEvidenceBoard(false);
    onMissionComplete?.();
  };

  return (
    <main
      className="exp-experience exp-viking"
      style={{
        position: 'relative',
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        background: '#111D21',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {/* 1. Three.js Canvas Viewport */}
      <div className="exp-scene" style={{ position: 'absolute', inset: 0 }}>
        <Canvas
          shadows
          camera={{
            position: [-6, 3.8, 9],
            fov: 54,
            near: 0.1,
            far: 350,
          }}
        >
          <ChryseTerrainScene
            selectedNodeId={selectedNodeId}
            scrubberProgress={scrubberProgress}
            onSelectNode={handleSelectNode}
            discoveredIds={discoveredIds}
          />
          <OrbitControls
            enabled={true}
            target={[0, 1.0, 0]}
            minDistance={2.5}
            maxDistance={70}
            maxPolarAngle={Math.PI * 0.49}
            enableDamping
            dampingFactor={0.08}
          />
        </Canvas>
      </div>

      {/* 2. Top Header Navigation Bar */}
      <header className="exp-topbar">
        <button
          className="exp-back-button"
          onClick={onExit}
          aria-label="Back to journal"
        >
          <ArrowLeft size={17} /> Back to journal
        </button>

        <div className="exp-mission-heading">
          <h1 style={{ fontFamily: '"DM Serif Display", serif' }}>
            Viking 1 · Thomas A. Mutch Station
          </h1>
          <span>Chryse Planitia (22.27° N, 47.95° W) · 1976 Surface Expedition</span>
        </div>

        <button
          className="exp-journal-toggle"
          onClick={() => setShowEvidenceBoard(true)}
          style={{
            borderColor: allDiscovered ? '#00F0FF' : undefined,
            color: allDiscovered ? '#00F0FF' : undefined,
          }}
        >
          <BookOpen size={18} /> {discoveredIds.length}/{VIKING_DISCOVERIES.length} records{' '}
          {allDiscovered && <Check size={16} color="#00F0FF" />}
        </button>
      </header>

      {/* 3. Epistemic Context Pill */}
      <div className="exp-context">
        <span
          className="exp-fiction-dot"
          style={{ background: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }}
        />
        <span>[DOCUMENTED 1976 HISTORY & CHRYSE PLANITIA DEM]</span>
      </div>

      {/* 4. Left Waypoint Drawer */}
      <aside className="exp-discoveries" aria-label="Viking inspection stations">
        <div className="exp-list-heading">
          <h2 style={{ fontFamily: '"DM Serif Display", serif' }}>Forensic Stations</h2>
        </div>
        <p style={{ fontSize: 12, color: '#CCDAD3', margin: '4px 0 14px' }}>
          Inspect all 4 hardware nodes to reconstruct the 1976 touchdown and the perchlorate synthesis.
        </p>
        <ol>
          {VIKING_DISCOVERIES.map((d, index) => {
            const isDiscovered = discoveredIds.includes(d.id);
            const isSelected = selectedNodeId === d.id;
            return (
              <li
                key={d.id}
                className={isDiscovered ? 'exp-discovered' : ''}
                style={{
                  background: isSelected ? 'rgba(0, 240, 255, 0.08)' : undefined,
                  borderRadius: 4,
                  padding: '8px 6px',
                }}
              >
                <button
                  className="exp-discovery-open"
                  onClick={() => handleSelectNode(d.id)}
                >
                  <span
                    className="exp-discovery-number"
                    style={{
                      borderColor: isDiscovered ? '#00F0FF' : undefined,
                      color: isDiscovered ? '#00F0FF' : undefined,
                    }}
                  >
                    {isDiscovered ? <Check size={13} /> : index + 1}
                  </span>
                  <span>
                    <strong>{d.title}</strong>
                    <small>{d.component}</small>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Synthesis Trigger Button */}
        <button
          className={`exp-task-button ${allDiscovered ? 'exp-task-ready' : ''}`}
          onClick={() => setShowEvidenceBoard(true)}
          style={{
            marginTop: 14,
            borderColor: allDiscovered ? '#00F0FF' : undefined,
          }}
        >
          <Flag size={16} />
          <span>
            {allDiscovered
              ? 'Synthesize Biology & Perchlorates'
              : `${VIKING_DISCOVERIES.length - discoveredIds.length} stations left to inspect`}
            <small>
              {allDiscovered ? 'Unlock 1976 conclusion task' : 'Examine all landing nodes'}
            </small>
          </span>
        </button>
      </aside>

      {/* 5. Right Archive Details Drawer (when a node is selected) */}
      {selectedNode && (
        <aside
          className="exp-archive"
          aria-label={`${selectedNode.title} forensic record`}
          style={{ width: 'min(460px, calc(100vw - 360px))' }}
        >
          <div className="exp-archive-toolbar">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={15} /> {selectedNode.provenance}
            </span>
            <button
              className="exp-icon-button exp-ink-button"
              onClick={() => setSelectedNodeId(null)}
              aria-label="Close record"
            >
              <X size={18} />
            </button>
          </div>

          <div className="exp-archive-body" style={{ padding: '20px 24px' }}>
            <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 26, margin: '0 0 6px' }}>
              {selectedNode.title}
            </h2>
            <p className="exp-component" style={{ marginBottom: 14 }}>
              {selectedNode.component} · Coords: ({selectedNode.coordinates.join(', ')})
            </p>

            <p className="exp-record-summary" style={{ fontSize: 14 }}>
              {selectedNode.summary}
            </p>

            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '16px 0 6px', color: '#1B4942' }}>
              The 1976 Historical Story
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>{selectedNode.story}</p>

            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '16px 0 6px', color: '#1B4942' }}>
              Engineering & Mechanism
            </h3>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>{selectedNode.engineering}</p>

            {/* Facsimile Simulation Trigger */}
            {selectedNode.id === '2_FACSIMILE_CAMERAS' && (
              <button
                onClick={() => setShowFacsimileMonitor(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#071518',
                  color: '#00F0FF',
                  border: '1px solid #00F0FF',
                  borderRadius: 6,
                  padding: '10px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  margin: '14px 0',
                }}
              >
                <Camera size={16} /> [SIMULATE 1976 FACSIMILE SCAN]
              </button>
            )}

            {/* 3 Deterministic Archive FAQ Chips */}
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '20px 0 8px', color: '#1B4942' }}>
              Primary Forensic Records (FAQ Chips)
            </h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {selectedNode.faqChips.map((chip, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #D6CEBE',
                    borderRadius: 6,
                    padding: '10px 12px',
                    background: '#FFFFFF',
                  }}
                >
                  <button
                    onClick={() => setShowFAQ(showFAQ === idx ? null : idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 12,
                      color: '#14292D',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <span>{chip.question}</span>
                    <HelpCircle size={14} color="#5A685C" />
                  </button>
                  {showFAQ === idx && (
                    <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, color: '#2C483E' }}>
                      <p style={{ margin: '0 0 6px' }}>{chip.answer}</p>
                      <span style={{ fontSize: 10, color: '#8A533C', fontStyle: 'italic' }}>
                        Citation: {chip.citation}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sources */}
            <div className="exp-sources" style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700 }}>Follow the Evidence</h3>
              {selectedNode.sourceUrls.map((s, idx) => (
                <a key={idx} href={s.url} target="_blank" rel="noreferrer">
                  {s.title}
                  <ExternalLink size={12} />
                  <span>{s.credit}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* 6. Holographic Time-Scrubber Control Toolbar (Bottom Center) */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          background: '#10252BEF',
          border: '1px solid #00F0FF66',
          borderRadius: 8,
          padding: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          width: 'min(580px, calc(100vw - 60px))',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            fontSize: 11,
            color: '#BCE8F5',
          }}
        >
          <span style={{ color: '#88989E' }}>0% 2026+ Quiet Artifact</span>
          <span style={{ color: '#00F0FF', fontWeight: 700 }}>
            {selectedNode
              ? selectedNode.timeScrubber.replayStateLabel
              : 'Holographic 1976 Replay'}
          </span>
          <span style={{ color: '#E28749' }}>100% 1976 Mission Action</span>
        </div>

        {/* Slider & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
          <button
            onClick={() => setIsPlayingScrubber((v) => !v)}
            style={{
              background: '#00F0FF22',
              border: '1px solid #00F0FF',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00F0FF',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title={isPlayingScrubber ? 'Pause' : 'Play 1976 Sequence'}
          >
            {isPlayingScrubber ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={scrubberProgress}
            onChange={(e) => setScrubberProgress(parseFloat(e.target.value))}
            style={{
              flex: 1,
              accentColor: '#00F0FF',
              cursor: 'pointer',
            }}
          />

          <button
            onClick={() => setScrubberProgress(0)}
            style={{
              background: 'none',
              border: 'none',
              color: '#88989E',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Reset to 0%"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Scrubber step guidance */}
        {selectedNode && (
          <div style={{ fontSize: 10, color: '#A0D2DE', textAlign: 'center' }}>
            {scrubberProgress < 0.25
              ? selectedNode.timeScrubber.animationSteps[0]
              : scrubberProgress < 0.65
              ? selectedNode.timeScrubber.animationSteps[1]
              : scrubberProgress < 0.9
              ? selectedNode.timeScrubber.animationSteps[2]
              : selectedNode.timeScrubber.animationSteps[3]}
          </div>
        )}
      </div>

      {/* 7. Facsimile PiP Monitor */}
      <FacsimileScanMonitor
        active={showFacsimileMonitor}
        onClose={() => setShowFacsimileMonitor(false)}
      />

      {/* 8. Synthesis Evidence Board Modal */}
      {showEvidenceBoard && (
        <VikingEvidenceBoard
          discoveries={VIKING_DISCOVERIES}
          discoveredIds={discoveredIds}
          onComplete={handleCompleteMission}
          onClose={() => setShowEvidenceBoard(false)}
        />
      )}
    </main>
  );
}
