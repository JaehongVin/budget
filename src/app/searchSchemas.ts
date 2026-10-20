import { z } from 'zod';
import { isValidDateKey, isValidMonthKey } from '@/lib/date';
import { TYPE_FILTER } from '@/types/transaction';

//* 잘못된 값은 에러 대신 버린다. 없는 값은 각 화면이 기본값(이번 달·오늘·전체)으로 채운다
const monthSchema = z
  .string()
  .refine(isValidMonthKey)
  .optional()
  .catch(undefined);
const dateSchema = z
  .string()
  .refine(isValidDateKey)
  .optional()
  .catch(undefined);

export const calendarSearchSchema = z.object({
  month: monthSchema,
  date: dateSchema,
});

export const historySearchSchema = z.object({
  month: monthSchema,
  type: z.enum(TYPE_FILTER).optional().catch(undefined),
});
