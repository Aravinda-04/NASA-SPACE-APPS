import { useId } from "react";
import type { ChronologicalArtifact } from "../../data/chronologicalArtifacts";

/** An intentionally small, non-WebGL diagram. No textures, telemetry or measured orbits. */
export function ArtifactAtlasPreview({ artifact }: { artifact: ChronologicalArtifact }) {
  const titleId = useId();
  const coordinates = artifact.coordinateData;
  const marker = coordinates ? {
    x: 35 + ((coordinates.longitude + 180) / 360) * 410,
    y: 25 + ((90 - coordinates.latitude) / 180) * 120,
  } : undefined;
  return <figure className="artifact-atlas">
    <div className="atlas-classification"><span>Schematic reconstruction</span><span>Not to scale</span></div>
    <svg viewBox="0 0 480 200" role="img" aria-labelledby={titleId}>
      <title id={titleId}>{artifact.journey
        ? `${artifact.title}: conceptual mission context: ${artifact.journey.join(' / ')}. ${artifact.schematic === 'telescope' ? 'Observation targets are not visited destinations. ' : ''}Not a measured orbit or live tracking.`
        : coordinates ? `Global coordinate grid of ${coordinates.body}: ${artifact.title} at ${coordinates.latitude} degrees latitude, ${coordinates.longitude} degrees east longitude. No terrain is represented.`
        : `${artifact.title}: simplified ${artifact.schematic} component diagram. Location context: ${artifact.coordinatesLabel}. No measured position is shown.`}</title>
      {artifact.journey ? <>
        <path d="M48 144 C110 144 112 63 240 63 S352 144 432 90" className="atlas-journey" />
        {[{ x: 48, y: 144 }, { x: 240, y: 63 }, { x: 432, y: 90 }].map((node, i) => <g key={i}>
          <circle cx={node.x} cy={node.y} r={i === 1 ? 17 : 8} />
          <circle cx={node.x} cy={node.y} r={i === 1 ? 25 : 14} opacity=".3" />
          <text x={node.x} y={node.y + (i === 0 ? -27 : 43)} textAnchor="middle">{artifact.journey![i]}</text>
        </g>)}
        <text x="240" y="188" textAnchor="middle" className="atlas-small-type">{artifact.schematic === 'telescope' ? 'Orbiting telescope receives distant starlight' : 'Historical destinations · conceptual sequence'}</text>
      </> : marker ? <>
        <g className="atlas-grid">
          <rect x="35" y="25" width="410" height="120" />
          {[60, 120, 180, 240, 300].map(lon => <path key={lon} d={`M ${35 + lon / 360 * 410} 25 V 145`} />)}
          {[30, 60, 90, 120, 150].map(lat => <path key={lat} d={`M35 ${25 + lat / 180 * 120} H445`} />)}
        </g>
        <text x="35" y="15" className="atlas-small-type">90°N</text><text x="445" y="15" textAnchor="end" className="atlas-small-type">{coordinates!.body.toUpperCase()} / GLOBAL GRID</text>
        <circle cx={marker.x} cy={marker.y} r="14" opacity=".4" /><circle cx={marker.x} cy={marker.y} r="5" className="atlas-marker" />
        <path d={`M${marker.x - 20} ${marker.y} h-10 m30 -20 v-10 m20 30 h10 m-30 20 v10`} />
        <text x="240" y="174" textAnchor="middle">{Math.abs(coordinates!.latitude)}°{coordinates!.latitude < 0 ? 'S' : 'N'} / {Math.abs(coordinates!.longitude)}°{coordinates!.longitude < 0 ? 'W' : 'E'}</text>
        <text x="240" y="192" textAnchor="middle" className="atlas-small-type">Equirectangular reference · no terrain or live telemetry</text>
      </> : <>
        <g className="atlas-grid"><circle cx="230" cy="93" r="75" /><circle cx="230" cy="93" r="58" /><path d="M230 8v25m0 120v25M140 93h30m120 0h30" /></g>
        <g className="atlas-hardware">
          {artifact.schematic === 'camera' ? <><rect x="205" y="61" width="50" height="73" rx="8" /><path d="M205 67l-13-25h76l-13 25M205 120h50M230 134v15m-25 0h50" /><circle cx="230" cy="86" r="13" /></>
            : artifact.schematic === 'helicopter' ? <><rect x="213" y="92" width="34" height="32" /><path d="M230 92V47m-59 21h118m-105 13h92m-72-36h52v-9h-52zM215 124l-22 26m51-26 22 26" /></>
            : artifact.schematic === 'laboratory' ? <><path d="M202 49h19v41l-31 52h81l-31-52V49h19M204 120h53M213 49h34" /><circle cx="229" cy="111" r="4" /><path d="M298 48v95h52m-43-29 10-25 10 12 15-36" /></>
            : artifact.schematic === 'rover' ? <><rect x="182" y="87" width="100" height="38" /><path d="M220 87V49h29v13h-29m-29 63-11 15m46-15v15m45-15 12 15" />{[180, 226, 283].map(x => <circle key={x} cx={x} cy="145" r="14" />)}</>
            : <><path d="M202 73h56l22 46h-99zM212 73V43h35v30M195 100l-35 48m102-48 37 48M231 119v32m-85 0h30m41 3h28m40-3h28" /><path d="M201 81l58 28m-58 0 58-28" /></>}
          <path d="M270 64h71l15-15M190 112h-68l-15 15" className="atlas-annotation" />
        </g>
        <text x="360" y="47" className="atlas-small-type">{artifact.schematic === 'laboratory' ? 'ANALYSIS' : 'HARDWARE'}</text>
        <text x="90" y="144" textAnchor="middle" className="atlas-small-type">{artifact.schematic === 'camera' ? 'OPTICS' : 'STRUCTURE'}</text>
        <text x="240" y="188" textAnchor="middle" className="atlas-small-type">Component study · not a measured drawing</text>
      </>}
    </svg>
    <figcaption>{artifact.coordinatesLabel}</figcaption>
  </figure>;
}
