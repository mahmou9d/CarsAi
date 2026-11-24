"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────
export const pct = (num, den, digits = 1) => {
  if (!den) return "0";
  return ((num / den) * 100).toFixed(digits);
};

// ─── Animated counter hook ──────────────────────────────────────────────────
export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (!target) {
      setValue(0);
      return;
    }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(p * target));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else setValue(target);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}

// ─── SVG Donut Ring ─────────────────────────────────────────────────────────
export function DonutRing({
  value,
  total,
  color = "#E4141B",
  size = 72,
  strokeWidth = 7,
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const ratio = total ? Math.min(value / total, 1) : 0;
  const dash = circ * ratio;
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

// ─── Stat KPI card with animated number ─────────────────────────────────────
export function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  ring,
  ringColor,
  ringTotal,
}) {
  const count = useCountUp(value);
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 group">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
              {title}
            </p>
            <div className="text-3xl font-extrabold text-slate-900 leading-tight">
              {count}
            </div>
            {sub && (
              <p className="text-xs text-slate-500 mt-1 leading-snug">{sub}</p>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 ml-3">
            {ring !== undefined ? (
              <div className="relative flex items-center justify-center">
                <DonutRing
                  value={ring}
                  total={ringTotal}
                  color={ringColor}
                  size={56}
                  strokeWidth={6}
                />
                <div
                  className={`absolute p-1.5 rounded-lg ${iconBg} ${iconColor}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
            ) : (
              <div
                className={`p-2.5 rounded-xl ${iconBg} ${iconColor} group-hover:scale-110 transition-transform`}
              >
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Status progress bar ─────────────────────────────────────────────────────
export function StatusBar({ label, value, total, colorClass, badge }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs sm:text-sm font-medium">
        <span className="text-slate-700 flex items-center gap-2">
          {label}
          {badge && (
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 h-4 ${badge}`}
            >
              {value}
            </Badge>
          )}
        </span>
        <span className="text-slate-500 font-semibold">
          {pct(value, total)}%
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`${colorClass} h-2 rounded-full transition-all duration-700`}
          style={{ width: `${total ? (value / total) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}

// ─── Quick action button ─────────────────────────────────────────────────────
export function QuickAction({ href, icon: Icon, label, desc, color }) {
  const bgStyles = {
    red: "hover:border-red-200 hover:bg-red-50/50 bg-red-100 text-red-700",
    blue: "hover:border-blue-200 hover:bg-blue-50/50 bg-blue-100 text-blue-700",
    amber:
      "hover:border-amber-200 hover:bg-amber-50/50 bg-amber-100 text-amber-700",
    slate:
      "hover:border-slate-300 hover:bg-slate-50/80 bg-slate-100 text-slate-700",
  };
  return (
    <Link href={href}>
      <div className="group flex items-center gap-3 p-3 rounded-xl border border-slate-200 transition-all duration-150 hover:bg-slate-50/70 cursor-pointer">
        <div
          className={`p-2 rounded-lg ${bgStyles[color] || bgStyles.slate} group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-800">{label}</div>
          <div className="text-xs text-slate-500 truncate">{desc}</div>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </Link>
  );
}

// ─── Health score gauge ───────────────────────────────────────────────────────
export function HealthScore({ cars, testDrives, inquiries }) {
  const availPct = cars.total ? (cars.available / cars.total) * 100 : 0;
  const completePct = testDrives.total
    ? (testDrives.completed / testDrives.total) * 100
    : 0;
  const resolvedPct = inquiries.total
    ? (inquiries.resolved / inquiries.total) * 100
    : 0;
  const score = Math.round(
    availPct * 0.4 + completePct * 0.35 + resolvedPct * 0.25,
  );
  const color =
    score >= 70
      ? "text-emerald-600"
      : score >= 40
        ? "text-amber-600"
        : "text-red-600";
  const bgColor = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label =
    score >= 70 ? "Great" : score >= 40 ? "Fair" : "Needs Attention";
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-4">
      <div className="relative flex items-center justify-center">
        <DonutRing
          value={score}
          total={100}
          color={bgColor}
          size={96}
          strokeWidth={9}
        />
        <div className="absolute flex flex-col items-center">
          <span className={`text-2xl font-black ${color}`}>{score}</span>
          <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>
      <div>
        <div className={`text-sm font-bold text-center ${color}`}>{label}</div>
        <div className="text-xs text-slate-400 text-center">
          Dealership health score
        </div>
      </div>
    </div>
  );
}

