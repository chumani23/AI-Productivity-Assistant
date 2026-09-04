import { useCallback, useEffect, useState } from "react";

export type Timeframe = "M15" | "H1" | "H4" | "D1";
export const TIMEFRAMES: Timeframe[] = ["M15", "H1", "H4", "D1"];

export type Candle = { t: number; o: number; h: number; l: number; c: number };

export type Trend = "Bullish" | "Bearish" | "Ranging";
export type Momentum = "Strong" | "Building" | "Fading" | "Flat";
export type SetupType =
  | "Breakout"
  | "Pullback"
  | "Range reversal"
  | "Trend continuation"
  | "No setup";
export type SignalKind = "BUY" | "SELL" | "WAIT";

export type PairMeta = { symbol: string; base: number; pip: number; vol: number };

export const PAIRS: PairMeta[] = [
  { symbol: "EUR/USD", base: 1.0842, pip: 0.0001, vol: 0.9 },
  { symbol: "GBP/USD", base: 1.2718, pip: 0.0001, vol: 1.15 },
  { symbol: "USD/JPY", base: 152.34, pip: 0.01, vol: 1.0 },
  { symbol: "AUD/USD", base: 0.6612, pip: 0.0001, vol: 1.05 },
  { symbol: "USD/CAD", base: 1.3564, pip: 0.0001, vol: 0.85 },
  { symbol: "USD/CHF", base: 0.8829, pip: 0.0001, vol: 0.8 },
  { symbol: "NZD/USD", base: 0.6041, pip: 0.0001, vol: 1.1 },
  { symbol: "EUR/GBP", base: 0.8525, pip: 0.0001, vol: 0.7 },
  { symbol: "EUR/JPY", base: 165.18, pip: 0.01, vol: 1.2 },
  { symbol: "GBP/JPY", base: 193.77, pip: 0.01, vol: 1.4 },
  { symbol: "XAU/USD", base: 2338.6, pip: 0.1, vol: 1.6 },
  { symbol: "USD/ZAR", base: 18.42, pip: 0.001, vol: 1.5 },
];

const TF_STEP: Record<Timeframe, number> = {
  M15: 15 * 60_000,
  H1: 60 * 60_000,
  H4: 4 * 60 * 60_000,
  D1: 24 * 60 * 60_000,
};

const TF_AMP: Record<Timeframe, number> = { M15: 0.45, H1: 1, H4: 2.1, D1: 3.6 };

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic synthetic OHLC series — identical on server and client. */
export function getCandles(symbol: string, tf: Timeframe, count = 120): Candle[] {
  const meta = PAIRS.find((p) => p.symbol === symbol) ?? PAIRS[0];
  const rnd = mulberry32(hash(`${symbol}|${tf}`));
  const step = TF_STEP[tf];
  const amp = meta.pip * 22 * meta.vol * TF_AMP[tf];
  const drift = (rnd() - 0.45) * amp * 0.28;
  const end = Date.UTC(2026, 8, 4, 8, 0, 0);

  let price = meta.base * (1 - (rnd() - 0.5) * 0.006);
  const out: Candle[] = [];
  for (let i = 0; i < count; i++) {
    const wave = Math.sin(i / 9 + rnd() * 0.2) * amp * 0.5;
    const o = price;
    const c = o + drift + wave * 0.35 + (rnd() - 0.5) * amp;
    const h = Math.max(o, c) + rnd() * amp * 0.55;
    const l = Math.min(o, c) - rnd() * amp * 0.55;
    out.push({ t: end - (count - 1 - i) * step, o, h, l, c });
    price = c;
  }
  return out;
}

function sma(values: number[], n: number) {
  if (values.length < n) return values[values.length - 1] ?? 0;
  return values.slice(-n).reduce((a, b) => a + b, 0) / n;
}

function rsi(closes: number[], n = 14) {
  let gain = 0;
  let loss = 0;
  const slice = closes.slice(-(n + 1));
  for (let i = 1; i < slice.length; i++) {
    const d = slice[i] - slice[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  if (loss === 0) return 100;
  const rs = gain / n / (loss / n);
  return 100 - 100 / (1 + rs);
}

export type Analysis = {
  symbol: string;
  timeframe: Timeframe;
  price: number;
  changePct: number;
  trend: Trend;
  momentum: Momentum;
  rsi: number;
  atrPips: number;
  volatility: "Low" | "Normal" | "High";
  support: number;
  resistance: number;
  setup: SetupType;
  signal: SignalKind;
  confidence: number;
  entry: [number, number];
  stop: number;
  target: number;
  rr: number;
  digits: number;
};

export function analyse(symbol: string, tf: Timeframe): Analysis {
  const meta = PAIRS.find((p) => p.symbol === symbol) ?? PAIRS[0];
  const candles = getCandles(symbol, tf);
  const closes = candles.map((c) => c.c);
  const price = closes[closes.length - 1];
  const prev = closes[closes.length - 2] ?? price;
  const fast = sma(closes, 10);
  const slow = sma(closes, 30);
  const r = rsi(closes);

  const recent = candles.slice(-40);
  const support = Math.min(...recent.map((c) => c.l));
  const resistance = Math.max(...recent.map((c) => c.h));
  const range = resistance - support || meta.pip;

  const tr =
    recent.slice(-14).reduce((a, c) => a + (c.h - c.l), 0) / 14 || meta.pip;
  const atrPips = tr / meta.pip;
  const normVol = atrPips / (22 * meta.vol * TF_AMP[tf]);
  const volatility = normVol > 1.25 ? "High" : normVol < 0.7 ? "Low" : "Normal";

  const sep = (fast - slow) / range;
  const trend: Trend = sep > 0.06 ? "Bullish" : sep < -0.06 ? "Bearish" : "Ranging";

  const momentum: Momentum =
    r > 62 || r < 38
      ? Math.abs(sep) > 0.1
        ? "Strong"
        : "Building"
      : Math.abs(sep) > 0.08
        ? "Building"
        : Math.abs(sep) < 0.03
          ? "Flat"
          : "Fading";

  const nearRes = (resistance - price) / range < 0.12;
  const nearSup = (price - support) / range < 0.12;

  let setup: SetupType = "No setup";
  if (trend === "Bullish" && nearRes) setup = "Breakout";
  else if (trend === "Bearish" && nearSup) setup = "Breakout";
  else if (trend === "Bullish" && (price - support) / range < 0.45)
    setup = "Pullback";
  else if (trend === "Bearish" && (resistance - price) / range < 0.45)
    setup = "Pullback";
  else if (trend === "Ranging" && (nearRes || nearSup)) setup = "Range reversal";
  else if (trend !== "Ranging" && momentum !== "Flat") setup = "Trend continuation";

  let signal: SignalKind = "WAIT";
  if (setup !== "No setup") {
    if (trend === "Bullish") signal = "BUY";
    else if (trend === "Bearish") signal = "SELL";
    else signal = nearSup ? "BUY" : "SELL";
  }

  let confidence = 44;
  confidence += Math.min(26, Math.abs(sep) * 130);
  if (momentum === "Strong") confidence += 12;
  if (momentum === "Building") confidence += 6;
  if (momentum === "Flat") confidence -= 8;
  if (setup === "Breakout" || setup === "Trend continuation") confidence += 7;
  if (volatility === "High") confidence -= 5;
  if (signal === "WAIT") confidence = Math.min(confidence, 46);
  confidence = Math.round(Math.max(18, Math.min(94, confidence)));

  const buf = tr * 0.35;
  const risk = tr * 1.4;
  const entry: [number, number] =
    signal === "SELL" ? [price, price + buf] : [price - buf, price];
  const stop = signal === "SELL" ? price + risk : price - risk;
  const target = signal === "SELL" ? price - risk * 1.9 : price + risk * 1.9;

  const digits = meta.pip === 0.01 ? 3 : meta.pip === 0.1 ? 2 : meta.pip === 0.001 ? 4 : 5;

  return {
    symbol,
    timeframe: tf,
    price,
    changePct: ((price - prev) / prev) * 100,
    trend,
    momentum,
    rsi: r,
    atrPips,
    volatility,
    support,
    resistance,
    setup,
    signal,
    confidence,
    entry,
    stop,
    target,
    rr: 1.9,
    digits,
  };
}

export function scan(tf: Timeframe): Analysis[] {
  return PAIRS.map((p) => analyse(p.symbol, tf));
}

export function fmt(value: number, digits: number) {
  return value.toFixed(digits);
}

export function pipsBetween(a: number, b: number, symbol: string) {
  const meta = PAIRS.find((p) => p.symbol === symbol) ?? PAIRS[0];
  return Math.round(Math.abs(a - b) / meta.pip);
}

export function analysisContext(a: Analysis) {
  return [
    `Pair: ${a.symbol} (${a.timeframe})`,
    `Price: ${fmt(a.price, a.digits)} (${a.changePct >= 0 ? "+" : ""}${a.changePct.toFixed(2)}% last candle)`,
    `Trend: ${a.trend} | Momentum: ${a.momentum} | RSI: ${a.rsi.toFixed(1)}`,
    `Volatility: ${a.volatility} (ATR ${a.atrPips.toFixed(0)} pips)`,
    `Support: ${fmt(a.support, a.digits)} | Resistance: ${fmt(a.resistance, a.digits)}`,
    `Detected setup: ${a.setup} | Signal: ${a.signal} | Confidence: ${a.confidence}%`,
    `Entry zone: ${fmt(a.entry[0], a.digits)}–${fmt(a.entry[1], a.digits)} | Stop: ${fmt(a.stop, a.digits)} | Target: ${fmt(a.target, a.digits)}`,
  ].join("\n");
}

/** localStorage-backed state, SSR-safe. */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignore */
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}

export const DEFAULT_WATCHLIST = ["EUR/USD", "GBP/JPY", "XAU/USD", "USD/JPY"];

export type TerminalSettings = {
  trader: string;
  account: string;
  defaultTimeframe: Timeframe;
  minConfidence: number;
  riskPercent: number;
  signalAlerts: boolean;
  dailyBriefing: boolean;
};

export const DEFAULT_SETTINGS: TerminalSettings = {
  trader: "Chumani Nqalathi",
  account: "Demo · FXR-40812",
  defaultTimeframe: "H1",
  minConfidence: 60,
  riskPercent: 1,
  signalAlerts: true,
  dailyBriefing: true,
};
