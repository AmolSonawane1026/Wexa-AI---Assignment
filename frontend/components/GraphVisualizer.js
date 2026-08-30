'use client';
import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize2, Filter, Search } from 'lucide-react';
import NodeDetailDrawer from './NodeDetailDrawer';

const LABEL_COLORS = {
  Customer: { bg: '#0284c7', text: '#ffffff', border: '#0369a1' },     // Sky/Blue
  Account: { bg: '#2563eb', text: '#ffffff', border: '#1d4ed8' },      // Royal Blue
  Branch: { bg: '#7c3aed', text: '#ffffff', border: '#6d28d9' },       // Violet
  Card: { bg: '#d97706', text: '#ffffff', border: '#b45309' },         // Amber
  Loan: { bg: '#059669', text: '#ffffff', border: '#047857' },         // Emerald
  Merchant: { bg: '#e11d48', text: '#ffffff', border: '#be123c' },     // Rose
  Default: { bg: '#475569', text: '#ffffff', border: '#334155' },
};

export default function GraphVisualizer({ initialData, onNodeSelect, highlightPath }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredNode, setHoveredNode] = useState(null);

  const simulationRef = useRef(null);
  const transformRef = useRef(d3.zoomIdentity);

  useEffect(() => {
    if (initialData && initialData.nodes) {
      processGraphData(initialData.nodes, initialData.edges || []);
    }
  }, [initialData]);

  const processGraphData = (rawNodes, rawEdges) => {
    const nodeMap = new Map();
    const processedNodes = rawNodes.map((n) => {
      const nodeObj = {
        ...n,
        radius: n.label === 'Branch' ? 24 : n.label === 'Customer' ? 20 : 16,
        x: n.x || undefined,
        y: n.y || undefined,
      };
      nodeMap.set(n.id, nodeObj);
      return nodeObj;
    });

    const processedEdges = rawEdges
      .map((e) => {
        const sourceNode = nodeMap.get(typeof e.source === 'object' ? e.source.id : e.source);
        const targetNode = nodeMap.get(typeof e.target === 'object' ? e.target.id : e.target);
        if (!sourceNode || !targetNode) return null;
        return {
          ...e,
          source: sourceNode,
          target: targetNode,
        };
      })
      .filter(Boolean);

    setNodes(processedNodes);
    setEdges(processedEdges);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3
          .forceLink(edges)
          .id((d) => d.id)
          .distance(105)
      )
      .force('charge', d3.forceManyBody().strength(-320))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d) => d.radius + 14));

    simulationRef.current = simulation;

    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 3.5])
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        render();
      });

    d3.select(canvas).call(zoom);

    function render() {
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Light background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const transform = transformRef.current;
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Draw subtle grid pattern
      const gridSize = 40;
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;

      // Draw Edges
      edges.forEach((edge) => {
        const isFilteredOut =
          activeFilter !== 'ALL' &&
          edge.source.label !== activeFilter &&
          edge.target.label !== activeFilter;

        if (isFilteredOut) return;

        ctx.beginPath();
        ctx.moveTo(edge.source.x, edge.source.y);
        ctx.lineTo(edge.target.x, edge.target.y);
        ctx.strokeStyle =
          edge.type === 'TRANSFERRED_TO'
            ? '#93c5fd'
            : edge.type === 'REFERRED'
            ? '#c4b5fd'
            : edge.type === 'JOINT_HOLDER_WITH'
            ? '#7dd3fc'
            : '#cbd5e1';
        ctx.lineWidth = edge.type === 'TRANSFERRED_TO' ? 2 : 1.3;
        ctx.stroke();

        // Edge Arrow
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const angle = Math.atan2(dy, dx);
        const targetRadius = edge.target.radius + 3;
        const arrowX = edge.target.x - targetRadius * Math.cos(angle);
        const arrowY = edge.target.y - targetRadius * Math.sin(angle);

        ctx.save();
        ctx.translate(arrowX, arrowY);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-7, -4);
        ctx.lineTo(-7, 4);
        ctx.closePath();
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        ctx.restore();

        // Edge label
        if (transform.k >= 0.8) {
          const midX = (edge.source.x + edge.target.x) / 2;
          const midY = (edge.source.y + edge.target.y) / 2;
          ctx.font = '9px Inter, sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.textAlign = 'center';
          const label = edge.properties?.amount
            ? `$${Number(edge.properties.amount).toLocaleString()}`
            : edge.type;
          ctx.fillText(label, midX, midY - 4);
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isFilteredOut = activeFilter !== 'ALL' && node.label !== activeFilter;
        if (isFilteredOut) return;

        const isMatchingSearch =
          searchQuery &&
          node.title?.toLowerCase().includes(searchQuery.toLowerCase());

        const color = LABEL_COLORS[node.label] || LABEL_COLORS.Default;

        // Search highlight halo
        if (isMatchingSearch) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = color.bg;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color.border;
        ctx.stroke();

        // Title text
        ctx.font = '500 11px Inter, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        const displayTitle = node.title || node.id;
        const truncated =
          displayTitle.length > 15 ? `${displayTitle.substring(0, 13)}…` : displayTitle;
        ctx.fillText(truncated, node.x, node.y + node.radius + 13);

        // Label Tag
        if (transform.k >= 0.7) {
          ctx.font = '400 9px Inter, sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText(node.label, node.x, node.y + node.radius + 24);
        }
      });

      ctx.restore();
    }

    simulation.on('tick', render);

    function findNodeAt(px, py) {
      const transform = transformRef.current;
      const x = (px - transform.x) / transform.k;
      const y = (py - transform.y) / transform.k;
      return nodes.find((n) => {
        const dx = n.x - x;
        const dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
      });
    }

    let isDragging = false;
    let draggedNode = null;

    canvas.onmousedown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const node = findNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (node) {
        isDragging = true;
        draggedNode = node;
        node.fx = node.x;
        node.fy = node.y;
        simulation.alphaTarget(0.3).restart();
      }
    };

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const node = findNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      setHoveredNode(node || null);

      if (isDragging && draggedNode) {
        const transform = transformRef.current;
        draggedNode.fx = (e.clientX - rect.left - transform.x) / transform.k;
        draggedNode.fy = (e.clientY - rect.top - transform.y) / transform.k;
      }
    };

    canvas.onmouseup = () => {
      if (isDragging && draggedNode) {
        draggedNode.fx = null;
        draggedNode.fy = null;
        isDragging = false;
        draggedNode = null;
        simulation.alphaTarget(0);
      }
    };

    canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const node = findNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (node) {
        setSelectedElement({ type: 'node', data: node });
        if (onNodeSelect) onNodeSelect(node);
      }
    };

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, activeFilter, searchQuery, highlightPath]);

  const handleZoom = (scaleFactor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    d3.select(canvas).transition().duration(300).call(d3.zoom().scaleBy, scaleFactor);
  };

  const handleResetZoom = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    d3.select(canvas).transition().duration(400).call(d3.zoom().transform, d3.zoomIdentity);
  };

  const labels = ['ALL', 'Customer', 'Account', 'Branch', 'Card', 'Loan', 'Merchant'];

  return (
    <div className="relative w-full h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Top Filter & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border-b border-slate-200 z-10">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Filter:
          </span>
          {labels.map((lbl) => {
            const isSel = activeFilter === lbl;
            const color = LABEL_COLORS[lbl] || LABEL_COLORS.Default;
            return (
              <button
                key={lbl}
                onClick={() => setActiveFilter(lbl)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  isSel
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {lbl !== 'ALL' && (
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: isSel ? '#ffffff' : color.bg }}
                  />
                )}
                {lbl}
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search account, name, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full h-[600px] min-h-[500px] overflow-hidden bg-white">
        <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

        {/* Tooltip */}
        {hoveredNode && (
          <div
            className="absolute top-4 left-4 z-20 p-3 rounded-xl bg-white border border-slate-200 shadow-lg pointer-events-none text-xs space-y-1 animate-in fade-in"
          >
            <div className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: LABEL_COLORS[hoveredNode.label]?.bg || '#2563eb' }}
              />
              <span className="font-bold text-slate-900">{hoveredNode.title || hoveredNode.id}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                {hoveredNode.label}
              </span>
            </div>
            {hoveredNode.properties?.tier && (
              <p className="text-[11px] text-slate-600">
                Tier: <span className="font-semibold text-blue-600">{hoveredNode.properties.tier}</span>
              </p>
            )}
            {hoveredNode.properties?.balance !== undefined && (
              <p className="text-[11px] text-slate-600">
                Balance: <span className="font-mono text-emerald-600 font-semibold">${Number(hoveredNode.properties.balance).toLocaleString()}</span>
              </p>
            )}
            {hoveredNode.properties?.city && (
              <p className="text-[11px] text-slate-500">
                Location: {hoveredNode.properties.city}
              </p>
            )}
            <p className="text-[10px] text-slate-400">Click to view details</p>
          </div>
        )}

        {/* Floating Zoom Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col space-y-1 bg-white border border-slate-200 p-1 rounded-xl shadow-md">
          <button
            onClick={() => handleZoom(1.3)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.7)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Legend */}
        <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center space-x-3 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] text-slate-600 shadow-sm">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
            <span>Customer</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
            <span>Account</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
            <span>Branch</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span>Card</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span>Loan</span>
          </div>
        </div>
      </div>

      <NodeDetailDrawer
        element={selectedElement}
        onClose={() => setSelectedElement(null)}
      />
    </div>
  );
}
