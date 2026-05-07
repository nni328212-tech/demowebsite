import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export const metadata = {
  title: 'Quản lý Yêu cầu Báo giá - Global Solutions',
};

// Next.js 15 requires opt-in dynamic behavior for database reads to not be cached forever in some cases
export const dynamic = 'force-dynamic';

export default async function InquiriesPage() {
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Danh sách Yêu cầu Báo giá</h1>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách hàng</th>
              <th>Công ty</th>
              <th>Liên hệ</th>
              <th>Yêu cầu</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {inquiries && inquiries.length > 0 ? (
              inquiries.map((inq) => (
                <tr key={inq.id}>
                  <td>#{inq.id.substring(0, 8)}</td>
                  <td className={styles.clientName}>{inq.full_name}</td>
                  <td>{inq.company_name || '-'}</td>
                  <td>
                    <div className={styles.contactInfo}>
                      <span>📞 {inq.phone}</span>
                      {inq.email && <span>✉ {inq.email}</span>}
                    </div>
                  </td>
                  <td>
                    <div className={styles.notes}>
                      <strong>{inq.product_interest}</strong>
                      {inq.message && <p className={styles.messageText}>"{inq.message}"</p>}
                    </div>
                  </td>
                  <td>{new Date(inq.created_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className={`${styles.badge} ${inq.status === 'new' ? styles.badgeNew : styles.badgeProcessed}`}>
                      {inq.status === 'new' ? 'Mới' : 'Đã xử lý'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={styles.emptyState}>Chưa có yêu cầu báo giá nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
