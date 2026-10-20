import { formatAmount } from './formatAmount';

describe('formatAmount', () => {
  it('세 자리마다 쉼표를 넣고 원을 붙인다', () => {
    expect(formatAmount(3420000)).toBe('3,420,000원');
  });

  it('unit 을 끄면 원을 붙이지 않는다', () => {
    expect(formatAmount(2000000, { unit: false })).toBe('2,000,000');
  });

  it('0원은 0원으로 표시한다', () => {
    expect(formatAmount(0)).toBe('0원');
  });

  it('입금은 + 기호를 붙인다', () => {
    expect(formatAmount(3420000, { sign: 'income' })).toBe('+3,420,000원');
  });

  it('지출은 − (U+2212) 기호를 붙인다', () => {
    expect(formatAmount(5500, { sign: 'expense' })).toBe('−5,500원');
  });

  it('기호와 unit 끄기를 함께 쓸 수 있다', () => {
    expect(formatAmount(154500, { sign: 'expense', unit: false })).toBe(
      '−154,500',
    );
  });

  it('정수가 아닌 금액은 거부한다', () => {
    expect(() => formatAmount(10.5)).toThrow(RangeError);
  });

  it('-0 은 0원으로 표시한다', () => {
    expect(formatAmount(-0)).toBe('0원');
    expect(formatAmount(-0, { sign: 'expense' })).toBe('−0원');
  });

  it('음수 금액은 거부한다 (부호는 sign 으로만 표현한다)', () => {
    expect(() => formatAmount(-100)).toThrow(RangeError);
  });
});
