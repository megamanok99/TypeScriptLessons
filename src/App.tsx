import React from 'react';
import { Col, Row, Input, Select, message, Button, Layout, Spin, SelectProps } from 'antd';
import './App.css';
import axios from 'axios';
import 'antd/dist/antd.css';
import debounce from 'lodash/debounce';
import classNames from 'classnames';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import moment from 'moment';
import GraphicXY from './components/GraphXY';
import Table from './components/Table';
import TableData from './components/Table';
const logo = require('./test.svg') as string;
const { Option } = Select;
function App() {
  const [listOfCities, setListOfCities] = React.useState([]);
  const [listOfShop, setListOfShop] = React.useState([]);

  const [currentTown, setCurrentTown] = React.useState([]);
  interface CurrentShop {
    value: string;
  }
  const [currentShop, setCurrentShop] = React.useState<CurrentShop>({
    value: '',
  });

  const [aboutItem, setAboutItem] = React.useState();

  const [clickTest, setclickTest] = React.useState(false);
  interface CurrentValue {
    value: string;
  }
  const [value, setValue] = React.useState<CurrentValue>();
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

  let searchBlock = classNames({
    mainContent: true,
    mainContentLoaded: clickTest,
  });
  let searchTitle = classNames({
    mainContentTitle: true,
    mainContentTitleLoaded: clickTest,
  });
  async function getListOfShop(arr: any) {
    console.log(`e`, arr);
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
        console.log(`value`, value);
        fetchOptions(value).then((newOptions: any) => {
          console.log('newOptions', newOptions);
          if (fetchId !== fetchRef.current) {
            // for fetch callback order
            return;
          }
          setOptions(
            newOptions.data.map((el: any) => {
              return {
                value: el.title,
                label: el.title,
                id: el.ids,
              };
            }),
          );
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
      retailerName: currentShop.value,
    });
  }
  async function getItemById(arr: any) {
    try {
      const itemInfo = await axios.post(`https://ruprice.flareon.ru/api/entities/offer`, [
        ...arr[0].id,
      ]);
      setAboutItem(itemInfo.data);
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
          {/* <nav className="singInWrapper">
            <a className="sinIn" href="/singin">
              еще больше проектов
            </a>
          </nav> */}
        </div>
      </div>
      <div className="mainWrapper">
        <div className={searchBlock}>
          <div className={searchTitle}>
            RUPRICE<span className="mainContentTitleThin"> — ГРАФИК ИЗМЕНЕНИЯ ЦЕН ТОВАРА</span>
          </div>
          <div className="wrapperSearch">
            <Row style={{ width: '100%' }} wrap align="middle" justify="center" gutter={[16, 32]}>
              <Col xs={24} sm={24} md={24} lg={16} xl={8} xxl={8}>
                <Select
                  maxTagCount={'responsive'}
                  className="selectorForm"
                  mode="multiple"
                  size="large"
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
              <Col xs={24} sm={24} md={8} lg={8} xl={5} xxl={4}>
                <Select
                  className="selectorForm"
                  allowClear
                  size="large"
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
              <Col xs={24} sm={24} md={16} lg={16} xl={8} xxl={8}>
                {/* <DebounceSelect
                  className="selectorForm"
                  mode="multiple"
                  size="large"
                  value={[]}
                  placeholder={value[0]?.value || 'Выбор товара'}
                  fetchOptions={fetchUserList}
                  onChange={(newValue: any, vb: any) => {
                    console.log('here', newValue);
                    setValue(newValue);
                    getItemById(vb);
                  }}
                  style={{
                    width: '100%',
                  }}
                /> */}
                <Input
                  value={value}
                  onChange={(newValue: any) => {
                    setValue(newValue.target.value);
                  }}
                  style={{
                    width: '100%',
                  }}
                />
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} xl={3} xxl={4}>
                <Button size="large" className="searchBtn" onClick={() => setclickTest(true)}>
                  Найти
                </Button>
                <Button size="large" className="searchBtn" onClick={() => setclickTest(true)}>
                  Найти табл
                </Button>
              </Col>
            </Row>
          </div>
        </div>
        <div className="mainWave">
          <svg
            width="100%"
            height="100%"
            id="svg"
            viewBox="0 0 1440 330"
            xmlns="http://www.w3.org/2000/svg"
            className="transition duration-300 ease-in-out delay-150 ">
            <style></style>
            <defs>
              <linearGradient id="gradient" x1="0%" x2="100%">
                <stop offset="5%" stop-color="#002bdc88"></stop>
                <stop offset="100%" stop-color="#8ed1fc88"></stop>
              </linearGradient>
            </defs>
            <path
              d="M 0,400 C 0,400 0,133 0,133 C 171.2,131.66666666666666 342.4,130.33333333333331 502,130 C 661.6,129.66666666666669 809.5999999999999,130.33333333333334 964,131 C 1118.4,131.66666666666666 1279.2,132.33333333333331 1440,133 C 1440,133 1440,400 1440,400 Z"
              stroke="none"
              stroke-width="0"
              fill="url(#gradient)"
              className="transition-all duration-300 ease-in-out delay-150 path-0"
              transform="rotate(-180 720 200)"></path>
            <style></style>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="5%" stop-color="#002bdcff"></stop>
                <stop offset="95%" stop-color="#8ed1fcff"></stop>
              </linearGradient>
            </defs>
            <path
              d="M 0,400 C 0,400 0,266 0,266 C 207.46666666666664,259.73333333333335 414.9333333333333,253.46666666666664 558,261 C 701.0666666666667,268.53333333333336 779.7333333333333,289.8666666666667 916,293 C 1052.2666666666667,296.1333333333333 1246.1333333333332,281.06666666666666 1440,266 C 1440,266 1440,400 1440,400 Z"
              stroke="none"
              stroke-width="0"
              fill="url(#gradient)"
              className="transition-all duration-300 ease-in-out delay-150 path-1"
              transform="rotate(-180 720 200)"></path>
          </svg>
        </div>

        <div className="test">
          <div className="textWhite">
            Следите за графиком изменения цены товара <br></br> в реальном времени
          </div>
        </div>
        <TableData />
        <GraphicXY aboutItem={aboutItem} />
      </div>
    </div>
  );
}

export default App;
