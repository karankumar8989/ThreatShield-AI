import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiDownload, FiFileText, FiPlus, FiFilter } from 'react-icons/fi';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { reportsService } from '../services/reportsService';
import { getReportsHistory, saveReportToHistory, formatDate, paginate } from '../utils/helpers';

const PAGE_SIZE = 8;

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    startDate: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    scanType: '',
    format: 'pdf',
  });

  useEffect(() => {
    setReports(getReportsHistory());
  }, []);

  const filtered = useMemo(() => {
    let items = [...reports];
    if (search) {
      items = items.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.scanType?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      items = items.filter(r => r.scanType === filterType || (!r.scanType && filterType === 'all'));
    }
    items.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return (a.name || '').localeCompare(b.name || '');
    });
    return items;
  }, [reports, search, sortBy, filterType]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = paginate(filtered, page, PAGE_SIZE);

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const start = new Date(form.startDate).toISOString();
      const end = new Date(form.endDate + 'T23:59:59').toISOString();
      const scanType = form.scanType || null;

      const service = form.format === 'pdf'
        ? reportsService.generatePdf
        : reportsService.generateCsv;

      const { data } = await service(start, end, scanType);
      const ext = form.format === 'pdf' ? 'pdf' : 'csv';
      const filename = `threat_report_${Date.now()}.${ext}`;
      downloadBlob(data, filename);

      const reportMeta = {
        name: `Report ${form.startDate} to ${form.endDate}`,
        scanType: form.scanType || 'all',
        format: form.format,
        startDate: form.startDate,
        endDate: form.endDate,
      };
      saveReportToHistory(reportMeta);
      setReports(getReportsHistory());
      setModalOpen(false);
      toast.success(`${ext.toUpperCase()} report downloaded`);
    } catch {
      // handled by interceptor
    } finally {
      setGenerating(false);
    }
  };

  const redownload = async (report) => {
    setGenerating(true);
    try {
      const start = new Date(report.startDate).toISOString();
      const end = new Date(report.endDate + 'T23:59:59').toISOString();
      const scanType = report.scanType === 'all' ? null : report.scanType;
      const service = report.format === 'csv' ? reportsService.generateCsv : reportsService.generatePdf;
      const { data } = await service(start, end, scanType);
      downloadBlob(data, `threat_report_${report.id}.${report.format}`);
      toast.success('Report downloaded');
    } catch {
      // handled
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header
        title="Reports"
        subtitle="Generate and manage security reports"
        action={
          <Button icon={FiPlus} onClick={() => setModalOpen(true)}>Generate Report</Button>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search reports..." className="flex-1" />
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        {paginated.length ? (
          <div className="space-y-3">
            {paginated.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg glass-light hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FiFileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{report.name}</p>
                    <p className="text-xs text-slate-500">
                      {report.format?.toUpperCase()} &middot; {report.scanType || 'all'} &middot; {formatDate(report.createdAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiDownload}
                  loading={generating}
                  onClick={() => redownload(report)}
                >
                  Download {report.format?.toUpperCase()}
                </Button>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reports yet"
            message="Generate your first security report using the button above."
            icon={FiFileText}
          />
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Report">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300 flex items-center gap-2"><FiFilter className="w-4 h-4" /> Scan Type</label>
            <select
              value={form.scanType}
              onChange={(e) => setForm({ ...form, scanType: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-300">Format</label>
            <div className="flex gap-3">
              {['pdf', 'csv'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setForm({ ...form, format: fmt })}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium uppercase transition-all cursor-pointer
                    ${form.format === fmt ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={generateReport} loading={generating} icon={FiDownload} className="w-full">
            Generate & Download
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
