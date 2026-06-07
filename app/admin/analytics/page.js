/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getInquiries } from '@/lib/inquiries';
import { AdminShell } from '@/components/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Award,
  Flame,
  TrendingUp,
  Package,
  RefreshCw,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// Returns a Tailwind-friendly background color based on rank.
// Darker → hotter (most popular category).
const HEAT_COLORS = [
  'bg-rose-600',
  'bg-rose-500',
  'bg-amber-500',
  'bg-amber-400',
  'bg-amber-300',
  'bg-slate-300',
];
const heatColor = (rank) => HEAT_COLORS[Math.min(rank, HEAT_COLORS.length - 1)];

// ─────────────────────────────────────────────────────────────
// Analytics content
// ─────────────────────────────────────────────────────────────
const AnalyticsContent = () => {
  const [inquiries, setInquiries] = useState([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setInquiries(getInquiries());
  }, [tick]);

  const stats = useMemo(() => {
    // 1. Total value of pending deliveries — New Request only
    const pendingValue = inquiries
      .filter((i) => i.status === 'New Request')
      .reduce((s, i) => s + Number(i.productPrice || 0), 0);
    const pendingCount = inquiries.filter((i) => i.status === 'New Request').length;

    // 2. Most clicked bag — group by productName
    const productCounts = {};
    const productMeta = {};
    for (const i of inquiries) {
      const key = i.productName || 'Unknown';
      productCounts[key] = (productCounts[key] || 0) + 1;
      if (!productMeta[key]) {
        productMeta[key] = {
          imageUrl: i.imageUrl || '',
          productPrice: Number(i.productPrice || 0),
          productCategory: i.productCategory || '',
        };
      }
    }
    const rankedProducts = Object.entries(productCounts)
      .map(([name, count]) => ({ name, count, ...productMeta[name] }))
      .sort((a, b) => b.count - a.count);
    const topProduct = rankedProducts[0] || null;

    // 3. Category heatmap
    const catCounts = {};
    for (const i of inquiries) {
      const c = i.productCategory || 'Uncategorised';
      catCounts[c] = (catCounts[c] || 0) + 1;
    }
    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const totalCatClicks = sortedCats.reduce((s, [, n]) => s + n, 0);
    const maxCat = sortedCats[0]?.[1] || 1;
    const heatmap = sortedCats.map(([name, count], idx) => ({
      name,
      count,
      pct: totalCatClicks ? (count / totalCatClicks) * 100 : 0,
      width: (count / maxCat) * 100,
      rank: idx,
    }));

    return {
      pendingValue,
      pendingCount,
      topProduct,
      rankedProducts,
      heatmap,
      totalInquiries: inquiries.length,
    };
  }, [inquiries]);

  const refresh = () => setTick((t) => t + 1);

  // Empty state
  if (stats.totalInquiries === 0) {
    return (
      <Card>
        <CardContent className="text-center py-20">
          <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-slate-900">
            No data to analyze yet
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Once customers start clicking the WhatsApp button on the storefront,
            their inquiries will be logged and analytics will appear here.
          </p>
          <Link href="/" className="inline-block mt-5">
            <Button variant="outline" size="sm" className="gap-2">
              <Package className="h-4 w-4" />
              View Storefront
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Performance overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated from {stats.totalInquiries}{' '}
            {stats.totalInquiries === 1 ? 'inquiry' : 'inquiries'} recorded.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* 3 metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* — Card 1 ——————————————————————————————————— */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Pending deliveries
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-slate-900 tabular-nums">
              {fmtMoney(stats.pendingValue)}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              From{' '}
              <span className="font-medium text-amber-700">
                {stats.pendingCount}
              </span>{' '}
              {stats.pendingCount === 1 ? 'inquiry' : 'inquiries'} marked{' '}
              <span className="font-medium">New Request</span>
            </p>
            <div className="mt-3 h-1.5 w-full rounded-full bg-amber-100 overflow-hidden">
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${
                    stats.totalInquiries
                      ? (stats.pendingCount / stats.totalInquiries) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* — Card 2 ——————————————————————————————————— */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Most clicked bag
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {stats.topProduct ? (
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {stats.topProduct.imageUrl ? (
                    <img
                      src={stats.topProduct.imageUrl}
                      alt={stats.topProduct.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 truncate">
                    {stats.topProduct.name}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 truncate">
                    {stats.topProduct.productCategory || '—'} ·{' '}
                    {fmtMoney(stats.topProduct.productPrice)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Flame className="h-3 w-3" />
                    {stats.topProduct.count}{' '}
                    {stats.topProduct.count === 1 ? 'click' : 'clicks'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No clicks recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* — Card 3 ——————————————————————————————————— */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Top category
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center">
              <Flame className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {stats.heatmap[0] ? (
              <>
                <div className="text-2xl font-semibold text-slate-900">
                  {stats.heatmap[0].name}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-medium text-rose-700">
                    {stats.heatmap[0].count}
                  </span>{' '}
                  {stats.heatmap[0].count === 1 ? 'click' : 'clicks'} —{' '}
                  {stats.heatmap[0].pct.toFixed(0)}% of all interest
                </p>
                <div className="mt-3 flex gap-1 items-end">
                  {stats.heatmap.slice(0, 6).map((row, idx) => (
                    <div
                      key={row.name}
                      title={`${row.name}: ${row.count}`}
                      className={`flex-1 ${heatColor(idx)} rounded-sm transition`}
                      style={{ height: `${Math.max(6, row.width * 0.4)}px` }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No category data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Category heatmap (detailed) ─────────────────── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-rose-500" />
            Category heatmap
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Which bag styles get the most customer interest. Heat intensifies
            with rank — stock up on what&apos;s burning hot.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.heatmap.map((row, idx) => (
              <div key={row.name} className="group">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${heatColor(idx)}`} />
                    <span className="font-medium text-slate-900">{row.name}</span>
                    {idx === 0 && (
                      <span className="text-[10px] uppercase tracking-wide font-medium text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                        Hottest
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 tabular-nums">
                    <span className="font-medium text-slate-900">{row.count}</span>{' '}
                    {row.count === 1 ? 'click' : 'clicks'} ·{' '}
                    {row.pct.toFixed(0)}%
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${heatColor(idx)} transition-all duration-500`}
                    style={{ width: `${row.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Top products leaderboard ────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-500" />
            Product leaderboard
          </CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            All bags ranked by total customer clicks.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-medium px-5 py-3 w-12">#</th>
                  <th className="text-left font-medium px-5 py-3 w-16">Image</th>
                  <th className="text-left font-medium px-5 py-3">Product</th>
                  <th className="text-left font-medium px-5 py-3">Category</th>
                  <th className="text-right font-medium px-5 py-3">Price</th>
                  <th className="text-right font-medium px-5 py-3">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.rankedProducts.map((p, idx) => (
                  <tr key={p.name} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 text-slate-500 tabular-nums">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-5 py-3 text-slate-600">{p.productCategory || '—'}</td>
                    <td className="px-5 py-3 text-right text-slate-900 tabular-nums">
                      {fmtMoney(p.productPrice)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full tabular-nums">
                        <Flame className="h-3 w-3 text-rose-500" />
                        {p.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const AnalyticsPage = () => (
  <AdminShell titleSlot="Most requested items & insights">
    <AnalyticsContent />
  </AdminShell>
);

export default AnalyticsPage;
