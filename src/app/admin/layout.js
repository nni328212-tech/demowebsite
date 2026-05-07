'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, MessageSquare, Settings, LogOut, Package } from 'lucide-react';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Settings size={24} className={styles.logoIcon} />
            <span>ADMIN PANEl</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={`${styles.navItem} ${pathname === '/admin' ? styles.active : ''}`}>
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/admin/inquiries" className={`${styles.navItem} ${pathname.includes('/inquiries') ? styles.active : ''}`}>
            <MessageSquare size={20} />
            Yêu cầu báo giá
          </Link>
          <Link href="/admin/products" className={`${styles.navItem} ${pathname.includes('/products') ? styles.active : ''}`}>
            <Package size={20} />
            Quản lý Sản phẩm
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.logoutBtn}>
            <LogOut size={20} />
            Thoát về Website
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>A</div>
            <span>Admin Global Solutions</span>
          </div>
        </header>
        
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
