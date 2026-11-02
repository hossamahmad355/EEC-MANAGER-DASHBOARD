import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  ArrowDownToLine,
  Building,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileCheck2,
  FileCode,
  FileSpreadsheet,
  FileText,
  Files,
  Filter,
  FolderOpen,
  HardDrive,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  DocumentCategory,
  DocumentKind,
  Project,
  ProjectDocument,
} from '../types/dashboard';

interface DocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  documents: ProjectDocument[];
  onUploadDocument: (doc: Partial<ProjectDocument>) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onRefresh: () => void;
  initialSelectedProjectId?: string;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  isOpen,
  onClose,
  projects,
  documents,
  onUploadDocument,
  onDeleteDocument,
  onRefresh,
  initialSelectedProjectId,
}) => {
  // 1. Hooks unconditionally at the very top (React Rules of Hooks)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialSelectedProjectId || 'all'
  );
  const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'all'>('all');
  const [activeKind, setActiveKind] = useState<DocumentKind | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [previewDocument, setPreviewDocument] = useState<ProjectDocument | null>(null);

  // Upload Form State
  const [formProjectId, setFormProjectId] = useState<string>(
    projects[0]?.id || 'p-1'
  );
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<DocumentCategory>('technical');
  const [formKind, setFormKind] = useState<DocumentKind>('blueprint');
  const [formFileName, setFormFileName] = useState<string>('');
  const [formFileExtension, setFormFileExtension] = useState<'pdf' | 'dwg' | 'xlsx' | 'docx' | 'zip'>('pdf');
  const [formVersion, setFormVersion] = useState<string>('v1.0');
  const [formDescription, setFormDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchProject = selectedProjectId === 'all' || doc.projectId === selectedProjectId;
      const matchCategory = activeCategory === 'all' || doc.category === activeCategory;
      const matchKind = activeKind === 'all' || doc.kind === activeKind;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        doc.projectName.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q));

      return matchProject && matchCategory && matchKind && matchSearch;
    });
  }, [documents, selectedProjectId, activeCategory, activeKind, searchQuery]);

  // Storage Stats
  const stats = useMemo(() => {
    const totalBytes = documents.reduce((acc, d) => acc + (d.fileSizeBytes || 0), 0);
    const totalMB = (totalBytes / 1048576).toFixed(1);
    const technicalCount = documents.filter((d) => d.category === 'technical').length;
    const financialCount = documents.filter((d) => d.category === 'financial').length;
    const administrativeCount = documents.filter((d) => d.category === 'administrative').length;
    const contractsCount = documents.filter((d) => d.kind === 'contract').length;
    const blueprintsCount = documents.filter((d) => d.kind === 'blueprint').length;
    const warrantiesCount = documents.filter((d) => d.kind === 'warranty').length;

    return {
      totalBytes,
      totalMB,
      technicalCount,
      financialCount,
      administrativeCount,
      contractsCount,
      blueprintsCount,
      warrantiesCount,
    };
  }, [documents]);

  // Early return after all hooks
  if (!isOpen) return null;

  // File Icon Helper
  const getFileIcon = (ext: string) => {
    switch (ext.toLowerCase()) {
      case 'dwg':
      case 'dxf':
        return <FileCode className="w-5 h-5 text-purple-600" />;
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'zip':
      case 'rar':
        return <Archive className="w-5 h-5 text-amber-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  const getCategoryBadge = (category: DocumentCategory) => {
    switch (category) {
      case 'technical':
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            وثيقة فنية
          </span>
        );
      case 'financial':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            وثيقة مالية
          </span>
        );
      case 'administrative':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            وثيقة إدارية
          </span>
        );
    }
  };

  const getKindBadge = (kind: DocumentKind) => {
    switch (kind) {
      case 'contract':
        return (
          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1">
            <FileCheck2 className="w-3 h-3 text-amber-700" />
            عقد مشروع
          </span>
        );
      case 'blueprint':
        return (
          <span className="bg-sky-100 text-sky-900 border border-sky-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1">
            <FolderOpen className="w-3 h-3 text-sky-700" />
            مخطط هندسي
          </span>
        );
      case 'warranty':
        return (
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            شهادة ضمان
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
            مستند عام
          </span>
        );
    }
  };

  // Simulated Download
  const handleDownloadFile = (doc: ProjectDocument) => {
    const dummyContent = `المملكة المصرية للمقاولات والبنية التحتية
نظام إدارة المستندات الرقمية (EDMS)
المشروع: ${doc.projectName}
العنوان: ${doc.title}
الملف: ${doc.fileName}
التصنيف: ${doc.category === 'technical' ? 'فنية' : doc.category === 'financial' ? 'مالية' : 'إدارية'}
النوع: ${doc.kind === 'contract' ? 'عقد مشروع' : doc.kind === 'blueprint' ? 'مخطط هندسي' : 'شهادة ضمان'}
تاريخ الرفع: ${doc.uploadedAtArabic}
المسؤول: ${doc.uploadedBy}
النسخة: ${doc.version}
الوصف: ${doc.description || 'وثيقة رقمية معتمدة ومحفوظة بالأرشيف الهندسي.'}
رمز التحقق المشفر: EDMS-VERIFIED-${doc.id}-${Date.now()}
`;

    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Submit Upload Form
  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedProj = projects.find((p) => p.id === formProjectId);
      const generatedFileName =
        formFileName.trim() ||
        `${formTitle.trim().replace(/\s+/g, '_')}_${formVersion}.${formFileExtension}`;

      await onUploadDocument({
        projectId: formProjectId,
        projectName: selectedProj?.name || 'مشروع عام',
        title: formTitle.trim(),
        fileName: generatedFileName,
        fileExtension: formFileExtension,
        fileSizeBytes: Math.floor(Math.random() * 8000000) + 1200000,
        category: formCategory,
        kind: formKind,
        uploadedBy: 'المدير العام / مدير الشبكة',
        version: formVersion,
        description: formDescription.trim(),
      });

      // Reset & Close
      setFormTitle('');
      setFormFileName('');
      setFormDescription('');
      setIsUploadModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden font-['Cairo',sans-serif]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Files className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  نظام إدارة المستندات الرقمية للمشاريع (DMS)
                </h3>
                <span className="bg-blue-900/60 text-blue-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-700/50 font-bold">
                  {documents.length} وثيقة معتمدة
                </span>
              </div>
              <p className="text-xs text-slate-400">
                أرشيف عقود المشاريع، المخططات الهندسية (CAD/BIM)، وشهادات الضمان المصنعية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              <span>رفع مستند جديد</span>
            </button>
            <button
              onClick={onRefresh}
              title="تحديث القائمة"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. Storage & Categories Statistics Strip */}
        <div className="bg-gradient-to-r from-slate-50 via-sky-50/30 to-blue-50/20 p-3 sm:px-5 border-b border-slate-200 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">المساحة الكلية</span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">{stats.totalMB} MB</span>
              </div>
              <HardDrive className="w-4 h-4 text-slate-500" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-600 block font-bold">وثائق فنية</span>
                <span className="font-extrabold text-purple-700 text-sm">{stats.technicalCount} مستند</span>
              </div>
              <FolderOpen className="w-4 h-4 text-purple-500" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-600 block font-bold">وثائق مالية</span>
                <span className="font-extrabold text-emerald-700 text-sm">{stats.financialCount} مستند</span>
              </div>
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-blue-600 block font-bold">وثائق إدارية</span>
                <span className="font-extrabold text-blue-700 text-sm">{stats.administrativeCount} مستند</span>
              </div>
              <FileCheck2 className="w-4 h-4 text-blue-500" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-700 block font-bold">العقود الرسمية</span>
                <span className="font-extrabold text-amber-800 text-sm">{stats.contractsCount} عقد</span>
              </div>
              <FileCheck2 className="w-4 h-4 text-amber-600" />
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-sky-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-sky-700 block font-bold">شهادات الضمان</span>
                <span className="font-extrabold text-sky-800 text-sm">{stats.warrantiesCount} شهادة</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-sky-600" />
            </div>
          </div>
        </div>

        {/* 2. Toolbar: Project Selector, Category Tabs, Search */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {/* Project Selector (لكل مشروع بشكل منفصل) */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500">المشروع:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs font-bold bg-transparent text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">كافة المشاريع ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter Pills (فنية، مالية، إدارية) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                كافة التصنيفات
              </button>
              <button
                onClick={() => setActiveCategory('technical')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  activeCategory === 'technical'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                فنية ({stats.technicalCount})
              </button>
              <button
                onClick={() => setActiveCategory('financial')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  activeCategory === 'financial'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مالية ({stats.financialCount})
              </button>
              <button
                onClick={() => setActiveCategory('administrative')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                  activeCategory === 'administrative'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                إدارية ({stats.administrativeCount})
              </button>
            </div>

            {/* Kind Quick Filter (عقود، مخططات، ضمانات) */}
            <div className="hidden lg:flex items-center gap-1 border-r border-slate-200 pr-2">
              <button
                onClick={() => setActiveKind((prev) => (prev === 'contract' ? 'all' : 'contract'))}
                className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-colors ${
                  activeKind === 'contract'
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                العقود ({stats.contractsCount})
              </button>
              <button
                onClick={() => setActiveKind((prev) => (prev === 'blueprint' ? 'all' : 'blueprint'))}
                className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-colors ${
                  activeKind === 'blueprint'
                    ? 'bg-sky-600 text-white border-sky-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                المخططات ({stats.blueprintsCount})
              </button>
              <button
                onClick={() => setActiveKind((prev) => (prev === 'warranty' ? 'all' : 'warranty'))}
                className={`px-2 py-1 text-[11px] font-bold rounded-md border transition-colors ${
                  activeKind === 'warranty'
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                شهادات الضمان ({stats.warrantiesCount})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث باسم المستند، الملف، أو المشروع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-800"
            />
          </div>
        </div>

        {/* 3. Document Items Grid / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Category & Kind Badges & Project */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getCategoryBadge(doc.category)}
                      {getKindBadge(doc.kind)}
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {doc.version}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      <span>{doc.projectName}</span>
                    </span>
                  </div>

                  {/* Document Title & File Info */}
                  <div className="flex items-start gap-3 mt-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                      {getFileIcon(doc.fileExtension)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-bold text-xs text-slate-900 truncate"
                        title={doc.title}
                      >
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5" title={doc.fileName}>
                        {doc.fileName}
                      </p>
                      {doc.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-600">{doc.fileSizeFormatted}</span>
                    <span>·</span>
                    <span>{doc.uploadedAtArabic}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Preview Button */}
                    <button
                      onClick={() => setPreviewDocument(doc)}
                      className="px-2 py-1 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 flex items-center gap-1 font-bold text-xs transition-colors"
                      title="معاينة تفاصيل المستند"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة</span>
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownloadFile(doc)}
                      className="px-2 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 font-bold text-xs transition-colors"
                      title="تحميل الملف للجهاز"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف المستند: "${doc.title}"؟`)) {
                          onDeleteDocument(doc.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="حذف المستند"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-slate-700 text-sm">لا توجد مستندات مطابقة</h4>
              <p className="text-xs text-slate-400 mt-1">
                جرب تغيير تصنيف البحث أو المشروع، أو قم برفع مستند جديد.
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>رفع وثيقة جديدة</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-sky-200 text-right font-['Cairo',sans-serif] overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold text-sm">رفع مستند رقمي جديد للأرشيف</h4>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="p-4 sm:p-5 space-y-3.5 text-xs">
              {/* Project Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  المشروع التابع له المستند <span className="text-red-500">*</span>
                </label>
                <select
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  عنوان المستند / الوثيقة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: عقد أعمال التكييف المركزي المعتمد"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Category & Kind in Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تصنيف الوثيقة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as DocumentCategory)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="technical">فنية (مخططات وهندسة)</option>
                    <option value="financial">مالية (عقود ومستخلصات)</option>
                    <option value="administrative">إدارية (ضمانات وتراخيص)</option>
                  </select>
                </div>

                {/* Kind */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    نوع الوثيقة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formKind}
                    onChange={(e) => setFormKind(e.target.value as DocumentKind)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="contract">عقد مشروع (Contract)</option>
                    <option value="blueprint">مخطط هندسي (Blueprint)</option>
                    <option value="warranty">شهادة ضمان (Warranty)</option>
                    <option value="permit">تصريح / رخصة (Permit)</option>
                    <option value="other">أخرى (Other)</option>
                  </select>
                </div>
              </div>

              {/* File Extension & Version */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">صيغة الملف</label>
                  <select
                    value={formFileExtension}
                    onChange={(e) => setFormFileExtension(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  >
                    <option value="pdf">PDF (وثيقة معتمدة)</option>
                    <option value="dwg">DWG (أوتوكاد / CAD)</option>
                    <option value="xlsx">XLSX (جداول مالية)</option>
                    <option value="docx">DOCX (عقود ونصوص)</option>
                    <option value="zip">ZIP (أرشيف مضغوط)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الإصدار / النسخة</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    placeholder="مثال: v1.0 أو Rev2"
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات ووصف المستند</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="اكتب نبذة عن بنود العقد أو تفاصيل المخطط أو شروط الضمان..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Upload Dropzone Simulation */}
              <div className="p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <UploadCloud className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <span className="font-bold text-slate-700 block">اسحب وأفلت الملف هنا أو انقر للاختيار</span>
                <span className="text-[10px] text-slate-400">يدعم ملفات PDF, DWG, BIM, XLSX حتى 100 ميجابايت</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formTitle}
                  className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الوثيقة بالأرشيف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Document Preview Modal */}
      {previewDocument && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-sky-200 text-right font-['Cairo',sans-serif] overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" />
                <h4 className="font-bold text-sm">معاينة المستند الرسمي المعتمد</h4>
              </div>
              <button
                onClick={() => setPreviewDocument(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Sheet Simulation */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Official Stamp Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-sky-200 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-700 font-bold block">
                      المملكة المصرية للمقاولات العامة والبنية التحتية
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-0.5">
                      {previewDocument.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      المشروع: <b className="text-slate-800">{previewDocument.projectName}</b>
                    </p>
                  </div>

                  {/* Stamp Graphic */}
                  <div className="w-20 h-20 border-2 border-emerald-600 rounded-full flex flex-col items-center justify-center text-emerald-700 rotate-[-12deg] p-1 bg-white/80 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-wider">معتمد وموثق</span>
                    <span className="text-[8px] font-mono">EDMS-APPROVED</span>
                  </div>
                </div>
              </div>

              {/* Metadata Details Table */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">اسم الملف المصدري</span>
                  <span className="font-mono font-bold text-slate-800 break-all">{previewDocument.fileName}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">التصنيف والنوع</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {getCategoryBadge(previewDocument.category)}
                    {getKindBadge(previewDocument.kind)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">الحجم والنسخة</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {previewDocument.fileSizeFormatted} · {previewDocument.version}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold">تاريخ الرفع والمسؤول</span>
                  <span className="font-bold text-slate-800">
                    {previewDocument.uploadedAtArabic} · {previewDocument.uploadedBy}
                  </span>
                </div>
              </div>

              {/* Description */}
              {previewDocument.description && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block font-bold mb-1">الوصف والملاحظات الفنية</span>
                  <p className="text-slate-700 leading-relaxed">{previewDocument.description}</p>
                </div>
              )}

              {/* Verification & QR Code Barcode */}
              <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white p-1 text-slate-900 flex items-center justify-center">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] text-sky-400 font-bold block">رمز التشفير والتحقق الرقمي</span>
                    <span className="text-xs font-mono font-bold text-slate-200">
                      SHA256: 8f4b29c9a...{previewDocument.id}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  ساري الصلاحية
                </span>
              </div>
            </div>

            {/* Preview Footer Actions */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => handleDownloadFile(previewDocument)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>تحميل المستند الأصلي ({previewDocument.fileSizeFormatted})</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDocument(null)}
                className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
              >
                إغلاق المعاينة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
