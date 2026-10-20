import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '@/test/renderRoute';

const TODAY = new Date(2026, 8, 15, 12);

const renderCalendar = (path = '/calendar') => renderRoute(path);

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: TODAY, toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('제목은 h1 하나만 있고 헤더 아이콘 버튼에 이름이 있다', async () => {
    await renderCalendar();

    expect(
      await screen.findByRole('heading', { level: 1, name: '캘린더' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: '캘린더 보기' }),
    ).toBeInTheDocument();
  });

  it('기본은 이번 달과 오늘이고 시안의 합계와 내역을 보여준다', async () => {
    await renderCalendar();

    expect(await screen.findByText('2026년 9월')).toBeInTheDocument();
    expect(screen.getByText('3,420,000원')).toBeInTheDocument();
    expect(screen.getByText('1,577,500원')).toBeInTheDocument();
    expect(screen.getByText('9월 15일 화요일')).toBeInTheDocument();
    expect(screen.getByText('4건')).toBeInTheDocument();
    expect(
      screen.getByText('입금 3,420,000원 · 지출 70,500원'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '내역 2건 더 보기' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^9월 15일/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('날짜를 누르면 그 날의 내역으로 바뀌고 URL 에 반영된다', async () => {
    const user = userEvent.setup();
    const { router } = await renderCalendar();

    await user.click(await screen.findByRole('button', { name: /^9월 14일/ }));

    expect(await screen.findByText('9월 14일 월요일')).toBeInTheDocument();
    expect(screen.getByText('이마트')).toBeInTheDocument();
    const dayTransactions = screen.getByRole('region', {
      name: /9월 14일 월요일/,
    });
    expect(within(dayTransactions).queryByText('오늘')).not.toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({ date: '2026-09-14' });
  });

  it('거래 없는 날을 누르면 빈 상태를 보여준다', async () => {
    const user = userEvent.setup();
    await renderCalendar();

    await user.click(
      await screen.findByRole('button', { name: '9월 16일 수요일' }),
    );

    expect(
      await screen.findByText('이 날은 내역이 없어요'),
    ).toBeInTheDocument();
  });

  it('이웃 달 날짜를 누르면 그 달로 이동하고 그 날짜를 선택한다', async () => {
    const user = userEvent.setup();
    const { router } = await renderCalendar();

    await user.click(
      await screen.findByRole('button', { name: '8월 31일 월요일' }),
    );

    expect(await screen.findByText('2026년 8월')).toBeInTheDocument();
    expect(screen.getByText('8월 31일 월요일')).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({
      month: '2026-08',
      date: '2026-08-31',
    });
  });

  it('이전 달로 이동하면 그 달 1일을 선택하고 그 달 합계를 보여준다', async () => {
    const user = userEvent.setup();
    await renderCalendar();

    await user.click(await screen.findByRole('button', { name: '이전 달' }));

    expect(await screen.findByText('2026년 8월')).toBeInTheDocument();
    expect(screen.getByText('1,500,000원')).toBeInTheDocument();
    expect(screen.getByText('1,792,500원')).toBeInTheDocument();
    expect(screen.getByText('8월 1일 토요일')).toBeInTheDocument();
  });

  it('오늘이 있는 달로 돌아오면 오늘을 선택한다', async () => {
    const user = userEvent.setup();
    await renderCalendar('/calendar?month=2026-08&date=2026-08-05');

    await user.click(await screen.findByRole('button', { name: '다음 달' }));

    expect(await screen.findByText('2026년 9월')).toBeInTheDocument();
    expect(screen.getByText('9월 15일 화요일')).toBeInTheDocument();
  });

  it('데이터가 없는 달은 합계 0원과 빈 상태를 보여준다', async () => {
    await renderCalendar('/calendar?month=2026-12');

    expect(await screen.findByText('2026년 12월')).toBeInTheDocument();
    expect(screen.getAllByText('0원')).toHaveLength(2);
    expect(screen.getByText('12월 1일 화요일')).toBeInTheDocument();
    expect(screen.getByText('이 날은 내역이 없어요')).toBeInTheDocument();
  });

  it('오늘 버튼은 다른 달·날짜에서 이번 달과 오늘로 돌아온다', async () => {
    const user = userEvent.setup();
    const { router } = await renderCalendar(
      '/calendar?month=2026-07&date=2026-07-09',
    );

    await user.click(await screen.findByRole('button', { name: '오늘' }));

    expect(await screen.findByText('2026년 9월')).toBeInTheDocument();
    expect(screen.getByText('9월 15일 화요일')).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({
      month: '2026-09',
      date: '2026-09-15',
    });
  });

  it('표시 중인 달과 맞지 않는 date 는 그 달의 기본 날짜로 대신한다', async () => {
    await renderCalendar('/calendar?month=2026-08&date=2026-09-15');

    expect(await screen.findByText('8월 1일 토요일')).toBeInTheDocument();
  });

  it('date 만 있으면 그 날짜의 달을 보여주고 그 날짜를 선택한다', async () => {
    await renderCalendar('/calendar?date=2026-08-05');

    expect(await screen.findByText('2026년 8월')).toBeInTheDocument();
    expect(screen.getByText('8월 5일 수요일')).toBeInTheDocument();
  });

  it('month 만 있고 이번 달이면 오늘을 선택한다', async () => {
    await renderCalendar('/calendar?month=2026-09');

    expect(await screen.findByText('9월 15일 화요일')).toBeInTheDocument();
  });

  it('선택한 날 내역에서 더 보기를 누르면 나머지를 펼친다', async () => {
    const user = userEvent.setup();
    await renderCalendar();

    await user.click(
      await screen.findByRole('button', { name: '내역 2건 더 보기' }),
    );

    const dayTransactions = screen.getByRole('region', {
      name: /9월 15일 화요일/,
    });
    expect(within(dayTransactions).getAllByRole('listitem')).toHaveLength(4);
  });
});
