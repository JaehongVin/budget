import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterChipGroup } from './FilterChipGroup';

const OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'expense', label: '지출' },
  { value: 'category', label: '카테고리', disabled: true },
];

describe('FilterChipGroup', () => {
  it('선택된 칩만 checked 상태다', () => {
    render(
      <FilterChipGroup
        label="내역 필터"
        options={OPTIONS}
        value="all"
        onValueChange={() => {}}
      />,
    );

    expect(screen.getByRole('radio', { name: '전체' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '지출' })).not.toBeChecked();
  });

  it('다른 칩을 누르면 그 값으로 onValueChange 가 호출된다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <FilterChipGroup
        label="내역 필터"
        options={OPTIONS}
        value="all"
        onValueChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: '지출' }));

    expect(handleChange).toHaveBeenCalledWith('expense');
  });

  it('이미 선택된 칩을 다시 눌러도 선택이 해제되지 않는다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <FilterChipGroup
        label="내역 필터"
        options={OPTIONS}
        value="all"
        onValueChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: '전체' }));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disabled 칩은 눌러도 선택되지 않는다', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <FilterChipGroup
        label="내역 필터"
        options={OPTIONS}
        value="all"
        onValueChange={handleChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: '카테고리' }));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('단일 선택 그룹(radiogroup)으로 이름과 함께 노출된다', () => {
    render(
      <FilterChipGroup
        label="내역 필터"
        options={OPTIONS}
        value="all"
        onValueChange={() => {}}
      />,
    );

    expect(
      screen.getByRole('radiogroup', { name: '내역 필터' }),
    ).toBeInTheDocument();
  });
});
