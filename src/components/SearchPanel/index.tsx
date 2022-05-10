import { Button, Col, Row, Select, SelectProps, Spin } from 'antd';
import React, { FC } from 'react';
import debounce from 'lodash/debounce';
import { DebounceSelectProps, TypeCities } from '../../types';
const { Option } = Select;
interface SearchPanelProps {
  name: string;
  id: number;
  listOfCities: TypeCities;
  getCurrentCities: string[];

  getCurrentShop: string[];
  listOfShop: string[];
  setValue: string[];
  getItemById: string[];
  fetchUserList: DebounceSelectProps;
  value: string[];
}
const SearchPanel: FC<SearchPanelProps> = ({
  getCurrentCities,
  listOfCities,
  getCurrentShop,
  listOfShop,
  setValue,
  getItemById,
  fetchUserList,
  value,
}) => {
  interface DebounceSelectProps<ValueType = any>
    extends Omit<SelectProps<ValueType>, 'options' | 'children'> {
    fetchOptions: (search: string) => Promise<ValueType[]>;
    debounceTimeout?: number;
  }

  function DebounceSelect<
    ValueType extends { key?: string; label: React.ReactNode; value: string | number } = any,
  >({ fetchOptions, debounceTimeout = 800, ...props }: DebounceSelectProps) {
    const [fetching, setFetching] = React.useState(false);
    const [options, setOptions] = React.useState<ValueType[]>([]);
    const fetchRef = React.useRef(0);

    const debounceFetcher = React.useMemo(() => {
      const loadOptions = (value: string) => {
        fetchRef.current += 1;
        const fetchId = fetchRef.current;
        setOptions([]);
        setFetching(true);

        fetchOptions(value).then((newOptions) => {
          if (fetchId !== fetchRef.current) {
            // for fetch callback order
            return;
          }

          setOptions(newOptions);
          setFetching(false);
        });
      };

      return debounce(loadOptions, debounceTimeout);
    }, [fetchOptions, debounceTimeout]);

    return (
      <Select<ValueType>
        labelInValue
        filterOption={false}
        onSearch={debounceFetcher}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        {...props}
        options={options}
      />
    );
  }
  return (
    <div className="wrapperSearch">
      <Row style={{ width: '100%' }} wrap gutter={[16, 32]}>
        <Col span={6}>
          <Select
            className="selectorForm"
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Выбор города"
            onChange={getCurrentCities}>
            {listOfCities.map((el: any) => (
              <Option key={el.id} value={el.name} id={el.id}>
                {el.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            className="selectorForm"
            allowClear
            style={{ width: '100%' }}
            placeholder="Выбор магазина"
            onChange={getCurrentShop}>
            {listOfShop.map((el: any) => (
              <Option key={el} value={el} data={el}>
                {el}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={10}>
          <DebounceSelect
            className="selectorForm"
            mode="multiple"
            value={[]}
            placeholder={value[0] || 'Выбор товара'}
            fetchOptions={fetchUserList}
            onChange={(newValue: any, vb: any) => {
              setValue(newValue);
              getItemById(vb);
              console.log('here', vb);
            }}
            style={{
              width: '100%',
            }}
          />
        </Col>
        <Col span={2}>
          <Button className="searchBtn">Найти</Button>
        </Col>
      </Row>
    </div>
  );
};
export default SearchPanel;
