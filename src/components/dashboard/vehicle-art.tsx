import { useId } from "react";
import type { VehicleCategoryId } from "@/types";

type Shape = { body: string; glass: string[]; wheels: [number, number]; door: string; lamp: [number, number]; tail: [number, number] };

/** Original, generic side profiles. Front of the vehicle faces left. */
const SHAPES: Record<VehicleCategoryId, Shape> = {
  economy: {
    body: "M26 100C20 88 24 76 40 71L82 62C98 44 120 32 156 31C196 30 226 38 250 62C268 66 286 72 292 86L292 100L255 100A23 23 0 0 0 209 100L105 100A23 23 0 0 0 59 100Z",
    glass: ["M98 63C110 49 128 40 150 39L150 63Z", "M157 39C188 38 214 44 236 63L157 63Z"],
    wheels: [82, 232], door: "M153 64V98", lamp: [34, 80], tail: [287, 82],
  },
  comfort: {
    body: "M16 100C12 88 18 76 36 72L88 63C106 46 130 34 162 34C196 34 216 44 238 62L288 69C302 72 310 84 306 100L267 100A23 23 0 0 0 221 100L101 100A23 23 0 0 0 55 100Z",
    glass: ["M104 63C118 50 138 41 160 41L160 63Z", "M167 41C192 42 208 50 226 63L167 63Z"],
    wheels: [78, 244], door: "M163 64V98", lamp: [26, 82], tail: [302, 81],
  },
  premium: {
    body: "M10 100C8 89 14 78 32 74L92 65C112 49 136 38 168 38C202 38 224 48 246 65L296 71C310 74 316 86 312 100L271 100A23 23 0 0 0 225 100L99 100A23 23 0 0 0 53 100Z",
    glass: ["M108 65C122 53 144 45 166 45L166 65Z", "M173 45C198 46 216 54 234 65L173 65Z"],
    wheels: [76, 248], door: "M169 66V98", lamp: [21, 84], tail: [308, 83],
  },
  suv: {
    body: "M18 100C14 84 18 68 38 63L70 58C84 38 96 24 124 22L226 22C248 22 262 40 272 60C292 64 304 74 304 100L265 100A23 23 0 0 0 219 100L101 100A23 23 0 0 0 55 100Z",
    glass: ["M84 58C94 42 106 31 126 30L168 30L168 58Z", "M175 30L224 30C240 30 250 44 258 58L175 58Z"],
    wheels: [78, 242], door: "M171 59V98", lamp: [27, 76], tail: [299, 76],
  },
  luxury: {
    body: "M6 100C4 88 10 77 28 73L88 63C110 44 138 33 172 33C208 33 232 45 254 63L300 70C314 73 318 86 314 100L277 100A23 23 0 0 0 231 100L93 100A23 23 0 0 0 47 100Z",
    glass: ["M104 63C118 50 134 42 150 40L150 63Z", "M156 40L196 40L196 63L156 63Z", "M202 41C218 45 230 53 242 63L202 63Z"],
    wheels: [70, 254], door: "M153 64V98M199 64V98", lamp: [17, 83], tail: [310, 82],
  },
  van: {
    body: "M16 100C12 84 16 70 34 64L58 56C72 34 86 16 116 14L262 14C286 14 298 30 300 56L304 100L269 100A23 23 0 0 0 223 100L99 100A23 23 0 0 0 53 100Z",
    glass: ["M72 55C84 38 96 24 118 22L150 22L150 55Z", "M157 22L205 22L205 55L157 55Z", "M212 22L262 22C278 22 288 34 290 55L212 55Z"],
    wheels: [76, 246], door: "M153 56V98M208 56V98", lamp: [25, 76], tail: [300, 70],
  },
};

export function VehicleArt({ vehicle, tint, className }: { vehicle: VehicleCategoryId; tint: string; className?: string }) {
  const id = useId();
  const s = SHAPES[vehicle];
  return (
    <svg viewBox="0 0 320 130" aria-hidden className={className}>
      <defs>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.48" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000" stopOpacity="0.34" />
        </linearGradient>
        <radialGradient id={`${id}-floor`}>
          <stop offset="0" stopColor="#000" stopOpacity="0.42" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="160" cy="120" rx="152" ry="8" fill={`url(#${id}-floor)`} />
      <path d={s.body} fill={tint} />
      <path d={s.body} fill={`url(#${id}-shade)`} />
      {s.glass.map((d) => <path key={d} d={d} fill="#14171b" fillOpacity="0.92" />)}
      <path d={s.door} stroke="#000" strokeOpacity="0.22" strokeWidth="1.2" fill="none" />
      <ellipse cx={s.lamp[0]} cy={s.lamp[1]} rx="7" ry="3" fill="#f7ffd6" />
      <rect x={s.tail[0] - 3} y={s.tail[1] - 4} width="6" height="8" rx="2" fill="#e5484d" />
      {s.wheels.map((x) => (
        <g key={x}>
          <circle cx={x} cy="100" r="22.5" fill="#0b0c0e" />
          <circle cx={x} cy="100" r="19" fill="#17181c" />
          <circle cx={x} cy="100" r="11" fill="#c4c7cb" />
          <g className="origin-center transition-transform duration-700 ease-out transform-fill group-hover/card:rotate-180">
            {[0, 60, 120].map((a) => (
              <rect key={a} x={x - 1.2} y="89.5" width="2.4" height="21" rx="1.2" fill="#5b5f65" transform={`rotate(${a} ${x} 100)`} />
            ))}
          </g>
          <circle cx={x} cy="100" r="3" fill="#2a2c30" />
        </g>
      ))}
    </svg>
  );
}
