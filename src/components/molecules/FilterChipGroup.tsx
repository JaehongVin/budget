import * as ToggleGroup from '@radix-ui/react-toggle-group';
import type { LucideIcon } from 'lucide-react';
import { Chip } from '@/components/atoms/Chip';
import { Icon } from '@/components/atoms/Icon';

const ICON_SIZE = 14;

interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  //* 라벨 오른쪽의 장식 아이콘. 접근 가능한 이름에는 들어가지 않는다
  icon?: LucideIcon;
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
        <Chip selected={option.value === value}>
          {option.label}
          {option.icon && <Icon icon={option.icon} size={ICON_SIZE} />}
        </Chip>
      </ToggleGroup.Item>
    ))}
  </ToggleGroup.Root>
);
