import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storageService';
import {
  Product,
  Category,
  Producer,
  LabResult,
  RecallAlert,
  Report,
  User,
  AppConfig,
  WebsiteSettings,
  CustomPage,
} from './types';
import { AppNavbar } from './components/AppNavbar';
import { ProductDirectory } from './components/ProductDirectory';
import { LabDatabaseView } from './components/LabDatabaseView';
import { RecallAlertsView } from './components/RecallAlertsView';
import { IngredientChecker } from './components/IngredientChecker';
import { ProducerDirectory } from './components/ProducerDirectory';
import { CertificateVerificationView } from './components/CertificateVerificationView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { AddProductModal } from './components/AddProductModal';
import { ReportHazardousModal } from './components/ReportHazardousModal';
import { UserManagerModal } from './components/UserManagerModal';
import { DatabaseSyncModal } from './components/DatabaseSyncModal';
import { DeploymentGuideModal } from './components/DeploymentGuideModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { StandaloneProductPage } from './components/StandaloneProductPage';
import { CustomPageView } from './components/CustomPageView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SupabaseService } from './services/supabaseService';
import { SUPABASE_SQL_SCHEMA } from './services/supabaseSchema';
import {
  ShieldAlert,
  PhoneCall,
  Mail,
  MapPin,
  ExternalLink,
  Lock,
  Globe,
  Database,
  Rocket,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  // Core Entities State (Initialized synchronously to prevent initial render flashes or undefined state)
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [producers, setProducers] = useState<Producer[]>(() => StorageService.getProducers());
  const [labResults, setLabResults] = useState<LabResult[]>(() => StorageService.getLabResults());
  const [recalls, setRecalls] = useState<RecallAlert[]>(() => StorageService.getRecalls());
  const [reports, setReports] = useState<Report[]>(() => StorageService.getReports());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [config, setConfig] = useState<AppConfig>(() => StorageService.getConfig());
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [settings, setSettings] = useState<WebsiteSettings>(() => StorageService.getSettings());
  const [customPages, setCustomPages] = useState<CustomPage[]>(() => StorageService.getCustomPages());

  // Navigation & Routing State (Synchronously resolved from URL)
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window === 'undefined') return 'directory';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/administrasi') || hash.includes('/administrasi')) {
      return 'administrasi';
    }
    const productMatch = path.match(/\/produk\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/produk\/([a-zA-Z0-9_-]+)/);
    if (productMatch && productMatch[1]) {
      return 'standalone-product';
    }
    const pageMatch = path.match(/\/halaman\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/halaman\/([a-zA-Z0-9_-]+)/);
    if (pageMatch && pageMatch[1]) {
      return 'custom-page-view';
    }
    return 'directory';
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [standaloneProduct, setStandaloneProduct] = useState<Product | null>(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const productMatch = path.match(/\/produk\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/produk\/([a-zA-Z0-9_-]+)/);
    if (productMatch && productMatch[1]) {
      const prodId = productMatch[1];
      const prods = StorageService.getProducts();
      return prods.find((p) => p.id === prodId || p.nomor_izin.toLowerCase() === prodId.toLowerCase()) || null;
    }
    return null;
  });

  const [selectedCustomPage, setSelectedCustomPage] = useState<CustomPage | null>(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const pageMatch = path.match(/\/halaman\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/halaman\/([a-zA-Z0-9_-]+)/);
    if (pageMatch && pageMatch[1]) {
      const slug = pageMatch[1];
      const pages = StorageService.getCustomPages();
      return pages.find((p) => p.slug === slug || p.id === slug) || null;
    }
    return null;
  });

  // Modals State
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState<boolean>(false);
  const [isDatabaseSyncOpen, setIsDatabaseSyncOpen] = useState<boolean>(false);
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  const [missingTableAlert, setMissingTableAlert] = useState<{
    table: string;
    message: string;
  } | null>(null);
  const [copiedSchemaBanner, setCopiedSchemaBanner] = useState(false);

  // Initial Data Load & Supabase Cross-browser Sync Listener
  useEffect(() => {
    // 1. Cek parameter URL untuk konfigurasi otomatis jika dibuka antar browser
    if (typeof window !== 'undefined') {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const urlSupabase = searchParams.get('supabase_url');
        const keySupabase = searchParams.get('supabase_key') || searchParams.get('supabase_anon_key');
        if (urlSupabase && keySupabase) {
          const currentCfg = StorageService.getConfig();
          currentCfg.supabase_url = urlSupabase;
          currentCfg.supabase_anon_key = keySupabase;
          currentCfg.is_connected = true;
          currentCfg.backend_mode = 'supabase';
          StorageService.saveConfig(currentCfg);
        }
      } catch (e) {
        // ignore
      }
    }

    loadAllData();

    // 2. Jika Supabase aktif, sinkronkan data terbaru secara otomatis dari cloud ke browser ini
    const sbConfig = SupabaseService.getConfigInfo();
    if (sbConfig.isConfigured) {
      SupabaseService.pullFromSupabase()
        .then((res) => {
          if (res.success) {
            loadAllData();
          }
        })
        .catch((e) => console.warn('Auto sync cloud on mount:', e));
    }

    const unsub = SupabaseService.onTableMissing((info) => {
      setMissingTableAlert({
        table: info.table,
        message: info.message,
      });
    });

    return () => {
      unsub();
    };
  }, []);

  const loadAllData = () => {
    setProducts(StorageService.getProducts());
    setCategories(StorageService.getCategories());
    setProducers(StorageService.getProducers());
    setLabResults(StorageService.getLabResults());
    setRecalls(StorageService.getRecalls());
    setReports(StorageService.getReports());
    setUsers(StorageService.getUsers());
    setConfig(StorageService.getConfig());
    setSettings(StorageService.getSettings());
    setCustomPages(StorageService.getCustomPages());
  };

  // Synchronize browser history and URL routes (e.g. /administrasi, /produk/:id, /halaman/:slug)
  const syncRouteFromUrl = useCallback(() => {
    if (typeof window === 'undefined') return;

    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // Check for /administrasi route (Requirement 1: https://bpom.vercel.app/administrasi)
    if (path.includes('/administrasi') || hash.includes('/administrasi')) {
      setActiveTab('administrasi');
      return;
    }

    // Check for /produk/:id route (Requirement 2: auto page generation for products)
    const productMatch = path.match(/\/produk\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/produk\/([a-zA-Z0-9_-]+)/);
    if (productMatch && productMatch[1]) {
      const prodId = productMatch[1];
      const prods = StorageService.getProducts();
      const found = prods.find(
        (p) => p.id === prodId || p.nomor_izin.toLowerCase() === prodId.toLowerCase()
      );
      if (found) {
        setStandaloneProduct(found);
        setActiveTab('standalone-product');
        return;
      } else {
        // Jika belum ada di penyimpanan lokal browser ini (misal dibuka di browser lain atau scan QR baru),
        // segera tarik data produk langsung dari Supabase
        SupabaseService.fetchProductById(prodId).then((cloudProd) => {
          if (cloudProd) {
            setStandaloneProduct(cloudProd);
            setActiveTab('standalone-product');
            const currentList = StorageService.getProducts();
            if (!currentList.some((p) => p.id === cloudProd.id)) {
              const updated = [cloudProd, ...currentList];
              StorageService.saveProductsLocally(updated);
              setProducts(updated);
            }
          }
        });
      }
    }

    // Check for /halaman/:slug route (Custom CMS pages)
    const pageMatch = path.match(/\/halaman\/([a-zA-Z0-9_-]+)/) || hash.match(/#\/halaman\/([a-zA-Z0-9_-]+)/);
    if (pageMatch && pageMatch[1]) {
      const slug = pageMatch[1];
      const pages = StorageService.getCustomPages();
      const found = pages.find((p) => p.slug === slug || p.id === slug);
      if (found) {
        setSelectedCustomPage(found);
        setActiveTab('custom-page-view');
        return;
      }
    }
  }, []);

  useEffect(() => {
    syncRouteFromUrl();

    const handlePopState = () => {
      syncRouteFromUrl();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [syncRouteFromUrl]);

  // Navigation Helpers with browser URL push
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      if (tab === 'administrasi') {
        window.history.pushState(null, '', '/administrasi');
      } else if (tab === 'directory') {
        window.history.pushState(null, '', '/');
      }
    }
  };

  const navigateToStandaloneProduct = (product: Product) => {
    setStandaloneProduct(product);
    setActiveTab('standalone-product');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/produk/${product.id}`);
    }
  };

  const navigateToCustomPage = (page: CustomPage) => {
    setSelectedCustomPage(page);
    setActiveTab('custom-page-view');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `/halaman/${page.slug}`);
    }
  };

  // Handlers for Products
  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    StorageService.saveProducts(updated);
    SupabaseService.syncProduct(newProduct).catch((err) => {
      console.warn('Sync to Supabase produk error:', err);
    });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(updated);
    StorageService.saveProducts(updated);
    SupabaseService.syncProduct(updatedProduct).catch((err) => {
      console.warn('Sync to Supabase produk error:', err);
    });
    if (selectedProduct?.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
    if (standaloneProduct?.id === updatedProduct.id) {
      setStandaloneProduct(updatedProduct);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    StorageService.saveProducts(updated);
    if (selectedProduct?.id === productId) setSelectedProduct(null);
    if (standaloneProduct?.id === productId) {
      setStandaloneProduct(null);
      setActiveTab('directory');
    }
  };

  // Category Handler
  const handleAddCategory = (newCategory: Category) => {
    const updated = [...categories, newCategory];
    setCategories(updated);
    StorageService.saveCategories(updated);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = categories.filter((c) => c.id !== categoryId);
    setCategories(updated);
    StorageService.saveCategories(updated);
  };

  // Custom Pages Handlers
  const handleAddCustomPage = (newPage: CustomPage) => {
    const updated = [...customPages, newPage];
    setCustomPages(updated);
    StorageService.saveCustomPages(updated);
  };

  const handleUpdateCustomPage = (updatedPage: CustomPage) => {
    const updated = customPages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
    setCustomPages(updated);
    StorageService.saveCustomPages(updated);
    if (selectedCustomPage?.id === updatedPage.id) {
      setSelectedCustomPage(updatedPage);
    }
  };

  const handleDeleteCustomPage = (pageId: string) => {
    const updated = customPages.filter((p) => p.id !== pageId);
    setCustomPages(updated);
    StorageService.saveCustomPages(updated);
    if (selectedCustomPage?.id === pageId) {
      setSelectedCustomPage(null);
      setActiveTab('directory');
    }
  };

  // Settings Handler
  const handleSaveSettings = (newSettings: WebsiteSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  // Lab Results Handler
  const handleAddLabResult = (newLab: LabResult) => {
    const updated = [newLab, ...labResults];
    setLabResults(updated);
    StorageService.saveLabResults(updated);
  };

  // Recalls Handler
  const handleAddRecall = (newRecall: RecallAlert) => {
    const updated = [newRecall, ...recalls];
    setRecalls(updated);
    StorageService.saveRecalls(updated);

    // If matches product, change status to 'Ditarik'
    const matched = products.find((p) => p.nomor_izin === newRecall.nomor_izin);
    if (matched) {
      handleUpdateProduct({
        ...matched,
        status_registrasi: 'Ditarik',
      });
    }
  };

  // Producer Handlers
  const handleAddProducer = (newProd: Producer) => {
    const updated = [...producers, newProd];
    setProducers(updated);
    StorageService.saveProducers(updated);
  };

  const handleUpdateProducer = (updatedProd: Producer) => {
    const updated = producers.map((p) => (p.id === updatedProd.id ? updatedProd : p));
    setProducers(updated);
    StorageService.saveProducers(updated);
  };

  const handleDeleteProducer = (id: string) => {
    const updated = producers.filter((p) => p.id !== id);
    setProducers(updated);
    StorageService.deleteProducer(id);
  };

  // Reports Handler
  const handleAddReport = (newReport: Report) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    StorageService.saveReports(updated);
  };

  const handleUpdateReportStatus = (id: string, status: Report['status'], note?: string) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, status, tanggapan_petugas: note || r.tanggapan_petugas } : r
    );
    setReports(updated);
    StorageService.saveReports(updated);
  };

  // Users Handler
  const handleAddUser = (newUser: User) => {
    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.saveUsers(updated);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    StorageService.saveUsers(updated);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      StorageService.setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    StorageService.saveUsers(updated);
  };

  // Config & Auth Handler
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    StorageService.saveConfig(newConfig);
  };

  const handleResetData = () => {
    StorageService.resetToDefault();
    loadAllData();
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    StorageService.setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
  };

  // Barcode scanned callback
  const handleBarcodeScanned = (scannedCode: string) => {
    const found = products.find(
      (p) =>
        p.barcode === scannedCode ||
        p.nomor_izin.toLowerCase() === scannedCode.toLowerCase() ||
        p.qr_code_hash.toLowerCase() === scannedCode.toLowerCase()
    );
    if (found) {
      setIsScannerOpen(false);
      navigateToStandaloneProduct(found);
    }
  };

  // Quick navigation to product by NIE
  const handleSelectProductByNie = (nie: string) => {
    const found = products.find((p) => p.nomor_izin.toLowerCase() === nie.toLowerCase());
    if (found) {
      navigateToStandaloneProduct(found);
    } else {
      navigateToTab('directory');
    }
  };

  // Quick navigation to product by Id
  const handleSelectProductById = (productId: string) => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      navigateToStandaloneProduct(found);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <AppNavbar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        currentUser={currentUser}
        recallsCount={recalls.filter((r) => r.status === 'Aktif').length}
        settings={settings}
        customPages={customPages}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAddProduct={() => setIsAddProductOpen(true)}
        onOpenUserManager={() => setIsUserManagerOpen(true)}
        onOpenDatabaseSync={() => setIsDatabaseSyncOpen(true)}
        onOpenDeploymentGuide={() => setIsDeploymentGuideOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => navigateToTab('administrasi')}
        onSelectCustomPage={navigateToCustomPage}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 1. Admin Panel Route (Requirement 1: https://bpom.vercel.app/administrasi) */}
        {activeTab === 'administrasi' && (
          <ErrorBoundary fallbackTitle="Kendala Memuat Panel Administrasi (/administrasi)">
            <AdminPanel
              settings={settings}
              customPages={customPages}
              products={products}
              categories={categories}
              producers={producers}
              users={users}
              currentUser={currentUser}
              onSaveSettings={handleSaveSettings}
              onAddProduct={(p) => {
                handleAddProduct(p);
                // Open product page with barcode immediately
                navigateToStandaloneProduct(p);
              }}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddCustomPage={handleAddCustomPage}
              onUpdateCustomPage={handleUpdateCustomPage}
              onDeleteCustomPage={handleDeleteCustomPage}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onLoginAsAdmin={handleLogin}
              onLogout={handleLogout}
              onNavigateToPublic={() => navigateToTab('directory')}
              onSelectProduct={navigateToStandaloneProduct}
              onSelectCustomPage={navigateToCustomPage}
              onAddProducer={handleAddProducer}
            />
          </ErrorBoundary>
        )}

        {/* 2. Standalone Dedicated Product Page with Barcode & QR Code (Requirement 2) */}
        {activeTab === 'standalone-product' && standaloneProduct && (
          <StandaloneProductPage
            product={standaloneProduct}
            producer={producers.find((pr) => pr.id === standaloneProduct.produsen_id)}
            labResult={labResults.find((lr) => lr.product_id === standaloneProduct.id)}
            recall={recalls.find((rc) => rc.nomor_izin === standaloneProduct.nomor_izin)}
            onBack={() => navigateToTab('directory')}
            onOpenReport={(prod) => {
              setSelectedProduct(prod);
              setIsReportOpen(true);
            }}
            onNavigateToProducer={() => navigateToTab('producers')}
          />
        )}

        {/* 3. Custom CMS Dynamic Page View (e.g. Profil, Regulasi, Panduan) */}
        {activeTab === 'custom-page-view' && selectedCustomPage && (
          <CustomPageView
            page={selectedCustomPage}
            allPages={customPages}
            onBack={() => navigateToTab('directory')}
            onSelectPage={navigateToCustomPage}
          />
        )}

        {/* 4. Product Directory (Home) */}
        {activeTab === 'directory' && (
          <ProductDirectory
            products={products}
            currentUser={currentUser}
            onSelectProduct={(p: Product) => setSelectedProduct(p)}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenStandalonePage={navigateToStandaloneProduct}
          />
        )}

        {/* 5. Laboratory Database View */}
        {activeTab === 'lab' && (
          <LabDatabaseView
            labResults={labResults}
            products={products}
            currentUser={currentUser}
            onAddLabResult={handleAddLabResult}
            onSelectProductById={handleSelectProductById}
          />
        )}

        {/* 6. Product Recalls & Alerts */}
        {activeTab === 'recalls' && (
          <RecallAlertsView
            recalls={recalls}
            currentUser={currentUser}
            onAddRecall={handleAddRecall}
            onSelectProductByNie={handleSelectProductByNie}
          />
        )}

        {/* 7. Composition & Hazardous Ingredient Checker */}
        {activeTab === 'composition' && <IngredientChecker />}

        {/* 8. Certified Producers Directory */}
        {activeTab === 'producers' && (
          <ProducerDirectory
            producers={producers}
            currentUser={currentUser}
            onAddProducer={handleAddProducer}
            onUpdateProducer={handleUpdateProducer}
            onDeleteProducer={handleDeleteProducer}
          />
        )}

        {/* 9. Digital Certificate Verification */}
        {activeTab === 'certificate' && (
          <CertificateVerificationView
            products={products}
            producers={producers}
            onOpenProductDetail={navigateToStandaloneProduct}
          />
        )}

        {/* 10. Fallback View for Unrecognized Route */}
        {![
          'administrasi',
          'standalone-product',
          'custom-page-view',
          'directory',
          'lab',
          'recalls',
          'composition',
          'producers',
          'certificate',
        ].includes(activeTab) && (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800">Halaman / Rute Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rute aktif saat ini tidak dapat dimuat. Anda dapat kembali ke katalog utama atau membuka panel administrasi website.
            </p>
            <div className="flex items-center justify-center pt-2">
              <button
                type="button"
                onClick={() => navigateToTab('directory')}
                className="w-full sm:w-auto px-5 py-2.5 bg-sky-900 hover:bg-sky-950 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Kembali ke Katalog
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Official BPOM Dynamic Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Website Branding & Overview */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="w-7 h-7 rounded bg-sky-700 text-white flex items-center justify-center font-black text-xs">
                {settings.singkatan_portal || 'BPOM'}
              </div>
              <span className="uppercase">{settings.nama_website}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
              {settings.deskripsi_singkat}
            </p>
            <div className="flex items-center gap-4 text-slate-300 pt-1 text-[11px] flex-wrap">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Sertifikasi Elektronik BSrE
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" /> pom.go.id
              </span>
            </div>
          </div>

          {/* Col 2: Contact & Service */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Layanan Informasi & Kontak
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li className="flex items-start gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Contact Center Halo BPOM: <strong>{settings.telepon_layanan}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span>{settings.email_resmi}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings.alamat_kantor}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Cloud, System & Quick CMS Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Sistem & Navigasi
            </h4>
            <div className="space-y-1.5 text-[11px]">
              {customPages
                .filter((p) => p.status === 'Publikasi')
                .slice(0, 3)
                .map((page) => (
                  <button
                    key={page.id}
                    onClick={() => navigateToCustomPage(page)}
                    className="w-full text-left py-0.5 text-slate-300 hover:text-white flex items-center gap-1"
                  >
                    <span>• {page.judul}</span>
                  </button>
                ))}

              <button
                onClick={() => setIsDatabaseSyncOpen(true)}
                className="w-full text-left py-1 text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <Database className="w-3.5 h-3.5" /> CRUD Google Sheets & Drive
              </button>
              <button
                onClick={() => setIsDeploymentGuideOpen(true)}
                className="w-full text-left py-1 text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
              >
                <Rocket className="w-3.5 h-3.5" /> Panduan Deploy Vercel / Netlify
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 py-4 px-4 sm:px-6 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} {settings.nama_website}. Seluruh hak cipta dilindungi undang-undang.
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Barcode & QR Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        products={products}
        onScanResult={handleBarcodeScanned}
      />

      {/* 2. Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        producer={producers.find((pr) => pr.id === selectedProduct?.produsen_id)}
        labResult={labResults.find((lr) => lr.product_id === selectedProduct?.id)}
        isAdmin={currentUser?.role === 'Admin'}
        onReportProduct={(p: Product) => {
          setSelectedProduct(null);
          setIsReportOpen(true);
        }}
      />

      {/* 3. Add Product & Category Modal */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        producers={producers}
        onAddProduct={handleAddProduct}
        onAddCategory={handleAddCategory}
        onAddProducer={handleAddProducer}
        onOpenCreatedProductPage={(prod) => {
          navigateToStandaloneProduct(prod);
        }}
      />

      {/* 4. Report Hazardous Product Modal with Drive upload */}
      <ReportHazardousModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reports={reports}
        currentUser={currentUser}
        initialProduct={selectedProduct}
        onAddReport={handleAddReport}
        onUpdateReportStatus={handleUpdateReportStatus}
      />

      {/* 5. Admin User Management Modal */}
      <UserManagerModal
        isOpen={isUserManagerOpen}
        onClose={() => setIsUserManagerOpen(false)}
        users={users}
        currentUser={currentUser}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* 6. Database & Cloud Sync Settings Modal */}
      <DatabaseSyncModal
        isOpen={isDatabaseSyncOpen}
        onClose={() => setIsDatabaseSyncOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetData={handleResetData}
      />

      {/* 7. Vercel & Netlify Deployment Guide Modal */}
      <DeploymentGuideModal
        isOpen={isDeploymentGuideOpen}
        onClose={() => setIsDeploymentGuideOpen(false)}
      />

      {/* 8. Auth & Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        users={users}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRegister={handleAddUser}
      />

      {/* 9. Global Supabase Missing Table Alert Banner */}
      {missingTableAlert && (
        <div className="fixed bottom-5 right-5 max-w-md w-full z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-amber-500/40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  Tabel Supabase Belum Ada: <span className="font-mono text-white">'{missingTableAlert.table}'</span>
                </h4>
                <button
                  onClick={() => setMissingTableAlert(null)}
                  className="text-slate-400 hover:text-white text-xs p-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Data Anda telah aman tersimpan di aplikasi lokal. Untuk menyimpan ke database Supabase Cloud, silakan eksekusi skrip SQL skema tabel.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={async () => {
                    const res = await SupabaseService.ensureProductTableExists();
                    if (res.success) {
                      setMissingTableAlert(null);
                      loadAllData();
                      alert('Tabel Supabase berhasil dibuat otomatis!');
                    } else {
                      window.open(SupabaseService.getDashboardSqlUrl(), '_blank');
                    }
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Buat Tabel Otomatis</span>
                </button>
                <a
                  href={SupabaseService.getDashboardSqlUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Buka SQL Editor
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                    setCopiedSchemaBanner(true);
                    setTimeout(() => setCopiedSchemaBanner(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold inline-flex items-center gap-1"
                >
                  {copiedSchemaBanner ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSchemaBanner ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  onClick={() => {
                    setMissingTableAlert(null);
                    navigateToTab('administrasi');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium"
                >
                  Buka Panel Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

