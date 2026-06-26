import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiSearch, FiLink } from 'react-icons/fi';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import PredictionResult from '../components/PredictionResult';
import { predictionService } from '../services/predictionService';

export default function URLScanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const scan = async () => {
    if (!url.trim()) { toast.error('URL is required'); return; }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await predictionService.predictUrl(url);
      setResult(data);
      toast.success('URL scan complete');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header title="URL Scanner" subtitle="Detect phishing and malicious URLs" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent/20">
              <FiLink className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Scan URL</h3>
              <p className="text-xs text-slate-500">Enter a URL to check for phishing threats</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://suspicious-site.com/login"
              icon={FiLink}
            />
            <Button onClick={scan} loading={loading} icon={FiSearch}>Scan URL</Button>

            <div className="glass-light rounded-lg p-4 mt-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Quick Examples</p>
              <div className="space-y-2">
                {[
                  'https://secure-bank-verify.com/login',
                  'https://google.com',
                  'http://free-prize-winner.xyz/claim',
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setUrl(example)}
                    className="block w-full text-left text-xs text-slate-400 hover:text-primary truncate cursor-pointer transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div>
          {result || loading ? (
            <PredictionResult result={result} loading={loading} />
          ) : (
            <Card className="flex flex-col items-center justify-center min-h-[300px] text-center">
              <FiLink className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-slate-400">Enter a URL to scan for phishing threats</p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
