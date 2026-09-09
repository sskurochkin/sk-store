import { getMinskDateKey, nextDailyOrderId } from './order-id';

describe('order-id', () => {
  it('allocates sequential daily ids', () => {
    expect(nextDailyOrderId('20260909', [])).toBe('20260909-1');
    expect(nextDailyOrderId('20260909', ['20260909-1', '20260909-2'])).toBe(
      '20260909-3',
    );
    expect(nextDailyOrderId('20260909', ['20260909-9', '20260909-10'])).toBe(
      '20260909-11',
    );
  });

  it('ignores ids from other days', () => {
    expect(nextDailyOrderId('20260909', ['20260908-99'])).toBe('20260909-1');
  });

  it('formats Minsk calendar date as YYYYMMDD', () => {
    const key = getMinskDateKey(new Date('2026-09-09T12:00:00+03:00'));
    expect(key).toBe('20260909');
  });
});
