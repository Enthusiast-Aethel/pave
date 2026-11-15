import { X } from "lucide-react";

export default function Sheet({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="mx-auto max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="rounded-full bg-gray-100 p-2">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}