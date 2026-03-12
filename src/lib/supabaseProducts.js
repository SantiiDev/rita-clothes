import { supabase } from './supabase';

const ADMIN_EMAIL = 'ritastudio33@gmail.com';

// ── Check if user is admin ──────────────────────────────────────────
export const isAdmin = (user) => {
  return user?.email === ADMIN_EMAIL;
};

// ── Fetch all products ──────────────────────────────────────────────
export const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

// ── Create a new product ────────────────────────────────────────────
export const createProduct = async (product) => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      category: product.category,
      price: product.price,
      colors: product.colors || [],
      sort_order: product.sort_order || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ── Update an existing product ──────────────────────────────────────
export const updateProduct = async (id, changes) => {
  const { data, error } = await supabase
    .from('products')
    .update(changes)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ── Delete a product ────────────────────────────────────────────────
export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ── Upload product image ────────────────────────────────────────────
export const uploadProductImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

// ── Delete product image from storage ───────────────────────────────
export const deleteProductImage = async (url) => {
  try {
    const path = url.split('/product-images/')[1];
    if (path) {
      await supabase.storage.from('product-images').remove([path]);
    }
  } catch {
    // Non-critical — old images from /opt-prendas/ won't be in storage
  }
};
