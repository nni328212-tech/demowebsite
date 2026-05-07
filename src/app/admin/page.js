import { supabase } from '@/lib/supabase';
import { ShoppingBag, Users, Package, AlertCircle } from 'lucide-react';
import styles from './page.module.css';

export const metadata = {
  title: 'Admin Dashboard - Global Solutions',
};

export default async function AdminDashboard() {
  // Fetch stats concurrently
  const [inquiriesRes, productsRes, categoriesRes] = await Promise.all([
    supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true })
  ]);

  const newInquiriesCount = inquiriesRes.count || 0;
  const productsCount = productsRes.count || 0;
  const categoriesCount = categoriesRes.count || 0;

  return (
    <div>
      <h1 className={styles.pageTitle}>Tổng quan Hệ thống</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <AlertCircle size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>Yêu cầu báo giá mới</h3>
            <p className={styles.statValue}>{newInquiriesCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#f0fdf4', color: '#22c55e' }}>
            <Package size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>Tổng Sản phẩm</h3>
            <p className={styles.statValue}>{productsCount}</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fdf2f8', color: '#ec4899' }}>
            <ShoppingBag size={24} />
          </div>
          <div className={styles.statInfo}>
            <h3>Danh mục Hàng hóa</h3>
            <p className={styles.statValue}>{categoriesCount}</p>
          </div>
        </div>
      </div>

      <div className={styles.dashboardWidget}>
        <h2>Chào mừng trở lại!</h2>
        <p>Hệ thống Global Solutions CMS đang hoạt động ổn định. Để xem chi tiết các yêu cầu báo giá từ khách hàng, vui lòng truy cập menu "Yêu cầu báo giá" bên trái.</p>
      </div>
    </div>
  );
}
