import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface Node {
  id: string | number;
  size?: number;
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

interface ForceGraph2DProps {
  graphData?: GraphData;
}

const ForceGraph2d: React.FC<ForceGraph2DProps> = ({ graphData }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const effectiveGraphData =
    graphData ||
    (location.state as { graphData?: GraphData })?.graphData;

  // If no valid data, fallback to auto-generated example
  const defaultGraphData: GraphData = {
    nodes: Array.from({ length: 300 }, (_, i) => ({
      id: i,
      size: 4 + Math.random() * 8,
    })),
    links: Array.from({ length: 299 }, (_, i) => ({
      source: i + 1,
      target: Math.floor(Math.random() * (i + 1)),
    })),
  };

  const dataToUse = effectiveGraphData || defaultGraphData;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Construct the HTML page inside the iframe
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>2D Force Graph</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      width: 100%;
      height: 100%;
      background-color: black;
    }
    #2d-graph {
      width: 100vw;
      height: 100vh;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/force-graph"></script>
</head>
<body>
  <div id="2d-graph"></div>
  <script>
    const gData = ${JSON.stringify(dataToUse)};
    const Graph = ForceGraph()(document.getElementById('2d-graph'))
      .graphData(gData)
      .nodeAutoColorBy('id')
      .nodeLabel(node => 'Node ' + node.id)
      .nodeVal(node => node.size)
      .linkWidth(1.5)
      .linkAutoColorBy('source')
      .width(window.innerWidth)
      .height(window.innerHeight);

    Graph.onNodeClick(node => {
      Graph.centerAt(node.x, node.y, 1000);
      Graph.zoom(4, 1000);
      console.log('Clicked on node ' + node.id);
    });

    function resizeGraph() {
      Graph.width(window.innerWidth).height(window.innerHeight);
    }
    window.addEventListener('resize', resizeGraph);
  </script>
</body>
</html>`;

    // Write the HTML into the iframe
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  }, [dataToUse]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Iframe that runs the 2D Force Graph */}
      <iframe
        ref={iframeRef}
        title="2D Force Graph"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* Back Button */}
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

export default ForceGraph2d;
