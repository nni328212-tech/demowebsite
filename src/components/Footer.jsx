import Link from 'next/link';
import { Settings, Facebook, Youtube, MessageCircle } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <Settings className={styles.logoIcon} size={24} />
            GLOBAL<span>SOLUTIONS</span>
          </Link>
          <p className={styles.desc}>
            Giải pháp toàn diện cho công nghiệp & năng lượng mới.<br/>
            Chúng tôi cam kết mang lại giá trị bền vững và hiệu quả cao nhất cho mọi công trình.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={20} /></a>
            <a href="#" aria-label="Zalo"><MessageCircle size={20} /></a>
          </div>
        </div>
        
        <div className={styles.col}>
          <h4>Về chúng tôi</h4>
          <Link href="/about">Giới thiệu công ty</Link>
          <Link href="/vision">Tầm nhìn & Sứ mệnh</Link>
          <Link href="/news">Tin tức sự kiện</Link>
          <Link href="/careers">Tuyển dụng</Link>
        </div>
        
        <div className={styles.col}>
          <h4>Lĩnh vực</h4>
          <Link href="/products/lighting">Đèn công nghiệp</Link>
          <Link href="/products/battery">Giải pháp Pin lưu trữ</Link>
          <Link href="/products/solar">Năng lượng mặt trời</Link>
          <Link href="/products/construction">Xây dựng hạ tầng</Link>
        </div>
        
        <div className={styles.col}>
          <h4>Liên hệ</h4>
          <p>📍 TP. Hồ Chí Minh, Việt Nam</p>
          <p>📞 Hotline: 0912 122 016</p>
          <p>✉ Email: contact@globalsolutions.vn</p>
        </div>
      </div>
      
      <div className={`container ${styles.bottom}`}>
        <span>© 2026 Global Solutions. All rights reserved.</span>
        <div className={styles.legal}>
          <Link href="/privacy">Chính sách bảo mật</Link>
          <Link href="/terms">Điều khoản sử dụng</Link>
        </div>
      </div>
    </footer>
  );
}
