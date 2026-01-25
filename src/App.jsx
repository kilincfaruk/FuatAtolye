import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  LayoutDashboard, Users, LogOut, TrendingUp, Wallet, CheckCircle,
  Search, X, ChevronLeft, ChevronRight, Calendar, User, ArrowUpDown, Printer, Edit, FileDown, Share2, AlertCircle, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient.js';

// --- Constants & Mock Data Configuration ---

const APP_NAME = "KUYUMCU ATÖLYESİ";

// --- Helper Functions ---

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(num);
};

const formatWeightWithPurity = (weightValue, purityValue) => {
  const weight = parseFloat(weightValue);
  if (isNaN(weight) || weight === 0) return '';
  const purity = (purityValue ?? '').toString().trim();
  const weightText = `${formatNumber(weight)} gr`;
  return purity ? `${weightText} (${purity})` : weightText;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

const LABEL_BASE = "block text-[13px] font-medium text-slate-600 mb-1.5 tracking-wide";
const INPUT_BASE = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-800 placeholder:text-slate-400 outline-none transition-colors hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10";
const SELECT_BASE = `${INPUT_BASE} pr-10`;
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold min-h-[44px] transition-colors focus:outline-none focus:ring-1 focus:ring-slate-900/10 focus:ring-offset-2";
const BTN_PRIMARY = `${BTN_BASE} bg-slate-900 text-white hover:bg-slate-800`;
const BTN_ACCENT = `${BTN_BASE} bg-amber-500 text-slate-900 hover:bg-amber-600`;
const BTN_SECONDARY = `${BTN_BASE} bg-white text-slate-700 border border-slate-200 hover:bg-slate-50`;
const BTN_TONAL = `${BTN_BASE} bg-slate-100 text-slate-700 hover:bg-slate-200`;
const BTN_ICON = "p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10";
const TAB_BASE = "flex-1 text-sm font-semibold rounded-lg px-3 py-2 transition-colors";

// Mock generation functions removed.

// --- Components ---

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
    info: <Info className="w-5 h-5 text-slate-700" />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200',
    error: 'bg-rose-50 border-rose-200',
    warning: 'bg-amber-50 border-amber-200',
    info: 'bg-slate-50 border-slate-200'
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border shadow-sm animate-in slide-in-from-right-full duration-500 max-w-sm ${bgColors[type]}`}>
      {icons[type]}
      <p className="text-sm font-semibold text-slate-800 flex-1">{message}</p>
      <button onClick={onClose} className={BTN_ICON} aria-label="Bildirimi kapat">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const LoginPage = ({ onLogin, showToast, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{APP_NAME}</h1>
          <p className="text-slate-500 text-sm mt-1">Yönetim Paneli Girişi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={LABEL_BASE} htmlFor="login-email">E-posta</label>
            <input
              id="login-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT_BASE}
              placeholder="ornek@firma.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className={LABEL_BASE} htmlFor="login-password">Şifre</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT_BASE}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>


          <button
            type="submit"
            className={`${BTN_PRIMARY} w-full py-3 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon: Icon, iconClass, onClick }) => (
  <div
    className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[13px] font-semibold text-slate-500 mb-1 tracking-wide">{title}</p>
        <h3 className="text-[26px] leading-tight font-bold text-slate-900">{value}</h3>
        {subtext && <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl ${iconClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);



// --- Extracted Price List ---
const TRANSACTION_PRICES = [
  { name: "YÜZÜK KÜÇÜLME", price: "150" },
  { name: "ZİNCİR YALDIZ", price: "150 - 250" },
  { name: "BİLEKLİK YALDIZ", price: "150 - 250 - 300" },
  { name: "KÜÇÜLTME VE YALDIZ", price: "200" },
  { name: "BÜYÜTME VE YALDIZ", price: "200" },
  { name: "YÜZÜK BÜYÜME", price: "150" },
  { name: "PARÇALI BÜYÜME VE YALDIZ", price: "300" },
  { name: "PARÇALI BÜYÜME", price: "GRAM + 200" },
  { name: "KÜPE KOLYE ZİNCİR TEK LAZER", price: "150" },
  { name: "PIRLANTA BAKIM VE RODAJ", price: "300" },
  { name: "YÜZÜK RODAJ", price: "300" },
  { name: "KÜPE ÇİFTİ RODAJ", price: "300" },
  { name: "İNCE ZİNCİR KOLYE RODAJ", price: "300" },
  { name: "FANTAZİ BİLEZİK ÇİFT TARAFLI KISALTMA CİMAR", price: "400" },
  { name: "ROLEX KISALTMA", price: "250" },
  { name: "BİLEKLİK KISALTMA ÇİFT TRF", price: "200" },
  { name: "TAKIM KISALTMA", price: "400" },
  { name: "SET TAKIM KOMPLE RODAJ", price: "1000" },
  { name: "KİLİTLİ KISALTMA ÇİFT TARAF VE YALDIZ", price: "500" },
  { name: "PIRLANTA KÜÇÜLME VE RODAJ", price: "350" },
  { name: "PIRLANTA BÜYÜME VE RODAJ PARÇALI", price: "GRAM + 400" },
  { name: "TRABZON KISALTMA VE CİMAR", price: "750" },
  { name: "LAZER KAYNAK", price: "150" },
  { name: "ÇİFT ALYANS PANTORAF", price: "150" },
  { name: "TEK PANT ALYANS", price: "75" },
  { name: "KÜNYE PANTORAF", price: "150" },
  { name: "KOLYE PANTORAF TEK TARAF", price: "150" },
  { name: "GÜMÜŞ KÜÇÜLME", price: "150" },
  { name: "GÜMÜŞ PARÇALI BÜYÜME", price: "200" },
  { name: "İSİM KOLYE İŞÇİLİK ", price: "GRAM + 1000" },
  { name: "AİLE İSİM KOLYE ", price: "GRAM + 750" },
  { name: "GÜMÜŞ İSİM KOLYE ZİNCİRLİ", price: "1000" },
  { name: "SONSUZLUK İSİM KOLYE 1 İLA 1,5 GRAM ARASI", price: "1000" },
  { name: "GÜMÜŞ SONSUZLUK KOLYE İSİMLİ SADE", price: "750" },
  { name: "KABARTMA KÜNYE", price: "500" },
  { name: "BİLEZİK RODAJ YAPIMI AJDA MODEL", price: "500" },
  { name: "BİLEZİK ROZ YAPIM AJDA", price: "250" },
  { name: "TESBİH PÜSKÜL YAPIMI ALTIN HARF BAŞI", price: "200" },
  { name: "TESBİH PÜSKÜL YAPIMI İSİM BAŞI GÜMÜŞ", price: "250" },
  { name: "GERDANLIK DİZİMİ VE CİMAR ÇOKLU", price: "350 - 500" },
  { name: "FOTOĞRAF İŞLEME LAZER", price: "750" },
  { name: "SAMANYOLU KISALTMA YALDIZ", price: "300" },
  { name: "FANTAZİ BİLEKLİK ÇİFT TARAFLI KISALTMA CİMAR", price: "300" },
  { name: "ARAPÇA PANTORAF VE ÇİZİM", price: "200" },
  { name: "HALAT KISALMA CİMAR", price: "200" },
  { name: "HALAT TAMİR CİMAR", price: "200" },
  { name: "HALAT KÜNYE ÇİFT TARAF KISALMA CİMAR", price: "300" },
  { name: "İNCİ DİZİM", price: "200" }
];

const TransactionForm = ({ onBack, onSubmit, initialData, showToast, customers = [], workTypes = [] }) => {
  const [activeTab, setActiveTab] = useState('job'); // 'job', 'expense', 'payment'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Job Form State
  const [jobData, setJobData] = useState({
    customer: '',
    quantity: 1,
    jobType: '',
    milyem: '',
    goldWeight: '',
    price: '',
    isPaid: false,
    date: new Date().toISOString().split('T')[0]
  });

  // Expense Form State
  const [expenseData, setExpenseData] = useState({
    type: 'Diğer',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    customer: '',
    hasAmount: '',
    silverAmount: '',
    cashAmount: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      if (initialData.type === 'expense') {
        setActiveTab('expense');
        setExpenseData({
          type: initialData.type,
          description: initialData.description || '',
          amount: initialData.amount || '',
          date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      } else if (initialData.type === 'payment') {
        setActiveTab('payment');
        setPaymentData({
          customer: initialData.customer,
          hasAmount: initialData.hasAmount || '',
          silverAmount: initialData.silverAmount || '',
          cashAmount: initialData.cashAmount || '',
          date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      } else if (initialData.type === 'job' || (!initialData.type && initialData.tamiratIsi)) {
        setActiveTab('job');
        setJobData({
          customer: initialData.customer,
          quantity: initialData.quantity || 1,
          jobType: initialData.jobType || initialData.tamiratIsi || '',
          milyem: initialData.milyem || initialData.ayar || '',
          goldWeight: initialData.goldWeight || initialData.altinGr || '',
          price: initialData.price || initialData.ucret || '',
          isPaid: initialData.isPaid || false,
          note: initialData.note || '',
          date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
      }
    }
  }, [initialData]);

  const isSilverMilyem = (value) => {
    const v = (value || '').toString().toLowerCase();
    return v.includes('silver') || v.includes('gümüş') || v.includes('gumus');
  };

  // --- JOB CALCULATIONS ---
  const calculatedJobHas = useMemo(() => {
    if (jobData.goldWeight) {
      const g = parseFloat(jobData.goldWeight);
      if (isNaN(g)) return '';
      if (isSilverMilyem(jobData.milyem)) return g.toFixed(3);
      const m = parseFloat(jobData.milyem);
      if (!isNaN(m)) return (m * g).toFixed(3);
    }
    return '';
  }, [jobData.milyem, jobData.goldWeight]);

  const handleJobTypeChange = (name) => {
    const item = workTypes.find(t => t.name === name);
    let price = '';
    if (item && item.default_price !== null && item.default_price !== undefined) {
      price = item.default_price;
    }
    setJobData({ ...jobData, jobType: name, price });
  };

  // --- SUBMIT HANDLERS ---
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    const submitData = {
      id: initialData?.id,
      entryType: 'job',
      ...jobData,
      has: calculatedJobHas,
      date: initialData ? initialData.date : jobData.date
    };
    try {
      await onSubmit(submitData);
    } catch (error) {
      showToast('İşlem kaydedilemedi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({
        id: initialData?.id,
        entryType: 'expense',
        ...expenseData,
        date: initialData ? initialData.date : expenseData.date
      });
    } catch (error) {
      showToast('Gider kaydedilemedi.', 'error');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({
        id: initialData?.id,
        entryType: 'payment',
        ...paymentData,
        date: initialData ? initialData.date : paymentData.date
      });
    } catch (error) {
      showToast('Ödeme kaydedilemedi.', 'error');
    }
  };

  // --- PRINT HANDLER ---
  const handlePrint = (e) => {
    e.preventDefault();
    if (!jobData.customer || !jobData.jobType) {
      showToast('Lütfen önce işlem detaylarını doldurun.', 'warning');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const hasLabel = isSilverMilyem(jobData.milyem) ? 'Gümüş' : 'Has Altın';
    const hasValue = calculatedJobHas ? `${calculatedJobHas} gr` : '';
    const weightDesc = formatWeightWithPurity(jobData.goldWeight, jobData.milyem);
    const htmlContent = `
      <html>
        <head>
          <title>Adisyon Yazdır</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
            .header { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .info { font-size: 14px; margin-bottom: 20px; text-align: left; }
            .info div { margin-bottom: 5px; }
            .content { font-size: 16px; font-weight: bold; margin: 20px 0; border: 1px dashed #000; padding: 15px; }
            .footer { font-size: 12px; margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; }
            @media print {
              @page { margin: 0; size: 80mm auto; }
              body { margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${APP_NAME}<br>
            İŞLEM FİŞİ
          </div>
          <div class="info">
            <div><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}</div>
            <div><strong>Sıra No:</strong> #${Math.floor(Math.random() * 1000)}</div>
            <div><strong>Müşteri:</strong> ${jobData.customer}</div>
          </div>
          <div class="content">
            <div>${jobData.jobType}</div>
            <div style="font-size: 14px; font-weight: normal; margin-top: 5px;">
              ${jobData.quantity > 1 ? `Adet: ${jobData.quantity}<br>` : ''}
              ${weightDesc ? `${weightDesc}` : ''}
            </div>
            ${hasValue ? `<div style="font-size: 13px; margin-top: 6px;">${hasLabel}: ${hasValue}</div>` : ''}
            ${jobData.note ? `<div style="font-size: 12px; margin-top: 6px;">Not: ${jobData.note}</div>` : ''}
            ${jobData.price ? `<div style="margin-top: 10px; font-size: 20px;">${formatCurrency(jobData.price)}</div>` : ''}
          </div>
          
          <div class="footer">
            Teşekkür Ederiz<br>
            İyi Günler
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const normalizedIncludes = (value, query) =>
    value.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'));

  const customerMatches = useMemo(() => {
    if (!jobData.customer) return customers;
    return customers.filter(name => normalizedIncludes(name, jobData.customer));
  }, [customers, jobData.customer]);

  const jobTypeMatches = useMemo(() => {
    if (!jobData.jobType) return workTypes;
    return workTypes.filter(t => normalizedIncludes(t.name, jobData.jobType));
  }, [workTypes, jobData.jobType]);

  const milyemOptions = ['0.995 (24K)', '0.916 (22K)', '0.750 (18K)', '0.585 (14K)', '0.416 (10K)', '0.333 (8K)', 'Gümüş'];
  const milyemMatches = useMemo(() => {
    if (!jobData.milyem) return milyemOptions;
    return milyemOptions.filter(v => normalizedIncludes(v, jobData.milyem));
  }, [jobData.milyem]);

  const Tabs = () => (
    <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200">
      <button
        type="button"
        disabled={!!initialData}
        onClick={() => setActiveTab('job')}
        className={`${TAB_BASE} ${activeTab === 'job'
          ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
          } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        İşlem Gir
      </button>
      <button
        type="button"
        disabled={!!initialData}
        onClick={() => setActiveTab('payment')}
        className={`${TAB_BASE} ${activeTab === 'payment'
          ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
          } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Ödeme Al
      </button>
      <button
        type="button"
        disabled={!!initialData}
        onClick={() => setActiveTab('expense')}
        className={`${TAB_BASE} ${activeTab === 'expense'
          ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
          } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Gider Ekle
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 w-full">
          <div className="flex items-center h-16 relative justify-center">
            <button
              onClick={onBack}
              className="absolute left-0 p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <ChevronLeft className="w-5 h-5" /> Geri
            </button>
            <span className="font-bold text-lg">
              {initialData ? 'İşlemi Düzenle' : (activeTab === 'job' ? 'Yeni İşlem' : activeTab === 'expense' ? 'Yeni Gider' : 'Tahsilat')}
            </span>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-7">
          <Tabs />

          {/* --- JOB FORM --- */}
          {activeTab === 'job' && (
            <form onSubmit={handleJobSubmit} className="space-y-6">
              <div>
                <label className={LABEL_BASE}>Firma Adı</label>
                <input
                  type="text"
                  list="customer-options"
                  placeholder="Firma adı yazın..."
                  className={INPUT_BASE}
                  value={jobData.customer}
                  onChange={e => setJobData({ ...jobData, customer: e.target.value })}
                />
                <datalist id="customer-options">
                  {customers.map(name => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                {jobData.customer && customerMatches.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    + Yeni ekle: <span className="font-medium">{jobData.customer}</span>
                  </p>
                )}
              </div>

              <div>
                <label className={LABEL_BASE}>Tarih</label>
                <input
                  type="date"
                  className={INPUT_BASE}
                  value={jobData.date}
                  onChange={e => setJobData({ ...jobData, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={LABEL_BASE}>Adedi</label>
                    <select
                      className={SELECT_BASE}
                    value={jobData.quantity}
                    onChange={e => setJobData({ ...jobData, quantity: Number(e.target.value) })}
                  >
                    {[...Array(20)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL_BASE}>Milyem</label>
                  <input
                    type="text"
                    list="milyem-options"
                    placeholder="0.995, 0.916 veya Gümüş"
                    className={INPUT_BASE}
                    value={jobData.milyem}
                    onChange={e => setJobData({ ...jobData, milyem: e.target.value })}
                  />
                  <datalist id="milyem-options">
                    {milyemOptions.map(option => (
                      <option key={option} value={option.includes('(') ? option.split(' ')[0] : option} />
                    ))}
                  </datalist>
                  {jobData.milyem && milyemMatches.length === 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      + Yeni ekle: <span className="font-medium">{jobData.milyem}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={LABEL_BASE}>Yapılan İş</label>
                <input
                  type="text"
                  list="jobtype-options"
                  placeholder="İşlem yazın..."
                  className={INPUT_BASE}
                  value={jobData.jobType}
                  onChange={e => setJobData({ ...jobData, jobType: e.target.value })}
                />
                <datalist id="jobtype-options">
                  {workTypes.map(t => (
                    <option key={t.id || t.name} value={t.name} />
                  ))}
                </datalist>
                {jobData.jobType && jobTypeMatches.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    + Yeni ekle: <span className="font-medium">{jobData.jobType}</span>
                  </p>
                )}
              </div>

              <div>
                <label className={LABEL_BASE}>Fiyat (TL)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className={INPUT_BASE}
                  value={jobData.price}
                  onChange={e => setJobData({ ...jobData, price: e.target.value })}
                />
                {jobData.jobType && (
                  <p className="text-[10px] text-amber-600 mt-1 truncate">
                    Ref: {workTypes.find(t => t.name === jobData.jobType)?.default_price ?? '-'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_BASE}>{isSilverMilyem(jobData.milyem) ? 'Gümüş (Gr)' : 'Altın (Gr)'}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={INPUT_BASE}
                    value={jobData.goldWeight}
                    onChange={e => setJobData({ ...jobData, goldWeight: e.target.value })}
                  />
                  {calculatedJobHas && (
                    <p className="text-[10px] text-green-600 mt-1 font-bold bg-green-50 px-1 py-0.5 rounded inline-block">
                      {isSilverMilyem(jobData.milyem) ? 'Gümüş' : 'Has'}: {calculatedJobHas}
                    </p>
                  )}
                </div>
                <div>
                  <label className={LABEL_BASE}>Not (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="İsteğe bağlı"
                    className={INPUT_BASE}
                    value={jobData.note || ''}
                    onChange={e => setJobData({ ...jobData, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer" onClick={() => setJobData(p => ({ ...p, isPaid: !p.isPaid }))}>
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${jobData.isPaid ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'}`}>
                  {jobData.isPaid && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className={`text-sm font-medium select-none ${jobData.isPaid ? 'text-green-700' : 'text-slate-600'}`}>
                  Ödeme Peşin Alındı
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handlePrint}
                  className={`${BTN_SECONDARY} flex-1 py-3`}
                >
                  <Printer className="w-5 h-5" /> Adisyon
                </button>
                <button
                  type="submit"
                  className={`${BTN_PRIMARY} flex-[2] py-3`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Kaydediliyor...' : (initialData ? 'Güncelle' : 'İşlemi Kaydet')}
                </button>
              </div>
            </form>
          )}

          {/* --- PAYMENT FORM --- */}
          {activeTab === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <div>
                <label className={LABEL_BASE}>Firma Adı</label>
                <select
                  className={SELECT_BASE}
                  value={paymentData.customer}
                  onChange={e => setPaymentData({ ...paymentData, customer: e.target.value })}
                >
                  <option value="">Seçiniz...</option>
                  {customers.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_BASE}>Tarih</label>
                <input
                  type="date"
                  className={INPUT_BASE}
                  value={paymentData.date}
                  onChange={e => setPaymentData({ ...paymentData, date: e.target.value })}
                />
              </div>

              <div>
                <label className={LABEL_BASE}>Nakit Tutar (TL)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className={INPUT_BASE}
                  value={paymentData.cashAmount}
                  onChange={e => setPaymentData({ ...paymentData, cashAmount: e.target.value })}
                />
              </div>

              <div>
                <label className={LABEL_BASE}>Has Altın (Gr)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={INPUT_BASE}
                  value={paymentData.hasAmount}
                  onChange={e => setPaymentData({ ...paymentData, hasAmount: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">Varsa hurda/has ödemesi</p>
              </div>

              <div>
                <label className={LABEL_BASE}>Gümüş (Gr)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={INPUT_BASE}
                  value={paymentData.silverAmount}
                  onChange={e => setPaymentData({ ...paymentData, silverAmount: e.target.value })}
                />
                <p className="text-xs text-slate-500 mt-1">Gümüş ödemesi varsa</p>
              </div>

              <button
                type="submit"
                className={`${BTN_PRIMARY} w-full py-3 mt-2`}
              >
                {initialData ? 'Güncelle' : 'Ödemeyi Al'}
              </button>
            </form>
          )}

          {/* --- EXPENSE FORM --- */}
          {activeTab === 'expense' && (
            <form onSubmit={handleExpenseSubmit} className="space-y-6">
              <div>
                <label className={LABEL_BASE}>Gider Türü</label>
                <select
                  className={SELECT_BASE}
                  value={expenseData.type}
                  onChange={e => setExpenseData({ ...expenseData, type: e.target.value })}
                >
                  {['Kira', 'Elektrik', 'Su', 'Doğalgaz', 'Yemek', 'Personel', 'Malzeme', 'Diğer'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL_BASE}>Tarih</label>
                <input
                  type="date"
                  className={INPUT_BASE}
                  value={expenseData.date}
                  onChange={e => setExpenseData({ ...expenseData, date: e.target.value })}
                />
              </div>

              <div>
                <label className={LABEL_BASE}>Tutar (TL)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className={INPUT_BASE}
                  value={expenseData.amount}
                  onChange={e => setExpenseData({ ...expenseData, amount: e.target.value })}
                />
              </div>

              <div>
                <label className={LABEL_BASE}>Açıklama (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Detay..."
                  className={INPUT_BASE}
                  value={expenseData.description}
                  onChange={e => setExpenseData({ ...expenseData, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className={`${BTN_PRIMARY} w-full py-3 mt-2`}
              >
                {initialData ? 'Güncelle' : 'Gideri Kaydet'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout, onNavigate, data, expenses, onEdit, showToast, customers = [] }) => {
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  });
  const [customerFilter, setCustomerFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'income', direction: 'desc' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [goldPrice, setGoldPrice] = useState(null);
  const [goldUpdatedAt, setGoldUpdatedAt] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('Tümü');
  const [expenseQuery, setExpenseQuery] = useState('');

  // Fetch gold price from backend API
  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        const baseUrl = import.meta.env.PROD ? '' : 'http://localhost:3001';
        const response = await fetch(`${baseUrl}/api/gold-price`);
        const data = await response.json();
        if (data.status === 'success') {
          setGoldPrice(data.price);
          setGoldUpdatedAt(new Date());
        }
      } catch (error) {
        // Gold price fetch error - silently fail
      }
    };

    // Initial fetch
    fetchGoldPrice();

    // Fetch every 10 seconds
    const interval = setInterval(fetchGoldPrice, 10000);

    return () => clearInterval(interval);
  }, []);

  // Filter Data
  const filteredData = useMemo(() => {
    let currentData = data;

    // Filter by Customer
    if (customerFilter) {
      if (currentData[customerFilter]) {
        currentData = { [customerFilter]: currentData[customerFilter] };
      } else {
        currentData = {};
      }
    }

    const filtered = {};
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime();

    Object.keys(currentData).forEach(customer => {
      const customerTransactions = currentData[customer].filter(t => {
        const tDate = new Date(t.date || t.tarih).getTime();
        return tDate >= start && tDate <= end;
      });
      if (customerTransactions.length > 0) {
        filtered[customer] = customerTransactions;
      }
    });
    return filtered;
  }, [data, dateRange, customerFilter]);

  // Derived Statistics
  const stats = useMemo(() => {
    const isSilver = (value) => {
      const v = (value || '').toString().toLowerCase();
      return v.includes('silver') || v.includes('gümüş') || v.includes('gumus');
    };
    let totalIncome = 0;      // Cash Collections
    let totalReceivables = 0; // Cash Debt
    let totalHasReceivables = 0; // Gold Debt
    let totalSilverReceivables = 0; // Silver Debt
    let totalTransactions = 0;
    let totalGoldVolume = 0; // Total Has Processed (Jobs)
    let totalSilverVolume = 0; // Total Silver Processed (Jobs)
    let customerStats = [];

    Object.entries(filteredData).forEach(([name, transactions]) => {
      let cIncome = 0;
      let cJobPrice = 0;
      let cJobHas = 0; // Job HAS
      let cJobSilver = 0; // Job Silver
      let cPaidHas = 0; // Payment HAS
      let cPaidSilver = 0; // Payment Silver
      let cCount = 0;

      transactions.forEach(t => {
        // Handle Legacy + New Schema
        const isJob = t.type === 'job' || (!t.type && t.tamiratIsi);
        const isPayment = t.type === 'payment';

        if (isJob) {
          cCount++;
          const pricePerUnit = parseFloat(t.price || t.ucret || 0);
          const quantity = t.quantity || 1;
          const totalPrice = pricePerUnit * quantity;
          const has = parseFloat(t.has || 0);

          if (!isNaN(totalPrice)) cJobPrice += totalPrice;
          if (!isNaN(has)) {
            if (isSilver(t.milyem || t.ayar)) cJobSilver += has;
            else cJobHas += has;
          }
        }

        if (isPayment) {
          const cash = parseFloat(t.cashAmount || 0);
          const has = parseFloat(t.hasAmount || 0);
          const silver = parseFloat(t.silverAmount || 0);
          if (!isNaN(cash)) cIncome += cash;
          if (!isNaN(has)) cPaidHas += has;
          if (!isNaN(silver)) cPaidSilver += silver;
        }
      });

      const cCashBalance = cJobPrice - cIncome;
      const cHasBalance = cJobHas - cPaidHas;
      const cSilverBalance = cJobSilver - cPaidSilver;

      totalIncome += cIncome;
      totalReceivables += cCashBalance;
      totalHasReceivables += cHasBalance;
      totalSilverReceivables += cSilverBalance;
      totalTransactions += cCount;
      totalGoldVolume += cJobHas;
      totalSilverVolume += cJobSilver;

      customerStats.push({
        name,
        income: cIncome,
        cashBalance: cCashBalance,
        hasBalance: cHasBalance,
        silverBalance: cSilverBalance,
        goldVolume: cJobHas,
        silverVolume: cJobSilver,
        count: cCount
      });
    });

    const activeCustomer = customerStats.sort((a, b) => b.count - a.count)[0];

    return { totalIncome, totalReceivables, totalHasReceivables, totalSilverReceivables, totalTransactions, totalGoldVolume, totalSilverVolume, activeCustomer, customerStats };
  }, [filteredData]);

  // Filter Expenses
  const totalExpense = useMemo(() => {
    if (!expenses) return 0;
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime();
    return expenses.filter(e => {
      const d = new Date(e.date).getTime();
      return d >= start && d <= end;
    }).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [expenses, dateRange]);

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime();
    return expenses
      .filter(e => {
        const d = new Date(e.date).getTime();
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, dateRange]);

  const filteredExpenseRows = useMemo(() => {
    return filteredExpenses.filter(e => {
      const typeMatch = expenseTypeFilter === 'Tümü' || e.type === expenseTypeFilter;
      const query = expenseQuery.trim().toLocaleLowerCase('tr-TR');
      if (!query) return typeMatch;
      const desc = (e.description || '').toLocaleLowerCase('tr-TR');
      return typeMatch && desc.includes(query);
    });
  }, [filteredExpenses, expenseTypeFilter, expenseQuery]);

  // Chart Data
  const chartData = useMemo(() => {
    const topCustomers = [...stats.customerStats]
      .sort((a, b) => b.income - a.income)
      .slice(0, 10);

    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      const monthKey = d.toISOString().slice(0, 7);
      return {
        name: d.toLocaleDateString('tr-TR', { month: 'short' }),
        income: 0,
        fullDate: monthKey
      };
    });

    Object.values(filteredData).flat().forEach(t => {
      if (t.type === 'payment' || t.isPaid) { // Count income from payments or paid jobs
        const tDate = t.date || t.tarih;
        const tMonth = tDate.slice(0, 7);
        const monthStats = monthlyTrend.find(m => m.fullDate === tMonth);
        if (monthStats) {
          const amount = t.type === 'payment' ? (parseFloat(t.cashAmount) || 0) : (parseFloat(t.ucret) || 0);
          monthStats.income += amount;
        }
      }
    });

    return { topCustomers, monthlyTrend };
  }, [stats, filteredData]);


  // Sorting
  const sortedCustomers = useMemo(() => {
    let sortableItems = [...stats.customerStats];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [stats.customerStats, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Navbar */}
      <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xl tracking-tight">{APP_NAME}</span>
            </div>

          <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('add-transaction')}
                className={`hidden sm:flex ${BTN_ACCENT} px-4 py-2 text-sm`}
              >
                <CheckCircle className="w-4 h-4" /> İşlem Ekle
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admin')}
                className={`${BTN_SECONDARY} px-4 py-2 text-sm`}
              >
                Yönetim
              </button>

              {goldPrice && (
                <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg border border-white/10">
                  <TrendingUp className="w-4 h-4 text-blue-100" />
                  <div className="flex flex-col">
                    <span className="text-xs text-blue-100">Altın (Gram)</span>
                    <span className="text-sm font-semibold text-white">{goldPrice} ₺</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user}</span>
              </div>
              <button
                onClick={onLogout}
                className={`${BTN_SECONDARY} px-4 py-2 text-sm`}
              >
                <LogOut className="w-4 h-4" /> Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <button
        type="button"
        onClick={() => onNavigate('add-transaction')}
        className="fixed bottom-6 right-6 sm:hidden bg-amber-500 text-blue-900 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-colors hover:bg-amber-600"
        aria-label="Yeni işlem ekle"
      >
        <CheckCircle className="w-8 h-8" />
      </button>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl font-bold text-slate-800">Genel Bakış</h1>
            <p className="text-slate-500 text-sm">Finansal durum ve işlem özetleri</p>
          </div>

          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-2.5">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <select
                  className="bg-transparent text-[13px] font-medium text-slate-700 focus:outline-none cursor-pointer py-2 pr-8 w-full sm:w-44"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                >
                  <option value="">Tüm Müşteriler</option>
                {customers.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
                </select>
              </div>

              <div className="hidden sm:block w-px bg-slate-100 my-1"></div>

              <div className="flex items-center gap-2 px-2 py-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="text-[13px] font-medium text-slate-700 focus:outline-none cursor-pointer"
                    value={dateRange.start}
                    max={dateRange.end}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setDateRange(prev => ({
                        start: newStart,
                        end: newStart > prev.end ? newStart : prev.end
                      }));
                    }}
                  />
                  <span className="text-slate-300">-</span>
                  <input
                    type="date"
                    className="text-[13px] font-medium text-slate-700 focus:outline-none cursor-pointer"
                    value={dateRange.end}
                    min={dateRange.start}
                    onChange={(e) => {
                      const newEnd = e.target.value;
                      setDateRange(prev => ({
                        start: newEnd < prev.start ? newEnd : prev.start,
                        end: newEnd
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="hidden sm:block w-px bg-slate-100 my-1"></div>

              <button
                onClick={() => {
                  const printWindow = window.open('', '_blank', 'width=800,height=800');
                  if (!printWindow) return;

                  const sortedCustomers = Object.keys(filteredData).sort();

                  let htmlContent = `
                    <html>
                      <head>
                        <title>İşlem Raporu</title>
                        <style>
                          body { font-family: 'Courier New', monospace; padding: 20px; }
                          .report-header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                          .customer-section { margin-bottom: 30px; page-break-inside: avoid; }
                          .customer-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; background: #eee; padding: 5px; }
                          table { width: 100%; border-collapse: collapse; font-size: 12px; }
                          th, td { border-bottom: 1px solid #ddd; padding: 5px; text-align: left; }
                          th { background: #f9f9f9; }
                          .text-right { text-align: right; }
                          .totals { font-weight: bold; border-top: 1px solid #000; margin-top: 5px; padding-top: 5px; display: flex; justify-content: space-between; font-size: 12px; }
                           @media print {
                            @page { size: 80mm auto; margin: 0; }
                            body { margin: 5mm; }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="report-header">
                          <strong>${APP_NAME}</strong><br>
                          İŞLEM RAPORU<br>
                          <span style="font-size: 12px">
                            ${new Date(dateRange.start).toLocaleDateString('tr-TR')} - ${new Date(dateRange.end).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                   `;

                  sortedCustomers.forEach(customer => {
                    const txs = filteredData[customer].sort((a, b) => new Date(a.date || a.tarih) - new Date(b.date || b.tarih));

                    let totalHas = 0;
                    let totalCash = 0;

                    let rows = txs.map(t => {
                      const isPayment = t.type === 'payment';
                      const date = new Date(t.date || t.tarih).toLocaleDateString('tr-TR');
                    let desc = isPayment ? 'Ödeme / Tahsilat' : (t.jobType || 'İşlem');
                    if (t.note) desc = `${desc} - Not: ${t.note}`;
                      const quantity = t.quantity || 1;

                      let hasVal = 0, cashVal = 0, pricePerUnit = 0;
                      if (isPayment) {
                        hasVal = -parseFloat(t.hasAmount || 0);
                        cashVal = -parseFloat(t.cashAmount || 0);
                      } else {
                        hasVal = parseFloat(t.has || 0);
                        pricePerUnit = parseFloat(t.price || t.ucret || 0);
                        cashVal = pricePerUnit * quantity;
                      }

                      totalHas += hasVal;
                      totalCash += cashVal;

                      return `
                          <tr>
                            <td>${date}</td>
                            <td>${desc}</td>
                            <td class="text-right">${!isPayment ? quantity : '-'}</td>
                            <td class="text-right">${hasVal !== 0 ? formatNumber(hasVal) : '-'}</td>
                            <td class="text-right">${!isPayment && pricePerUnit > 0 ? formatNumber(pricePerUnit) + ' x ' + quantity : '-'}</td>
                            <td class="text-right">${cashVal !== 0 ? formatNumber(cashVal) : '-'}</td>
                          </tr>
                        `;
                    }).join('');

                    htmlContent += `
                        <div class="customer-section">
                          <div class="customer-title">${customer}</div>
                          <table>
                            <thead>
                              <tr>
                                <th>Tarih</th>
                                <th>İşlem</th>
                                <th class="text-right">Adet</th>
                                <th class="text-right">Has</th>
                                <th class="text-right">Birim Fiyat</th>
                                <th class="text-right">Toplam</th>
                              </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                          </table>
                          <div class="totals">
                             <span>Dönem Net:</span>
                             <span>Has: ${formatNumber(totalHas)} | Nakit: ${formatNumber(totalCash)}</span>
                          </div>
                        </div>
                      `;
                  });

                  htmlContent += `
                      <script>window.onload = function() { window.print(); window.close(); }</script>
                      </body></html>
                   `;

                  printWindow.document.write(htmlContent);
                  printWindow.document.close();
                }}
                className={`${BTN_TONAL} px-3 py-2 text-sm`}
                title="Listeyi Yazdır"
                aria-label="Listeyi yazdır"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Gold Price Banner (Home Page) */}
        {goldPrice && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="bg-slate-900 p-3 rounded-xl text-white shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 leading-tight">Canlı Altın Kuru</h3>
                <p className="text-slate-500 text-xs font-medium">Altınkaynak verileriyle 10 saniyede bir güncellenir</p>
                {goldUpdatedAt && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Son güncelleme: {goldUpdatedAt.toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center sm:text-right">
                <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold mb-0.5">Gram Altın</span>
                <span className="text-3xl font-bold text-slate-800 font-mono tracking-tighter">
                  {goldPrice} <span className="text-xl">₺</span>
                </span>
              </div>
              <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
              <a
                href="https://www.altinkaynak.com/Altin/Kur/Guncel"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg border border-slate-200 transition-colors text-sm"
              >
                Detaylar
              </a>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Toplam Tahsilat"
            value={formatCurrency(stats.totalIncome)}
            iconClass="bg-emerald-50 text-emerald-600"
            icon={Wallet}
          />
          <StatCard
            title="Toplam Gider"
            value={formatCurrency(totalExpense)}
            iconClass="bg-rose-50 text-rose-600"
            icon={ArrowUpDown}
            onClick={() => setShowExpenseModal(true)}
          />
          <StatCard // Replaced 'Total Receivables' with 'Cash Receivables' or just 'Alacak'
            title="Nakit Alacak"
            value={formatCurrency(stats.totalReceivables)}
            iconClass="bg-amber-50 text-amber-600"
            icon={ArrowUpDown}
          />
          <StatCard // Replaced 'Total Gold' with 'Gold Balance'
            title="Has Alacak (Gr)"
            value={`${formatNumber(stats.totalHasReceivables)}`}
            iconClass="bg-indigo-50 text-indigo-600"
            icon={TrendingUp}
          />
          <StatCard
            title="Gümüş Bakiye (Gr)"
            value={`${formatNumber(stats.totalSilverReceivables)}`}
            iconClass="bg-slate-50 text-slate-600"
            icon={TrendingUp}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">En Çok Kazandıran Müşteriler</h3>
            <div style={{ width: '100%', height: 288 }}>
              {chartData?.topCustomers?.length > 0 ? (
                <ResponsiveContainer width="100%" height={288}>
                  <BarChart data={chartData.topCustomers} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="income" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Henüz veri yok
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Aylık Tahsilat Trendi</h3>
            <div style={{ width: '100%', height: 288 }}>
              {chartData?.monthlyTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height={288}>
                  <LineChart data={chartData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickFormatter={(val) => `₺${val / 1000}k`} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="income" stroke="#475569" strokeWidth={3} dot={{ r: 4, fill: '#475569' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Henüz veri yok
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conditional Content: Customer Table OR Inline Detail */}
        {!customerFilter ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Müşteri Bazlı Özet (Bakiye)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/60">
                  <tr>
                    {[
                      { id: 'name', label: 'Müşteri Adı' },
                      { id: 'count', label: 'İş Sayısı' },
                      { id: 'goldVolume', label: 'İşlenen Has (gr)' },
                      { id: 'silverVolume', label: 'İşlenen Gümüş (gr)' },
                      { id: 'hasBalance', label: 'Has Bakiye' },
                      { id: 'silverBalance', label: 'Gümüş Bakiye' },
                      { id: 'income', label: 'Tahsilat' },
                      { id: 'cashBalance', label: 'Nakit Bakiye' }
                    ].map(col => (
                      <th
                        key={col.id}
                        onClick={() => requestSort(col.id)}
                        className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest cursor-pointer hover:bg-slate-100/60 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortConfig.key === col.id && (
                            <ArrowUpDown className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedCustomers.map((customer) => (
                    <tr
                      key={customer.name}
                      onClick={() => setSelectedCustomer(customer.name)}
                      className="group cursor-pointer transition-colors hover:bg-slate-50/60 hover:opacity-95 hover:shadow-[0_1px_0_0_rgba(15,23,42,0.05)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300/70"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedCustomer(customer.name);
                        }
                      }}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-800 group-hover:text-slate-900">{customer.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{customer.count}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{formatNumber(customer.goldVolume)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{formatNumber(customer.silverVolume || 0)}</td>
                      <td className={`px-6 py-4 text-sm font-bold font-mono ${customer.hasBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatNumber(customer.hasBalance)}
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold font-mono ${customer.silverBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatNumber(customer.silverBalance || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600 font-mono">{formatCurrency(customer.income)}</td>
                      <td className={`px-6 py-4 text-sm font-bold font-mono ${customer.cashBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(customer.cashBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <CustomerDetail
            customer={customerFilter}
            transactions={data[customerFilter] || []}
            dateRange={dateRange}
            isInline={true}
            onEdit={onEdit}
            showToast={showToast}
          />
        )}

        {/* Modal only if NOT filtered and a customer is selected via click */}
        {!customerFilter && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-end p-2 absolute top-3 right-3 z-10">
                <button onClick={() => setSelectedCustomer(null)} className={BTN_ICON} aria-label="Kapat">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <CustomerDetail
                customer={selectedCustomer}
                transactions={data[selectedCustomer] || []}
                dateRange={dateRange}
                onClose={() => setSelectedCustomer(null)}
                onEdit={onEdit}
                showToast={showToast}
              />
            </div>
          </div>
        )}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)}>
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Gider Detayları</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Seçili tarih aralığı için filtreleyebilirsiniz
                  </p>
                </div>
                <button onClick={() => setShowExpenseModal(false)} className={BTN_ICON} aria-label="Kapat">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className={LABEL_BASE}>Tür</label>
                  <select
                    className={SELECT_BASE}
                    value={expenseTypeFilter}
                    onChange={(e) => setExpenseTypeFilter(e.target.value)}
                  >
                    {['Tümü', 'Kira', 'Elektrik', 'Su', 'Doğalgaz', 'Yemek', 'Personel', 'Malzeme', 'Diğer'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={LABEL_BASE}>Açıklama</label>
                  <input
                    type="text"
                    placeholder="Açıklamada ara..."
                    className={INPUT_BASE}
                    value={expenseQuery}
                    onChange={(e) => setExpenseQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {filteredExpenseRows.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/60 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Tarih</th>
                        <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Tür</th>
                        <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Açıklama</th>
                        <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredExpenseRows.map((exp) => (
                        <tr key={exp.id}>
                          <td className="px-6 py-4 text-sm text-slate-600">{new Date(exp.date).toLocaleDateString('tr-TR')}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-medium">{exp.type}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{exp.description || '-'}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-rose-600">{formatCurrency(exp.amount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-10 text-sm text-slate-400">
                    Filtreye uygun gider kaydı yok.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const CustomerDetail = ({ customer, transactions, dateRange, onClose, isInline = false, onEdit, showToast }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const pdfRef = useRef();

  if (!customer) return null;

  const handleDownloadExcel = () => {
    const rows = periodData.map((t) => {
      const isPayment = t.type === 'payment';
      const date = t.date || t.tarih;
      const quantity = t.quantity || 1;

      let label = (t.jobType || t.tamiratIsi || 'İŞLEM');
      let desc = formatWeightWithPurity(t.altinGr || t.goldWeight, t.milyem || t.ayar);
      let hasVal = parseFloat(t.has || 0);
      let pricePerUnit = parseFloat(t.price || t.ucret || 0);
      let cashVal = pricePerUnit * quantity;

      if (isPayment) {
        hasVal = parseFloat(t.hasAmount || 0);
        cashVal = parseFloat(t.cashAmount || 0);
        pricePerUnit = 0;

        if (hasVal > 0 && cashVal > 0) label = 'Nakit ve Has Ödeme';
        else if (hasVal > 0) label = 'Has Ödeme';
        else if (cashVal > 0) label = 'Nakit Ödeme';
        else label = 'Ödeme';

        if (t.autoGenerated) label += ' (Otomatik)';
        desc = 'Tahsilat';
      }

      return {
        Tarih: formatDate(date),
        'İşlem / Tür': label,
        Açıklama: desc,
        Adet: !isPayment ? quantity : '-',
        'Has (Gr)': formatNumber(hasVal || 0),
        'Birim Fiyat': !isPayment && pricePerUnit > 0 ? `${formatNumber(pricePerUnit)} x ${quantity}` : '-',
        'Toplam (TL)': formatCurrency(cashVal || 0),
        Not: t.note || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ekstre');
    XLSX.writeFile(wb, `Ekstre_${customer}_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Excel başarıyla indirildi.', 'success');
  };

  // 1. Sort All Transactions by Date (Newest First)
  const allSorted = [...transactions].sort((a, b) => {
    return new Date(b.date || b.tarih) - new Date(a.date || a.tarih);
  });

  // 2. Filter Logic & Devir Calculation
  const startDate = new Date(dateRange.start).getTime();
  const endDate = new Date(dateRange.end).getTime();

  const periodData = [];
  let previousJobPrice = 0, previousJobHas = 0, previousPaidCash = 0, previousPaidHas = 0;

  allSorted.forEach(t => {
    const tDate = new Date(t.date || t.tarih).getTime();

    // Check if it is AFTER the end date (Future relative to filter)
    // We include up to end of the day roughly, simplified comparison
    if (tDate > endDate + 86400000) {
      return;
    }

    if (tDate >= startDate) {
      periodData.push(t);
    } else {
      // It is BEFORE start date. Contribute to Devir.
      const isJob = t.type === 'job' || (!t.type && t.tamiratIsi);
      const isPayment = t.type === 'payment';

      if (isJob) {
        const price = parseFloat(t.price || t.ucret || 0);
        const qty = t.quantity || 1;
        previousJobPrice += price * qty;
        previousJobHas += parseFloat(t.has || 0) || 0;
      }
      if (isPayment) {
        previousPaidCash += parseFloat(t.cashAmount || 0) || 0;
        previousPaidHas += parseFloat(t.hasAmount || 0) || 0;
      }
    }
  });

  const devirCash = previousJobPrice - previousPaidCash;
  const devirHas = previousJobHas - previousPaidHas;

  // Pagination
  const totalPages = Math.ceil(periodData.length / itemsPerPage);
  const currentData = periodData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Period Totals
  const periodTotals = periodData.reduce((acc, t) => {
    const isJob = t.type === 'job' || (!t.type && t.tamiratIsi);
    const isPayment = t.type === 'payment';

    if (isJob) {
      const price = parseFloat(t.price || t.ucret || 0);
      const qty = t.quantity || 1;
      const totalP = price * qty;
      const has = parseFloat(t.has || 0);
      const gold = parseFloat(t.altinGr || t.goldWeight || 0);
      return {
        ...acc,
        jobCount: acc.jobCount + 1,
        totalJobPrice: acc.totalJobPrice + (isNaN(totalP) ? 0 : totalP),
        totalJobHas: acc.totalJobHas + (isNaN(has) ? 0 : has),
        totalGold: acc.totalGold + (isNaN(gold) ? 0 : gold)
      };
    }
    if (isPayment) {
      const cash = parseFloat(t.cashAmount || 0);
      const has = parseFloat(t.hasAmount || 0);
      return {
        ...acc,
        totalPaid: acc.totalPaid + (isNaN(cash) ? 0 : cash),
        totalPaidHas: acc.totalPaidHas + (isNaN(has) ? 0 : has)
      };
    }
    return acc;
  }, { jobCount: 0, totalJobPrice: 0, totalJobHas: 0, totalGold: 0, totalPaid: 0, totalPaidHas: 0 });

  const finalCashBalance = devirCash + (periodTotals.totalJobPrice - periodTotals.totalPaid);
  const finalHasBalance = devirHas + (periodTotals.totalJobHas - periodTotals.totalPaidHas);

  return (
    <div className={`flex flex-col h-full ${isInline ? 'bg-white rounded-2xl shadow-sm border border-slate-200' : ''}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/60">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            {customer}
            <span className="text-sm font-normal text-slate-500 bg-white px-2 py-1 rounded-full border border-slate-200 shadow-sm">
              {periodTotals.jobCount} İşlem (Dönem)
            </span>
          </h2>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Son Has Bakiye:</span>
              <span className={`font-bold font-mono ${finalHasBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatNumber(finalHasBalance)} gr
              </span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Son Nakit Bakiye:</span>
              <span className={`font-bold font-mono ${finalCashBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(finalCashBalance)}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Dönem İşlenen:</span>
              <span className="font-medium">{formatNumber(periodTotals.totalGold)} gr</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Filtre: {new Date(dateRange.start).toLocaleDateString('tr-TR')} - {new Date(dateRange.end).toLocaleDateString('tr-TR')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadExcel}
            className={`${BTN_PRIMARY} px-4 py-2 text-sm`}
            aria-label="Excel indir"
          >
            <FileDown className="w-4 h-4" /> Excel İndir
          </button>
          {onClose && (
            <button onClick={onClose} className={BTN_ICON} aria-label="Kapat">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div ref={pdfRef} className="flex-1 overflow-auto bg-white p-4">
        {/* PDF Header (Only visible in PDF/Print context conceptually, but here we capture the div) */}
        <div className="hidden printable-header mb-8 border-b-2 border-blue-900 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-blue-900">{APP_NAME}</h1>
              <p className="text-slate-500 text-sm">Müşteri Hesap Ekstresi</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
              <p>Dönem: {new Date(dateRange.start).toLocaleDateString('tr-TR')} - {new Date(dateRange.end).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-0">
          <table className="tx-table w-full text-left border-collapse">
            <thead className="bg-slate-50/70 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Tarih</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">İşlem / Tür</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200">Açıklama</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Adet</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Has (Gr)</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Birim Fiyat</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-right">Toplam (TL)</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-200 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.map((t) => {
                const isPayment = t.type === 'payment';
                const date = t.date || t.tarih;
                const quantity = t.quantity || 1;

                let label = (t.jobType || t.tamiratIsi || 'İŞLEM');
                let desc = formatWeightWithPurity(t.altinGr || t.goldWeight, t.milyem || t.ayar);

                let hasVal = parseFloat(t.has);
                let pricePerUnit = parseFloat(t.price || t.ucret);
                let cashVal = pricePerUnit * quantity;

                if (isPayment) {
                  hasVal = parseFloat(t.hasAmount || 0);
                  cashVal = parseFloat(t.cashAmount || 0);
                  pricePerUnit = 0; // No unit price for payments

                  if (hasVal > 0 && cashVal > 0) label = 'Nakit ve Has Ödeme';
                  else if (hasVal > 0) label = 'Has Ödeme';
                  else if (cashVal > 0) label = 'Nakit Ödeme';
                  else label = 'Ödeme';

                  if (t.autoGenerated) label += ' (Otomatik)';
                  desc = 'Tahsilat';
                }
                const noteText = t.note || '';

                return (
                  <tr
                    key={t.id}
                    className={`group transition-colors hover:opacity-95 hover:shadow-[0_1px_0_0_rgba(15,23,42,0.05)] ${isPayment ? 'bg-emerald-50/30 hover:bg-emerald-50/40' : 'hover:bg-slate-50/60'}`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">{formatDate(date)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`tx-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPayment ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {label}
                      </span>
                      {t.isEdited && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200" title={`Son düzenleme: ${formatDate(t.lastEditedAt)}`}>
                          Düzenlendi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{desc}</div>
                      {noteText ? (
                        <div className="tx-note mt-1 text-[11px] text-slate-400">Not: {noteText}</div>
                      ) : (
                        <div className="tx-note tx-note--empty mt-1 text-[11px] text-slate-300">Not yok</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-right text-slate-600">
                      {!isPayment ? quantity : '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm font-mono text-right ${isPayment ? 'text-green-600 font-bold' : 'text-slate-600'}`}>
                      {isPayment && hasVal > 0 ? '-' : ''}{formatNumber(hasVal || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-right text-slate-600">
                      {!isPayment && pricePerUnit > 0 ? `${formatCurrency(pricePerUnit)} x ${quantity}` : '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm font-mono text-right ${isPayment ? 'text-green-600 font-bold' : 'text-slate-800 font-bold'}`}>
                      {isPayment && cashVal > 0 ? '-' : ''}{formatCurrency(cashVal || 0)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!t.autoGenerated && onEdit && (
                        <button
                          onClick={() => onEdit(t)}
                          className={BTN_ICON}
                          title="Düzenle"
                          aria-label="İşlemi düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* DEVIR ROW */}
              {currentPage === totalPages && (
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td className="px-6 py-4 text-sm text-slate-500 italic block min-w-[120px]">
                    {new Date(dateRange.start).toLocaleDateString('tr-TR')} Öncesi
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-bold italic" colSpan="3">
                    DEVİR / ÖNCEKİ BAKİYE
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold font-mono text-right ${devirHas > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {formatNumber(devirHas)}
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className={`px-6 py-4 text-sm font-bold font-mono text-right ${devirCash > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {formatCurrency(devirCash)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              )}
            </tbody>
          </table>
          {periodData.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <div className="mb-2">Bu tarih aralığında işlem bulunamadı.</div>
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white rounded-b-2xl pdf-hide">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`${BTN_SECONDARY} px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ChevronLeft className="w-4 h-4" /> Önceki
            </button>
            <span className="text-sm text-slate-600 font-medium">
              Sayfa {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`${BTN_SECONDARY} px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Sonraki <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPanel = ({ customers, data, workTypes, onAddCustomer, onDeleteCustomer, onDeleteEntry, onBack, onNavigate, onAddWorkType, onUpdateWorkType, onDeleteWorkType, onImportDefaultPrices }) => {
  const [customerName, setCustomerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [workName, setWorkName] = useState('');
  const [workPrice, setWorkPrice] = useState('');
  const [priceDrafts, setPriceDrafts] = useState({});
  const [isImporting, setIsImporting] = useState(false);

  const entries = useMemo(() => {
    const flattened = Object.entries(data).flatMap(([name, items]) =>
      items.map(item => ({
        ...item,
        customerName: name
      }))
    );
    return flattened
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 50);
  }, [data]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = customerName.trim();
    if (!name) return;
    setIsSaving(true);
    try {
      await onAddCustomer(name);
      setCustomerName('');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkCreate = async (e) => {
    e.preventDefault();
    const name = workName.trim();
    if (!name) return;
    await onAddWorkType(name, workPrice);
    setWorkName('');
    setWorkPrice('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg text-white">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xl tracking-tight">Yönetim</span>
            </div>
        <div className="flex items-center gap-2">
              <button type="button" onClick={() => onNavigate('add-transaction')} className={`${BTN_ACCENT} px-4 py-2 text-sm`}>
                <CheckCircle className="w-4 h-4" /> Yeni İşlem
              </button>
              <button type="button" onClick={onBack} className={`${BTN_SECONDARY} px-4 py-2 text-sm`}>
                <ChevronLeft className="w-4 h-4" /> Geri
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Müşteri Yönetimi</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={LABEL_BASE}>Müşteri Adı</label>
                <input
                  type="text"
                  className={INPUT_BASE}
                  placeholder="Yeni müşteri"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <button type="submit" className={`${BTN_PRIMARY} w-full py-3`} disabled={isSaving}>
                {isSaving ? 'Ekleniyor...' : 'Müşteri Ekle'}
              </button>
            </form>
            <div className="mt-6 space-y-2 max-h-[420px] overflow-auto">
              {customers.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-slate-50/60 border border-slate-200 rounded-xl px-3 py-2">
                  <span className="text-sm text-slate-700">{c.name}</span>
                  <button
                    className={BTN_ICON}
                    aria-label="Müşteri sil"
                    onClick={() => onDeleteCustomer(c.id)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {customers.length === 0 && (
                <div className="text-sm text-slate-400">Müşteri yok</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">İşlemler (Son 50)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/60">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Tarih</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Müşteri</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Tür</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Özet</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{entry.customerName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {entry.type === 'payment' ? 'Ödeme' : 'İşlem'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {entry.type === 'payment'
                          ? 'Tahsilat'
                          : entry.jobType || 'İşlem'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <button
                          className={BTN_ICON}
                          aria-label="İşlemi sil"
                          onClick={() => onDeleteEntry(entry)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-sm text-slate-400" colSpan={5}>
                        Henüz işlem yok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Yapılan İş / Fiyat</h2>
            {workTypes.length === 0 && onImportDefaultPrices && (
              <button
                type="button"
                className={`${BTN_ACCENT} px-4 py-2 text-sm`}
                onClick={async () => {
                  setIsImporting(true);
                  try {
                    await onImportDefaultPrices();
                  } finally {
                    setIsImporting(false);
                  }
                }}
                disabled={isImporting}
              >
                {isImporting ? 'Yükleniyor...' : 'Varsayılan Fiyatları Yükle'}
              </button>
            )}
          </div>
          <form onSubmit={handleWorkCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={LABEL_BASE}>İş Adı</label>
              <input
                type="text"
                className={INPUT_BASE}
                placeholder="Örn: Yüzük Rodaj"
                value={workName}
                onChange={(e) => setWorkName(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_BASE}>Varsayılan Fiyat (TL)</label>
              <input
                type="number"
                className={INPUT_BASE}
                placeholder="0"
                value={workPrice}
                onChange={(e) => setWorkPrice(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className={`${BTN_PRIMARY} w-full py-3`}>İş Ekle</button>
            </div>
          </form>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/60">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">İş</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Fiyat</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {workTypes.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-sm text-slate-700">{w.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <input
                        type="number"
                        className={INPUT_BASE}
                        value={priceDrafts[w.id] ?? (w.default_price ?? '')}
                        onChange={(e) => setPriceDrafts(prev => ({ ...prev, [w.id]: e.target.value }))}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className={BTN_TONAL}
                          onClick={() => onUpdateWorkType(w.id, priceDrafts[w.id] ?? w.default_price)}
                          type="button"
                        >
                          Kaydet
                        </button>
                        <button
                          className={BTN_ICON}
                          onClick={() => onDeleteWorkType(w.id)}
                          aria-label="İşi sil"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {workTypes.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-sm text-slate-400" colSpan={3}>
                      Henüz iş tanımı yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};


// --- App Container ---


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [expenses, setExpenses] = useState([]);
  const [transactions, setTransactions] = useState({});
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [customers, setCustomers] = useState([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthAction, setIsAuthAction] = useState(false);
  const [workTypes, setWorkTypes] = useState([]);

  const withTimeout = (promise, ms, message) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
    ]);
  };

  const customerOptions = useMemo(() => {
    return [...new Set(customers.map(c => c.name))].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [customers]);

  const fetchAllData = async () => {
    const [customersRes, transactionsRes, paymentsRes, expensesRes] = await Promise.all([
      supabase.from('customers').select('id, name'),
      supabase.from('transactions').select('id, customer_id, job_type, quantity, milyem, gold_weight, price, has, is_paid, date, note, is_edited, last_edited_at'),
      supabase.from('payments').select('id, customer_id, has_amount, silver_amount, cash_amount, date, note, is_auto_generated, is_edited, last_edited_at'),
      supabase.from('expenses').select('id, type, description, amount, date')
    ]);
    const workTypesRes = await supabase.from('work_types').select('id, name, default_price, is_active');

    if (customersRes.error) {
      showToast(`Müşteriler yüklenemedi: ${customersRes.error.message}`, 'error');
    }
    if (transactionsRes.error) {
      showToast(`İşlemler yüklenemedi: ${transactionsRes.error.message}`, 'error');
    }
    if (paymentsRes.error) {
      showToast(`Ödemeler yüklenemedi: ${paymentsRes.error.message}`, 'error');
    }
    if (expensesRes.error) {
      showToast(`Giderler yüklenemedi: ${expensesRes.error.message}`, 'error');
    }
    if (workTypesRes.error) {
      showToast(`İş listesi yüklenemedi: ${workTypesRes.error.message}`, 'error');
    }

    const customersData = customersRes.data || [];
    const workTypesData = (workTypesRes.data || []).filter(w => w.is_active !== false);
    setCustomers(customersData);
    setWorkTypes(workTypesData);

    const customerMap = new Map(customersData.map(c => [c.id, c.name]));
    const grouped = {};

    (transactionsRes.data || []).forEach(t => {
      const customerName = customerMap.get(t.customer_id);
      if (!customerName) return;
      if (!grouped[customerName]) grouped[customerName] = [];
      grouped[customerName].push({
        id: t.id,
        type: 'job',
        customer: customerName,
        quantity: t.quantity,
        jobType: t.job_type,
        milyem: t.milyem,
        goldWeight: t.gold_weight,
        price: t.price,
        has: t.has,
        isPaid: t.is_paid,
        date: t.date,
        note: t.note || '',
        isEdited: t.is_edited,
        lastEditedAt: t.last_edited_at
      });
    });

    (paymentsRes.data || []).forEach(p => {
      const customerName = customerMap.get(p.customer_id);
      if (!customerName) return;
      if (!grouped[customerName]) grouped[customerName] = [];
      grouped[customerName].push({
        id: p.id,
        type: 'payment',
        customer: customerName,
        hasAmount: p.has_amount,
        silverAmount: p.silver_amount,
        cashAmount: p.cash_amount,
        date: p.date,
        note: p.note || '',
        autoGenerated: p.is_auto_generated,
        isEdited: p.is_edited,
        lastEditedAt: p.last_edited_at
      });
    });

    setTransactions(grouped);
    setExpenses(expensesRes.data || []);
  };

  // Auth & Data Load - Gün boyu açık kalacak uygulama için optimize edildi
  useEffect(() => {
    let mounted = true;
    let refreshInterval = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) {
          // Hata durumunda yeniden dene
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(init, 3000); // 3 saniye sonra tekrar dene
            return;
          }
          showToast('Oturum doğrulanamadı. Sayfa yenilenecek...', 'error');
          setTimeout(() => window.location.reload(), 5000);
          return;
        }
        retryCount = 0; // Başarılı olunca sıfırla
        const session = data?.session;
        setUser(session?.user || null);
        setIsAuthenticated(!!session);
        if (session) {
          await fetchAllData();
          hasInitialized = true; // Init tamamlandı
        }
      } catch (err) {
        if (mounted && retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(init, 3000);
          return;
        }
        if (mounted) {
          showToast('Bağlantı hatası. Sayfa yenilenecek...', 'error');
          setTimeout(() => window.location.reload(), 5000);
        }
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    };
    init();

    // Her 5 dakikada bir verileri yenile (gün boyu açık kalacak uygulama için)
    refreshInterval = setInterval(async () => {
      if (mounted && isAuthenticated) {
        try {
          await fetchAllData();
        } catch (err) {
          // Silent refresh error
        }
      }
    }, 5 * 60 * 1000); // 5 dakika

    let lastFetchTime = Date.now();
    let hasInitialized = false;
    const MIN_FETCH_INTERVAL = 10000; // 10 saniye

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      setUser(session?.user || null);
      setIsAuthenticated(!!session);
      
      // İlk yükleme zaten init() tarafından yapıldı, SIGNED_IN event'ini görmezden gel
      if (event === 'SIGNED_IN') {
        if (!hasInitialized) {
          // Sadece gerçek yeni girişlerde veri çek (init'ten sonra olmamalı ama güvenlik için)
          hasInitialized = true;
          await fetchAllData();
          lastFetchTime = Date.now();
        }
      } else if (event === 'SIGNED_OUT') {
        hasInitialized = false;
        setTransactions({});
        setExpenses([]);
        setCustomers([]);
        setWorkTypes([]);
      }
      setIsAuthLoading(false);
    });

    // Sayfa görünür olduğunda verileri yenile (sekme değişikliği sonrası) - debounce ile
    let visibilityTimeout = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted && isAuthenticated) {
        // Son fetch'ten en az 10 saniye geçmişse yenile
        const now = Date.now();
        if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
          return;
        }
        
        // Debounce: 2 saniye bekle, eğer tekrar görünür olursa iptal et
        if (visibilityTimeout) clearTimeout(visibilityTimeout);
        visibilityTimeout = setTimeout(() => {
          fetchAllData();
          lastFetchTime = Date.now();
        }, 2000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      if (refreshInterval) clearInterval(refreshInterval);
      if (visibilityTimeout) clearTimeout(visibilityTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener?.subscription?.unsubscribe();
    };
  }, [isAuthenticated]);

  const handleLogin = async (email, password) => {
    setIsAuthAction(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showToast(error.message || 'Giriş başarısız', 'error');
      setIsAuthAction(false);
      return;
    }
    setUser(data.user);
    setIsAuthenticated(true);
    await fetchAllData();
    showToast('Giriş başarılı!', 'success');
    setIsAuthAction(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setTransactions({});
    setExpenses([]);
    setCustomers([]);
  };

  const navigate = (route) => {
    if (route === 'dashboard') {
      setEditingTransaction(null);
    }
    setCurrentRoute(route);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    navigate('add-transaction');
  };

  const handleTransactionSubmit = async (formData) => {
    if (!formData) return;
    if (!isAuthenticated) {
      showToast('Oturum yok. Lütfen tekrar giriş yapın.', 'error');
      return;
    }

    const entryType = formData.entryType || formData.type;

    if (entryType === 'expense') {
      try {
        if (formData.id) {
          const { error } = await supabase.from('expenses')
            .update({
              type: formData.type,
              description: formData.description || '',
              amount: parseFloat(formData.amount || 0),
              date: formData.date
            })
            .eq('id', formData.id);
          if (error) {
            return showToast(error.message || 'Gider güncellenemedi.', 'error');
          }
          showToast('Gider güncellendi!', 'success');
        } else {
          const { error } = await supabase.from('expenses').insert({
            type: formData.type,
            description: formData.description || '',
            amount: parseFloat(formData.amount || 0),
            date: formData.date
          });
          if (error) {
            return showToast(error.message || 'Gider kaydedilemedi.', 'error');
          }
          showToast('Gider kaydedildi!', 'success');
        }
        await fetchAllData();
        navigate('dashboard');
      } catch (err) {
        showToast(err.message || 'Gider kaydedilemedi.', 'error');
      }
      return;
    }

    const customerName = formData.customer?.trim();
    if (!customerName) return showToast('Firma adı boş olamaz.', 'warning');

    let customerRow = null;
    try {
      // Önce müşteriyi bul
      const { data: existingCustomer, error: selectError } = await supabase
        .from('customers')
        .select('id, name')
        .eq('name', customerName)
        .maybeSingle();
      
      if (selectError) {
        showToast(selectError.message || 'Müşteri kontrolü yapılamadı.', 'error');
        return;
      }
      
      if (existingCustomer) {
        // Müşteri zaten var
        customerRow = existingCustomer;
      } else {
        // Müşteri yok, oluştur
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({ name: customerName })
          .select('id, name')
          .single();
        
        if (insertError) {
          showToast(insertError.message || 'Müşteri kaydı oluşturulamadı.', 'error');
          return;
        }
        
        if (!newCustomer) {
          showToast('Müşteri kaydı oluşturulamadı.', 'error');
          return;
        }
        
        customerRow = newCustomer;
      }
    } catch (err) {
      showToast(err.message || 'Müşteri kaydı oluşturulamadı.', 'error');
      return;
    }

    if (!customerRow || !customerRow.id) {
      showToast('Müşteri ID bulunamadı.', 'error');
      return;
    }

    const customerId = customerRow.id;
    const nowIso = new Date().toISOString();

    if (entryType === 'payment') {
      try {
        if (formData.id) {
          const { error } = await supabase.from('payments')
            .update({
              customer_id: customerId,
              has_amount: parseFloat(formData.hasAmount || 0),
              silver_amount: parseFloat(formData.silverAmount || 0),
              cash_amount: parseFloat(formData.cashAmount || 0),
              date: formData.date,
              note: formData.note || '',
              is_edited: true,
              last_edited_at: nowIso
            })
            .eq('id', formData.id);
          if (error) {
            return showToast(error.message || 'Ödeme güncellenemedi.', 'error');
          }
          showToast('Ödeme güncellendi!', 'success');
        } else {
          const { error } = await supabase.from('payments').insert({
            customer_id: customerId,
            has_amount: parseFloat(formData.hasAmount || 0),
            silver_amount: parseFloat(formData.silverAmount || 0),
            cash_amount: parseFloat(formData.cashAmount || 0),
            date: formData.date,
            note: formData.note || '',
            is_auto_generated: false,
            is_edited: false
          });
          if (error) {
            return showToast(error.message || 'Ödeme kaydedilemedi.', 'error');
          }
          showToast('Ödeme başarıyla kaydedildi!', 'success');
        }
        await fetchAllData();
        navigate('dashboard');
      } catch (err) {
        showToast(err.message || 'Ödeme kaydedilemedi.', 'error');
      }
      return;
    }

    if (entryType === 'job') {
      try {
        const jobTypeName = (formData.jobType || '').trim();
        if (jobTypeName) {
          const exists = workTypes.some(t => (t.name || '').toLocaleLowerCase('tr-TR') === jobTypeName.toLocaleLowerCase('tr-TR'));
          if (!exists) {
            const { error: workTypeError } = await supabase.from('work_types').insert({
              name: jobTypeName,
              default_price: formData.price === '' ? null : parseFloat(formData.price || 0),
              is_active: true
            });
            if (workTypeError) {
              showToast(workTypeError.message || 'İş türü eklenemedi.', 'error');
              return;
            }
          }
        }
        if (formData.id) {
          // Eski transaction bilgisini al (müşteri değişikliğini kontrol etmek için)
          const { data: oldTransaction } = await supabase
            .from('transactions')
            .select('customer_id, is_paid, has, price, date')
            .eq('id', formData.id)
            .single();
          
          const oldCustomerId = oldTransaction?.customer_id;
          const oldIsPaid = oldTransaction?.is_paid;
          const isCustomerChanged = oldCustomerId && oldCustomerId !== customerId;
          const isPaid = !!formData.isPaid;

          const updateData = {
            customer_id: customerId,
            job_type: formData.jobType || '',
            quantity: parseInt(formData.quantity || 1, 10),
            milyem: formData.milyem || '',
            gold_weight: parseFloat(formData.goldWeight || 0),
            price: parseFloat(formData.price || 0),
            has: parseFloat(formData.has || 0),
            is_paid: isPaid,
            date: formData.date,
            note: formData.note || '',
            is_edited: true,
            last_edited_at: nowIso
          };
          const { data, error } = await supabase.from('transactions')
            .update(updateData)
            .eq('id', formData.id)
            .select();
          if (error) {
            showToast(error.message || 'İşlem güncellenemedi.', 'error');
            return;
          }
          if (!data || data.length === 0) {
            showToast('İşlem bulunamadı veya güncellenemedi.', 'error');
            return;
          }

          // Eğer ödeme alındıysa ve müşteri değiştiyse, ödeme kaydını da güncelle
          if (isPaid && isCustomerChanged && oldCustomerId) {
            const hasAmount = parseFloat(formData.has || 0);
            const cashAmount = parseFloat(formData.price || 0);
            const paymentDate = formData.date;

            // Eski müşteriye ait, otomatik oluşturulan ödeme kaydını bul
            const { data: oldPayments, error: findError } = await supabase
              .from('payments')
              .select('id')
              .eq('customer_id', oldCustomerId)
              .eq('date', paymentDate)
              .eq('has_amount', hasAmount)
              .eq('cash_amount', cashAmount)
              .eq('is_auto_generated', true)
              .limit(1);

            if (!findError && oldPayments && oldPayments.length > 0) {
              // Ödeme kaydını yeni müşteriye taşı
              const { error: paymentUpdateError } = await supabase
                .from('payments')
                .update({
                  customer_id: customerId,
                  has_amount: hasAmount,
                  cash_amount: cashAmount,
                  date: paymentDate,
                  is_edited: true,
                  last_edited_at: nowIso
                })
                .eq('id', oldPayments[0].id);

              if (paymentUpdateError) {
                showToast('İşlem güncellendi ancak ödeme kaydı güncellenemedi.', 'warning');
              }
            } else if (isPaid && !oldIsPaid) {
              // Ödeme durumu false -> true oldu, yeni ödeme kaydı oluştur
              const { error: payError } = await supabase.from('payments').insert({
                customer_id: customerId,
                has_amount: hasAmount,
                cash_amount: cashAmount,
                date: paymentDate,
                note: 'Otomatik ödeme',
                is_auto_generated: true,
                is_edited: false
              });
              if (payError) {
                showToast('İşlem güncellendi ancak ödeme kaydı oluşturulamadı.', 'warning');
              }
            }
          } else if (isPaid && !oldIsPaid) {
            // Ödeme durumu false -> true oldu, yeni ödeme kaydı oluştur
            const { error: payError } = await supabase.from('payments').insert({
              customer_id: customerId,
              has_amount: parseFloat(formData.has || 0),
              cash_amount: parseFloat(formData.price || 0),
              date: formData.date,
              note: 'Otomatik ödeme',
              is_auto_generated: true,
              is_edited: false
            });
            if (payError) {
              showToast('İşlem güncellendi ancak ödeme kaydı oluşturulamadı.', 'warning');
            }
          } else if (!isPaid && oldIsPaid) {
            // Ödeme durumu true -> false oldu, otomatik oluşturulan ödeme kaydını sil
            const hasAmount = parseFloat(formData.has || oldTransaction?.has || 0);
            const cashAmount = parseFloat(formData.price || oldTransaction?.price || 0);
            const paymentDate = formData.date || oldTransaction?.date;

            // Otomatik oluşturulan ödeme kaydını bul ve sil
            const { data: autoPayments, error: findError } = await supabase
              .from('payments')
              .select('id')
              .eq('customer_id', customerId)
              .eq('date', paymentDate)
              .eq('has_amount', hasAmount)
              .eq('cash_amount', cashAmount)
              .eq('is_auto_generated', true)
              .limit(1);

            if (!findError && autoPayments && autoPayments.length > 0) {
              const { error: deleteError } = await supabase
                .from('payments')
                .delete()
                .eq('id', autoPayments[0].id);

              if (deleteError) {
                showToast('İşlem güncellendi ancak ödeme kaydı silinemedi.', 'warning');
              }
            }
          }

          showToast('İşlem güncellendi!', 'success');
        } else {
          const insertData = {
            customer_id: customerId,
            job_type: formData.jobType || '',
            quantity: parseInt(formData.quantity || 1, 10),
            milyem: formData.milyem || '',
            gold_weight: parseFloat(formData.goldWeight || 0),
            price: parseFloat(formData.price || 0),
            has: parseFloat(formData.has || 0),
            is_paid: !!formData.isPaid,
            date: formData.date,
            note: formData.note || '',
            is_edited: false
          };
          const { error } = await supabase.from('transactions').insert(insertData).select();
          if (error) {
            return showToast(error.message || 'İşlem kaydedilemedi.', 'error');
          }

          if (formData.isPaid) {
            const { error: payError } = await supabase.from('payments').insert({
              customer_id: customerId,
              has_amount: parseFloat(formData.has || 0),
              cash_amount: parseFloat(formData.price || 0),
              date: formData.date,
              note: 'Otomatik ödeme',
              is_auto_generated: true,
              is_edited: false
            });
            if (payError) {
              showToast(payError.message || 'Otomatik ödeme kaydedilemedi.', 'error');
            }
          }
          showToast('İşlem başarıyla kaydedildi!', 'success');
        }
        await fetchAllData();
        navigate('dashboard');
      } catch (err) {
        showToast(err.message || 'İşlem kaydedilemedi.', 'error');
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} showToast={showToast} isLoading={isAuthAction} />;
  }

  if (currentRoute === 'add-transaction') {
    return (
      <TransactionForm
        onBack={() => navigate('dashboard')}
        onSubmit={handleTransactionSubmit}
        initialData={editingTransaction}
        showToast={showToast}
        customers={customerOptions}
        workTypes={workTypes}
      />
    );
  }

  if (currentRoute === 'admin') {
    return (
      <AdminPanel
        customers={customers}
        workTypes={workTypes}
        data={transactions}
        onAddCustomer={async (name) => {
          try {
            const { error } = await supabase.from('customers').upsert({ name }, { onConflict: 'name' }).select();
            if (error) {
              showToast(`Müşteri eklenemedi: ${error.message}`, 'error');
              return;
            }
            await fetchAllData();
            showToast('Müşteri eklendi.', 'success');
          } catch (err) {
            showToast(err.message || 'Müşteri eklenemedi.', 'error');
          }
        }}
        onDeleteCustomer={async (id) => {
          if (!window.confirm('Müşteriyi silmek istediğinize emin misiniz?')) return;
          const { error } = await supabase.from('customers').delete().eq('id', id);
          if (error) {
            showToast('Müşteri silinemedi.', 'error');
            return;
          }
          await fetchAllData();
          showToast('Müşteri silindi.', 'success');
        }}
        onDeleteEntry={async (entry) => {
          if (!window.confirm('İşlemi silmek istediğinize emin misiniz?')) return;
          const table = entry.type === 'payment' ? 'payments' : 'transactions';
          const { error } = await supabase.from(table).delete().eq('id', entry.id);
          if (error) {
            showToast('İşlem silinemedi.', 'error');
            return;
          }
          await fetchAllData();
          showToast('İşlem silindi.', 'success');
        }}
        onAddWorkType={async (name, price) => {
          try {
            const { error } = await supabase.from('work_types').insert({
              name,
              default_price: price === '' ? null : parseFloat(price || 0),
              is_active: true
            }).select();
            if (error) {
              showToast(`İş eklenemedi: ${error.message}`, 'error');
              return;
            }
            await fetchAllData();
            showToast('İş eklendi.', 'success');
          } catch (err) {
            showToast(err.message || 'İş eklenemedi.', 'error');
          }
        }}
        onUpdateWorkType={async (id, price) => {
          const { error } = await supabase.from('work_types')
            .update({ default_price: price === '' ? null : parseFloat(price || 0) })
            .eq('id', id);
          if (error) {
            showToast('Fiyat güncellenemedi.', 'error');
            return;
          }
          await fetchAllData();
          showToast('Fiyat güncellendi.', 'success');
        }}
        onDeleteWorkType={async (id) => {
          if (!window.confirm('İşi silmek istediğinize emin misiniz?')) return;
          const { error } = await supabase.from('work_types').delete().eq('id', id);
          if (error) {
            showToast('İş silinemedi.', 'error');
            return;
          }
          await fetchAllData();
          showToast('İş silindi.', 'success');
        }}
        onImportDefaultPrices={async () => {
          const parsePrice = (priceStr) => {
            if (!priceStr) return null;
            // "150 - 250" gibi aralıklar için ilk değeri al
            const match = priceStr.match(/^(\d+)/);
            return match ? parseFloat(match[1]) : null;
          };
          
          const items = TRANSACTION_PRICES.map(p => ({
            name: p.name.trim(),
            default_price: parsePrice(p.price),
            is_active: true
          }));
          
          const { error } = await supabase.from('work_types').upsert(items, { onConflict: 'name' });
          if (error) {
            showToast(`Fiyatlar yüklenemedi: ${error.message}`, 'error');
            return;
          }
          await fetchAllData();
          showToast(`${items.length} iş türü başarıyla yüklendi!`, 'success');
        }}
        onBack={() => navigate('dashboard')}
        onNavigate={navigate}
      />
    );
  }

  return (
    <>
      <Dashboard
        user={user?.email || user?.user_metadata?.name || 'Kullanıcı'}
        onLogout={handleLogout}
        onNavigate={navigate}
        data={transactions}
        expenses={expenses}
        onEdit={handleEdit}
        showToast={showToast}
        customers={customerOptions}
      />

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
          />
        ))}
      </div>
    </>
  );
}

export default App;
