import { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Loader2,
  Sparkles,
  FileText,
  Copy,
  Check,
  Bot,
  User,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { fileService } from '../services/fileService';
import toast from 'react-hot-toast';

const SUGGESTIONS = [
  'Summarize this document in 3 bullets',
  'What are the key conclusions?',
  'List the main action items or recommendations',
];

export default function AiPdfChatModal({ isOpen, onClose, file }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && file) {
      setMessages([
        {
          role: 'assistant',
          content: `Hi! I'm your AI assistant for **${file.originalName || file.name}**. Ask me any question or click **Summarize Document** below.`,
        },
      ]);
      setQuestion('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, file]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSummarize = async () => {
    if (!file || loading) return;
    setLoading(true);

    const userMsg = { role: 'user', content: 'Generate a summary of this PDF' };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { data } = await fileService.getAiSummary(file.id);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.result || 'No summary returned.' },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to generate summary. Please check your Gemini API key or try again.';
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error:** ${msg}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (textToSend) => {
    const q = (textToSend || question).trim();
    if (!q || !file || loading) return;

    setQuestion('');
    setLoading(true);

    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const { data } = await fileService.askAiQuestion(file.id, q);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.result || 'No response returned.' },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to get answer. Please check your Gemini API key or try again.';
      toast.error(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ **Error:** ${msg}`,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 modal-backdrop animate-fadeInUp">
      <div className="flex flex-col w-full max-w-2xl h-[85vh] max-h-[700px] rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface-2/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-primary truncate max-w-[280px] sm:max-w-md">
                  {file.originalName || file.name}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <Sparkles className="h-2.5 w-2.5" /> Gemini AI
                </span>
              </div>
              <p className="text-[11px] text-text-muted">
                Ask questions or summarize PDF contents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSummarize}
              disabled={loading}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-2 hover:text-text-primary border border-border transition-colors disabled:opacity-50 cursor-pointer"
              title="Quickly summarize this PDF"
            >
              <Sparkles className="h-3 w-3 text-primary" />
              <span>Summarize</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Suggestion pills bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/60 bg-surface/60 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-semibold uppercase text-text-muted shrink-0 flex items-center gap-1">
            <Lightbulb className="h-3 w-3" /> Quick:
          </span>
          <button
            onClick={handleSummarize}
            disabled={loading}
            className="sm:hidden text-[11px] rounded-full px-2.5 py-0.5 bg-primary/10 text-primary hover:bg-primary/20 shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Summarize PDF
          </button>
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              disabled={loading}
              className="text-[11px] rounded-full px-2.5 py-0.5 bg-surface-2 text-text-secondary hover:text-text-primary hover:bg-surface-2/80 shrink-0 border border-border transition-colors disabled:opacity-50 cursor-pointer truncate max-w-[240px]"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-primary text-white rounded-tr-xs'
                      : m.isError
                      ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-tl-xs'
                      : 'bg-surface-2 text-text-primary border border-border/60 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap select-text">
                    {m.content}
                  </div>

                  {!isUser && !m.isError && (
                    <button
                      onClick={() => handleCopy(m.content, idx)}
                      className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 rounded p-1 bg-surface border border-border text-text-muted hover:text-text-primary transition-opacity cursor-pointer shadow-xs"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-secondary mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs bg-surface-2 border border-border/60 px-3.5 py-2.5 text-xs text-text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Reading document & thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Input */}
        <div className="p-3 border-t border-border bg-surface">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a question about this PDF..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
              className="input-theme flex-1 rounded-xl px-3.5 py-2 text-xs disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!question.trim() || loading}
              className="btn-primary rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              title="Send question"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Ask AI</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

