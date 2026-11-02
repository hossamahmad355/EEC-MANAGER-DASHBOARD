import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Printer,
  ShieldCheck,
  X,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PerformanceReport } from '../types/dashboard';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: PerformanceReport | null;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!isOpen || !reportData) return null;

  const filteredProjects = reportData.projects.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  // Direct PDF Download handler using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      // Temporarily ensure high quality capture
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // 2x resolution for sharp text and graphics
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page documents if table is long
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`تقرير_أداء_المشاريع_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      // Fallback to print dialog if canvas fails
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  // Printable Native browser print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden">
        {/* Top Control Bar (Non-printed) */}
        <div className="bg-slate-900 text-white p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">تقرير أداء المشاريع الشامل (PDF)</h3>
              <p className="text-xs text-slate-400">معاينة المستند التنفيذي القابل للطباعة والتحميل</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
            >
              <option value="all">كافة المشاريع ({reportData.projects.length})</option>
              <option value="in_progress">قيد التنفيذ ({reportData.summary.inProgressProjects})</option>
              <option value="completed">مكتملة ({reportData.summary.completedProjects})</option>
              <option value="delayed">مؤجلة ({reportData.summary.delayedProjects})</option>
              <option value="at_risk">معرضة للمخاطر ({reportData.summary.atRiskProjects})</option>
            </select>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إنشاء PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>تحميل PDF</span>
                </>
              )}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Viewport */}
        <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
          {/* Printable Report Canvas Document */}
          <div
            ref={reportRef}
            id="printable-report"
            className="bg-white mx-auto max-w-4xl p-8 rounded-xl shadow-sm border border-slate-200 text-slate-800 font-['Cairo',sans-serif]"
          >
            {/* 1. Official Header */}
            <div className="border-b-2 border-blue-600 pb-5 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {reportData.reportTitle}
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-slate-600 mt-1">
                    {reportData.companyName}
                  </p>
                </div>

                <div className="text-left text-xs font-medium text-slate-500">
                  <p>تاريخ التقرير: <span className="font-bold text-slate-800">{reportData.generatedAtArabic}</span></p>
                  <p>إعداد: <span className="font-bold text-slate-800">{reportData.generatedBy}</span></p>
                  <p>الرقم المرجعي: <span className="font-mono font-bold text-blue-700">REP-2026-HQ-011</span></p>
                </div>
              </div>
            </div>

            {/* 2. Executive KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">إجمالي المشاريع</span>
                <span className="text-2xl font-black text-slate-800 tabular-nums">
                  {reportData.summary.totalProjects}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  نسبة الإنجاز: {reportData.summary.overallCompletionRate}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">إجمالي قيمة العقود</span>
                <span className="text-sm sm:text-base font-black text-slate-800 tabular-nums">
                  1,250,000,000 <span className="text-xs font-normal">ج.م</span>
                </span>
                <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
                  محفظة المشروعات
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">التكلفة المنفذة الفعلية</span>
                <span className="text-sm sm:text-base font-black text-blue-700 tabular-nums">
                  870,000,000 <span className="text-xs font-normal">ج.م</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  (69.6% من الميزانية)
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block">المتبقي من الميزانية</span>
                <span className="text-sm sm:text-base font-black text-red-600 tabular-nums">
                  380,000,000 <span className="text-xs font-normal">ج.م</span>
                </span>
                <span className="text-[10px] text-red-500 font-semibold block mt-0.5">
                  (30.4% رصيد احتياطي)
                </span>
              </div>
            </div>

            {/* 3. Distribution Breakdown */}
            <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-100 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>مكتملة: {reportData.summary.completedProjects} مشاريع</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span>قيد التنفيذ: {reportData.summary.inProgressProjects} مشروعاً</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>مؤجلة: {reportData.summary.delayedProjects}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span>معرضة للمخاطر: {reportData.summary.atRiskProjects}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>المواقع المتصلة: {reportData.summary.connectedSitesCount} من {reportData.summary.totalSitesCount}</span>
              </div>
            </div>

            {/* 4. Detailed Projects Performance Table */}
            <div className="mb-6">
              <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center justify-between">
                <span>جدول الأداء التفصيلي للمشاريع ({filteredProjects.length})</span>
                <span className="text-xs text-slate-400 font-normal">
                  مرتبة حسب الأولوية ونسب التنفيذ الميداني
                </span>
              </h3>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-2.5">المشروع</th>
                      <th className="p-2.5">التصنيف</th>
                      <th className="p-2.5">المهندس المسؤول</th>
                      <th className="p-2.5">الموقع</th>
                      <th className="p-2.5 text-center">الميزانية (ج.م)</th>
                      <th className="p-2.5 text-center">نسبة التنفيذ</th>
                      <th className="p-2.5 text-center">التسليم الابتدائي</th>
                      <th className="p-2.5 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {filteredProjects.map((p, idx) => (
                      <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-2.5 text-slate-600">{p.category}</td>
                        <td className="p-2.5 text-slate-600">{p.manager}</td>
                        <td className="p-2.5 text-slate-600">{p.location}</td>
                        <td className="p-2.5 text-center tabular-nums text-slate-800">
                          {p.budgetEGP.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="font-extrabold text-emerald-600 tabular-nums">
                            {p.executionRate}%
                          </span>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="font-extrabold text-blue-600 tabular-nums">
                            {p.initialHandoverRate}%
                          </span>
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : p.status === 'delayed'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.statusArabic}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Official Sign-off & Signatures Footer */}
            <div className="pt-8 border-t border-slate-200 mt-8">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-700">مدير البنية التحتية والشبكات</p>
                  <p className="text-[11px] text-slate-400 mt-1">م. طارق العوضي</p>
                  <div className="w-28 h-px bg-slate-300 mx-auto mt-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">المدير الفني للمشروعات</p>
                  <p className="text-[11px] text-slate-400 mt-1">م. أحمد خالد</p>
                  <div className="w-28 h-px bg-slate-300 mx-auto mt-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-700">المدير العام التنفيذي</p>
                  <p className="text-[11px] text-slate-400 mt-1">الاعتماد النهائي</p>
                  <div className="w-28 h-px bg-slate-300 mx-auto mt-6" />
                </div>
              </div>

              <div className="mt-8 text-center text-[10px] text-slate-400">
                هذا التقرير تم استخراجه آلياً من نظام إدارة المقاولات والبنية التحتية بتاريخ {reportData.generatedAtArabic}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
