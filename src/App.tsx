import React, { useState, useEffect, useCallback } from 'react';
import { StorageService } from './services/storageService';
import { SupabaseService } from './services/supabaseService';
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
} from 'lucide-react';

export default function App() {
  // Core Entities State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [recalls, setRecalls] = useState<RecallAlert[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<AppConfig>(StorageService.getConfig());
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [settings, setSettings] = useState<WebsiteSettings>(StorageService.getSettings());
  const [customPages, setCustomPages] = useState<CustomPage[]>(StorageService.getCustomPages());

  // Navigation & Routing State
  const [activeTab, setActiveTab] = useState<string>('directory');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [standaloneProduct, setStandaloneProduct] = useState<Product | null>(null);
  const [selectedCustomPage, setSelectedCustomPage] = useState<CustomPage | null>(null);

  // Modals State
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState<boolean>(false);
  const [isDatabaseSyncOpen, setIsDatabaseSyncOpen] = useState<boolean>(false);
  const [isDeploymentGuideOpen, setIsDeploymentGuideOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Supabase Sync Status State
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<'connected' | 'syncing' | 'error' | 'idle'>('idle');
  const [lastSyncedTime, setLastSyncedTime] = useState<string>('');
  const [supabaseErrorBanner, setSupabaseErrorBanner] = useState<string | null>(null);

  // Initial Data Load & Supabase Integration
  const loadLocalData = () => {
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

  const syncFromSupabase = useCallback(async (silent = false) => {
    const configInfo = SupabaseService.getConfigInfo();
    if (!configInfo.isConfigured) {
      setSupabaseSyncStatus('idle');
      return;
    }

    if (!silent) setSupabaseSyncStatus('syncing');

    try {
      const result = await SupabaseService.fetchAllFromSupabase();
      if (result.isAvailable) {
        if (result.products && result.products.length > 0) {
          setProducts(result.products);
          StorageService.saveProductsLocalOnly(result.products);
        } else if (result.products && result.products.length === 0) {
          // If Supabase table is completely empty on initial setup, seed it
          await SupabaseService.autoSeedIfEmpty();
          const refreshed = await SupabaseService.fetchProducts();
          if (refreshed && refreshed.length > 0) {
            setProducts(refreshed);
            StorageService.saveProductsLocalOnly(refreshed);
          }
        }

        if (result.categories && result.categories.length > 0) {
          setCategories(result.categories);
          StorageService.saveCategoriesLocalOnly(result.categories);
        }
        if (result.producers && result.producers.length > 0) {
          setProducers(result.producers);
          StorageService.saveProducersLocalOnly(result.producers);
        }
        if (result.labResults && result.labResults.length > 0) {
          setLabResults(result.labResults);
          StorageService.saveLabResultsLocalOnly(result.labResults);
        }
        if (result.recalls && result.recalls.length > 0) {
          setRecalls(result.recalls);
          StorageService.saveRecallsLocalOnly(result.recalls);
        }
        if (result.reports && result.reports.length > 0) {
          setReports(result.reports);
          StorageService.saveReportsLocalOnly(result.reports);
        }
        if (result.users && result.users.length > 0) {
          setUsers(result.users);
          StorageService.saveUsersLocalOnly(result.users);
        }
        if (result.customPages && result.customPages.length > 0) {
          setCustomPages(result.customPages);
          StorageService.saveCustomPagesLocalOnly(result.customPages);
        }
        if (result.settings) {
          setSettings(result.settings);
          StorageService.saveWebsiteSettingsLocalOnly(result.settings);
        }

        setSupabaseSyncStatus('connected');
        setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        setSupabaseErrorBanner(null);
      } else {
        const testRes = await SupabaseService.testConnection();
        if (!testRes.success && (testRes.message.includes('tabel') || testRes.message.includes('SQL'))) {
          setSupabaseErrorBanner(testRes.message);
        }
        setSupabaseSyncStatus('error');
      }
    } catch (e: any) {
      console.warn('Sync from Supabase failed:', e);
      setSupabaseSyncStatus('error');
    }
  }, []);

  useEffect(() => {
    loadLocalData();
    syncFromSupabase();

    // Setup Supabase Realtime subscription
    const unsubscribe = SupabaseService.subscribeToChanges((table) => {
      console.log(`[Supabase Realtime] Perubahan terdeteksi di tabel: ${table}`);
      if (table === 'produk') {
        SupabaseService.fetchProducts().then(prods => {
          if (prods) {
            setProducts(prods);
            StorageService.saveProductsLocalOnly(prods);
          }
        });
      } else if (table === 'kategori') {
        SupabaseService.fetchCategories().then(cats => {
          if (cats) {
            setCategories(cats);
            StorageService.saveCategoriesLocalOnly(cats);
          }
        });
      } else if (table === 'produsen') {
        SupabaseService.fetchProducers().then(prods => {
          if (prods) {
            setProducers(prods);
            StorageService.saveProducersLocalOnly(prods);
          }
        });
      } else if (table === 'penarikan_produk') {
        SupabaseService.fetchRecalls().then(recs => {
          if (recs) {
            setRecalls(recs);
            StorageService.saveRecallsLocalOnly(recs);
          }
        });
      } else if (table === 'pengaduan_masyarakat') {
        SupabaseService.fetchReports().then(reps => {
          if (reps) {
            setReports(reps);
            StorageService.saveReportsLocalOnly(reps);
          }
        });
      } else if (table === 'halaman_kustom') {
        SupabaseService.fetchCustomPages().then(pgs => {
          if (pgs) {
            setCustomPages(pgs);
            StorageService.saveCustomPagesLocalOnly(pgs);
          }
        });
      } else if (table === 'pengaturan_website') {
        SupabaseService.fetchSettings().then(setts => {
          if (setts) {
            setSettings(setts);
            StorageService.saveWebsiteSettingsLocalOnly(setts);
          }
        });
      }
    });

    const handleFocus = () => {
      syncFromSupabase(true);
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      syncFromSupabase(true);
    }, 25000);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [syncFromSupabase]);

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
  const handleAddProduct = async (newProduct: Product) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    StorageService.addProduct(newProduct);
    await SupabaseService.upsertProduct(newProduct);
    setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(updated);
    StorageService.updateProduct(updatedProduct);
    if (selectedProduct?.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
    if (standaloneProduct?.id === updatedProduct.id) {
      setStandaloneProduct(updatedProduct);
    }
    await SupabaseService.upsertProduct(updatedProduct);
    setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleDeleteProduct = async (productId: string) => {
    const updated = products.filter((p) => p.id !== productId);
    setProducts(updated);
    StorageService.deleteProduct(productId);
    if (selectedProduct?.id === productId) setSelectedProduct(null);
    if (standaloneProduct?.id === productId) {
      setStandaloneProduct(null);
      setActiveTab('directory');
    }
    await SupabaseService.deleteProduct(productId);
    setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  };

  // Category Handler
  const handleAddCategory = async (newCategory: Category) => {
    const updated = [...categories, newCategory];
    setCategories(updated);
    StorageService.addCategory(newCategory);
    await SupabaseService.upsertCategory(newCategory);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const updated = categories.filter((c) => c.id !== categoryId);
    setCategories(updated);
    StorageService.deleteCategory(categoryId);
    await SupabaseService.deleteCategory(categoryId);
  };

  // Custom Pages Handlers
  const handleAddCustomPage = async (newPage: CustomPage) => {
    const updated = [...customPages, newPage];
    setCustomPages(updated);
    StorageService.addCustomPage(newPage);
    await SupabaseService.upsertCustomPage(newPage);
  };

  const handleUpdateCustomPage = async (updatedPage: CustomPage) => {
    const updated = customPages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
    setCustomPages(updated);
    StorageService.updateCustomPage(updatedPage);
    if (selectedCustomPage?.id === updatedPage.id) {
      setSelectedCustomPage(updatedPage);
    }
    await SupabaseService.upsertCustomPage(updatedPage);
  };

  const handleDeleteCustomPage = async (pageId: string) => {
    const updated = customPages.filter((p) => p.id !== pageId);
    setCustomPages(updated);
    StorageService.deleteCustomPage(pageId);
    if (selectedCustomPage?.id === pageId) {
      setSelectedCustomPage(null);
      setActiveTab('directory');
    }
    await SupabaseService.deleteCustomPage(pageId);
  };

  // Settings Handler
  const handleSaveSettings = async (newSettings: WebsiteSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    await SupabaseService.saveWebsiteSettings(newSettings);
  };

  // Lab Results Handler
  const handleAddLabResult = async (newLab: LabResult) => {
    const updated = [newLab, ...labResults];
    setLabResults(updated);
    StorageService.addLabResult(newLab);
    await SupabaseService.upsertLabResult(newLab);
  };

  // Recalls Handler
  const handleAddRecall = async (newRecall: RecallAlert) => {
    const updated = [newRecall, ...recalls];
    setRecalls(updated);
    StorageService.addRecall(newRecall);
    await SupabaseService.upsertRecall(newRecall);

    // If matches product, change status to 'Ditarik'
    const matched = products.find((p) => p.nomor_izin === newRecall.nomor_izin);
    if (matched) {
      handleUpdateProduct({
        ...matched,
        status_registrasi: 'Ditarik',
      });
    }
  };

  // Producer Handler
  const handleAddProducer = async (newProd: Producer) => {
    const updated = [...producers, newProd];
    setProducers(updated);
    StorageService.addProducer(newProd);
    await SupabaseService.upsertProducer(newProd);
  };

  // Reports Handler
  const handleAddReport = async (newReport: Report) => {
    const updated = [newReport, ...reports];
    setReports(updated);
    StorageService.addReport(newReport);
    await SupabaseService.upsertReport(newReport);
  };

  const handleUpdateReportStatus = async (id: string, status: Report['status'], note?: string) => {
    const updated = reports.map((r) =>
      r.id === id ? { ...r, status, tanggapan_petugas: note || r.tanggapan_petugas } : r
    );
    setReports(updated);
    StorageService.updateReportStatus(id, status, note);
    const target = updated.find(r => r.id === id);
    if (target) {
      await SupabaseService.upsertReport(target);
    }
  };

  // Users Handler
  const handleAddUser = async (newUser: User) => {
    const updated = [...users, newUser];
    setUsers(updated);
    StorageService.addUser(newUser);
    await SupabaseService.upsertUser(newUser);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    StorageService.updateUser(updatedUser);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      StorageService.setCurrentUser(updatedUser);
    }
    await SupabaseService.upsertUser(updatedUser);
  };

  const handleDeleteUser = async (userId: string) => {
    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    StorageService.deleteUser(userId);
    await SupabaseService.deleteUser(userId);
  };

  // Config & Auth Handler
  const handleSaveConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    StorageService.saveConfig(newConfig);
    syncFromSupabase(false);
  };

  const handleResetData = () => {
    StorageService.resetToDefault();
    loadLocalData();
    syncFromSupabase(false);
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
        supabaseSyncStatus={supabaseSyncStatus}
        lastSyncedTime={lastSyncedTime}
        onTriggerSync={() => syncFromSupabase(false)}
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

      {/* Supabase Schema Notice Banner if tables aren't created yet */}
      {supabaseErrorBanner && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-200" />
            <span>
              <strong>Perhatian Supabase:</strong> {supabaseErrorBanner}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsDatabaseSyncOpen(true)}
              className="px-2.5 py-1 bg-white text-slate-900 rounded font-bold hover:bg-amber-50 text-[11px]"
            >
              Buka Skrip SQL Supabase
            </button>
            <button
              onClick={() => setSupabaseErrorBanner(null)}
              className="text-white/80 hover:text-white font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* 1. Admin Panel Route (Requirement 1: https://bpom.vercel.app/administrasi) */}
        {activeTab === 'administrasi' && (
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
            onOpenAddModal={() => setIsAddProductOpen(true)}
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
    </div>
  );
}
