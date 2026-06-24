"use client";
import axios from "axios";
import { BarChart2, Star, TrendingDown, TrendingUp, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

type Earning = {
  date: string;
  earnings: number;
};

function PartnerEarning() {
  const [earning, setEarning] = useState<Earning[]>([]);
  useEffect(() => {
    const fetchEarning = async () => {
      try {
        const { data } = await axios.get("/api/partner/earning");
        const last7DayData: Earning[] = data.earning.slice(-7);
        setEarning(last7DayData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchEarning();
  }, []);

  const total = earning.reduce((acc, cur) => acc + cur.earnings, 0);
  const avg = earning.length ? Math.round(total / earning.length) : 0;
  const max = earning.length
    ? Math.max(...earning.map((item) => item.earnings))
    : 0;
  const bestDay = earning.find((item) => item.earnings === max);
  const today = earning[earning.length - 1];
  const yesterday = earning[earning.length - 2];
  const delta = today && yesterday ? today.earnings - yesterday.earnings : 0;
  const deltaPositive = delta >= 0;
  const deltaPct = yesterday
    ? Math.abs(Math.round((delta / yesterday.earnings) * 100))
    : 0;

  const fmt = (earnings: number) => {
    return (
      <>
        <span className="underline">đ</span>
        <span className="font-semibold">
          {earnings.toLocaleString("vi-VN")}
        </span>
      </>
    );
  };
  const metrics = [
    {
      label: "Best Day",
      value: fmt(max),
      sub: bestDay?.date ?? "-",
      icon: <Star size={14} />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Daily Avg",
      value: fmt(avg),
      sub: "per day",
      icon: <BarChart2 size={14} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Today",
      value: today ? fmt(today.earnings) : "-",
      sub:
        today && yesterday
          ? `${deltaPositive ? "+" : "-"}${deltaPct}% vs yesterday`
          : "-",
      icon: <Zap size={14} />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 w-full">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2">
            Partner Dashboard
          </span>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Daily Earning
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Last 7 days performance
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Weekly total
          </p>
          <motion.div
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 font-mono tracking-tight"
          >
            {fmt(total)}
          </motion.div>

          <div
            className={`flex items-center justify-end gap-1 text-xs font-semibold mt-1 ${deltaPositive ? "text-emerald-600" : "text-rose-500"}`}
          >
            {deltaPositive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            <span>{deltaPct}% vs yesterday</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
            className="bg-gray-50 rounded-3xl p-4"
          >
            <div
              className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2 ${metric.color}`}
            >
              <span className={`${metric.bg} p-1 rounded-lg ${metric.color}`}>
                {metric.icon}
              </span>
              {metric.label}
            </div>
            <p className="text-lg font-bold text-gray-900 font-mono leading-none">
              {metric.value}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">{metric.sub}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scaleY: 0.92 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="h-56"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={earning} barCategoryGap={"30%"}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 500, fill: "#9CA3AF" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickFormatter={(v) =>
                  "đ" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)
                }
              />
              <Bar
                dataKey="earnings"
                radius={[8, 8, 3, 3]}
              >
                {earning.map((e, i) => {
                  const isToday = i === earning.length - 1;
                  const isBest = e.earnings === max && !isToday;
                  return (
                    <Cell 
                      key={`cell-${i}`}
                      fill={isToday ? "#10b981" : isBest ? "#8b5cf6" : "#bfdbfe"}
                    />
                  )
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default PartnerEarning;
