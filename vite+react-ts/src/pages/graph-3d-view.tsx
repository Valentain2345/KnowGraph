import React, { useEffect, useRef } from "react";

const ForceGraph: React.FC = () => {
  const graphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load the 3d-force-graph script
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/3d-force-graph";
    script.async = true;

    script.onload = () => {
      // Ensure ForceGraph3D is available
      if (!(window as any).ForceGraph3D) {
        console.error("ForceGraph3D not loaded");
        return;
      }

      // Generate sample graph data
      const N = 300;
      const gData = {
        nodes: [...Array(N).keys()].map((i) => ({ id: i })),
        links: [...Array(N).keys()]
          .filter((id) => id)
          .map((id) => ({
            source: id,
            target: Math.floor(Math.random() * id),
          })),
      };

      // Initialize the 3D force graph
      const Graph = (window as any).ForceGraph3D()(graphRef.current)
        .graphData(gData)
        .backgroundColor("#101020")
        .nodeAutoColorBy("id")
        .linkWidth(1.5)
        .nodeLabel((node: any) => `Node ${node.id}`)
        .nodeVal(() => 4 + Math.random() * 8);

      // Handle node click
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

      // Handle window resize
      const resizeGraph = () => {
        Graph.width(window.innerWidth).height(window.innerHeight);
      };
      window.addEventListener("resize", resizeGraph);
      resizeGraph();

      // Cleanup on unmount
      return () => {
        window.removeEventListener("resize", resizeGraph);
      };
    };

    script.onerror = () => {
      console.error("Failed to load 3d-force-graph script");
    };

    document.body.appendChild(script);

    // Cleanup: Remove the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div
      id="3d-graph"
      ref={graphRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default ForceGraph;
