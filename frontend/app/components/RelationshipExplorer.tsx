"use client";

import { useMemo } from "react";
import type { Relationship } from "@/types/analysis";
import { truncateAddress } from "@/lib/api";

// ─────────────────────────────────────────────────────────
// Relationship Explorer (PRD §P1)
//
// 2D tree-style relationship graph built with SVG.
// Acts as the container for future 3D integration (Member 3).
//
// Interface: <RelationshipExplorer relationships={data} />
// Member 3 can later replace the internals with Three.js.
// ─────────────────────────────────────────────────────────

type Props = {
  relationships: Relationship[];
  walletAddress: string;
};

// ── Layout constants ──
const NODE_W = 160;
const NODE_H = 56;
const VERTICAL_GAP = 100;
const HORIZONTAL_GAP = 40;
const TOP_PADDING = 40;

const TYPE_COLORS: Record<string, { bg: string; stroke: string; text: string; badge: string }> = {
  approved: {
    bg: "#1e3a5f",
    stroke: "#3b82f6",
    text: "#93c5fd",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  interacted: {
    bg: "#1e3a4a",
    stroke: "#06b6d4",
    text: "#67e8f9",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  received: {
    bg: "#1a3a2a",
    stroke: "#10b981",
    text: "#6ee7b7",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  deployed: {
    bg: "#2d1f4e",
    stroke: "#8b5cf6",
    text: "#c4b5fd",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/30",
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
  // Deduplicate targets
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

  // Calculate SVG dimensions
  const totalChildWidth = childCount * NODE_W + (childCount - 1) * HORIZONTAL_GAP;
  const svgWidth = Math.max(totalChildWidth + 80, NODE_W + 80);
  const svgHeight = TOP_PADDING + NODE_H + VERTICAL_GAP + NODE_H + 60;

  // Root node (centered)
  const rootX = svgWidth / 2 - NODE_W / 2;
  const rootY = TOP_PADDING;

  const rootNode: GraphNode = {
    id: "root",
    label: "Your Wallet",
    address: walletAddress,
    x: rootX,
    y: rootY,
    isRoot: true,
  };

  const nodes: GraphNode[] = [rootNode];
  const edges: GraphEdge[] = [];

  // Child nodes
  const startX = (svgWidth - totalChildWidth) / 2;
  const childY = TOP_PADDING + NODE_H + VERTICAL_GAP;

  targets.forEach(([, target], idx) => {
    const childX = startX + idx * (NODE_W + HORIZONTAL_GAP);
    const childNode: GraphNode = {
      id: `child-${idx}`,
      label: target.label,
      address: target.rels[0].to,
      x: childX,
      y: childY,
      isRoot: false,
    };
    nodes.push(childNode);

    // One edge per unique relationship type to this target
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
  const fill = node.isRoot ? "#0f2847" : "#171717";
  const stroke = node.isRoot ? "#3b82f6" : "#404040";

  return (
    <g>
      {/* Node background */}
      <rect
        x={node.x}
        y={node.y}
        width={NODE_W}
        height={NODE_H}
        rx={12}
        ry={12}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />

      {/* Glow for root */}
      {node.isRoot && (
        <rect
          x={node.x - 2}
          y={node.y - 2}
          width={NODE_W + 4}
          height={NODE_H + 4}
          rx={14}
          ry={14}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={0.5}
          opacity={0.3}
        />
      )}

      {/* Label */}
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 22}
        textAnchor="middle"
        fill={node.isRoot ? "#93c5fd" : "#e5e5e5"}
        fontSize={12}
        fontWeight={600}
      >
        {node.label.length > 18 ? node.label.slice(0, 17) + "…" : node.label}
      </text>

      {/* Address */}
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 40}
        textAnchor="middle"
        fill="#737373"
        fontSize={10}
        fontFamily="monospace"
      >
        {truncateAddress(node.address)}
      </text>
    </g>
  );
}

function GraphEdgeLine({ edge }: { edge: GraphEdge }) {
  const colors = TYPE_COLORS[edge.type] || TYPE_COLORS.interacted;

  const fromX = edge.from.x + NODE_W / 2;
  const fromY = edge.from.y + NODE_H;
  const toX = edge.to.x + NODE_W / 2;
  const toY = edge.to.y;

  // Bezier curve
  const midY = (fromY + toY) / 2;
  const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

  // Edge label position
  const labelX = (fromX + toX) / 2;
  const labelY = midY - 4;
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
        strokeWidth={1.5}
        strokeDasharray={edge.type === "interacted" ? "6 3" : "none"}
        opacity={0.6}
      />

      {/* Arrow head */}
      <circle
        cx={toX}
        cy={toY - 2}
        r={3}
        fill={colors.stroke}
        opacity={0.8}
      />

      {/* Edge label background */}
      <rect
        x={labelX - 40}
        y={labelY - 9}
        width={80}
        height={18}
        rx={6}
        fill="#0a0a0a"
        stroke={colors.stroke}
        strokeWidth={0.8}
        opacity={0.9}
      />

      {/* Edge label text */}
      <text
        x={labelX}
        y={labelY + 3}
        textAnchor="middle"
        fill={colors.text}
        fontSize={9}
        fontWeight={500}
      >
        {labelText.length > 16 ? labelText.slice(0, 15) + "…" : labelText}
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
      <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/40 py-14 px-6 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-1">
          No relationships found
        </h3>
        <p className="text-neutral-500 text-sm max-w-sm mx-auto">
          No relevant relationships were identified from the data available for
          this analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <svg
            className="w-4 h-4 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Relationship Explorer
          <span className="text-neutral-500 font-normal">
            ({relationships.length})
          </span>
        </h3>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3">
          {Object.entries(TYPE_COLORS).map(([type, colors]) => (
            <span
              key={type}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium border ${colors.badge}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: colors.stroke }}
              />
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* SVG Graph Container — future 3D integration point */}
      <div
        className="rounded-2xl bg-neutral-900/60 border border-neutral-800/60 backdrop-blur-sm overflow-x-auto"
        id="relationship-explorer-container"
        data-integration="3d-ready"
      >
        <svg
          width={graph.width}
          height={graph.height}
          viewBox={`0 0 ${graph.width} ${graph.height}`}
          className="w-full min-w-[500px]"
          style={{ minHeight: graph.height }}
        >
          {/* Grid pattern background */}
          <defs>
            <pattern
              id="grid"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="#262626"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.4" />

          {/* Edges */}
          {graph.edges.map((edge) => (
            <GraphEdgeLine key={edge.id} edge={edge} />
          ))}

          {/* Nodes */}
          {graph.nodes.map((node) => (
            <GraphNodeRect key={node.id} node={node} />
          ))}
        </svg>

        {/* 3D integration hint */}
        <div className="px-4 py-2.5 border-t border-neutral-800/40 flex items-center justify-center gap-2 text-neutral-600 text-[10px]">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
            />
          </svg>
          2D view • 3D visualization coming soon
        </div>
      </div>
    </div>
  );
}
