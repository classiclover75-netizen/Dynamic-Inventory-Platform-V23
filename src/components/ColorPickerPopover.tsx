import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Palette } from "lucide-react";
import { ColorPickerPanel, ColorPickerMode, ColorPickerValue } from "./ColorPickerPanel";
import { familyByChipClass, parseHex } from "../lib/colorUtils";

interface ColorPickerPopoverProps {
  value?: string;
  initialMode?: ColorPickerMode;
  showModeToggle?: boolean;
  onChange?: (val: ColorPickerValue) => void;
  onCommit?: (val: ColorPickerValue) => void;
  disabled?: boolean;
  label?: string;
  forceIconVisible?: boolean;
  hideSwatch?: boolean;
  className?: string;
}

const PANEL_MARGIN = 8;
const VIEWPORT_PADDING = 8;

function useCanHover() {
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(hover: hover)');
    const sync = () => setCanHover(mq.matches);
    sync();
    if (mq.addEventListener) {
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    } else if (mq.addListener) {
      mq.addListener(sync);
      return () => mq.removeListener(sync);
    }
  }, []);
  // touch screens report false and there the icon must stay visible, 
  // because a hover-only control is unreachable on a phone or tablet.
  return canHover;
}

function resolveSwatchColor(value?: string): string {
  if (!value) return "#E5E7EB";
  if (parseHex(value)) return value;
  const family = familyByChipClass(value);
  if (family) return family.swatch;
  return "#E5E7EB";
}

export const ColorPickerPopover = React.memo(function ColorPickerPopover({
  value,
  initialMode = "palette",
  showModeToggle = true,
  onChange,
  onCommit,
  disabled = false,
  label = "Change colour",
  forceIconVisible = false,
  hideSwatch = false,
  className = ""
}: ColorPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const latestValueRef = useRef<ColorPickerValue | null>(null);

  const canHover = useCanHover();

  const swatchColor = resolveSwatchColor(value);
  // On a hover-capable device the icon hides until it is wanted, anywhere else it stays put.
  const iconVisible = !canHover || isHovered || hasFocus || isOpen || forceIconVisible;

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelW = panelRef.current ? panelRef.current.offsetWidth : 288;
    const panelH = panelRef.current ? panelRef.current.offsetHeight : 380;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpwards = spaceBelow < (panelH + PANEL_MARGIN) && spaceAbove > spaceBelow;

    let top = openUpwards ? rect.top - panelH - PANEL_MARGIN : rect.bottom + PANEL_MARGIN;
    let left = rect.left;

    left = Math.max(VIEWPORT_PADDING, Math.min(left, window.innerWidth - panelW - VIEWPORT_PADDING));
    top = Math.max(VIEWPORT_PADDING, Math.min(top, window.innerHeight - panelH - VIEWPORT_PADDING));

    setPosition({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', updatePosition, { capture: true });
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, { capture: true });
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const close = useCallback(() => {
    setIsOpen(false);
    if (latestValueRef.current && onCommit) {
      onCommit(latestValueRef.current);
    }
  }, [onCommit]);

  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && panelRef.current.contains(target)) return;
      if (triggerRef.current && triggerRef.current.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, [isOpen, close]);

  const handleChange = useCallback((val: ColorPickerValue) => {
    latestValueRef.current = val;
    if (onChange) onChange(val);
  }, [onChange]);

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setHasFocus(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        title={label}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          if (disabled) return;
          if (isOpen) {
            close();
          } else {
            latestValueRef.current = null;
            setIsOpen(true);
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-md border-none bg-transparent p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:outline-2 focus-visible:outline-[#2b579a] focus-visible:outline-offset-2"
      >
        {!hideSwatch && (
          <span className="shrink-0 w-4 h-4 rounded-full ring-1 ring-inset ring-black/10" style={{ backgroundColor: swatchColor }} />
        )}
        <Palette
          size={15}
          className="shrink-0 text-gray-500 transition-opacity duration-150"
          style={{ opacity: iconVisible ? 1 : 0, pointerEvents: iconVisible ? "auto" : "none" }}
        />
      </button>
      {isOpen && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Colour picker"
          className="fixed z-[10050]"
          style={{
            top: position ? `${position.top}px` : "-9999px",
            left: position ? `${position.left}px` : "-9999px",
            visibility: position ? "visible" : "hidden"
          }}
        >
          <ColorPickerPanel
            key={String(isOpen) + String(value)}
            initialValue={value}
            initialMode={initialMode}
            showModeToggle={showModeToggle}
            onChange={handleChange}
            onRequestClose={close}
          />
        </div>,
        document.body
      )}
    </span>
  );
});
