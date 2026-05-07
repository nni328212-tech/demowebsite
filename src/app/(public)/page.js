import Image from 'next/image';
import Link from 'next/link';
import { Lightbulb, Battery, Sun, Building2, Phone, Mail } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image 
            src="/images/hero_factory.png" 
            alt="Factory Background" 
            fill 
            priority
            style={{ objectFit: 'cover' }} 
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={`container ${styles.heroContent}`}>
          <h1>GIẢI PHÁP TOÀN DIỆN CHO CÔNG NGHIỆP & NĂNG LƯỢNG MỚI</h1>
          <p>Khám phá các lĩnh vực cốt lõi của chúng tôi bên dưới.</p>
        </div>
      </section>

      {/* 4 PILLARS */}
      <section className={styles.pillarsSection}>
        <div className="container">
          <div className={styles.pillarsGrid}>
            
            {/* Lighting */}
            <div className={`${styles.pillarCard} ${styles.pillarLighting}`}>
              <div className={styles.pillarHeader}>
                <h3>ĐÈN CÔNG NGHIỆP</h3>
                <div className={styles.pillarIcon}><Lightbulb size={32} /></div>
              </div>
              <div className={styles.pillarImg}>
                <Image src="/images/led_highbay.png" alt="Đèn công nghiệp" width={400} height={300} style={{objectFit: 'cover'}} />
              </div>
              <div className={styles.pillarBody}>
                <p>Chiếu sáng nhà xưởng, kho bãi tối ưu.</p>
                <Link href="/products" className={styles.pillarBtn}>XEM CHI TIẾT</Link>
              </div>
            </div>

            {/* Battery */}
            <div className={`${styles.pillarCard} ${styles.pillarBattery}`}>
              <div className={styles.pillarHeader}>
                <h3>PIN LƯU TRỮ</h3>
                <div className={styles.pillarIcon}><Battery size={32} /></div>
              </div>
              <div className={styles.pillarImg}>
                <Image src="/images/led_panel.png" alt="Pin lưu trữ" width={400} height={300} style={{objectFit: 'cover'}} />
              </div>
              <div className={styles.pillarBody}>
                <p>Giải pháp lưu trữ năng lượng tin cậy.</p>
                <Link href="/products" className={styles.pillarBtn}>XEM CHI TIẾT</Link>
              </div>
            </div>

            {/* Solar */}
            <div className={`${styles.pillarCard} ${styles.pillarSolar}`}>
              <div className={styles.pillarHeader}>
                <h3>NLMT</h3>
                <div className={styles.pillarIcon}><Sun size={32} /></div>
              </div>
              <div className={styles.pillarImg}>
                <Image src="/images/led_solar.png" alt="Năng lượng mặt trời" width={400} height={300} style={{objectFit: 'cover'}} />
              </div>
              <div className={styles.pillarBody}>
                <p>Năng lượng mặt trời sạch cho tương lai.</p>
                <Link href="/products" className={styles.pillarBtn}>XEM CHI TIẾT</Link>
              </div>
            </div>

            {/* Construction */}
            <div className={`${styles.pillarCard} ${styles.pillarConstruction}`}>
              <div className={styles.pillarHeader}>
                <h3>XÂY DỰNG</h3>
                <div className={styles.pillarIcon}><Building2 size={32} /></div>
              </div>
              <div className={styles.pillarImg}>
                <Image src="/images/project_warehouse.png" alt="Xây dựng" width={400} height={300} style={{objectFit: 'cover'}} />
              </div>
              <div className={styles.pillarBody}>
                <p>Thi công công trình, hạ tầng chất lượng.</p>
                <Link href="/products" className={styles.pillarBtn}>XEM CHI TIẾT</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Ưu điểm</span>
            <h2 className={styles.sectionTitle}>Vì sao chọn Global Solutions?</h2>
            <p className={styles.sectionDesc}>Cam kết chất lượng hàng đầu và giải pháp tối ưu nhất</p>
          </div>
          
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⭐</div>
              <h3>Chất lượng vượt trội</h3>
              <p>Sản phẩm và dịch vụ đạt tiêu chuẩn quốc tế, bền bỉ với thời gian.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>Tối ưu hiệu quả</h3>
              <p>Giải pháp giúp tiết kiệm chi phí năng lượng và vận hành tối đa.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛡️</div>
              <h3>Bảo hành dài hạn</h3>
              <p>Chính sách bảo hành tận tâm, đồng hành cùng doanh nghiệp.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🤝</div>
              <h3>Đối tác tin cậy</h3>
              <p>Hợp tác với các thương hiệu hàng đầu thế giới trong ngành.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section">
        <div className="container">
          <div className={styles.ctaSection}>
            <h2>Bạn cần <span style={{ color: 'var(--brand-blue)' }}>giải pháp</span> năng lượng chuyên nghiệp?</h2>
            <p>Đội ngũ chuyên gia Global Solutions sẵn sàng hỗ trợ bạn 24/7. Liên hệ ngay để nhận tư vấn!</p>
            <div className={styles.ctaActions}>
              <a href="tel:0912122016" className="btn btn-primary">
                <Phone size={18} style={{ marginRight: '8px' }} /> Gọi ngay: 0912.122.016
              </a>
              <Link href="/contact" className="btn btn-outline">
                <Mail size={18} style={{ marginRight: '8px' }} /> Gửi yêu cầu
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
