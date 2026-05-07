/**
 * POTECH Cart Module
 * Giỏ hàng / Yêu cầu báo giá - Lưu localStorage
 */
const Cart = {
  KEY: 'potech_cart',

  getItems() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  add(item) {
    const items = this.getItems();
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      existing.qty += item.qty;
    } else {
      items.push({ id: item.id, name: item.name, sku: item.sku || '', price: item.price, image_url: item.image_url || '', qty: item.qty || 1, unit: item.unit || 'bộ' });
    }
    this.save(items);
  },

  updateQty(id, qty) {
    const items = this.getItems();
    const item = items.find(i => i.id === id);
    if (item) { item.qty = Math.max(1, qty); this.save(items); }
  },

  remove(id) {
    this.save(this.getItems().filter(i => i.id !== id));
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },

  count() {
    return this.getItems().reduce((sum, i) => sum + i.qty, 0);
  },

  total() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  itemCount() {
    return this.getItems().length;
  }
};
