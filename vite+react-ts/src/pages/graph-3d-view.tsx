import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface Node {
  id: string | number;
  [key: string]: any;
}

interface Link {
  source: string | number;
  target: string | number;
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
  const navigate = useNavigate();
  const location = useLocation();

  // Use graphData from props if provided, else from location.state, else default
  const effectiveGraphData =
    graphData ||
    (location.state as { graphData?: GraphData })?.graphData ;

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
        .backgroundColor("#101020")
        .nodeAutoColorBy("group")
        .linkWidth((link: any) => link.value * 0.5)
        .nodeLabel((node: any) => node.name || `Node ${node.id}`)
        .nodeVal(() => 4 + Math.random() * 8);

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
        console.log(`Clicked on node ${node.id}`);
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
        }}
      />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          backgroundColor: "#1f1f3a",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: "500",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          transition: "background 0.3s ease, transform 0.1s ease",
        }}
        onMouseOver={(e) =>
          (e.currentTarget.style.backgroundColor = "#29295a")
        }
        onMouseOut={(e) =>
          (e.currentTarget.style.backgroundColor = "#1f1f3a")
        }
        onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.96)")}
        onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ⬅ Back Home
      </button>
    </div>
  );
};

export default ForceGraph3d;
