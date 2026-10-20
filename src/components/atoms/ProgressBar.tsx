interface ProgressBarProps {
  //* 0~100. 넘는 값은 호출하는 쪽에서 막아서 넘긴다
  value: number;
  label: string;
}

//* Figma 의 Progress track/fill — H7 · Pill
export const ProgressBar = ({ value, label }: ProgressBarProps) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={value}
    className="h-7 w-full overflow-hidden rounded-full bg-surface-subtle"
  >
    <div
      className="h-full rounded-full bg-accent"
      style={{ width: `${value}%` }}
    />
  </div>
);
