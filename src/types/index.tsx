import { SelectProps } from 'antd';

export interface TypeCities {
  name: string;
  id: number;
}
export interface UserValue {
  label: string;
  value: string;
}

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
  fetchOptions?: (search: string) => Promise<ValueType[]>;
  debounceTimeout?: number;
}
