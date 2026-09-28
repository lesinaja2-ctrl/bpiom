import { Product, Category, Producer, LabResult, RecallAlert, Report, User, AppConfig, WebsiteSettings, CustomPage } from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PRODUCERS,
  INITIAL_LAB_RESULTS,
  INITIAL_RECALLS,
  INITIAL_REPORTS,
  INITIAL_USERS,
  DEFAULT_WEBSITE_SETTINGS,
  INITIAL_CUSTOM_PAGES,
} from '../data/initialData';
import { SupabaseService } from './supabaseService';

const CONFIG_KEY = 'bpom_app_config_v1';
const PRODUCTS_KEY = 'bpom_products_v1';
const CATEGORIES_KEY = 'bpom_categories_v1';
const PRODUCERS_KEY = 'bpom_producers_v1';
const LAB_RESULTS_KEY = 'bpom_lab_results_v1';
const RECALLS_KEY = 'bpom_recalls_v1';
const REPORTS_KEY = 'bpom_reports_v1';
const USERS_KEY = 'bpom_users_v1';
const CURRENT_USER_KEY = 'bpom_current_user_v1';
const SETTINGS_KEY = 'bpom_website_settings_v1';
const CUSTOM_PAGES_KEY = 'bpom_custom_pages_v1';

export class StorageService {
  // WEBSITE SETTINGS (Admin Branding, Logo, Theme, Info, Running Text)
  static getWebsiteSettings(): WebsiteSettings {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          !parsed.nama_website ||
          parsed.nama_website.toUpperCase().includes('PENGAWASAN')
        ) {
          parsed.nama_website = DEFAULT_WEBSITE_SETTINGS.nama_website;
          parsed.singkatan_portal = DEFAULT_WEBSITE_SETTINGS.singkatan_portal;
          parsed.teks_footer = DEFAULT_WEBSITE_SETTINGS.teks_footer;
          parsed.deskripsi_singkat = DEFAULT_WEBSITE_SETTINGS.deskripsi_singkat;
          localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_WEBSITE_SETTINGS, ...parsed }));
        }
        return { ...DEFAULT_WEBSITE_SETTINGS, ...parsed };
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_WEBSITE_SETTINGS));
    return DEFAULT_WEBSITE_SETTINGS;
  }

  static getSettings(): WebsiteSettings {
    return this.getWebsiteSettings();
  }

  static saveWebsiteSettingsLocalOnly(settings: WebsiteSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  static saveWebsiteSettings(settings: WebsiteSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    this.syncToRemoteIfActive('PengaturanWebsite', settings);
    SupabaseService.saveWebsiteSettings(settings).catch(e => console.warn('Supabase settings sync error:', e));
  }

  static saveSettings(settings: WebsiteSettings): void {
    this.saveWebsiteSettings(settings);
  }

  // CUSTOM PAGES (CMS)
  static getCustomPages(): CustomPage[] {
    const saved = localStorage.getItem(CUSTOM_PAGES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(CUSTOM_PAGES_KEY, JSON.stringify(INITIAL_CUSTOM_PAGES));
    return INITIAL_CUSTOM_PAGES;
  }

  static saveCustomPagesLocalOnly(pages: CustomPage[]): void {
    localStorage.setItem(CUSTOM_PAGES_KEY, JSON.stringify(pages));
  }

  static saveCustomPages(pages: CustomPage[]): void {
    localStorage.setItem(CUSTOM_PAGES_KEY, JSON.stringify(pages));
    this.syncToRemoteIfActive('HalamanKonten', pages);
  }

  static addCustomPage(page: CustomPage): CustomPage {
    const list = this.getCustomPages();
    const updated = [...list, page];
    this.saveCustomPages(updated);
    SupabaseService.upsertCustomPage(page).catch(e => console.warn('Supabase addCustomPage error:', e));
    return page;
  }

  static updateCustomPage(page: CustomPage): CustomPage {
    const list = this.getCustomPages();
    const idx = list.findIndex(p => p.id === page.id);
    if (idx !== -1) {
      list[idx] = page;
      this.saveCustomPages(list);
    }
    SupabaseService.upsertCustomPage(page).catch(e => console.warn('Supabase updateCustomPage error:', e));
    return page;
  }

  static deleteCustomPage(pageId: string): void {
    const list = this.getCustomPages();
    const updated = list.filter(p => p.id !== pageId);
    this.saveCustomPages(updated);
    SupabaseService.deleteCustomPage(pageId).catch(e => console.warn('Supabase deleteCustomPage error:', e));
  }

  // CONFIG
  static getConfig(): AppConfig {
    const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
    const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
    const hasEnvSupabase = Boolean(envUrl && envKey);

    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (hasEnvSupabase) {
          parsed.supabase_url = parsed.supabase_url || envUrl;
          parsed.supabase_anon_key = parsed.supabase_anon_key || envKey;
          if (parsed.backend_mode === 'local') {
            parsed.backend_mode = 'supabase';
            parsed.is_connected = true;
          }
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }

    return {
      backend_mode: hasEnvSupabase ? 'supabase' : 'local',
      google_sheets_id: '',
      google_script_url: '',
      google_drive_folder_id: '',
      supabase_url: envUrl,
      supabase_anon_key: envKey,
      is_connected: hasEnvSupabase,
    };
  }

  static saveConfig(config: AppConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }

  // CURRENT LOGGED IN USER
  static getCurrentUser(): User | null {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default to admin user for convenient full demonstration if desired
    return INITIAL_USERS[0];
  }

  static setCurrentUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  }

  // PRODUCTS
  static getProducts(): Product[] {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  static saveProductsLocalOnly(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  }

  static saveProducts(products: Product[]): void {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    this.syncToRemoteIfActive('Produk', products);
  }

  static addProduct(product: Product): Product {
    const list = this.getProducts();
    const updated = [product, ...list];
    this.saveProducts(updated);
    
    // update category count
    this.incrementCategoryCount(product.kategori);

    // Persist to Supabase Server
    SupabaseService.upsertProduct(product).catch(err => {
      console.warn('[Supabase] Gagal menyimpan produk ke Supabase server:', err);
    });

    return product;
  }

  static updateProduct(product: Product): Product {
    const list = this.getProducts();
    const index = list.findIndex(p => p.id === product.id);
    if (index !== -1) {
      list[index] = product;
      this.saveProducts(list);
    }

    // Persist to Supabase Server
    SupabaseService.upsertProduct(product).catch(err => {
      console.warn('[Supabase] Gagal memperbarui produk di Supabase server:', err);
    });

    return product;
  }

  static deleteProduct(productId: string): void {
    const list = this.getProducts();
    const target = list.find(p => p.id === productId);
    const filtered = list.filter(p => p.id !== productId);
    this.saveProducts(filtered);
    if (target) {
      this.decrementCategoryCount(target.kategori);
    }

    // Persist delete to Supabase Server
    SupabaseService.deleteProduct(productId).catch(err => {
      console.warn('[Supabase] Gagal menghapus produk dari Supabase server:', err);
    });
  }

  // CATEGORIES
  static getCategories(): Category[] {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }

  static saveCategoriesLocalOnly(categories: Category[]): void {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }

  static saveCategories(categories: Category[]): void {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    this.syncToRemoteIfActive('Kategori', categories);
  }

  static addCategory(category: Category): Category {
    const list = this.getCategories();
    const updated = [...list, category];
    this.saveCategories(updated);
    SupabaseService.upsertCategory(category).catch(e => console.warn('Supabase addCategory error:', e));
    return category;
  }

  static deleteCategory(categoryId: string): void {
    const list = this.getCategories();
    const updated = list.filter(c => c.id !== categoryId);
    this.saveCategories(updated);
    SupabaseService.deleteCategory(categoryId).catch(e => console.warn('Supabase deleteCategory error:', e));
  }

  private static incrementCategoryCount(catName: string) {
    const list = this.getCategories();
    const item = list.find(c => c.nama === catName);
    if (item) {
      item.total_produk += 1;
      this.saveCategories([...list]);
      SupabaseService.upsertCategory(item).catch(() => {});
    }
  }

  private static decrementCategoryCount(catName: string) {
    const list = this.getCategories();
    const item = list.find(c => c.nama === catName);
    if (item && item.total_produk > 0) {
      item.total_produk -= 1;
      this.saveCategories([...list]);
      SupabaseService.upsertCategory(item).catch(() => {});
    }
  }

  // PRODUCERS
  static getProducers(): Producer[] {
    const saved = localStorage.getItem(PRODUCERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(PRODUCERS_KEY, JSON.stringify(INITIAL_PRODUCERS));
    return INITIAL_PRODUCERS;
  }

  static saveProducersLocalOnly(producers: Producer[]): void {
    localStorage.setItem(PRODUCERS_KEY, JSON.stringify(producers));
  }

  static saveProducers(producers: Producer[]): void {
    localStorage.setItem(PRODUCERS_KEY, JSON.stringify(producers));
    this.syncToRemoteIfActive('Produsen', producers);
  }

  static addProducer(producer: Producer): Producer {
    const list = this.getProducers();
    const updated = [producer, ...list];
    this.saveProducers(updated);
    SupabaseService.upsertProducer(producer).catch(e => console.warn('Supabase addProducer error:', e));
    return producer;
  }

  static deleteProducer(producerId: string): void {
    const list = this.getProducers();
    const updated = list.filter(p => p.id !== producerId);
    this.saveProducers(updated);
    SupabaseService.deleteProducer(producerId).catch(e => console.warn('Supabase deleteProducer error:', e));
  }

  // LAB RESULTS
  static getLabResults(): LabResult[] {
    const saved = localStorage.getItem(LAB_RESULTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(LAB_RESULTS_KEY, JSON.stringify(INITIAL_LAB_RESULTS));
    return INITIAL_LAB_RESULTS;
  }

  static saveLabResultsLocalOnly(results: LabResult[]): void {
    localStorage.setItem(LAB_RESULTS_KEY, JSON.stringify(results));
  }

  static saveLabResults(results: LabResult[]): void {
    localStorage.setItem(LAB_RESULTS_KEY, JSON.stringify(results));
    this.syncToRemoteIfActive('UjiLaborat', results);
  }

  static addLabResult(result: LabResult): LabResult {
    const list = this.getLabResults();
    const updated = [result, ...list];
    this.saveLabResults(updated);
    SupabaseService.upsertLabResult(result).catch(e => console.warn('Supabase addLabResult error:', e));
    return result;
  }

  static deleteLabResult(labId: string): void {
    const list = this.getLabResults();
    const updated = list.filter(l => l.id !== labId);
    this.saveLabResults(updated);
    SupabaseService.deleteLabResult(labId).catch(e => console.warn('Supabase deleteLabResult error:', e));
  }

  // RECALLS
  static getRecalls(): RecallAlert[] {
    const saved = localStorage.getItem(RECALLS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(RECALLS_KEY, JSON.stringify(INITIAL_RECALLS));
    return INITIAL_RECALLS;
  }

  static saveRecallsLocalOnly(recalls: RecallAlert[]): void {
    localStorage.setItem(RECALLS_KEY, JSON.stringify(recalls));
  }

  static saveRecalls(recalls: RecallAlert[]): void {
    localStorage.setItem(RECALLS_KEY, JSON.stringify(recalls));
    this.syncToRemoteIfActive('PenarikanProduk', recalls);
  }

  static addRecall(recall: RecallAlert): RecallAlert {
    const list = this.getRecalls();
    const updated = [recall, ...list];
    this.saveRecalls(updated);
    SupabaseService.upsertRecall(recall).catch(e => console.warn('Supabase addRecall error:', e));
    return recall;
  }

  static deleteRecall(recallId: string): void {
    const list = this.getRecalls();
    const updated = list.filter(r => r.id !== recallId);
    this.saveRecalls(updated);
    SupabaseService.deleteRecall(recallId).catch(e => console.warn('Supabase deleteRecall error:', e));
  }

  // REPORTS (PENGADUAN MASYARAKAT)
  static getReports(): Report[] {
    const saved = localStorage.getItem(REPORTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
    return INITIAL_REPORTS;
  }

  static saveReportsLocalOnly(reports: Report[]): void {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }

  static saveReports(reports: Report[]): void {
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    this.syncToRemoteIfActive('PengaduanMasyarakat', reports);
  }

  static addReport(report: Report): Report {
    const list = this.getReports();
    const updated = [report, ...list];
    this.saveReports(updated);
    SupabaseService.upsertReport(report).catch(e => console.warn('Supabase addReport error:', e));
    return report;
  }

  static updateReportStatus(reportId: string, status: Report['status'], tanggapan?: string): void {
    const list = this.getReports();
    const item = list.find(r => r.id === reportId);
    if (item) {
      item.status = status;
      if (tanggapan) item.tanggapan_petugas = tanggapan;
      this.saveReports([...list]);
      SupabaseService.upsertReport(item).catch(e => console.warn('Supabase updateReport error:', e));
    }
  }

  // USERS (Admin Sheet Data User)
  static getUsers(): User[] {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }

  static saveUsersLocalOnly(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.syncToRemoteIfActive('Users', users);
  }

  static addUser(user: User): User {
    const list = this.getUsers();
    const updated = [...list, user];
    this.saveUsers(updated);
    SupabaseService.upsertUser(user).catch(e => console.warn('Supabase addUser error:', e));
    return user;
  }

  static updateUser(user: User): User {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      list[idx] = user;
      this.saveUsers(list);
      SupabaseService.upsertUser(user).catch(e => console.warn('Supabase updateUser error:', e));
    }
    return user;
  }

  static deleteUser(userId: string): void {
    const list = this.getUsers();
    const updated = list.filter(u => u.id !== userId);
    this.saveUsers(updated);
    SupabaseService.deleteUser(userId).catch(e => console.warn('Supabase deleteUser error:', e));
  }

  // FILE UPLOAD KE GOOGLE DRIVE (Direct GAS or Cloud Simulation with Drive URL)
  static async uploadFileToDrive(file: File): Promise<{ fileUrl: string; fileId: string }> {
    const config = this.getConfig();

    // If Google Apps Script Web App URL is configured, try live upload to Drive
    if (config.google_script_url && config.backend_mode === 'googlesheets') {
      try {
        const base64 = await this.fileToBase64(file);
        const res = await fetch(config.google_script_url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'upload_drive',
            fileName: file.name,
            mimeType: file.type,
            base64Data: base64,
          }),
        });
        const json = await res.json();
        if (json.success && json.fileUrl) {
          return { fileUrl: json.fileUrl, fileId: json.fileId };
        }
      } catch (err) {
        console.warn('Gagal upload ke Google Apps Script Drive, beralih ke penyimpanan lokal:', err);
      }
    }

    // Default Fallback: generate high-resolution data URI preview with Google Drive compatible URL simulation
    const base64 = await this.fileToBase64(file);
    const randomDriveId = 'DRV-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now();
    return {
      fileUrl: base64,
      fileId: randomDriveId,
    };
  }

  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // REMOTE SYNC HELPER
  private static async syncToRemoteIfActive(table: string, data: any) {
    const config = this.getConfig();
    if (!config.is_connected) return;

    // Google Sheets GAS Sync
    if (config.backend_mode === 'googlesheets' && config.google_script_url) {
      try {
        fetch(config.google_script_url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'sync_table',
            table: table,
            dataset: data,
          }),
        }).catch(err => console.error('Sync error:', err));
      } catch (err) {
        console.error(err);
      }
    }
  }

  // RESET TO DEFAULT
  static resetToDefault(): void {
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(CATEGORIES_KEY);
    localStorage.removeItem(PRODUCERS_KEY);
    localStorage.removeItem(LAB_RESULTS_KEY);
    localStorage.removeItem(RECALLS_KEY);
    localStorage.removeItem(REPORTS_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(CUSTOM_PAGES_KEY);
  }
}
