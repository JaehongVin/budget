import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '@/app/App';

describe('App', () => {
  it('앱 제목을 렌더링한다', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: '가계부' })).toBeInTheDocument();
  });
});
