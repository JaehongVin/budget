import type { TransactionType } from '@/types/transaction';
import { TRANSACTION_TYPE } from '@/types/transaction';

interface FormatAmountOptions {
  sign?: TransactionType;
  unit?: boolean;
}

const SIGN_SYMBOL: Record<TransactionType, string> = {
  [TRANSACTION_TYPE.INCOME]: '+',
  [TRANSACTION_TYPE.EXPENSE]: '−',
};

const numberFormat = new Intl.NumberFormat('ko-KR');

//* 금액은 원 단위 0 이상 정수만 받는다. 입금/지출 방향은 sign 으로만 표현한다
export const formatAmount = (
  amount: number,
  { sign, unit = true }: FormatAmountOptions = {},
) => {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new RangeError(`금액은 0 이상의 정수여야 한다: ${amount}`);
  }

  const symbol = sign ? SIGN_SYMBOL[sign] : '';
  //* -0 은 가드를 통과하지만 Intl 이 "-0" 으로 찍는다. + 0 으로 0 에 맞춘다
  return `${symbol}${numberFormat.format(amount + 0)}${unit ? '원' : ''}`;
};

//* 남은 돈은 지출이 입금보다 많으면 음수가 된다. formatAmount 는 음수를 거부하므로 부호만 따로 붙인다
export const formatBalance = (
  balance: number,
  options: { unit?: boolean } = {},
) => {
  const symbol = balance < 0 ? SIGN_SYMBOL[TRANSACTION_TYPE.EXPENSE] : '';
  return `${symbol}${formatAmount(Math.abs(balance), options)}`;
};
