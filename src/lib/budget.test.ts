import { getBudgetUsage } from './budget';

describe('getBudgetUsage', () => {
  it('사용률을 반올림한 퍼센트로 계산한다', () => {
    const usage = getBudgetUsage(1577500, 2000000);

    expect(usage.percent).toBe(79);
    expect(usage.progress).toBe(79);
    expect(usage.remaining).toBe(422500);
    expect(usage.isOver).toBe(false);
  });

  it('.5 경계에서 부동소수점 오차 없이 올림한다', () => {
    expect(getBudgetUsage(14500, 100000).percent).toBe(15);
    expect(getBudgetUsage(57500, 100000).percent).toBe(58);
  });

  it('하나도 쓰지 않았으면 0% 다', () => {
    const usage = getBudgetUsage(0, 2000000);

    expect(usage.percent).toBe(0);
    expect(usage.remaining).toBe(2000000);
    expect(usage.isOver).toBe(false);
  });

  it('예산과 똑같이 쓰면 100% 지만 초과는 아니다', () => {
    const usage = getBudgetUsage(2000000, 2000000);

    expect(usage.percent).toBe(100);
    expect(usage.remaining).toBe(0);
    expect(usage.isOver).toBe(false);
  });

  it('1원이라도 넘으면 초과다', () => {
    expect(getBudgetUsage(2000001, 2000000).isOver).toBe(true);
  });

  it('예산을 넘으면 percent 는 실제 값, progress 는 100 으로 막는다', () => {
    const usage = getBudgetUsage(2500000, 2000000);

    expect(usage.percent).toBe(125);
    expect(usage.progress).toBe(100);
    expect(usage.remaining).toBe(0);
    expect(usage.isOver).toBe(true);
  });

  it('반올림해 100% 가 되어도 실제로 넘지 않았으면 초과가 아니다', () => {
    const usage = getBudgetUsage(1999000, 2000000);

    expect(usage.percent).toBe(100);
    expect(usage.isOver).toBe(false);
  });

  it('예산이 0 이하면 거부한다', () => {
    expect(() => getBudgetUsage(0, 0)).toThrow(RangeError);
  });

  it('정수가 아니거나 음수인 지출은 거부한다', () => {
    expect(() => getBudgetUsage(10.5, 100)).toThrow(RangeError);
    expect(() => getBudgetUsage(-1, 100)).toThrow(RangeError);
  });
});
