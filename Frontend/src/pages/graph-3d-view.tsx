import React, { useEffect, useRef } from "react";
import {  useLocation } from "react-router-dom";

interface Node {
  id: string | number;
  [key: string]: any;
}

interface Link {
  source: string | number;
  target: string | number;
  label:string | number;
  [key: string]: any;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface ForceGraphProps {
  graphData?: GraphData;
}

const ForceGraph3d: React.FC<ForceGraphProps> = ({ graphData }) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

 const effectiveGraphData: GraphData =
  graphData ||
  (location.state as { graphData?: GraphData })?.graphData || {
    nodes: [],
    links: [],
  };

  // Validate graphData
  if (!effectiveGraphData.nodes.length || !effectiveGraphData.links.length) {
    console.warn("Invalid or empty graph data, using fallback");
  }

  useEffect(() => {
    let Graph: any;

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/3d-force-graph";
    script.async = true;

    script.onload = () => {
      if (!(window as any).ForceGraph3D) {
        console.error("ForceGraph3D not loaded");
        return;
      }

      Graph = (window as any)
        .ForceGraph3D()(graphRef.current)
        .graphData(effectiveGraphData)
        .backgroundColor("white")
        .nodeAutoColorBy("id")
        .linkWidth(() =>  1.5)
        .linkAutoColorBy('source')
        .linkCurvature(0.5)
        .linkCurveRotation(3.14159*0.25)
        .linkLabel((link:any) => link.label ||`${link.source}+ "->" + ${link.target}` )
        .nodeLabel((node: any) => node.name || `${node.id}`)
        .nodeVal((node:any) => node.size)


      Graph.onNodeClick((node: any) => {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        Graph.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          },
          node,
          3000
        );

      });

      const resizeGraph = () => {
        Graph.width(window.innerWidth).height(window.innerHeight);
      };
      window.addEventListener("resize", resizeGraph);
      resizeGraph();

      return () => {
        window.removeEventListener("resize", resizeGraph);
      };
    };

    script.onerror = () => {
      console.error("Failed to load 3d-force-graph script");
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [effectiveGraphData]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background:"white",
      }}
    >
      {/* Graph container */}
      <div
        id="3d-graph"
        ref={graphRef}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          background:"white",
        }}
      />


    </div>
  );
};

export default ForceGraph3d;
