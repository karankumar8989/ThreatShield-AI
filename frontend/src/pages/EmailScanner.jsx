import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSearch, FiMail } from 'react-icons/fi';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import PredictionResult from '../components/PredictionResult';
import { predictionService } from '../services/predictionService';

export default function EmailScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ subject: '', body: '', sender: '', recipient: '' });

  const scan = async () => {
    if (!form.body.trim()) { toast.error('Email body is required'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await predictionService.predictEmail({
        subject: form.subject || 'No Subject',
        body: form.body,
        sender: form.sender || 'unknown@email.com',
        recipient: form.recipient || 'user@email.com',
      });
      setResult(data);
      toast.success('Email scan complete');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header title="Email Scanner" subtitle="Detect spam and phishing emails" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-secondary/20">
              <FiMail className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Scan Email</h3>
              <p className="text-xs text-slate-500">Paste email details for analysis</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Email subject" />
            <Input label="From (Sender)" value={form.sender} onChange={(e) => setForm({ ...form, sender: e.target.value })} placeholder="sender@email.com" icon={FiMail} />
            <Input label="To (Recipient)" value={form.recipient} onChange={(e) => setForm({ ...form, recipient: e.target.value })} placeholder="recipient@email.com" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Email Body</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={8}
                placeholder="Paste the full email content..."
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none"
              />
            </div>
            <Button onClick={scan} loading={loading} icon={FiSearch}>Scan Email</Button>
          </div>
        </Card>

        <div>
          {result || loading ? (
            <PredictionResult result={result} loading={loading} />
          ) : (
            <Card className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <FiMail className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400">Enter email details to scan for threats</p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
