'use client';
import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function ProductActions({ product, classNameBtn }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem(product, quantity);
    alert(`Đã thêm ${quantity} x ${product.name} vào yêu cầu báo giá!`);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
      <div style={{
        display: 'flex',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden'
      }}>
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          style={{ background: 'var(--bg-secondary)', border: 'none', width: '48px', fontSize: '1.2rem', cursor: 'pointer' }}
        >-</button>
        <input 
          type="number" 
          value={quantity} 
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          style={{ width: '60px', border: 'none', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', textAlign: 'center', fontSize: '1.1rem', fontWeight: '600' }}
        />
        <button 
          onClick={() => setQuantity(quantity + 1)}
          style={{ background: 'var(--bg-secondary)', border: 'none', width: '48px', fontSize: '1.2rem', cursor: 'pointer' }}
        >+</button>
      </div>
      
      <button className={classNameBtn} onClick={handleAdd}>
        <ShoppingCart size={20} />
        THÊM VÀO YÊU CẦU BÁO GIÁ
      </button>
    </div>
  );
}
