import { cn } from './cn';

describe('cn', () => {
  it('글자 크기 토큰과 글자 색 토큰을 둘 다 남긴다', () => {
    expect(cn('text-15', 'text-content-primary')).toBe(
      'text-15 text-content-primary',
    );
  });

  it('같은 종류의 글자 크기는 뒤에 온 것만 남긴다', () => {
    expect(cn('text-13', 'text-15')).toBe('text-15');
  });

  it('같은 종류의 글자 색은 뒤에 온 것만 남긴다', () => {
    expect(cn('text-content-primary', 'text-accent')).toBe('text-accent');
  });

  it('라운드 토큰이 겹치면 뒤에 온 것만 남긴다', () => {
    expect(cn('rounded-12', 'rounded-20')).toBe('rounded-20');
  });

  it('falsy 값은 무시한다', () => {
    expect(cn('p-16', false, undefined, 'gap-8')).toBe('p-16 gap-8');
  });
});

describe('cn — 화면용 토큰', () => {
  it('text-19 와 글자 색을 둘 다 남긴다', () => {
    expect(cn('text-19', 'text-income')).toBe('text-19 text-income');
  });

  it('rounded-6 이 다른 라운드와 겹치면 뒤에 온 것만 남긴다', () => {
    expect(cn('rounded-6', 'rounded-8')).toBe('rounded-8');
  });
});
