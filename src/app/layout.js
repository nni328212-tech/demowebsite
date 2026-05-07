import '../globals.css';

export const metadata = {
  title: 'Global Solutions - Giải pháp toàn diện',
  description: 'Cung cấp giải pháp toàn diện về Đèn công nghiệp, Pin lưu trữ, Năng lượng mặt trời.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
      </body>
    </html>
  );
}
