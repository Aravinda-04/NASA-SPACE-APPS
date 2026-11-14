import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Flag, ArrowRight, ExternalLink, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import type { VikingDiscoveryNode } from '../data/vikingForensicData';

interface VikingEvidenceBoardProps {
  discoveries: VikingDiscoveryNode[];
  discoveredIds: string[];
  onComplete: () => void;
  onClose: () => void;
  initialAnswer?: number | null;
}

export function VikingEvidenceBoard({
  discoveries,
  discoveredIds,
  onComplete,
  onClose,
  initialAnswer = null,
}: VikingEvidenceBoardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(initialAnswer);
  const [submitted, setSubmitted] = useState<boolean>(initialAnswer !== null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  const allDiscovered = discoveries.every((d) => discoveredIds.includes(d.id));
  const discoveredCount = discoveries.filter((d) => discoveredIds.includes(d.id)).length;

  const isCorrect = selectedOption === 0; // Option A is the historically and scientifically verified answer

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSelect = (index: number) => {
    setSelectedOption(index);
    setSubmitted(true);
    if (index === 0) {
      onComplete();
    }
  };

  return (
    <aside
      className="exp-archive exp-task-panel"
      role="dialog"
      aria-labelledby="viking-evidence-heading"
      aria-modal="true"
      style={{
        zIndex: 10,
        width: 'min(620px, calc(100vw - 40px))',
        maxHeight: 'calc(100dvh - 80px)',
      }}
    >
      {/* Top Toolbar */}
      <div className="exp-archive-toolbar">
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 600 }}>
          <Flag size={16} /> Chryse Planitia Forensic Synthesis
        </span>
        <button
          className="exp-icon-button exp-ink-button"
          onClick={onClose}
          aria-label="Close evidence board"
        >
          <X size={19} />
        </button>
      </div>

      <div className="exp-archive-body" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 10,
              letterSpacing: 1.2,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#B84B29',
              background: '#F0E2D0',
              padding: '3px 8px',
              borderRadius: 4,
            }}
          >
            [DOCUMENTED HISTORY & ASTROBIOLOGY]
          </span>
          <span style={{ fontSize: 11, color: '#5A685C' }}>
            {discoveredCount} of {discoveries.length} stations inspected
          </span>
        </div>

        <h2
          id="viking-evidence-heading"
          ref={headingRef}
          tabIndex={-1}
          style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.15,
            margin: '0 0 14px',
            color: '#14292D',
          }}
        >
          The 1976 Biology & Perchlorate Paradox
        </h2>

        {!allDiscovered ? (
          <div style={{ background: '#F7E9D7', padding: 18, borderRadius: 6, margin: '16px 0' }}>
            <p style={{ margin: '0 0 10px', fontWeight: 600, color: '#8D321E' }}>
              <AlertCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 6 }} />
              Inspect all 4 forensic stations to unlock synthesis.
            </p>
            <p style={{ fontSize: 13, margin: 0, color: '#38574B' }}>
              You have analyzed {discoveredCount} of {discoveries.length} hardware nodes. Visit the
              remaining locations around the lander deck to piece together the chemical evidence.
            </p>
          </div>
        ) : (
          <>
            <p className="exp-record-summary" style={{ fontSize: 14, lineHeight: 1.6, color: '#25443B' }}>
              In July 1976, two independent instruments inside Viking 1 delivered seemingly irreconcilable conclusions:
            </p>

            {/* The 2 Conflicting Experiments Evidence Spread */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 14,
                margin: '18px 0',
              }}
            >
              {/* LR Experiment */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D6CEBE',
                  borderRadius: 6,
                  padding: 14,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8D321E', fontWeight: 700, fontSize: 12 }}>
                  <Sparkles size={14} /> 1. Labeled Release (LR)
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.5, margin: '8px 0 0', color: '#203632' }}>
                  Liquid nutrient containing <strong><sup>14</sup>C-tagged organics</strong> touched the soil, triggering an immediate, intense evolution of radioactive gas that mimicked active microbial respiration.
                </p>
              </div>

              {/* GCMS Experiment */}
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D6CEBE',
                  borderRadius: 6,
                  padding: 14,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1B4942', fontWeight: 700, fontSize: 12 }}>
                  <HelpCircle size={14} /> 2. GCMS Pyrolysis Oven
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.5, margin: '8px 0 0', color: '#203632' }}>
                  Soil heated to <strong>500°C</strong> detected <strong>zero organic carbon</strong> down to parts per billion—a cleaner result than Antarctic sands or sterile lunar soils.
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#14292D', margin: '22px 0 10px' }}>
              Scientific Inquiry: Which conclusion is supported by modern planetary evidence?
            </h3>

            {/* Option Cards */}
            <div className="exp-answer-list" style={{ display: 'grid', gap: 12 }}>
              {/* Option A (Correct) */}
              <button
                className={`exp-answer-button ${
                  selectedOption === 0 ? 'exp-answer-correct' : ''
                }`}
                onClick={() => handleSelect(0)}
                aria-pressed={selectedOption === 0}
                style={{
                  padding: 14,
                  borderRadius: 6,
                  border: selectedOption === 0 ? '2px solid #3E7052' : '1px solid #D6CEBE',
                  background: selectedOption === 0 ? '#DFEADE' : '#FFFAEE',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '1px solid #193E35',
                    fontSize: 11,
                    fontWeight: 700,
                    background: selectedOption === 0 ? '#3E7052' : 'transparent',
                    color: selectedOption === 0 ? '#FFFFFF' : '#14292D',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  A
                </span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 13, color: '#14292D', display: 'block', marginBottom: 4 }}>
                    Oxidizing Chemistry (Perchlorates & Superoxides)
                  </strong>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: '#2C483E' }}>
                    Viking 1 revealed highly reactive, oxidizing Martian soil chemistry; while the Labeled Release test reacted strongly, the absence of clear organic signatures meant scientists could not confirm living microbes.
                  </span>
                </div>
                {selectedOption === 0 && <Check size={18} color="#2A6B46" style={{ flexShrink: 0 }} />}
              </button>

              {/* Option B (Incorrect) */}
              <button
                className={`exp-answer-button ${
                  selectedOption === 1 ? 'exp-answer-incorrect' : ''
                }`}
                onClick={() => handleSelect(1)}
                aria-pressed={selectedOption === 1}
                style={{
                  padding: 14,
                  borderRadius: 6,
                  border: selectedOption === 1 ? '2px solid #A95532' : '1px solid #D6CEBE',
                  background: selectedOption === 1 ? '#F7E1D5' : '#FFFAEE',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    border: '1px solid #193E35',
                    fontSize: 11,
                    fontWeight: 700,
                    background: selectedOption === 1 ? '#A95532' : 'transparent',
                    color: selectedOption === 1 ? '#FFFFFF' : '#14292D',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  B
                </span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: 13, color: '#14292D', display: 'block', marginBottom: 4 }}>
                    Total Planetary Sterility
                  </strong>
                  <span style={{ fontSize: 12, lineHeight: 1.5, color: '#2C483E' }}>
                    Viking 1 proved that Mars is completely sterile and has never had water or organic chemistry anywhere on the planet.
                  </span>
                </div>
                {selectedOption === 1 && <X size={18} color="#A95532" style={{ flexShrink: 0 }} />}
              </button>
            </div>

            {/* Forensic Feedback & Resolution */}
            {submitted && (
              <div
                className={`exp-task-feedback ${
                  isCorrect ? 'exp-feedback-correct' : ''
                }`}
                role="status"
                style={{
                  margin: '20px 0',
                  padding: 16,
                  borderRadius: 6,
                  background: isCorrect ? '#DCE9DA' : '#F7E1D5',
                  border: isCorrect ? '1px solid #B4D6B0' : '1px solid #EAC0B0',
                }}
              >
                <strong style={{ fontSize: 13, color: isCorrect ? '#205835' : '#8A2D16', display: 'block', marginBottom: 6 }}>
                  {isCorrect ? '✓ Scientific Synthesis Validated' : '⚠ Historical Re-Examination Required'}
                </strong>
                <p style={{ fontSize: 12, lineHeight: 1.6, margin: 0, color: '#203632' }}>
                  {isCorrect ? (
                    <>
                      <strong>The Resolution (2008 Phoenix Discovery):</strong> In 2008, NASA’s Phoenix lander discovered that Martian regolith contains roughly 0.5% <strong>perchlorates (ClO₄⁻)</strong>. When heated to 500°C inside Viking’s GCMS pyrolysis chamber, perchlorates decomposed into reactive oxygen and chlorine, burning up and destroying any organic molecules before the mass spectrometer could detect them!
                    </>
                  ) : (
                    <>
                      This conclusion contradicts subsequent discoveries. Orbiters and rovers (Curiosity, Perseverance) proved Mars once held long-lived lakes, river deltas, and indigenous organic macromolecules. Viking demonstrated reactive surface chemistry, not planetary sterility.
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Historical Legacy Footnote */}
            {isCorrect && (
              <div style={{ borderTop: '1px solid #D6CEBE', paddingTop: 18, marginTop: 18 }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, margin: '0 0 6px', color: '#14292D' }}>
                  Enduring Historical Legacy
                </h4>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: '#4C6255', margin: '0 0 16px' }}>
                  In 1984, NASA officially named Viking 1 the <strong>Thomas A. Mutch Memorial Station</strong> in honor of the imaging science team leader. The lander remains resting on its tilted pad in Chryse Planitia, preserving humanity’s first successful long-term surface observatory on Mars.
                </p>
                <button
                  className="exp-paper-action"
                  onClick={onClose}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                  }}
                >
                  <Check size={16} /> Close & Seal Expedition Journal
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
