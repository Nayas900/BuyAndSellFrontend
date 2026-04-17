import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/layout/PageShell';
import { TextInput } from '@/components/inputs/TextInput';
import { Button } from '@/components/ui/Button';
import useProductStore from '@/stores/productStore';
import useAuthStore from '@/stores/authStore';
import { uploadToCloudinary } from '@/lib/cloudinary';

const CATEGORIES = ['Electronics', 'Cars', 'Furniture', 'Clothing', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'] as const;

export const PostAdPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const createProduct = useProductStore((s) => s.createProduct);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: user?.location || '',
    condition: 'Good' as (typeof CONDITIONS)[number],
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - images.length;
    const toUpload = files.slice(0, remaining);

    setUploadingCount(toUpload.length);
    const urls: string[] = [];

    for (const file of toUpload) {
      try {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      } catch {
        setError('One or more images failed to upload. Try again.');
      }
      setUploadingCount((n) => n - 1);
    }

    setImages((prev) => [...prev, ...urls]);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title || !form.description || !form.price || !form.category || !form.location) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const product = await createProduct({
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        location: form.location,
        condition: form.condition,
        images,
      });
      setSuccess('Post uploaded successfully.');
      setTimeout(() => {
        navigate(`/product/${product._id}`);
      }, 900);
    } catch {
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell className="bg-surface-muted">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-surface-border sticky top-0 z-40">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface-muted flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-slate-700" />
        </motion.button>
        <h1 className="font-bold text-slate-800">Post an Ad</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-0 py-6 lg:py-10">
        <div className="hidden lg:flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-slate-300">/</span>
          <h1 className="font-bold text-slate-800 text-lg">Post a New Ad</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Listing details */}
          <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
            <h2 className="font-bold text-slate-800">Listing Details</h2>

            <TextInput
              label="Title *"
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              value={form.title}
              onChange={set('title')}
              maxLength={100}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-600">Description *</label>
              <textarea
                rows={4}
                placeholder="Describe your item — condition, features, reason for selling..."
                value={form.description}
                onChange={set('description')}
                maxLength={2000}
                className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-all duration-150"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Price (₹) *"
                type="number"
                placeholder="0"
                min="0"
                value={form.price}
                onChange={set('price')}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">Condition</label>
                <select
                  value={form.condition}
                  onChange={set('condition')}
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-150"
                >
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-600">Category *</label>
                <select
                  value={form.category}
                  onChange={set('category')}
                  className="w-full px-4 py-3 bg-surface-muted border border-surface-border rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-150"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <TextInput
                label="Location *"
                placeholder="e.g. Kolkata, WB"
                value={form.location}
                onChange={set('location')}
              />
            </div>
          </div>

          {/* Photos — Cloudinary upload */}
          <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800">Photos</h2>
              <span className="text-xs text-slate-400">{images.length}/5</span>
            </div>

            {/* Image grid */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}

              {/* Upload spinner slots */}
              {uploadingCount > 0 && Array.from({ length: uploadingCount }).map((_, i) => (
                <div key={`u${i}`} className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center">
                  <Loader2 size={20} className="text-brand-500 animate-spin" />
                </div>
              ))}

              {/* Add button */}
              {images.length + uploadingCount < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-surface-border hover:border-brand-400 flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <ImagePlus size={20} className="text-slate-400" />
                  <span className="text-[10px] text-slate-400">Add photo</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-slate-400">Upload up to 5 photos. JPG, PNG, WebP supported.</p>
          </div>

          {error && <p className="text-sm text-red-500 px-1">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-600 px-1 font-medium">{success}</p>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={isSubmitting || uploadingCount > 0}
            className="shadow-lg shadow-brand-500/25"
          >
            {isSubmitting ? (
              <><Loader2 size={16} className="animate-spin" /> Posting…</>
            ) : uploadingCount > 0 ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading photos…</>
            ) : (
              'Post Ad for Free'
            )}
          </Button>
        </form>
      </div>
    </PageShell>
  );
};
