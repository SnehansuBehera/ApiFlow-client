import React, { useEffect, useRef } from "react";
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
      .attr("height", 100)
      .attr("x", -80) // center rect at (x,y)
      .attr("y", -50)
      .attr("rx", 12)
      .attr("fill", "#1e3a8a") // Tailwind blue-900
      .attr("stroke", "#60a5fa") // Tailwind blue-400
      .attr("stroke-width", 2)
      .attr("class", "shadow-lg");

    // Wrapped text inside square using foreignObject
    node
      .append("foreignObject")
      .attr("x", -75)
      .attr("y", -45)
      .attr("width", 150)
      .attr("height", 90)
      .append("xhtml:div")
      .style("width", "150px")
      .style("height", "90px")
      .style("color", "#f9fafb") // text color (gray-50)
      .style("font-size", "12px")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("text-align", "center")
      .style("overflow-wrap", "break-word")
      .style("word-break", "break-word")
      .html(
        (d) =>
          `<div style="font-weight:600; margin-bottom:4px;">${d.snippet || d.label || d.id}</div>
           <div><a href="${d.url || "#"}" target="_blank" style="color:#93c5fd; text-decoration:underline; font-size:11px;">
             ${d.url ? d.url.replace(/^https?:\/\//, "").slice(0, 22) + "…" : ""}
           </a></div>`
      );

    // Tooltip fallback
    node.append("title").text((d) => d.label || d.id);

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
    <div className="bg-gray-900 p-4 rounded-2xl shadow-lg">
      <svg ref={svgRef} className="w-full h-[80vh]"></svg>
    </div>
  );
}
