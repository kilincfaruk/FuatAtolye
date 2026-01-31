import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  LayoutDashboard, Users, LogOut, TrendingUp, Wallet, CheckCircle,
  Search, X, ChevronLeft, ChevronRight, Calendar, User, ArrowUpDown, Printer, Edit, FileDown, Share2, AlertCircle, Info,
  Inbox, BarChart3, FileText, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient.js';


const APP_NAME = "KUYUMCU ATÖLYESİ";


const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 }).format(num);
};

const formatGram = (num) => {
  const value = parseFloat(num) || 0;
  return value.toFixed(3);
};

const formatWeightWithPurity = (weightValue, purityValue) => {
  const weight = parseFloat(weightValue);
  if (isNaN(weight) || weight === 0) return '';
  const purity = (purityValue ?? '').toString().trim();
  const weightText = `${formatGram(weight)} gr`;
  return purity ? `${weightText} (${purity})` : weightText;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

const LABEL_BASE = "block text-[13px] font-medium text-slate-300 mb-1.5 tracking-wide";
const INPUT_BASE = "w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-800 text-[14px] text-slate-100 placeholder:text-slate-500 outline-none transition-colors hover:border-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20";
const SELECT_BASE = `${INPUT_BASE} pr-10`;
const BTN_BASE = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold min-h-[44px] transition-colors focus:outline-none focus:ring-1 focus:ring-amber-500/20 focus:ring-offset-2 focus:ring-offset-slate-900";
const BTN_PRIMARY = `${BTN_BASE} bg-amber-500 text-slate-900 hover:bg-amber-400`;
const BTN_ACCENT = `${BTN_BASE} bg-emerald-500 text-white hover:bg-emerald-400`;
const BTN_SECONDARY = `${BTN_BASE} bg-slate-700 text-slate-200 border border-slate-600 hover:bg-slate-600`;
const BTN_TONAL = `${BTN_BASE} bg-slate-700 text-slate-200 hover:bg-slate-600 px-4 py-2`;
const BTN_ICON = "p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/20";
const TAB_BASE = "flex-1 text-sm font-semibold rounded-lg px-3 py-2 transition-colors";



const Skeleton = ({ className = "" }) => (
  <div className={`skeleton ${className}`}></div>
);

const SkeletonCard = () => (
  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);

const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
    <div className="p-6 border-b border-slate-700">
      <Skeleton className="h-6 w-48" />
    </div>
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="empty-state-icon mb-4 p-4 bg-slate-700/50 rounded-full">
      <Icon className="w-12 h-12 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 text-center max-w-xs">{description}</p>}
  </div>
);

const Toast = ({ message, type, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-slate-300" />
  };

  const bgColors = {
    success: 'bg-emerald-900/90 border-emerald-700',
    error: 'bg-rose-900/90 border-rose-700',
    warning: 'bg-amber-900/90 border-amber-700',
    info: 'bg-slate-800 border-slate-600'
  };

  return (
    <div className={`toast-animated flex items-center gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-sm max-w-sm ${bgColors[type]}`}>
      {icons[type]}
      <p className="text-sm font-semibold text-slate-100 flex-1">{message}</p>
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mb-4">
            <Users className="w-7 h-7 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">{APP_NAME}</h1>
          <p className="text-slate-400 text-sm mt-1">Yönetim Paneli Girişi</p>
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
    className={`card-hover bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 hover:border-slate-600 ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[13px] font-semibold text-slate-400 mb-1 tracking-wide">{title}</p>
        <h3 className="text-[26px] leading-tight font-bold text-slate-100">{value}</h3>
        {subtext && <p className="text-[11px] text-slate-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${iconClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);



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
  const [activeTab, setActiveTab] = useState('job');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [goldPriceForPrint, setGoldPriceForPrint] = useState('');

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

  const [expenseData, setExpenseData] = useState({
    type: 'Diğer',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  });

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

  const handlePrint = (e) => {
    e.preventDefault();
    if (!jobData.customer || !jobData.jobType) {
      showToast('Lütfen önce işlem detaylarını doldurun.', 'warning');
      return;
    }
    setShowPrintModal(true);
  };

  const handlePrintConfirm = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) return;

    const isSilver = isSilverMilyem(jobData.milyem);
    const hasLabel = isSilver ? 'Gümüş' : 'Has Altın';
    const hasValue = calculatedJobHas ? parseFloat(calculatedJobHas) : 0;
    const hasValueStr = hasValue ? `${hasValue.toFixed(3)} gr` : '';
    const weightDesc = formatWeightWithPurity(jobData.goldWeight, jobData.milyem);
    
    const goldPrice = parseFloat(goldPriceForPrint) || 0;
    const hasTLValue = !isSilver && hasValue && goldPrice ? (hasValue * goldPrice) : 0;
    
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
            .gold-calc { font-size: 12px; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; text-align: left; }
            .gold-calc div { margin-bottom: 4px; }
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
            ${hasValueStr ? `<div style="font-size: 13px; margin-top: 6px;">${hasLabel}: ${hasValueStr}</div>` : ''}
            ${jobData.note ? `<div style="font-size: 12px; margin-top: 6px;">Not: ${jobData.note}</div>` : ''}
            ${jobData.price ? `<div style="margin-top: 10px; font-size: 20px;">${formatCurrency(jobData.price)}</div>` : ''}
            ${jobData.isPaid ? `<div style="margin-top: 10px; padding: 8px; background: #d4edda; border: 2px solid #28a745; border-radius: 4px; color: #155724; font-size: 14px; font-weight: bold;">✓ PEŞİN ALINDI</div>` : ''}
          </div>
          
          ${!isSilver && goldPrice > 0 && hasValue > 0 ? `
          <div class="gold-calc">
            <div><strong>Has Altın Gram Fiyatı:</strong> ${formatCurrency(goldPrice)}</div>
            <div><strong>${hasLabel} Borcu:</strong> ${hasValue.toFixed(3)} gr</div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #999;">
              <strong>TL Karşılığı:</strong> ${formatCurrency(hasTLValue)}
            </div>
            <div style="font-size: 10px; color: #666; margin-top: 4px;">
              * altinkaynak.com referans fiyatı
            </div>
          </div>
          ` : ''}
          
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
    setShowPrintModal(false);
    setGoldPriceForPrint('');
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
    <div className="flex bg-slate-900 p-1 rounded-2xl mb-6 border border-slate-700">
      <button
        type="button"
        disabled={!!initialData}
        onClick={() => setActiveTab('job')}
        className={`${TAB_BASE} ${activeTab === 'job'
          ? 'bg-slate-700 text-amber-400 border border-slate-600 shadow-sm'
          : 'text-slate-400 hover:text-slate-200'
          } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        İşlem Gir
      </button>
      <button
        type="button"
        disabled={!!initialData}
        onClick={() => setActiveTab('payment')}
        className={`${TAB_BASE} ${activeTab === 'payment'
          ? 'bg-slate-700 text-amber-400 border border-slate-600 shadow-sm'
          : 'text-slate-400 hover:text-slate-200'
          } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Ödeme Al
      </button>
      <button
        type="button"
        disabled={!!initialData}
        onClick={() => setActiveTab('expense')}
        className={`${TAB_BASE} ${activeTab === 'expense'
          ? 'bg-slate-700 text-amber-400 border border-slate-600 shadow-sm'
          : 'text-slate-400 hover:text-slate-200'
          } ${initialData ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        Gider Ekle
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <nav className="bg-slate-800 text-white shadow-lg sticky top-0 z-40 border-b border-slate-700">
        <div className="max-w-md mx-auto px-4 w-full">
          <div className="flex items-center h-16 relative justify-center">
            <button
              onClick={onBack}
              className="absolute left-0 p-2 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2 text-sm text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" /> Geri
            </button>
            <span className="font-bold text-lg text-amber-400">
              {initialData ? 'İşlemi Düzenle' : (activeTab === 'job' ? 'Yeni İşlem' : activeTab === 'expense' ? 'Yeni Gider' : 'Tahsilat')}
            </span>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-7">
          <Tabs />

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
                  <p className="mt-2 text-xs text-emerald-400">
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
                    <p className="mt-2 text-xs text-emerald-400">
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
                  <p className="mt-2 text-xs text-emerald-400">
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
                  <p className="text-[10px] text-amber-400 mt-1 truncate">
                    Ref: {workTypes.find(t => t.name === jobData.jobType)?.default_price ?? '-'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_BASE}>{isSilverMilyem(jobData.milyem) ? 'Gümüş (Gr)' : 'Altın (Gr)'}</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000"
                    className={INPUT_BASE}
                    value={jobData.goldWeight}
                    onChange={e => setJobData({ ...jobData, goldWeight: e.target.value })}
                  />
                  {calculatedJobHas && (
                    <p className="text-[10px] text-emerald-400 mt-1 font-bold bg-emerald-900/50 px-1 py-0.5 rounded inline-block">
                      {isSilverMilyem(jobData.milyem) ? 'Gümüş' : 'Has'}: {parseFloat(calculatedJobHas).toFixed(3)} gr
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

              <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-slate-600 cursor-pointer hover:border-slate-500 transition-colors" onClick={() => setJobData(p => ({ ...p, isPaid: !p.isPaid }))}>
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${jobData.isPaid ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-700 border-slate-500'}`}>
                  {jobData.isPaid && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <span className={`text-sm font-medium select-none ${jobData.isPaid ? 'text-emerald-400' : 'text-slate-300'}`}>
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
                  step="0.001"
                  placeholder="0.000"
                  className={INPUT_BASE}
                  value={paymentData.hasAmount}
                  onChange={e => setPaymentData({ ...paymentData, hasAmount: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">Varsa hurda/has ödemesi</p>
              </div>

              <div>
                <label className={LABEL_BASE}>Gümüş (Gr)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="0.000"
                  className={INPUT_BASE}
                  value={paymentData.silverAmount}
                  onChange={e => setPaymentData({ ...paymentData, silverAmount: e.target.value })}
                />
                <p className="text-xs text-slate-400 mt-1">Gümüş ödemesi varsa</p>
              </div>

              <button
                type="submit"
                className={`${BTN_PRIMARY} w-full py-3 mt-2`}
              >
                {initialData ? 'Güncelle' : 'Ödemeyi Al'}
              </button>
            </form>
          )}

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

      {showPrintModal && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowPrintModal(false)}>
          <div className="modal-content bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-100">Adisyon Yazdır</h3>
              <button onClick={() => setShowPrintModal(false)} className={BTN_ICON}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={LABEL_BASE}>Has Altın Gram Fiyatı (TL)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Örn: 3250.00"
                  className={INPUT_BASE}
                  value={goldPriceForPrint}
                  onChange={e => setGoldPriceForPrint(e.target.value)}
                  autoFocus
                />
                <a 
                  href="https://www.altinkaynak.com/Altin/Kur/Guncel" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-amber-400 hover:text-amber-300"
                >
                  <TrendingUp className="w-3 h-3" />
                  altinkaynak.com güncel fiyatlar
                </a>
              </div>

              {calculatedJobHas && !isSilverMilyem(jobData.milyem) && goldPriceForPrint && (
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-700">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Has Altın:</span>
                    <span className="text-slate-200 font-mono">{parseFloat(calculatedJobHas).toFixed(3)} gr</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Gram Fiyatı:</span>
                    <span className="text-slate-200 font-mono">{formatCurrency(parseFloat(goldPriceForPrint) || 0)}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-slate-700">
                    <span className="text-slate-300 font-semibold">TL Karşılığı:</span>
                    <span className="text-amber-400 font-bold font-mono">
                      {formatCurrency((parseFloat(calculatedJobHas) || 0) * (parseFloat(goldPriceForPrint) || 0))}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className={`${BTN_SECONDARY} flex-1 py-3`}
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={handlePrintConfirm}
                  className={`${BTN_PRIMARY} flex-1 py-3`}
                >
                  <Printer className="w-4 h-4" /> Yazdır
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  const [showListPrintModal, setShowListPrintModal] = useState(false);
  const [listPrintGoldPrice, setListPrintGoldPrice] = useState('');

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
      }
    };

    fetchGoldPrice();

    const interval = setInterval(fetchGoldPrice, 10000);

    return () => clearInterval(interval);
  }, []);

  const filteredData = useMemo(() => {
    let currentData = data;

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
        expense: 0,
        fullDate: monthKey
      };
    });

    Object.values(filteredData).flat().forEach(t => {
      if (t.type === 'payment' || t.isPaid) {
        const tDate = t.date || t.tarih;
        const tMonth = tDate.slice(0, 7);
        const monthStats = monthlyTrend.find(m => m.fullDate === tMonth);
        if (monthStats) {
          const amount = t.type === 'payment' ? (parseFloat(t.cashAmount) || 0) : (parseFloat(t.ucret) || 0);
          monthStats.income += amount;
        }
      }
    });

    if (expenses && expenses.length > 0) {
      expenses.forEach(exp => {
        const expMonth = exp.date.slice(0, 7);
        const monthStats = monthlyTrend.find(m => m.fullDate === expMonth);
        if (monthStats) {
          monthStats.expense += parseFloat(exp.amount) || 0;
        }
      });
    }

    return { topCustomers, monthlyTrend };
  }, [stats, filteredData, expenses]);


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
    <div className="min-h-screen bg-slate-900 pb-12">
      <nav className="bg-slate-800 text-white shadow-lg sticky top-0 z-40 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-amber-400">{APP_NAME}</span>
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
                <div className="hidden md:flex items-center gap-2 bg-amber-500/20 px-3 py-2 rounded-lg border border-amber-500/30">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <div className="flex flex-col">
                    <span className="text-xs text-amber-300">Altın (Gram)</span>
                    <span className="text-sm font-semibold text-amber-400">{goldPrice} ₺</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
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
        className="fab-animated fixed bottom-6 right-6 sm:hidden bg-amber-500 text-slate-900 w-16 h-16 rounded-full shadow-xl flex items-center justify-center z-50"
        aria-label="Yeni işlem ekle"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </button>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl font-bold text-slate-100">Genel Bakış</h1>
            <p className="text-slate-400 text-sm">Finansal durum ve işlem özetleri</p>
          </div>

          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg p-2.5">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <select
                  className="bg-transparent text-[13px] font-medium text-slate-200 focus:outline-none cursor-pointer py-2 pr-8 w-full sm:w-44"
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                >
                  <option value="">Tüm Müşteriler</option>
                {customers.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
                </select>
              </div>

              <div className="hidden sm:block w-px bg-slate-600 my-1"></div>

              <div className="flex items-center gap-2 px-2 py-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="text-[13px] font-medium text-slate-200 bg-transparent focus:outline-none cursor-pointer"
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
                  <span className="text-slate-500">-</span>
                  <input
                    type="date"
                    className="text-[13px] font-medium text-slate-200 bg-transparent focus:outline-none cursor-pointer"
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

              <div className="hidden sm:block w-px bg-slate-600 my-1"></div>

              <button
                onClick={() => setShowListPrintModal(true)}
                className={`${BTN_TONAL} px-3 py-2 text-sm`}
                title="Listeyi Yazdır"
                aria-label="Listeyi yazdır"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {goldPrice && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 p-3 rounded-xl text-slate-900 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 leading-tight">Canlı Altın Kuru</h3>
                <p className="text-slate-400 text-xs font-medium">Altınkaynak verileriyle 10 saniyede bir güncellenir</p>
                {goldUpdatedAt && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Son güncelleme: {goldUpdatedAt.toLocaleString('tr-TR')}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center sm:text-right">
                <span className="text-xs text-amber-400 block uppercase tracking-wider font-semibold mb-0.5">Gram Altın</span>
                <span className="text-3xl font-bold text-amber-400 font-mono tracking-tighter">
                  {goldPrice} <span className="text-xl">₺</span>
                </span>
              </div>
              <div className="hidden sm:block w-px h-10 bg-slate-600"></div>
              <a
                href="https://www.altinkaynak.com/Altin/Kur/Guncel"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-lg border border-slate-600 transition-colors text-sm"
              >
                Detaylar
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Toplam Tahsilat"
            value={formatCurrency(stats.totalIncome)}
            iconClass="bg-emerald-900/50 text-emerald-400"
            icon={Wallet}
          />
          <StatCard
            title="Toplam Gider"
            value={formatCurrency(totalExpense)}
            iconClass="bg-rose-900/50 text-rose-400"
            icon={ArrowUpDown}
            onClick={() => setShowExpenseModal(true)}
          />
          <StatCard
            title="Nakit Alacak"
            value={formatCurrency(stats.totalReceivables)}
            iconClass="bg-amber-900/50 text-amber-400"
            icon={ArrowUpDown}
          />
          <StatCard
            title="Has Alacak (Gr)"
            value={`${formatGram(stats.totalHasReceivables)}`}
            iconClass="bg-indigo-900/50 text-indigo-400"
            icon={TrendingUp}
          />
          <StatCard
            title="Gümüş Bakiye (Gr)"
            value={`${formatGram(stats.totalSilverReceivables)}`}
            iconClass="bg-slate-700 text-slate-300"
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-bold text-slate-100 mb-6">En Çok Kazandıran Müşteriler</h3>
            <div style={{ width: '100%', height: 288 }}>
              {chartData?.topCustomers?.length > 0 ? (
                <ResponsiveContainer width="100%" height={288}>
                  <BarChart data={chartData.topCustomers} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#475569" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'Gelir']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#f1f5f9' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend formatter={() => 'Gelir'} wrapperStyle={{ color: '#94a3b8' }} />
                    <Bar dataKey="income" name="Gelir" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="empty-state-icon mb-3 p-3 bg-slate-700/50 rounded-full">
                    <BarChart3 className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-sm">Henüz veri yok</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Aylık Gelir / Gider Trendi</h3>
            <div style={{ width: '100%', height: 288 }}>
              {chartData?.monthlyTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height={288}>
                  <LineChart data={chartData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis tickFormatter={(val) => `₺${val / 1000}k`} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip
                      formatter={(value, name) => [formatCurrency(value), name === 'income' ? 'Gelir' : 'Gider']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#f1f5f9' }}
                      labelStyle={{ color: '#f1f5f9' }}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="income" name="Gelir" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6, fill: '#4ade80' }} />
                    <Line type="monotone" dataKey="expense" name="Gider" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6, fill: '#f87171' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="empty-state-icon mb-3 p-3 bg-slate-700/50 rounded-full">
                    <TrendingUp className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-sm">Henüz veri yok</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {!customerFilter ? (
          <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-bold text-slate-100">Müşteri Bazlı Özet (Bakiye)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/60 sticky top-0 z-10">
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
                        className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-700/60 transition-colors select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortConfig.key === col.id && (
                            <ArrowUpDown className="w-3 h-3 text-amber-400" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {sortedCustomers.map((customer) => (
                    <tr
                      key={customer.name}
                      onClick={() => setSelectedCustomer(customer.name)}
                      className="group cursor-pointer transition-colors hover:bg-slate-700/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/30"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedCustomer(customer.name);
                        }
                      }}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-200 group-hover:text-white">{customer.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{customer.count}</td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">{formatGram(customer.goldVolume)}</td>
                      <td className="px-6 py-4 text-sm text-slate-400 font-mono">{formatGram(customer.silverVolume || 0)}</td>
                      <td className={`px-6 py-4 text-sm font-bold font-mono ${customer.hasBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatGram(customer.hasBalance)}
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold font-mono ${customer.silverBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatGram(customer.silverBalance || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-400 font-mono">{formatCurrency(customer.income)}</td>
                      <td className={`px-6 py-4 text-sm font-bold font-mono ${customer.cashBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
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

        {!customerFilter && selectedCustomer && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}>
            <div className="modal-content bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
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
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowExpenseModal(false)}>
            <div className="modal-content bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Gider Detayları</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Seçili tarih aralığı için filtreleyebilirsiniz
                  </p>
                </div>
                <button onClick={() => setShowExpenseModal(false)} className={BTN_ICON} aria-label="Kapat">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 border-b border-slate-700 flex flex-col md:flex-row gap-4">
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
                    <thead className="bg-slate-900/60 sticky top-0">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Tarih</th>
                        <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Tür</th>
                        <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Açıklama</th>
                        <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {filteredExpenseRows.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-700/50">
                          <td className="px-6 py-4 text-sm text-slate-300">{new Date(exp.date).toLocaleDateString('tr-TR')}</td>
                          <td className="px-6 py-4 text-sm text-slate-200 font-medium">{exp.type}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{exp.description || '-'}</td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-rose-400">{formatCurrency(exp.amount || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-10 text-sm text-slate-500">
                    Filtreye uygun gider kaydı yok.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showListPrintModal && (
          <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowListPrintModal(false)}>
            <div className="modal-content bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-100">Listeyi Yazdır</h3>
                <button onClick={() => setShowListPrintModal(false)} className={BTN_ICON}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={LABEL_BASE}>Has Altın Gram Fiyatı (TL) - Opsiyonel</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Boş bırakılabilir"
                    className={INPUT_BASE}
                    value={listPrintGoldPrice}
                    onChange={e => setListPrintGoldPrice(e.target.value)}
                    autoFocus
                  />
                  <a 
                    href="https://www.altinkaynak.com/Altin/Kur/Guncel" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-amber-400 hover:text-amber-300"
                  >
                    <TrendingUp className="w-3 h-3" />
                    altinkaynak.com güncel fiyatlar
                  </a>
                  <p className="text-xs text-slate-400 mt-1">Girilirse Has Altın borcunun TL karşılığı da yazdırılır.</p>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowListPrintModal(false)}
                    className={`${BTN_SECONDARY} flex-1 py-3`}
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const printWindow = window.open('', '_blank', 'width=800,height=800');
                      if (!printWindow) return;

                      const sortedCustomers = Object.keys(filteredData).sort();
                      const goldPriceVal = parseFloat(listPrintGoldPrice) || 0;

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
                              .totals { font-weight: bold; border-top: 1px solid #000; margin-top: 5px; padding-top: 5px; font-size: 12px; }
                              .tl-equiv { background: #fff8e1; padding: 8px; margin-top: 5px; border-radius: 4px; font-size: 11px; }
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
                              ${goldPriceVal > 0 ? `<br><span style="font-size: 11px; color: #666;">Has Altın: ${formatCurrency(goldPriceVal)}/gr</span>` : ''}
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
                                <td class="text-right">${hasVal !== 0 ? hasVal.toFixed(3) : '-'}</td>
                                <td class="text-right">${!isPayment && pricePerUnit > 0 ? formatNumber(pricePerUnit) + ' x ' + quantity : '-'}</td>
                                <td class="text-right">${cashVal !== 0 ? formatNumber(cashVal) : '-'}</td>
                              </tr>
                            `;
                        }).join('');

                        const hasTLEquiv = goldPriceVal > 0 && totalHas !== 0 ? totalHas * goldPriceVal : 0;

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
                                 <div>Dönem Net: Has: ${totalHas.toFixed(3)} gr | Nakit: ${formatNumber(totalCash)} TL</div>
                                 ${hasTLEquiv !== 0 ? `<div class="tl-equiv"><strong>Has Altın TL Karşılığı:</strong> ${formatCurrency(hasTLEquiv)} (${totalHas.toFixed(3)} gr × ${formatCurrency(goldPriceVal)})</div>` : ''}
                              </div>
                            </div>
                          `;
                      });

                      htmlContent += `
                          ${goldPriceVal > 0 ? `<div style="font-size: 10px; color: #666; margin-top: 20px; text-align: center;">* Has Altın fiyatı altinkaynak.com referans alınmıştır.</div>` : ''}
                          <script>window.onload = function() { window.print(); window.close(); }</script>
                          </body></html>
                       `;

                      printWindow.document.write(htmlContent);
                      printWindow.document.close();
                      setShowListPrintModal(false);
                      setListPrintGoldPrice('');
                    }}
                    className={`${BTN_PRIMARY} flex-1 py-3`}
                  >
                    <Printer className="w-4 h-4" /> Yazdır
                  </button>
                </div>
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
        'Has (Gr)': formatGram(hasVal || 0),
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

  const allSorted = [...transactions].sort((a, b) => {
    return new Date(b.date || b.tarih) - new Date(a.date || a.tarih);
  });

  const startDate = new Date(dateRange.start).getTime();
  const endDate = new Date(dateRange.end).getTime();

  const periodData = [];
  let previousJobPrice = 0, previousJobHas = 0, previousPaidCash = 0, previousPaidHas = 0;

  allSorted.forEach(t => {
    const tDate = new Date(t.date || t.tarih).getTime();

    if (tDate > endDate + 86400000) {
      return;
    }

    if (tDate >= startDate) {
      periodData.push(t);
    } else {
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

  const totalPages = Math.ceil(periodData.length / itemsPerPage);
  const currentData = periodData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className={`flex flex-col h-full ${isInline ? 'bg-slate-800 rounded-2xl shadow-lg border border-slate-700' : ''}`}>
      <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/60">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            {customer}
            <span className="text-sm font-normal text-slate-400 bg-slate-700 px-2 py-1 rounded-full border border-slate-600 shadow-sm">
              {periodTotals.jobCount} İşlem (Dönem)
            </span>
          </h2>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Son Has Bakiye:</span>
              <span className={`font-bold font-mono ${finalHasBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatGram(finalHasBalance)} gr
              </span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Son Nakit Bakiye:</span>
              <span className={`font-bold font-mono ${finalCashBalance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatCurrency(finalCashBalance)}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Dönem İşlenen:</span>
              <span className="font-medium text-slate-200">{formatGram(periodTotals.totalGold)} gr</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2">
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

      <div ref={pdfRef} className="flex-1 overflow-auto bg-slate-800 p-4">
        <div className="hidden printable-header mb-8 border-b-2 border-amber-500 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-amber-400">{APP_NAME}</h1>
              <p className="text-slate-400 text-sm">Müşteri Hesap Ekstresi</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
              <p>Dönem: {new Date(dateRange.start).toLocaleDateString('tr-TR')} - {new Date(dateRange.end).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-0">
          <table className="tx-table w-full text-left border-collapse">
            <thead className="bg-slate-900/70 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700">Tarih</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700">İşlem / Tür</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700">Açıklama</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700 text-right">Adet</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700 text-right">Has (Gr)</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700 text-right">Birim Fiyat</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700 text-right">Toplam (TL)</th>
                <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-700 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
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
                    className={`group transition-colors ${isPayment ? 'bg-emerald-900/20 hover:bg-emerald-900/30' : 'hover:bg-slate-700/50'}`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-300 font-medium whitespace-nowrap">{formatDate(date)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`tx-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPayment ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                        {label}
                      </span>
                      {t.isEdited && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-400 border border-slate-600" title={`Son düzenleme: ${formatDate(t.lastEditedAt)}`}>
                          Düzenlendi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <div>{desc}</div>
                      {noteText ? (
                        <div className="tx-note mt-1 text-[11px] text-slate-500">Not: {noteText}</div>
                      ) : (
                        <div className="tx-note tx-note--empty mt-1 text-[11px] text-slate-500">Not yok</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-right text-slate-400">
                      {!isPayment ? quantity : '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm font-mono text-right ${isPayment ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                      {isPayment && hasVal > 0 ? '-' : ''}{formatGram(hasVal || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-right text-slate-400">
                      {!isPayment && pricePerUnit > 0 ? `${formatCurrency(pricePerUnit)} x ${quantity}` : '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm font-mono text-right ${isPayment ? 'text-emerald-400 font-bold' : 'text-slate-200 font-bold'}`}>
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

              {currentPage === totalPages && (
                <tr className="bg-slate-900 border-t-2 border-slate-600">
                  <td className="px-6 py-4 text-sm text-slate-400 italic block min-w-[120px]">
                    {new Date(dateRange.start).toLocaleDateString('tr-TR')} Öncesi
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-bold italic" colSpan="3">
                    DEVİR / ÖNCEKİ BAKİYE
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold font-mono text-right ${devirHas > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {formatGram(devirHas)}
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className={`px-6 py-4 text-sm font-bold font-mono text-right ${devirCash > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
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

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-700 flex items-center justify-between bg-slate-900 rounded-b-2xl pdf-hide">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`${BTN_SECONDARY} px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ChevronLeft className="w-4 h-4" /> Önceki
            </button>
            <span className="text-sm text-slate-400 font-medium">
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
    <div className="min-h-screen bg-slate-900 pb-12">
      <nav className="bg-slate-800 text-white shadow-lg sticky top-0 z-40 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg text-slate-900">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-amber-400">Yönetim</span>
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
          <div className="lg:col-span-1 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Müşteri Yönetimi</h2>
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
                <div key={c.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-600 rounded-xl px-3 py-2">
                  <span className="text-sm text-slate-300">{c.name}</span>
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
                <div className="flex flex-col items-center py-8">
                  <div className="empty-state-icon mb-3 p-3 bg-slate-700/50 rounded-full">
                    <Users className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-500">Müşteri yok</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-100">İşlemler (Son 50)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/60 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Tarih</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Müşteri</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Tür</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Özet</th>
                    <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {entries.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-sm text-slate-400 whitespace-nowrap">{formatDate(entry.date)}</td>
                      <td className="px-4 py-3 text-sm text-slate-300">{entry.customerName}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {entry.type === 'payment' ? 'Ödeme' : 'İşlem'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
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
                      <td className="px-4 py-12" colSpan={5}>
                        <div className="flex flex-col items-center">
                          <div className="empty-state-icon mb-3 p-3 bg-slate-700/50 rounded-full">
                            <FileText className="w-6 h-6 text-slate-500" />
                          </div>
                          <p className="text-sm text-slate-500">Henüz işlem yok</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Yapılan İş / Fiyat</h2>
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
              <thead className="bg-slate-900/60 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">İş</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Fiyat</th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {workTypes.map(w => (
                  <tr key={w.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm text-slate-300">{w.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
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
                    <td className="px-4 py-12" colSpan={3}>
                      <div className="flex flex-col items-center">
                        <div className="empty-state-icon mb-3 p-3 bg-slate-700/50 rounded-full">
                          <Inbox className="w-6 h-6 text-slate-500" />
                        </div>
                        <p className="text-sm text-slate-500">Henüz iş tanımı yok</p>
                      </div>
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

    refreshInterval = setInterval(async () => {
      if (mounted && isAuthenticated) {
        try {
          await fetchAllData();
        } catch (err) {
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
      
      if (event === 'SIGNED_IN') {
        if (!hasInitialized) {
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

    let visibilityTimeout = null;
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted && isAuthenticated) {
        const now = Date.now();
        if (now - lastFetchTime < MIN_FETCH_INTERVAL) {
          return;
        }
        
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
        customerRow = existingCustomer;
      } else {
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

          if (isPaid && isCustomerChanged && oldCustomerId) {
            const hasAmount = parseFloat(formData.has || 0);
            const cashAmount = parseFloat(formData.price || 0);
            const paymentDate = formData.date;

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
            const hasAmount = parseFloat(formData.has || oldTransaction?.has || 0);
            const cashAmount = parseFloat(formData.price || oldTransaction?.price || 0);
            const paymentDate = formData.date || oldTransaction?.date;

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-sm text-slate-400">Yükleniyor...</div>
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
