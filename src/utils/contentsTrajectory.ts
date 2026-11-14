/** Both SVG nodes and HTML rows use the same relative coordinates.
 * Equal-height rows put their centres at (i + .5) / N, at every viewport width.
 */
export function createContentsTrajectory(count: number) {
  const nodes = Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => ({
    x: i % 2 === 0 ? 44 : 92,
    y: ((i + 0.5) / count) * 560,
  }));
  const segments = nodes.slice(1).map((node, i) => {
    const previous = nodes[i];
    const midY = (previous.y + node.y) / 2;
    return `C ${previous.x} ${midY}, ${node.x} ${midY}, ${node.x} ${node.y}`;
  });
  return { nodes, path: nodes.length ? `M ${nodes[0].x} ${nodes[0].y} ${segments.join(" ")}` : "" };
}
