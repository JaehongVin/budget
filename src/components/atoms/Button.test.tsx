import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('누르면 onClick 이 호출된다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>내역 추가</Button>);

    await user.click(screen.getByRole('button', { name: '내역 추가' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disabled 면 눌러도 onClick 이 호출되지 않는다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        저장하기
      </Button>,
    );

    await user.click(screen.getByRole('button', { name: '저장하기' }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('기본 type 은 submit 이 아니라 button 이다', () => {
    render(<Button>전체 보기</Button>);

    expect(screen.getByRole('button', { name: '전체 보기' })).toHaveAttribute(
      'type',
      'button',
    );
  });
});
