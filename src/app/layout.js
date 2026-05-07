import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Global Solutions - Giải pháp toàn diện cho công nghiệp & năng lượng mới',
  description: 'Global Solutions - Cung cấp giải pháp toàn diện về Đèn công nghiệp, Pin lưu trữ, Năng lượng mặt trời và Xây dựng hạ tầng chuyên nghiệp.',
  keywords: 'đèn công nghiệp, giải pháp pin, năng lượng mặt trời, xây dựng hạ tầng, Global Solutions',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
