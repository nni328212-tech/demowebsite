'use client';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function AddToCartBtn({ product, className, showText = false, quantity = 1 }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = (e) => {
    e.preventDefault(); // In case it's inside a Link
    addItem(product, quantity);
    alert(`Đã thêm ${product.name} vào yêu cầu báo giá!`);
  };

  return (
    <button className={className} onClick={handleAdd} aria-label="Thêm vào yêu cầu báo giá">
      <ShoppingCart size={18} />
      {showText && <span style={{ marginLeft: '8px' }}>THÊM VÀO YÊU CẦU BÁO GIÁ</span>}
    </button>
  );
}
