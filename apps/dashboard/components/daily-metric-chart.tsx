"use client";

import { useId, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";

export type MetricChartPoint = { date: string; value: number };

type DailyMetricChartProps = {
  title: string;
  description: string;
  points: MetricChartPoint[];
  singular: string;
  plural: string;
};

const WIDTH = 720;
const HEIGHT = 250;
const LEFT = 36;
const RIGHT = 704;
const TOP = 24;
const BOTTOM = 210;

function dateLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function DailyMetricChart({ title, description, points, singular, plural }: DailyMetricChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const activeIndex = hovered ?? selected;
  const maximum = Math.max(1, ...points.map((point) => point.value));
  const xAt = (index: number) => LEFT + (index / Math.max(points.length - 1, 1)) * (RIGHT - LEFT);
  const yAt = (value: number) => BOTTOM - (value / maximum) * (BOTTOM - TOP);
  const coordinates = points.map((point, index) => ({ x: xAt(index), y: yAt(point.value) }));
  const linePath = coordinates.map(({ x, y }, index) => `${index ? "L" : "M"}${x},${y}`).join(" ");
  const firstCoordinate = coordinates[0];
  const lastCoordinate = coordinates.at(-1);
  const areaPath = firstCoordinate && lastCoordinate ? `${linePath} L${lastCoordinate.x},${BOTTOM} L${firstCoordinate.x},${BOTTOM} Z` : "";
  const ticks = Array.from(new Set([maximum, Math.ceil(maximum / 2), 0]));
  const active = activeIndex === null ? null : points[activeIndex];
  const activeCoordinate = activeIndex === null ? null : coordinates[activeIndex];

  function indexFromClientX(clientX: number, element: SVGSVGElement) {
    const rect = element.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * WIDTH;
    return Math.max(0, Math.min(points.length - 1, Math.round(((svgX - LEFT) / (RIGHT - LEFT)) * (points.length - 1))));
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (points.length) setHovered(indexFromClientX(event.clientX, event.currentTarget));
  }

  function handleClick(event: MouseEvent<SVGSVGElement>) {
    if (points.length) setSelected(indexFromClientX(event.clientX, event.currentTarget));
  }

  function handleKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (!points.length) return;
    const current = selected ?? points.length - 1;
    let next = current;
    if (event.key === "ArrowLeft") next = Math.max(0, current - 1);
    else if (event.key === "ArrowRight") next = Math.min(points.length - 1, current + 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = points.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
  }

  return (
    <article className="status-chart-card">
      <div className="status-chart-heading">
        <div><h2>{title}</h2><p>{description}</p></div>
        <span className="status-chart-legend"><i aria-hidden="true" /> Daily</span>
      </div>
      <svg
        className="status-chart-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${title}. Move across the chart, tap, or use the arrow keys to inspect each date.`}
        tabIndex={0}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHovered(null)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setSelected((current) => current ?? points.length - 1)}
      >
        <title>{title}: daily values for the last 30 days</title>
        <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".24" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
        {ticks.map((tick) => {
          const y = yAt(tick);
          return <g key={tick}><line className="status-chart-grid" x1={LEFT} x2={RIGHT} y1={y} y2={y} /><text className="status-chart-axis" x={LEFT - 9} y={y + 4} textAnchor="end">{tick}</text></g>;
        })}
        {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
        {linePath ? <path className="status-chart-line" d={linePath} /> : null}
        {coordinates.map(({ x, y }, index) => <circle key={points[index]?.date ?? index} className="status-chart-dot" cx={x} cy={y} r={activeIndex === index ? 5 : 2.5} />)}
        {points.length ? [0, Math.floor((points.length - 1) / 2), points.length - 1].map((index) => {
          const point = points[index];
          return point ? <text key={point.date} className="status-chart-axis" x={xAt(index)} y={238} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}>{dateLabel(point.date)}</text> : null;
        }) : null}
        {active && activeCoordinate ? <g className="status-chart-tooltip" aria-hidden="true">
          <line x1={activeCoordinate.x} x2={activeCoordinate.x} y1={TOP} y2={BOTTOM} />
          <rect x={Math.max(LEFT, Math.min(RIGHT - 150, activeCoordinate.x - 75))} y={Math.max(3, activeCoordinate.y - 66)} width="150" height="52" rx="7" />
          <text x={Math.max(LEFT, Math.min(RIGHT - 150, activeCoordinate.x - 75)) + 12} y={Math.max(3, activeCoordinate.y - 66) + 20}>{dateLabel(active.date)}</text>
          <text className="status-chart-tooltip-value" x={Math.max(LEFT, Math.min(RIGHT - 150, activeCoordinate.x - 75)) + 12} y={Math.max(3, activeCoordinate.y - 66) + 39}>{active.value} {active.value === 1 ? singular : plural}</text>
        </g> : null}
      </svg>
      <output className="sr-only" aria-live="polite">{active ? `${dateLabel(active.date)}: ${active.value} ${active.value === 1 ? singular : plural}` : ""}</output>
    </article>
  );
}
