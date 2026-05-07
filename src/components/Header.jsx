'use client';
import Link from 'next/link';
import { Settings, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Link href="/" className={styles.logo}>
          <Settings className={styles.logoIcon} size={28} />
          GLOBAL<span>SOLUTIONS</span>
        </Link>
        
        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <Link href="/" className={styles.active}>Trang chủ</Link>
          <Link href="/about">Về chúng tôi</Link>
          <Link href="/products">Sản phẩm</Link>
          <Link href="/news">Tin tức</Link>
          <Link href="/careers">Tuyển dụng</Link>
          <Link href="/contact">Liên hệ</Link>
          <Link href="/contact" className={styles.navCta}>Hỗ trợ trực tuyến</Link>
          <button className={styles.searchBtn} aria-label="Search">
            <Search size={20} />
          </button>
        </nav>

        <button 
          className={styles.menuToggle} 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
