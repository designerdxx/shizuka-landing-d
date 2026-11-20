"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
/** WhatsApp deep link for every "Message us" action; falls back to the contact section until a number is set. */
const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent("Hello Shizuka, I'd like a valuation for my ")}` : "#d-contact";
const igHref = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#d-contact";
const liHref = process.env.NEXT_PUBLIC_LINKEDIN_URL || "#d-contact";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useSite() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState(0);

  // One-time reveals. Content is visible without JavaScript; once this runs, anything below the fold waits
  // for its rise, while whatever is already on screen stays exactly as rendered (no flash).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); } }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    root.querySelectorAll("[data-r],[data-m]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) el.setAttribute("data-in", "");
      else io.observe(el);
    });
    root.setAttribute("data-armed", "");
    return () => io.disconnect();
  }, []);

  // The phone menu: page scroll locks behind it, Escape closes it.
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [menu]);

  const toggleMenu = useCallback(() => setMenu((m) => !m), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  const [cat, setCat] = useState(0);
  const [tab, setTab] = useState(0);
  const [touch, setTouch] = useState(false);
  useEffect(() => { setTouch(window.matchMedia("(hover: none)").matches); }, []);

  // What we buy: the band holds in place (sticky, centred) for 1.5 screens of scrolling, a half-screen per category,
  // so nobody scrolls past it without seeing all three; --p drives the progress line. A click scrolls to that stretch.
  const buyGo = useRef<((i: number) => void) | null>(null);
  useEffect(() => {
    const track = rootRef.current?.querySelector<HTMLElement>(".buy-track");
    const buy = track?.querySelector<HTMLElement>(".buy");
    if (!track || !buy) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = -1, run = 0, btop = 0;
    const measure = () => {
      raf = 0;
      const wh = window.innerHeight, h = buy.offsetHeight, pin = wh <= 1400;
      run = pin ? Math.round(wh * 1.5) : 0;
      btop = pin ? Math.max(0, Math.round((wh - h) / 2)) : 0;
      track.toggleAttribute("data-pin", pin);
      track.style.setProperty("--run", run + "px");
      track.style.setProperty("--btop", btop + "px");
      const p = run ? Math.min(1, Math.max(0, (btop - track.getBoundingClientRect().top) / run)) : 0;
      track.style.setProperty("--p", p.toFixed(3));
      const i = run ? Math.min(2, Math.floor(p * 3)) : 0;
      if (i !== last) { last = i; setCat(i); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    buyGo.current = (i: number) => {
      if (!run) return;
      const y = window.scrollY + track.getBoundingClientRect().top - btop + (run * (i + 0.5)) / 3;
      window.scrollTo({ top: Math.round(y), behavior: reduce ? "auto" : "smooth" });
    };
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); buyGo.current = null; };
  }, []);

  // The loupe follows the pointer (or a finger) and magnifies the photo 2.4x; it rests on the dial otherwise.
  useEffect(() => {
    const lens = rootRef.current?.querySelector<HTMLElement>(".lens");
    const loupe = lens?.querySelector<HTMLElement>(".loupe");
    if (!lens || !loupe) return;
    const Z = 2.4;
    let raf = 0, px = 0.44, py = 0.42;
    const place = () => {
      raf = 0;
      const w = lens.clientWidth, h = lens.clientHeight, r = loupe.offsetWidth / 2;
      const x = px * w, y = py * h;
      loupe.style.setProperty("--x", x + "px");
      loupe.style.setProperty("--y", y + "px");
      loupe.style.backgroundSize = `${w * Z}px ${h * Z}px`;
      loupe.style.backgroundPosition = `${r - x * Z}px ${r - y * Z}px`;
    };
    const move = (e: PointerEvent) => {
      const b = lens.getBoundingClientRect();
      px = Math.min(1, Math.max(0, (e.clientX - b.left) / b.width));
      py = Math.min(1, Math.max(0, (e.clientY - b.top) / b.height));
      if (!raf) raf = requestAnimationFrame(place);
    };
    lens.addEventListener("pointermove", move);
    lens.addEventListener("pointerdown", move);
    place();
    const ro = new ResizeObserver(place);
    ro.observe(lens);
    return () => { lens.removeEventListener("pointermove", move); lens.removeEventListener("pointerdown", move); ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const v = useMemo(() => {
    const v: Record<string, any> = {
      waHref, igHref, liHref,
      rootCls: menu ? "dd open" : "dd",
      menuOpen: menu ? "true" : "false",
      menuHidden: menu ? "false" : "true",
      menuLabel: menu ? "Close" : "Menu",
      toggleMenu, closeMenu,
    };
    const alts = ["A woman resting on a cream bouclé chair, holding a yellow Goyard clutch", "A steel chronograph on a wrist resting on dark marble", "A woman in a black dress wearing a diamond ring and a gold watch"];
    v.buyAlt = alts[cat];
    v.hint = touch ? "Touch the photo to look closer" : "Move across the photo to look closer";
    for (let i = 0; i < 3; i++) {
      const on = i === cat;
      v["bgCls" + i] = on ? "on" : "";
      v["wCls" + i] = on ? "word on" : "word";
      v["wOn" + i] = on ? "true" : "false";
      v["nCls" + i] = on ? "on" : "";
      v["nHid" + i] = on ? "false" : "true";
      v["pick" + i] = () => { setCat(i); buyGo.current?.(i); };
    }
    for (let i = 0; i < 4; i++) {
      const on = i === tab;
      v["tCls" + i] = on ? "tab on" : "tab";
      v["tSel" + i] = on ? "true" : "false";
      v["tIdx" + i] = on ? 0 : -1;
      v["pCls" + i] = on ? "panel on" : "panel";
      v["tab" + i] = () => setTab(i);
    }
    return v;
  }, [menu, q, toggleMenu, closeMenu, cat, tab, touch]);

  return { v, rootRef };
}
