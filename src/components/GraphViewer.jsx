import React, { useEffect, useRef} from "react";
import * as d3 from "d3";

export default function GraphViewer({ graph }) {
  const svgRef = useRef();
  useEffect(() => {

    if (!graph?.nodes || !graph?.edges) return;

    const width = window.innerWidth * 0.75;
    const height = window.innerHeight * 0.85;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .attr("viewBox", [0, 0, width, height])
      .call(
        d3.zoom().on("zoom", (e) => {
          g.attr("transform", e.transform);
        })
      )
      .append("g");

    // Force simulation
    const simulation = d3
      .forceSimulation(graph.nodes)
      .force(
        "link",
        d3.forceLink(graph.edges).id((d) => d.id).distance(160)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const link = g
      .selectAll("line")
      .data(graph.edges)
      .enter()
      .append("line")
      .attr("stroke", "#888")
      .attr("stroke-width", 1.5);

    // Draw node groups
    const node = g
      .selectAll("g")
      .data(graph.nodes)
      .enter()
      .append("g")
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Rectangle background
    node
      .append("rect")
      .attr("width", 160)
      .attr("height", 80)
      .attr("x", -80)
      .attr("y", -50)
      .attr("rx", 12)
      .attr("fill", "#F9F6F3")
      .style("filter", "drop-shadow(3px 5px 8px rgba(0,0,0,0.5))");

    // Wrapped text inside square using foreignObject
    node
      .append("foreignObject")
      .attr("x", -75)
      .attr("y", -45)
      .attr("width", 150)
      .attr("height", 70)
      .append("xhtml:div")
      .style("width", "150px")
      .style("height", "70px")
      .style("color", "#393E46")
      .style("font-size", "12px")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("text-align", "center")
      .style("overflow-wrap", "break-word")
      .style("word-break", "break-word")
      .html((d) => {
        let displayUrl = "";
        if (d.data.url) {
          try {
            const urlObj = new URL(d.data.url, window.location.origin);
            const parts = urlObj.pathname.split("/").filter(Boolean);
            displayUrl = "/" + (parts.pop() || "");
          } catch {
            displayUrl = d.data.url;
          }
        }

        return `
          <div style="font-weight:700;font-size:20px; margin-bottom:4px;">
            ${d.data.method || "N/A"}
          </div>
          <div>
            <a href="${d.data.url || "#"}" target="_blank" 
               style="color:#393E46; font-weight:500; font-size:14px;">
              ${displayUrl || "No URL"}
            </a>
          </div>`;
      });

    // Tooltip div
    const tooltip = d3
      .select("#tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none");

    // Show tooltip
    node.on("mouseenter", function (event, d) {
      let table = `
        <table class="table-auto text-xs text-gray-700 w-full">
          <tbody>
            <tr><td class="font-medium pr-2 text-gray-500">Method:</td><td>${d.data.method || "N/A"}</td></tr>
            <tr><td class="font-medium pr-2 text-gray-500">URL:</td>
                <td style="word-break:break-all;overflow-wrap:anywhere;">${d.data.url || "N/A"}</td></tr>
           
          </tbody>
        </table>
      `;

      tooltip
        .html(table)
        .style("left", event.pageX + 0 + "px")
        .style("top", event.pageY - 10 + "px")
        .classed("hidden", false);
    });

    node.on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 0 + "px")
        .style("top", event.pageY - 10 + "px");
    });

    node.on("mouseleave", function () {
      tooltip.classed("hidden", true);
    });

    // Tick simulation
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  }, [graph]);

  return (
    <div className="bg-gray-200 rounded-2xl w-full relative overflow-hidden inset-shadow">
      <img
        src="pallet.png"
        alt="bg-pallet"
        className="w-full h-full absolute top-0 left-0 object-cover z-0 opacity-10"
      />

      <svg ref={svgRef} className="w-full h-[80vh] relative z-10"></svg>

      <div
        id="tooltip"
        className="hidden absolute bg-white/95 backdrop-blur-md border border-gray-300 rounded-xl shadow-2xl p-4 text-sm z-50 max-w-sm"
      ></div>
    </div>
  );
}
