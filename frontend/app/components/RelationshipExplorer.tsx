"use client";

import { useMemo } from "react";
import type { Relationship } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Relationship Explorer (PRD §P1 & §17)
//
// Tactical data map.
// Sharp nodes, dashed connections, technical typography.
// Built with SVG.
// ─────────────────────────────────────────────────────────

type Props = {
  relationships: Relationship[];
  walletAddress: string;
};

// ── Layout constants ──
const NODE_W = 180;
const NODE_H = 64;
const VERTICAL_GAP = 120;
const HORIZONTAL_GAP = 60;
const TOP_PADDING = 60;

const TYPE_COLORS: Record<string, { bg: string; stroke: string; text: string }> = {
  approved: {
    bg: "#050608", // mangaatha-background
    stroke: "#4ade80", // mangaatha-safe
    text: "#4ade80",
  },
  interacted: {
    bg: "#050608",
    stroke: "#a3a3a3", // neutral-400
    text: "#a3a3a3",
  },
  received: {
    bg: "#050608",
    stroke: "#4ade80",
    text: "#4ade80",
  },
  deployed: {
    bg: "#050608",
    stroke: "#fbbf24", // attention
    text: "#fbbf24",
  },
};

type GraphNode = {
  id: string;
  label: string;
  address: string;
  x: number;
  y: number;
  isRoot: boolean;
};

type GraphEdge = {
  id: string;
  from: GraphNode;
  to: GraphNode;
  type: Relationship["type"];
  token?: string;
  chain: string;
};

function buildGraph(
  relationships: Relationship[],
  walletAddress: string
): { nodes: GraphNode[]; edges: GraphEdge[]; width: number; height: number } {
  const targetMap = new Map<string, { label: string; rels: Relationship[] }>();

  for (const rel of relationships) {
    const key = rel.to.toLowerCase();
    if (!targetMap.has(key)) {
      targetMap.set(key, { label: rel.toLabel, rels: [] });
    }
    targetMap.get(key)!.rels.push(rel);
  }

  const targets = Array.from(targetMap.entries());
  const childCount = targets.length;

  const totalChildWidth = childCount * NODE_W + (childCount - 1) * HORIZONTAL_GAP;
  const svgWidth = Math.max(totalChildWidth + 120, NODE_W + 120);
  const svgHeight = TOP_PADDING + NODE_H + VERTICAL_GAP + NODE_H + 100;

  const rootX = svgWidth / 2 - NODE_W / 2;
  const rootY = TOP_PADDING;

  const rootNode: GraphNode = {
    id: "root",
    label: "INVESTIGATION TARGET",
    address: walletAddress,
    x: rootX,
    y: rootY,
    isRoot: true,
  };

  const nodes: GraphNode[] = [rootNode];
  const edges: GraphEdge[] = [];

  const startX = (svgWidth - totalChildWidth) / 2;
  const childY = TOP_PADDING + NODE_H + VERTICAL_GAP;

  targets.forEach(([, target], idx) => {
    const childX = startX + idx * (NODE_W + HORIZONTAL_GAP);
    const childNode: GraphNode = {
      id: `child-${idx}`,
      label: target.label.toUpperCase(),
      address: target.rels[0].to,
      x: childX,
      y: childY,
      isRoot: false,
    };
    nodes.push(childNode);

    const seenTypes = new Set<string>();
    for (const rel of target.rels) {
      const edgeKey = `${rel.type}-${rel.token || ""}`;
      if (seenTypes.has(edgeKey)) continue;
      seenTypes.add(edgeKey);

      edges.push({
        id: `edge-${idx}-${edgeKey}`,
        from: rootNode,
        to: childNode,
        type: rel.type,
        token: rel.token,
        chain: rel.chain,
      });
    }
  });

  return { nodes, edges, width: svgWidth, height: svgHeight };
}

function GraphNodeRect({ node }: { node: GraphNode }) {
  const fill = "#050608"; // background
  const stroke = node.isRoot ? "#00f0ff" : "#333333"; // mint for root, dark border for children
  const textPrimary = node.isRoot ? "#00f0ff" : "#e5e5e5";
  
  return (
    <g className="group cursor-crosshair">
      {/* Node background */}
      <rect
        x={node.x}
        y={node.y}
        width={NODE_W}
        height={NODE_H}
        fill={fill}
        stroke={stroke}
        strokeWidth={1}
        className="transition-all duration-300 group-hover:stroke-[#00f0ff]"
      />

      {/* Label */}
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 26}
        textAnchor="middle"
        fill={textPrimary}
        fontSize={10}
        fontFamily="monospace"
        fontWeight={600}
        letterSpacing="0.1em"
      >
        {node.label.length > 20 ? node.label.slice(0, 19) + "…" : node.label}
      </text>

      {/* Address */}
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 44}
        textAnchor="middle"
        fill="#737373"
        fontSize={11}
        fontFamily="monospace"
      >
        {truncateAddress(node.address)}
      </text>
      
      {/* Corner accents */}
      <path d={`M ${node.x} ${node.y + 6} L ${node.x} ${node.y} L ${node.x + 6} ${node.y}`} fill="none" stroke={stroke} strokeWidth={2} />
      <path d={`M ${node.x + NODE_W} ${node.y + 6} L ${node.x + NODE_W} ${node.y} L ${node.x + NODE_W - 6} ${node.y}`} fill="none" stroke={stroke} strokeWidth={2} />
      <path d={`M ${node.x} ${node.y + NODE_H - 6} L ${node.x} ${node.y + NODE_H} L ${node.x + 6} ${node.y + NODE_H}`} fill="none" stroke={stroke} strokeWidth={2} />
      <path d={`M ${node.x + NODE_W} ${node.y + NODE_H - 6} L ${node.x + NODE_W} ${node.y + NODE_H} L ${node.x + NODE_W - 6} ${node.y + NODE_H}`} fill="none" stroke={stroke} strokeWidth={2} />
    </g>
  );
}

function GraphEdgeLine({ edge }: { edge: GraphEdge }) {
  const colors = TYPE_COLORS[edge.type] || TYPE_COLORS.interacted;

  const fromX = edge.from.x + NODE_W / 2;
  const fromY = edge.from.y + NODE_H;
  const toX = edge.to.x + NODE_W / 2;
  const toY = edge.to.y;

  // Sharp orthogonal routing
  const midY = (fromY + toY) / 2;
  const path = `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;

  const labelX = (fromX + toX) / 2;
  const labelY = midY - 6;
  const labelText = edge.token
    ? `${edge.type} ${edge.token}`
    : edge.type;

  return (
    <g>
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={1}
        strokeDasharray="4 4"
        opacity={0.6}
      />

      {/* Target connection point */}
      <rect
        x={toX - 2.5}
        y={toY - 5}
        width={5}
        height={5}
        fill={colors.stroke}
      />

      {/* Edge label background */}
      <rect
        x={labelX - 45}
        y={labelY - 10}
        width={90}
        height={20}
        fill="#050608"
        stroke={colors.stroke}
        strokeWidth={1}
      />

      {/* Edge label text */}
      <text
        x={labelX}
        y={labelY + 4}
        textAnchor="middle"
        fill={colors.text}
        fontSize={9}
        fontFamily="monospace"
        fontWeight={600}
        letterSpacing="0.1em"
        textTransform="uppercase"
      >
        {labelText.length > 18 ? labelText.slice(0, 17) + "…" : labelText}
      </text>
    </g>
  );
}

export default function RelationshipExplorer({
  relationships,
  walletAddress,
}: Props) {
  const graph = useMemo(
    () => buildGraph(relationships, walletAddress),
    [relationships, walletAddress]
  );

  if (relationships.length === 0) {
    return (
      <div className="w-full py-16 px-6 text-center border border-dashed border-mangaatha-border bg-mangaatha-surface-alt/50 animate-fadeIn">
        <span className="text-mangaatha-text-muted text-2xl mb-4 block">⊘</span>
        <h3 className="text-sm font-mono uppercase tracking-widest text-mangaatha-text-muted mb-2">
          NO RELATIONSHIPS
        </h3>
        <p className="text-xs text-mangaatha-text-muted/60 font-mono max-w-sm mx-auto">
          No external relationships were identified for this target.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4 px-1">
        <h3 className="text-[10px] font-mono text-mangaatha-text-muted tracking-widest uppercase">
          Tactical Data Map
          <span className="ml-2 px-1.5 py-0.5 bg-mangaatha-surface-alt text-mangaatha-text border border-mangaatha-border">
            {String(relationships.length).padStart(2, '0')}
          </span>
        </h3>

        {/* Legend */}
        <div className="flex items-center gap-3">
          {Object.entries(TYPE_COLORS).map(([type, colors]) => (
            <span
              key={type}
              className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase"
              style={{ color: colors.text }}
            >
              <span
                className="w-1.5 h-1.5 border"
                style={{ borderColor: colors.stroke }}
              />
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* SVG Graph Container */}
      <div
        className="relative bg-[#030406] border border-mangaatha-border overflow-x-auto"
      >
        <svg
          width={graph.width}
          height={graph.height}
          viewBox={`0 0 ${graph.width} ${graph.height}`}
          className="w-full min-w-[600px]"
          style={{ minHeight: graph.height }}
        >
          {/* Tactical grid background */}
          <defs>
            <pattern
              id="tactical-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#111111"
                strokeWidth="1"
              />
              <circle cx="40" cy="40" r="1" fill="#222222" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tactical-grid)" />

          {/* Edges */}
          {graph.edges.map((edge) => (
            <GraphEdgeLine key={edge.id} edge={edge} />
          ))}

          {/* Nodes */}
          {graph.nodes.map((node) => (
            <GraphNodeRect key={node.id} node={node} />
          ))}
        </svg>
      </div>
    </div>
  );
}
