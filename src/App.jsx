import { useEffect, useState } from "react";
import GraphViewer from "./components/GraphViewer";
import FileUpload from "./components/FileUpload";
import { GrPowerReset } from "react-icons/gr";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function App() {
  const [graph, setGraph] = useState(null);
  const [graphId, setGraphId] = useState("");
  console.log(baseUrl)
  const handleReset = () => {
    setGraph(null);
    setGraphId("");
    localStorage.removeItem("graphId");
  }
  useEffect(() => {
    const storedGraphId = localStorage.getItem("graphId");
    if (storedGraphId) {
      setGraphId(storedGraphId);
    }
    const fetchGraph = async () => {
    const res = await fetch(`${baseUrl}/api/graph/${graphId}`);
    const data = await res.json();
    setGraph(data.graph);
    };
    if (graphId) {
      fetchGraph();
    }
  }, [graphId]);
 


  return (
    <div className="min-h-screen bg-gray-100 text-white flex">
      <div className="w-1/4 h-[80vh] my-auto ml-10 mr-4 bg-gray-800 rounded-2xl p-6 border-r border-gray-700 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">API VISUALISER</h1>
          <GrPowerReset onClick={handleReset} className="text-white text-lg"/>
          </div>
        <FileUpload
          onUploadComplete={(data) => {
            setGraph(data.graph);
            setGraphId(data.savedId);
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center h-[80vh] my-auto mr-10 rounded-2xl w-full relative overflow-hidden inset-shadow">
      <img
        src="pallet.png"
        alt="bg-pallet"
        className="w-full absolute top-0 left-0 object-cover z-0 opacity-10"
      />
        {graph ? (
          <GraphViewer graph={graph} />
        ) : (
          <p className="text-gray-400 font-semibold text-lg">Upload a file or .zip to visualize</p>
        )}
      </div>
    </div>
  );
}
