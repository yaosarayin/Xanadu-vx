import React from "react";
import { Group } from "@vx/group";
//import genBins, { Bin, Bins } from "@vx/mock-data/lib/generators/genBins";
import { scaleLinear, scaleSqrt } from "@vx/scale";
import { HeatmapRect } from "@vx/heatmap";

const rawData = require("./heatmap.json"); //genBins(/* length = */ 7, /* height = */ 5);
const binData = rawData["January"];

console.log(Object.keys(rawData));

const cool1 = "#000000";
const cool2 = "#b59a64";
export const background = "#333"; //"#28272c";

function max<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.max(...data.map(value));
}

function min<Datum>(data: Datum[], value: (d: Datum) => number): number {
  return Math.min(...data.map(value));
}

function marginOffset(month): number {
  return Object.keys(rawData).indexOf(month) * 60;
}

// accessors
const bins = d => d.bins;
const count = d => d.count;
const colorMax = max(binData, d => max(bins(d), count));
const bucketSizeMax = max(binData, d => bins(d).length);

// scales
const xScale = scaleLinear<number>({
  domain: [0, binData.length]
});
const yScale = scaleLinear<number>({
  domain: [0, bucketSizeMax]
});

const rectColorScale = scaleSqrt<string>({
  range: [cool1, cool2],
  domain: [0, colorMax]
});
const opacityScale = scaleSqrt<number>({
  range: [0.5, 1],
  domain: [0, colorMax]
});

export type HeatmapProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  separation?: number;
  events?: boolean;
};

const defaultMargin = { top: 200, left: 0, right: 20, bottom: 200 };

export default ({
  width,
  height,
  events = false,
  margin = defaultMargin,
  separation = 10
}: HeatmapProps) => {
  // bounds
  const size =
    width > margin.left + margin.right
      ? width - margin.left - margin.right - separation
      : width;
  const xMax = size / 24;
  const yMax = height - margin.bottom - margin.top;

  const binWidth = xMax / binData.length;
  const binHeight = yMax / bucketSizeMax;

  xScale.range([0, xMax]);
  yScale.range([0, yMax]);

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={14}
        fill={background}
      />
      {Object.keys(rawData).map(key => (
        <Group
          top={margin.top}
          left={xMax + margin.left + separation + marginOffset(key)}
        >
          <HeatmapRect
            data={rawData[key]}
            xScale={xScale}
            yScale={yScale}
            colorScale={rectColorScale}
            opacityScale={opacityScale}
            binWidth={binHeight}
            binHeight={binHeight}
            gap={2}
          >
            {heatmap =>
              heatmap.map(heatmapBins =>
                heatmapBins.map(bin => (
                  <rect
                    key={`heatmap-rect-${bin.row}-${bin.column}`}
                    className="vx-heatmap-rect"
                    width={bin.width}
                    height={bin.height}
                    x={bin.x}
                    y={bin.y}
                    fill={bin.color}
                    fillOpacity={bin.opacity}
                    onClick={() => {
                      if (!events) return;
                      const { row, column } = bin;
                      alert(JSON.stringify({ row, column, bin: bin.bin }));
                    }}
                  />
                ))
              )
            }
          </HeatmapRect>
        </Group>
      ))}
    </svg>
  );
};
