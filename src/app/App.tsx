import { useCounterStore } from './counterStore';

export const App = () => {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4">
      <h1 className="font-bold text-3xl">가계부</h1>
      <button
        type="button"
        onClick={increment}
        className="rounded-lg bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
      >
        count: {count}
      </button>
    </main>
  );
};
