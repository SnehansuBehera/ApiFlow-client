import React, { useEffect, useState } from "react";
import GraphViewer from "./components/GraphViewer";
import FileUpload from "./components/FileUpload";

export default function App() {
  const [graph, setGraph] = useState(null);
  const [graphId, setGraphId] = useState("");

  useEffect(() => {
    const fetchGraph = async () => {
    const res = await fetch(`http://localhost:5000/api/graph/${graphId}`);
    const data = await res.json();
    setGraph(data.graph);
    };
    if (graphId) {
      fetchGraph();
    }
  }, [graphId]);
 


  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-800 p-6 border-r border-gray-700 flex flex-col">
        <h1 className="text-2xl font-bold mb-4">API EXPLORER</h1>

        {/* Load existing graph */}
        {/* <input
          type="text"
          placeholder="Enter Graph ID"
          value={graphId}
          onChange={(e) => setGraphId(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        /> */}

        {/* Upload new graph */}
        <FileUpload
          onUploadComplete={(data) => {
            setGraph(data.graph);
            setGraphId(data.savedId);
          }}
        />
        {/* <button
          onClick={fetchGraph}
          className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md"
        >
          Load Graph
        </button> */}
      </div>

      {/* Graph Area */}
      <div className="flex-1 flex items-center justify-center">
        {graph ? (
          <GraphViewer graph={graph} />
        ) : (
          <p className="text-gray-400">Enter a Graph ID or upload a file to visualize</p>
        )}
      </div>
    </div>
  );
}
