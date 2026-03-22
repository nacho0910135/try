"use client";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function MiniLineChart({
  series = [],
  height = 120,
  stroke = "#0b8a6a",
  fill = "rgba(11, 138, 106, 0.12)",
  emptyLabel = "No data"
}) {
  const width = 280;
  const points = series
    .map((item, index) => ({
      x: index,
      y: Number(item?.averagePpsm ?? item?.value ?? 0)
    }))
    .filter((item) => Number.isFinite(item.y));

  if (points.length < 2) {
    return (
      <div className="flex h-[120px] items-center justify-center rounded-[22px] bg-mist text-sm text-ink/55">
        {emptyLabel}
      </div>
    );
  }

  const minY = Math.min(...points.map((item) => item.y));
  const maxY = Math.max(...points.map((item) => item.y));
  const rangeY = Math.max(maxY - minY, 1);
  const stepX = width / Math.max(points.length - 1, 1);

  const polyline = points
    .map((point, index) => {
      const x = index * stepX;
      const y = height - ((point.y - minY) / rangeY) * (height - 18) - 9;
      return `${x},${clamp(y, 8, height - 8)}`;
    })
    .join(" ");

  const areaPath = `M 0 ${height} L ${polyline} L ${width} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[120px] w-full overflow-visible rounded-[22px] bg-white"
      aria-hidden="true"
    >
      <path d={areaPath} fill={fill} />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={polyline}
      />
      {points.map((point, index) => {
        const x = index * stepX;
        const y = height - ((point.y - minY) / rangeY) * (height - 18) - 9;
        return <circle key={index} cx={x} cy={clamp(y, 8, height - 8)} r="4.5" fill={stroke} />;
      })}
    </svg>
  );
}

export function VerticalBarChart({
  items = [],
  color = "#0f4ea9",
  valueFormatter = (value) => value
}) {
  const maxValue = Math.max(...items.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-[22px] border border-ink/10 bg-white p-4">
          <div className="flex h-36 items-end justify-center rounded-[18px] bg-mist px-3 py-4">
            <div
              className="w-full rounded-t-[16px] transition-all"
              style={{
                height: `${Math.max(12, (Number(item.value || 0) / maxValue) * 100)}%`,
                background: color
              }}
            />
          </div>
          <div className="mt-3 text-center text-sm font-semibold text-ink">{item.label}</div>
          <div className="mt-1 text-center text-lg font-semibold text-ink/75">
            {valueFormatter(item.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HorizontalBarList({
  items = [],
  color = "#2c6847",
  valueFormatter = (value) => value,
  subtitleKey = "subtitle"
}) {
  const maxValue = Math.max(...items.map((item) => Number(item.value || 0)), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-[22px] border border-ink/10 bg-white p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <div className="font-semibold text-ink">{item.label}</div>
              {item[subtitleKey] ? (
                <div className="mt-1 text-xs text-ink/55">{item[subtitleKey]}</div>
              ) : null}
            </div>
            <div className="font-semibold text-ink/80">{valueFormatter(item.value)}</div>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max(8, (Number(item.value || 0) / maxValue) * 100)}%`,
                background: color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
