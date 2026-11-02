import { describe, it, expect } from "vitest";
import {
  nextExpansionStep,
  type PendingExpansion,
} from '@/utils/cluster-expansion-retry';

const MAX_ATTEMPTS = 3;
const MARGIN = 0.05;

const pending = (over: Partial<PendingExpansion> = {}): PendingExpansion => ({
  lat: 39.47,
  lng: -0.376,
  expansionZoom: 13,
  attempts: 1,
  ...over,
});

describe('nextExpansionStep', () => {
  it('se da por hecho cuando el zoom real llegó exacto al de expansión', () => {
    const step = nextExpansionStep(pending(), 13, MAX_ATTEMPTS, MARGIN);
    expect(step).toEqual({ done: true });
  });

  it('se da por hecho cuando el zoom real pasó de largo el de expansión', () => {
    const step = nextExpansionStep(pending(), 15, MAX_ATTEMPTS, MARGIN);
    expect(step).toEqual({ done: true });
  });

  it('reintenta cuando el zoom real quedó corto', () => {
    const step = nextExpansionStep(pending({ attempts: 1 }), 12, MAX_ATTEMPTS, MARGIN);
    expect(step.done).toBe(false);
    if (!step.done) {
      expect(step.pending.attempts).toBe(2);
      // margen escalado por el número de intento: no repite el pedido que
      // ya falló, pide un poco más cada vez.
      expect(step.targetZoom).toBeCloseTo(13 + MARGIN * 2, 10);
      expect(step.pending.lat).toBe(pending().lat);
      expect(step.pending.lng).toBe(pending().lng);
      expect(step.pending.expansionZoom).toBe(13);
    }
  });

  it('cada reintento pide un target más profundo que el anterior', () => {
    let state = pending({ attempts: 1 });
    const targets: number[] = [];
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const step = nextExpansionStep(state, 12, MAX_ATTEMPTS, MARGIN);
      if (step.done) break;
      targets.push(step.targetZoom);
      state = step.pending;
    }
    for (let i = 1; i < targets.length; i++) {
      expect(targets[i]).toBeGreaterThan(targets[i - 1]);
    }
  });

  it('se rinde al agotar los intentos en vez de reintentar para siempre', () => {
    const step = nextExpansionStep(
      pending({ attempts: MAX_ATTEMPTS }),
      12,
      MAX_ATTEMPTS,
      MARGIN,
    );
    expect(step).toEqual({ done: true });
  });

  it('nunca reintenta más veces que MAX_ATTEMPTS incluso si siempre queda corto', () => {
    let state = pending({ attempts: 1 });
    let retries = 0;
    for (let i = 0; i < 50; i++) {
      const step = nextExpansionStep(state, 0, MAX_ATTEMPTS, MARGIN);
      if (step.done) break;
      retries++;
      state = step.pending;
    }
    expect(retries).toBeLessThanOrEqual(MAX_ATTEMPTS - 1);
  });
});
