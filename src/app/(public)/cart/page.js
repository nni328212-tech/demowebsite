'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    companyName: '',
    message: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit inquiry to Supabase
      const { error } = await supabase.from('inquiries').insert([
        {
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          company_name: formData.companyName,
          message: formData.message,
          product_interest: `Yêu cầu báo giá ${items.length} sản phẩm`,
          notes: JSON.stringify(items.map(i => ({ 
            id: i.product.id, 
            sku: i.product.sku, 
            name: i.product.name, 
            qty: i.quantity 
          })))
        }
      ]);

      if (error) throw error;

      setSubmitSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      alert("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại hoặc gọi Hotline.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (submitSuccess) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ color: 'var(--brand-blue)', marginBottom: '16px' }}>Gửi yêu cầu thành công!</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '30px' }}>
          Cảm ơn bạn đã quan tâm đến giải pháp của Global Solutions.<br/>
          Chuyên viên của chúng tôi sẽ liên hệ báo giá với bạn trong thời gian sớm nhất.
        </p>
        <Link href="/products" className="btn btn-primary">Tiếp tục xem sản phẩm</Link>
      </div>
    );
  }

  return (
    <>
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>YÊU CẦU BÁO GIÁ</h1>
        </div>
      </div>

      <div className="container section">
        {items.length === 0 ? (
          <div className={styles.emptyCart}>
            <ShoppingBag size={64} style={{ color: 'var(--border)', marginBottom: '20px' }} />
            <h2>Bạn chưa chọn sản phẩm nào</h2>
            <p>Vui lòng xem danh mục sản phẩm và thêm vào danh sách yêu cầu báo giá.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Xem sản phẩm ngay
            </Link>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            {/* Cart Items List */}
            <div className={styles.cartItems}>
              <div className={styles.cartHeader}>
                <h2 className={styles.cartTitle}>Sản phẩm đã chọn ({items.length})</h2>
              </div>
              
              <div className={styles.itemsList}>
                {items.map((item) => (
                  <div key={item.product.id} className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      <Image 
                        src={`/${item.product.image_url}`} 
                        alt={item.product.name} 
                        width={100} 
                        height={100} 
                        style={{ objectFit: 'cover' }} 
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <Link href={`/products/${item.product.slug}`} className={styles.itemName}>
                        {item.product.name}
                      </Link>
                      <div className={styles.itemSku}>Mã SP: {item.product.sku}</div>
                      <div className={styles.itemPrice}>
                        {item.product.price > 0 ? `${Number(item.product.price).toLocaleString()} ₫` : 'Liên hệ'}
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <div className={styles.qtyControl}>
                        <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                          min="1"
                        />
                        <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                      </div>
                      <div className={styles.itemTotal}>
                        {item.product.price > 0 ? `${Number(item.product.price * item.quantity).toLocaleString()} ₫` : ''}
                      </div>
                      <button 
                        className={styles.removeBtn} 
                        onClick={() => removeItem(item.product.id)}
                        aria-label="Xóa"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cartSummary}>
                <div className={styles.summaryRow}>
                  <span>Tạm tính ({items.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm):</span>
                  <span className={styles.totalPrice}>{Number(getTotalPrice()).toLocaleString()} ₫</span>
                </div>
                <p className={styles.summaryNote}>* Giá trên chỉ là tạm tính và chưa bao gồm VAT, chiết khấu và chi phí vận chuyển. Chúng tôi sẽ gửi báo giá chính thức sau khi nhận được yêu cầu.</p>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className={styles.inquiryFormContainer}>
              <h2 className={styles.formTitle}>Thông tin liên hệ</h2>
              <form className={styles.inquiryForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Họ và tên *</label>
                  <input type="text" id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="companyName">Tên công ty / Tổ chức</label>
                  <input type="text" id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message">Ghi chú yêu cầu</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    rows="4" 
                    placeholder="Vui lòng cho biết thêm về dự án, địa điểm giao hàng hoặc các yêu cầu đặc biệt khác..."
                    value={formData.message} 
                    onChange={handleChange}
                  ></textarea>
                </div>
                <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={isSubmitting}>
                  {isSubmitting ? 'ĐANG GỬI...' : 'GỬI YÊU CẦU BÁO GIÁ'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
