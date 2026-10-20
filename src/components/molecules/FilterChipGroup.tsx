import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { Chip } from '@/components/atoms/Chip';

interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface FilterChipGroupProps<T extends string> {
  label: string;
  options: readonly FilterChipOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
}

const isOptionValue = <T extends string>(
  options: readonly FilterChipOption<T>[],
  value: string,
): value is T => options.some((option) => option.value === value);

//* 단일 선택 필터. 키보드 이동·role 은 Radix ToggleGroup 에 맡긴다
export const FilterChipGroup = <T extends string>({
  label,
  options,
  value,
  onValueChange,
}: FilterChipGroupProps<T>) => (
  <ToggleGroup.Root
    type="single"
    aria-label={label}
    value={value}
    //* Radix 는 선택된 칩을 다시 누르면 '' 로 해제한다. 필터는 항상 하나가 선택돼 있어야 하므로 무시한다
    onValueChange={(next) => {
      if (isOptionValue(options, next)) onValueChange(next);
    }}
    className="flex gap-8"
  >
    {options.map((option) => (
      <ToggleGroup.Item
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        asChild
      >
        <Chip selected={option.value === value}>{option.label}</Chip>
      </ToggleGroup.Item>
    ))}
  </ToggleGroup.Root>
);
