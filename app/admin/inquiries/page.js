/* eslint-disable react-hooks/immutability */
'use client'

import { useState, useEffect, useMemo } from 'react';
import {
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  clearInquiries,
  INQUIRY_STATUSES,
} from '@/lib/inquiries';
import { AdminShell } from '@/components/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────
// Status pill styling
// ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  'New Request':       'bg-amber-50  text-amber-800  border-amber-200',
  'Delivered & Paid':  'bg-emerald-50 text-emerald-800 border-emerald-200',
  'Cancelled':         'bg-rose-50    text-rose-700    border-rose-200',
};

const STATUS_DOT = {
  'New Request':      'bg-amber-500',
  'Delivered & Paid': 'bg-emerald-500',
  'Cancelled':        'bg-rose-500',
};

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

// ─────────────────────────────────────────────────────────────
// Inquiries Content
// ─────────────────────────────────────────────────────────────
const InquiriesManager = () => {
  const [inquiries, setInquiries] = useState([]);
  const [tick, setTick] = useState(0); // forces re-render after status changes

  useEffect(() => {
    load();
  }, [tick]);

  const load = () => setInquiries(getInquiries());

  // Sort most recent first
  const sorted = useMemo(() => {
    const copy = inquiries.slice();
    copy.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return copy;
  }, [inquiries]);

  const counts = useMemo(() => {
    const c = { 'New Request': 0, 'Delivered & Paid': 0, 'Cancelled': 0 };
    for (const i of inquiries) {
      if (c[i.status] !== undefined) c[i.status] += 1;
    }
    return c;
  }, [inquiries]);

  const handleStatusChange = (id, status) => {
    updateInquiryStatus(id, status);
    toast.success(`Marked as "${status}"`);
    setTick((t) => t + 1);
  };

  const handleDelete = (id) => {
    deleteInquiry(id);
    toast.success('Inquiry removed');
    setTick((t) => t + 1);
  };

  const handleClearAll = () => {
    clearInquiries();
    toast.success('All inquiries cleared');
    setTick((t) => t + 1);
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Total inquiries</div>
            <div className="mt-1 text-3xl font-semibold text-slate-900">{inquiries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">New requests</div>
            <div className="mt-1 text-3xl font-semibold text-amber-600">{counts['New Request']}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Delivered &amp; paid</div>
            <div className="mt-1 text-3xl font-semibold text-emerald-600">{counts['Delivered & Paid']}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Cancelled</div>
            <div className="mt-1 text-3xl font-semibold text-rose-600">{counts['Cancelled']}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100">
          <div>
            <CardTitle className="text-base">Customer Inquiries</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              {inquiries.length} {inquiries.length === 1 ? 'inquiry' : 'inquiries'}, sorted by most recent
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {inquiries.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear all</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all inquiries?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently deletes every inquiry record. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll} className="bg-rose-600 hover:bg-rose-700">
                      Clear all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {inquiries.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-900">No inquiries yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                When a customer clicks the WhatsApp button on a product page, their inquiry will appear here for you to track and fulfil.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left font-medium px-5 py-3 w-20">Image</th>
                    <th className="text-left font-medium px-5 py-3">Product</th>
                    <th className="text-right font-medium px-5 py-3">Price</th>
                    <th className="text-left font-medium px-5 py-3 whitespace-nowrap">Received</th>
                    <th className="text-left font-medium px-5 py-3 w-56">Status</th>
                    <th className="text-right font-medium px-5 py-3 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                          {row.imageUrl ? (
                            <img
                              src={row.imageUrl}
                              alt={row.productName}
                              className="h-full w-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                              <MessageSquare className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-900">{row.productName}</div>
                        {row.productCategory && (
                          <div className="text-xs text-slate-500 mt-0.5">{row.productCategory}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-900 tabular-nums">
                        ${Number(row.productPrice).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-slate-600 whitespace-nowrap text-xs">
                        {formatDate(row.timestamp)}
                      </td>
                      <td className="px-5 py-3">
                        <Select
                          value={row.status}
                          onValueChange={(v) => handleStatusChange(row.id, v)}
                        >
                          <SelectTrigger
                            className={`h-8 px-3 text-xs font-medium border ${STATUS_STYLES[row.status] || ''}`}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[row.status] || 'bg-slate-400'}`} />
                              <SelectValue />
                            </span>
                          </SelectTrigger>
                          <SelectContent>
                            {INQUIRY_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                <span className="flex items-center gap-2">
                                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[s]}`} />
                                  {s}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(row.id)}
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            aria-label="Delete inquiry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const InquiriesPage = () => (
  <AdminShell titleSlot="Customer inquiry ledger">
    <InquiriesManager />
  </AdminShell>
);

export default InquiriesPage;
