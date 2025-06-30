import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, Maximize, Filter, Search, Info, Brain, Network, X, Download, Share, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { Note } from '../../types';

interface KnowledgeGraphProps {
  notes: Note[];
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'note' | 'concept';
  size: number;
  color: string;
  note?: Note;
  centrality?: number;
  cluster?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  strength: number;
  type: 'content' | 'category' | 'emotion';
}

interface GraphMetrics {
  totalNodes: number;
  totalConnections: number;
  clusters: number;
  density: number;
  avgDegree: number;
  centralNodes: GraphNode[];
  isolatedNodes: GraphNode[];
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ notes }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform | null>(null);
  const [graphMetrics, setGraphMetrics] = useState<GraphMetrics | null>(null);

  useEffect(() => {
    if (!svgRef.current || notes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create nodes from notes with improved categorization
    const nodes: GraphNode[] = notes.map(note => {
      let color = '#6b7280'; // Default gray
      
      // Use the actual category from the note with better color mapping
      if (note.category) {
        switch (note.category.toLowerCase()) {
          case 'work':
            color = '#3b82f6'; // Blue
            break;
          case 'personal':
            color = '#10b981'; // Green
            break;
          case 'ideas':
            color = '#8b5cf6'; // Purple
            break;
          case 'research':
            color = '#f97316'; // Orange
            break;
          case 'learning':
            color = '#06b6d4'; // Cyan
            break;
          case 'health':
            color = '#84cc16'; // Lime
            break;
          case 'finance':
            color = '#eab308'; // Yellow
            break;
          case 'travel':
            color = '#ec4899'; // Pink
            break;
          default:
            color = '#64748b'; // Slate
        }
      }

      // Override with favorite color if it's a favorite
      if (note.is_favorite) {
        color = '#f59e0b'; // Amber for favorites
      }

      return {
        id: note.id,
        name: note.title || 'Untitled',
        type: 'note',
        size: Math.max(10, Math.min(30, (note.word_count || note.content.length / 10) / 8)),
        color,
        note,
      };
    });

    // Enhanced link creation with multiple connection types
    const links: GraphLink[] = [];
    for (let i = 0; i < notes.length; i++) {
      for (let j = i + 1; j < notes.length; j++) {
        const note1 = notes[i];
        const note2 = notes[j];
        
        // Check for shared category (stronger connection)
        const sharedCategory = note1.category && note2.category && note1.category === note2.category;
        
        // Check for shared emotion (emotional connection)
        const sharedEmotion = note1.sentiment && note2.sentiment && note1.sentiment === note2.sentiment;
        
        // Content similarity (could be enhanced with actual NLP)
        const similarity = calculateSimilarity(note1.content, note2.content);
        
        if (sharedCategory) {
          links.push({
            source: note1.id,
            target: note2.id,
            strength: 0.8,
            type: 'category',
          });
        } else if (sharedEmotion) {
          links.push({
            source: note1.id,
            target: note2.id,
            strength: 0.6,
            type: 'emotion',
          });
        } else if (similarity > 0.15) {
          links.push({
            source: note1.id,
            target: note2.id,
            strength: similarity,
            type: 'content',
          });
        }
      }
    }

    // Calculate graph metrics for evaluation
    const metrics = calculateGraphMetrics(nodes, links);
    setGraphMetrics(metrics);

    // Create force simulation with improved physics
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => (d as GraphNode).id).strength(d => (d as GraphLink).strength * 0.5))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => (d as GraphNode).size + 8))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom);

    // Create container for zoomable content
    const container = svg.append('g');

    // Draw links with different styles for different types
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => {
        switch (d.type) {
          case 'category': return '#3b82f6';
          case 'emotion': return '#ec4899';
          case 'content': return '#94a3b8';
          default: return '#94a3b8';
        }
      })
      .attr('stroke-opacity', d => d.type === 'category' ? 0.8 : d.type === 'emotion' ? 0.6 : 0.4)
      .attr('stroke-width', d => Math.sqrt(d.strength * 4))
      .attr('stroke-dasharray', d => d.type === 'emotion' ? '5,5' : 'none');

    // Draw nodes with enhanced styling
    const node = container.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded))
      .on('click', (event, d) => {
        setSelectedNode(d);
      })
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size * 1.3)
          .attr('stroke-width', 3);
        
        // Highlight connected nodes
        const connectedNodeIds = new Set();
        links.forEach(link => {
          if ((link.source as GraphNode).id === d.id) {
            connectedNodeIds.add((link.target as GraphNode).id);
          } else if ((link.target as GraphNode).id === d.id) {
            connectedNodeIds.add((link.source as GraphNode).id);
          }
        });

        node.style('opacity', n => connectedNodeIds.has(n.id) || n.id === d.id ? 1 : 0.3);
        link.style('opacity', l => 
          (l.source as GraphNode).id === d.id || (l.target as GraphNode).id === d.id ? 0.8 : 0.1
        );
        
        // Show tooltip
        tooltip
          .style('opacity', 1)
          .html(`
            <div class="font-medium">${d.name}</div>
            <div class="text-sm text-gray-600">
              ${d.note?.category || 'Uncategorized'} • ${d.note?.word_count || 0} words
            </div>
            <div class="text-xs text-gray-500 mt-1">
              ${d.note?.sentiment ? `Mood: ${d.note.sentiment}` : ''}
            </div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size)
          .attr('stroke-width', 2);
        
        // Reset opacity
        node.style('opacity', 1);
        link.style('opacity', l => l.type === 'category' ? 0.8 : l.type === 'emotion' ? 0.6 : 0.4);
        
        tooltip.style('opacity', 0);
      });

    // Add labels with improved positioning
    const label = container.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name)
      .attr('font-size', 11)
      .attr('font-family', 'Inter, sans-serif')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.size + 18)
      .attr('fill', '#374151')
      .style('pointer-events', 'none')
      .style('user-select', 'none');

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('z-index', '1000');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

      label
        .attr('x', d => d.x!)
        .attr('y', d => d.y!);
    });

    function dragStarted(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Zoom controls
    const handleZoomIn = () => {
      svg.transition().call(zoom.scaleBy, 1.5);
    };

    const handleZoomOut = () => {
      svg.transition().call(zoom.scaleBy, 1 / 1.5);
    };

    const handleZoomFit = () => {
      const bounds = container.node()!.getBBox();
      const fullWidth = width;
      const fullHeight = height;
      const widthScale = fullWidth / bounds.width;
      const heightScale = fullHeight / bounds.height;
      const scale = 0.8 * Math.min(widthScale, heightScale);
      const translate = [fullWidth / 2 - scale * (bounds.x + bounds.width / 2), fullHeight / 2 - scale * (bounds.y + bounds.height / 2)];
      
      svg.transition().duration(750).call(
        zoom.transform,
        d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      );
    };

    // Store zoom functions for button access
    (svg.node() as any).zoomIn = handleZoomIn;
    (svg.node() as any).zoomOut = handleZoomOut;
    (svg.node() as any).zoomFit = handleZoomFit;

    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [notes]);

  const calculateSimilarity = (text1: string, text2: string): number => {
    // Enhanced similarity calculation
    const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 3));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
  };

  const calculateGraphMetrics = (nodes: GraphNode[], links: GraphLink[]): GraphMetrics => {
    const totalNodes = nodes.length;
    const totalConnections = links.length;
    
    // Calculate degree for each node
    const degrees = new Map<string, number>();
    nodes.forEach(node => degrees.set(node.id, 0));
    
    links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
      const targetId = typeof link.target === 'string' ? link.target : link.target.id;
      degrees.set(sourceId, (degrees.get(sourceId) || 0) + 1);
      degrees.set(targetId, (degrees.get(targetId) || 0) + 1);
    });

    const avgDegree = Array.from(degrees.values()).reduce((sum, degree) => sum + degree, 0) / totalNodes;
    const density = totalNodes > 1 ? (2 * totalConnections) / (totalNodes * (totalNodes - 1)) : 0;
    
    // Find central nodes (high degree)
    const centralNodes = nodes
      .map(node => ({ ...node, degree: degrees.get(node.id) || 0 }))
      .sort((a, b) => b.degree - a.degree)
      .slice(0, Math.min(5, Math.ceil(totalNodes * 0.1)));

    // Find isolated nodes (no connections)
    const isolatedNodes = nodes.filter(node => (degrees.get(node.id) || 0) === 0);

    // Estimate clusters (simplified)
    const clusters = Math.max(1, Math.ceil(totalNodes / 10));

    return {
      totalNodes,
      totalConnections,
      clusters,
      density: Math.round(density * 100) / 100,
      avgDegree: Math.round(avgDegree * 100) / 100,
      centralNodes,
      isolatedNodes,
    };
  };

  const exportGraphData = () => {
    const graphData = {
      nodes: notes.map(note => ({
        id: note.id,
        title: note.title,
        category: note.category,
        sentiment: note.sentiment,
        wordCount: note.word_count,
        isFavorite: note.is_favorite,
      })),
      metrics: graphMetrics,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindvault-knowledge-graph-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get category statistics with better categorization
  const categoryStats = notes.reduce((acc, note) => {
    const category = note.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-full'} flex flex-col`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Network className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Knowledge Graph</h2>
              <p className="text-sm text-gray-600">Visualize connections between your notes</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowMetrics(!showMetrics)}
              className={showMetrics ? 'bg-green-50 text-green-600' : ''}
              title="Graph metrics for evaluation"
            >
              <Target className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowInfo(!showInfo)}
              className={showInfo ? 'bg-blue-50 text-blue-600' : ''}
              title="Toggle information panel"
            >
              <Info className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={exportGraphData}
              title="Export graph data"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 border-b border-blue-200 p-4 flex-shrink-0"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <h3 className="font-medium mb-1">Understanding the Knowledge Graph</h3>
                  <p className="mb-3">
                    This visualization shows relationships between your notes based on content similarity, shared categories, and emotional connections. 
                    Each node represents a note, and connections show how related they are.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <strong>Connection Types:</strong>
                      <ul className="mt-1 space-y-0.5">
                        <li><span className="inline-block w-3 h-1 bg-blue-600 mr-2"></span>Category connections (solid blue)</li>
                        <li><span className="inline-block w-3 h-1 bg-pink-600 mr-2" style={{borderTop: '1px dashed'}}></span>Emotional connections (dashed pink)</li>
                        <li><span className="inline-block w-3 h-1 bg-gray-400 mr-2"></span>Content similarity (gray)</li>
                      </ul>
                    </div>
                    <div>
                      <strong>How to use:</strong>
                      <ul className="mt-1 space-y-0.5">
                        <li>• Click nodes to see details</li>
                        <li>• Drag to rearrange layout</li>
                        <li>• Zoom and pan to explore</li>
                        <li>• Hover to highlight connections</li>
                        <li>• Export data for analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowInfo(false)}
                className="text-blue-600 hover:text-blue-800 ml-4 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Panel */}
      <AnimatePresence>
        {showMetrics && graphMetrics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-green-50 border-b border-green-200 p-4 flex-shrink-0"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <Target className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-green-800">
                  <h3 className="font-medium mb-2">Graph Evaluation Metrics</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <strong>Network Structure:</strong>
                      <ul className="mt-1 space-y-0.5">
                        <li>Nodes: {graphMetrics.totalNodes}</li>
                        <li>Connections: {graphMetrics.totalConnections}</li>
                        <li>Density: {graphMetrics.density}</li>
                        <li>Avg Degree: {graphMetrics.avgDegree}</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Central Nodes:</strong>
                      <ul className="mt-1 space-y-0.5">
                        {graphMetrics.centralNodes.slice(0, 3).map(node => (
                          <li key={node.id} className="truncate">
                            {node.name.substring(0, 20)}...
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Knowledge Health:</strong>
                      <ul className="mt-1 space-y-0.5">
                        <li>Isolated: {graphMetrics.isolatedNodes.length}</li>
                        <li>Connected: {graphMetrics.totalNodes - graphMetrics.isolatedNodes.length}</li>
                        <li>Connectivity: {Math.round((1 - graphMetrics.isolatedNodes.length / graphMetrics.totalNodes) * 100)}%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMetrics(false)}
                className="text-green-600 hover:text-green-800 ml-4 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graph Container */}
      <div className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full"
          style={{ background: 'radial-gradient(circle, #f8fafc 0%, #f1f5f9 100%)' }}
        />

        {/* Enhanced Controls */}
        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white shadow-sm"
            onClick={() => {
              const svg = svgRef.current;
              if (svg && (svg as any).zoomIn) {
                (svg as any).zoomIn();
              }
            }}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white shadow-sm"
            onClick={() => {
              const svg = svgRef.current;
              if (svg && (svg as any).zoomOut) {
                (svg as any).zoomOut();
              }
            }}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="bg-white shadow-sm"
            onClick={() => {
              const svg = svgRef.current;
              if (svg && (svg as any).zoomFit) {
                (svg as any).zoomFit();
              }
            }}
            title="Fit to view"
          >
            <Target className="w-4 h-4" />
          </Button>
        </div>

        {/* Enhanced Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm p-4 max-w-xs">
          <h4 className="font-medium mb-3 text-gray-900">Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Favorites ({notes.filter(n => n.is_favorite).length})</span>
            </div>
            {Object.entries(categoryStats).map(([category, count]) => {
              let color = '#64748b';
              switch (category.toLowerCase()) {
                case 'work': color = '#3b82f6'; break;
                case 'personal': color = '#10b981'; break;
                case 'ideas': color = '#8b5cf6'; break;
                case 'research': color = '#f97316'; break;
                case 'learning': color = '#06b6d4'; break;
                case 'health': color = '#84cc16'; break;
                case 'finance': color = '#eab308'; break;
                case 'travel': color = '#ec4899'; break;
              }
              return (
                <div key={category} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                  <span>{category} ({count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm p-4 text-sm">
          <h4 className="font-medium mb-2 text-gray-900">Graph Statistics</h4>
          <div className="space-y-1">
            <div><strong>Total Notes:</strong> {notes.length}</div>
            <div><strong>Categories:</strong> {Object.keys(categoryStats).length}</div>
            <div><strong>Connections:</strong> {graphMetrics?.totalConnections || 0}</div>
            <div><strong>Favorites:</strong> {notes.filter(n => n.is_favorite).length}</div>
            <div><strong>With Emotions:</strong> {notes.filter(n => n.sentiment).length}</div>
            {zoomTransform && (
              <div><strong>Zoom:</strong> {(zoomTransform.k * 100).toFixed(0)}%</div>
            )}
            {graphMetrics && (
              <div><strong>Connectivity:</strong> {Math.round((1 - graphMetrics.isolatedNodes.length / graphMetrics.totalNodes) * 100)}%</div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Selected Node Panel */}
      <AnimatePresence>
        {selectedNode && selectedNode.note && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="absolute top-0 right-0 w-80 h-full bg-white shadow-lg border-l border-gray-200 overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Note Details</h3>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedNode.note.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedNode.note.content.substring(0, 200)}
                    {selectedNode.note.content.length > 200 ? '...' : ''}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <p className="font-medium">{selectedNode.note.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Words:</span>
                    <p className="font-medium">{selectedNode.note.word_count || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="font-medium">{new Date(selectedNode.note.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Emotion:</span>
                    <p className="font-medium">
                      {selectedNode.note.sentiment ? 
                        selectedNode.note.sentiment.charAt(0).toUpperCase() + selectedNode.note.sentiment.slice(1) : 
                        'Unknown'
                      }
                    </p>
                  </div>
                </div>

                {selectedNode.note.is_favorite && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-600">⭐</span>
                      <span className="text-sm font-medium text-yellow-800">Favorite Note</span>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Network Position</h5>
                  <p className="text-sm text-gray-600">
                    This note is connected to others through <strong>{selectedNode.note.category || 'content'}</strong> relationships
                    {selectedNode.note.sentiment && (
                      <span> and shares <strong>{selectedNode.note.sentiment}</strong> emotional themes</span>
                    )}.
                  </p>
                </div>

                {graphMetrics && graphMetrics.centralNodes.some(n => n.id === selectedNode.id) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">🎯</span>
                      <span className="text-sm font-medium text-blue-800">Central Node</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      This note is highly connected and plays a key role in your knowledge network.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};