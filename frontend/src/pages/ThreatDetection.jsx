import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSearch, FiMail, FiMessageSquare, FiLink, FiFileText } from 'react-icons/fi';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import PredictionResult from '../components/PredictionResult';
import { predictionService } from '../services/predictionService';

const TABS = [
  { id: 'email', label: 'Email', icon: FiMail },
  { id: 'sms', label: 'SMS', icon: FiMessageSquare },
  { id: 'url', label: 'URL', icon: FiLink },
  { id: 'custom', label: 'Custom Text', icon: FiFileText },
];

export default function ThreatDetection() {
  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [emailData, setEmailData] = useState({ subject: '', body: '', sender: '', recipient: '' });
  const [smsText, setSmsText] = useState('');
  const [urlText, setUrlText] = useState('');
  const [customText, setCustomText] = useState('');

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      let response;
      switch (activeTab) {
        case 'email':
          if (!emailData.body.trim()) { toast.error('Email body is required'); setLoading(false); return; }
          response = await predictionService.predictEmail({
            subject: emailData.subject || 'No Subject',
            body: emailData.body,
            sender: emailData.sender || 'unknown@email.com',
            recipient: emailData.recipient || 'user@email.com',
          });
          break;
        case 'sms':
          if (!smsText.trim()) { toast.error('SMS text is required'); setLoading(false); return; }
          response = await predictionService.predictSms(smsText);
          break;
        case 'url':
          if (!urlText.trim()) { toast.error('URL is required'); setLoading(false); return; }
          response = await predictionService.predictUrl(urlText);
          break;
        case 'custom':
          if (!customText.trim()) { toast.error('Text is required'); setLoading(false); return; }
          response = await predictionService.predictSms(customText);
          break;
        default:
          break;
      }
      setResult(response.data);
      toast.success('Analysis complete');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header
        title="Threat Detection"
        subtitle="Analyze emails, SMS, URLs, and custom text for threats"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex flex-wrap gap-2 mb-6">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setResult(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer
                  ${activeTab === id
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activeTab === 'email' && (
              <>
                <Input label="Subject" value={emailData.subject} onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })} placeholder="Email subject" />
                <Input label="Sender" value={emailData.sender} onChange={(e) => setEmailData({ ...emailData, sender: e.target.value })} placeholder="sender@email.com" />
                <Input label="Recipient" value={emailData.recipient} onChange={(e) => setEmailData({ ...emailData, recipient: e.target.value })} placeholder="recipient@email.com" />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-300">Email Body</label>
                  <textarea
                    value={emailData.body}
                    onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                    rows={6}
                    placeholder="Paste email content here..."
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                </div>
              </>
            )}

            {activeTab === 'sms' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">SMS Message</label>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  rows={6}
                  placeholder="Paste SMS message here..."
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>
            )}

            {activeTab === 'url' && (
              <Input label="URL" value={urlText} onChange={(e) => setUrlText(e.target.value)} placeholder="https://example.com" icon={FiLink} />
            )}

            {activeTab === 'custom' && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">Custom Text</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={6}
                  placeholder="Paste any suspicious text for analysis..."
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none"
                />
              </div>
            )}

            <Button onClick={analyze} loading={loading} icon={FiSearch} className="w-full sm:w-auto">
              Analyze
            </Button>
          </div>
        </Card>

        <div>
          {result || loading ? (
            <PredictionResult result={result} loading={loading} />
          ) : (
            <Card className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <FiSearch className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400">Enter content and click Analyze to detect threats</p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
