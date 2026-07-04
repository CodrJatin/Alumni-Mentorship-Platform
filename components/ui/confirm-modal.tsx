"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error("Error during confirm action:", err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="sm:max-w-[440px] bg-white rounded-[4px] border border-[#E2E8F0] p-6 text-left">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-lg font-bold text-[#0F172A]">{title}</DialogTitle>
          <DialogDescription className="text-xs font-semibold text-[#64748B] leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-row gap-2 justify-end">
          <Button
            variant="ghost"
            disabled={loading}
            onClick={onClose}
            className="border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] rounded-[4px] font-semibold text-xs h-9 px-4 cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            disabled={loading}
            onClick={handleConfirm}
            className={`rounded-[4px] font-semibold text-xs h-9 px-4 cursor-pointer text-white border-0 ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#4f46e5] hover:bg-[#4338ca]"
            }`}
          >
            {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin inline" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
