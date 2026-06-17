'use client';

import { X } from 'lucide-react';
import { Sidebar } from './sidebar';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 md:hidden">
        <div className="relative flex h-full w-64 flex-col">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
          <Sidebar />
        </div>
      </div>
    </>
  );
}
