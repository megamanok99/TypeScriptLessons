import React from 'react';
import { Col, Row, Input, Select, message, Button, Layout, Spin, SelectProps } from 'antd';
import './App.css';
import axios from 'axios';
import 'antd/dist/antd.css';
import debounce from 'lodash/debounce';
const logo = require('./test.svg') as string;
const { Option } = Select;
function App() {
  const [listOfCities, setListOfCities] = React.useState([]);
  const [listOfShop, setListOfShop] = React.useState([]);

  const [currentTown, setCurrentTown] = React.useState([]);
  const [currentShop, setCurrentShop] = React.useState([]);

  const [aboutItem, setAboutItem] = React.useState('');

  const [clickTest, setclickTest] = React.useState(false);
  const [value, setValue] = React.useState([]);
  const [valueCur, setvalueCur] = React.useState([]);

  React.useEffect(() => {
    getCities();
  }, []);

  async function getCities() {
    try {
      const cities = await axios.get(`https://ruprice.flareon.ru/api/entities/cities`);

      setListOfCities(cities.data);
    } catch (error) {
      message.error('Не удалось получить список городов');
    }
  }
  function getCurrentCities(value: any, rest: any) {
    getListOfShop(rest);
    setCurrentTown(rest);
  }
  async function getListOfShop(arr: any) {
    try {
      const listOfShop = await axios.post(
        `https://ruprice.flareon.ru/api/entities/retailer-by-city`,

        makeArrayOfId(arr),
      );

      setListOfShop(listOfShop.data);
    } catch (error) {
      message.error('Не удалось получить магазины по городам');
    }
  }
  function getCurrentShop(value: any, rest: any) {
    setCurrentShop(rest);
  }
  ///вспомогательные функции
  function makeArrayOfId(arr: any) {
    return arr.map((el: any) => {
      return el.id;
    });
  }

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
  interface UserValue {
    label: string;
    value: string;
  }

  async function fetchUserList(searchedText: any): Promise<UserValue[]> {
    return axios.post('https://ruprice.flareon.ru/api/entities/search-by-params', {
      cityIds: currentTown.map((el: any) => el.id),
      partOfDescription: searchedText,
      // retailerId: currentShop.id,
      retailerName: currentShop,
    });
  }
  async function getItemById(arr: any) {
    try {
      const itemInfo = await axios.post(`https://ruprice.flareon.ru/api/entities/offer`, [
        ...arr[0].id,
      ]);
      setAboutItem(itemInfo.data);
      setclickTest(true);
    } catch (error) {
      message.error('не удалось получить информацию по товару');
    }
  }
  return (
    <div className="App">
      <div className="header">
        <div className="headerWrapper">
          <a className=" textLogo" href="/">
            FLAREON
          </a>

          <ul className=" btnHeader">
            <li className="menuLinkWrapper">
              <a className="menuLink">Контакты</a>
            </li>
            <li className="menuLinkWrapper">
              <a className="menuLink">Приколы</a>
            </li>
          </ul>
          <nav className="singInWrapper">
            <a className="sinIn" href="/singin">
              еще больше проектов
            </a>
          </nav>
        </div>
      </div>
      <div className="mainWrapper">
        <div className="mainContent">
          <div className="mainContentTitle">
            FLAREON<span className="mainContentTitleThin"> — ГРАФИК ИЗМЕНЕНИЯ ЦЕН ТОВАРА</span>
          </div>
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
                  {listOfShop.map((el) => (
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
        </div>
        <div className="mainWave">
          <svg
            width="100%"
            height="100%"
            id="svg"
            viewBox="0 0 1440 250"
            xmlns="http://www.w3.org/2000/svg"
            className="transition duration-300 ease-in-out delay-150">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="5%" stop-color="#002bdcff"></stop>
                <stop offset="95%" stop-color="#8ed1fcff"></stop>
              </linearGradient>
            </defs>
            <path
              d="M 0,400 C 0,400 0,200 0,200 C 105.25358851674642,184.80382775119617 210.50717703349284,169.60765550239233 315,171 C 419.49282296650716,172.39234449760767 523.2248803827752,190.3732057416268 602,203 C 680.7751196172248,215.6267942583732 734.5933014354066,222.89952153110048 821,224 C 907.4066985645934,225.10047846889952 1026.4019138755982,220.0287081339713 1135,215 C 1243.5980861244018,209.9712918660287 1341.7990430622008,204.98564593301435 1440,200 C 1440,200 1440,400 1440,400 Z"
              stroke="none"
              stroke-width="0"
              fill="url(#gradient)"
              className="transition-all duration-300 ease-in-out delay-150 path-0"
              transform="rotate(-180 720 200)"></path>
          </svg>
        </div>

        <div className="test">
          <div className="textWhite">
            Следите за графиком изменения цены товара <br></br> в реальном времени
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
