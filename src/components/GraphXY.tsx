import React, { useRef, useLayoutEffect } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import moment from 'moment';
interface Graphics {
  value: string;
}
function GraphicXY<Graphics>({ aboutItem }: any) {
  React.useLayoutEffect(() => {
    let root = am5.Root.new('chartdiv');

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        maxTooltipDistance: 0,
        pinchZoomX: true,
      }),
    );

    let date = new Date();
    date.setHours(0, 0, 0, 0);
    let value = 100;

    function generateData() {
      value = Math.round(Math.random() * 10 - 4.2 + value);
      am5.time.add(date, 'day', 1);
      return {
        date: date.getTime(),
        value: value,
      };
    }

    function generateDatas(count: any) {
      let data = [];
      for (let i = 0; i < count; ++i) {
        data.push(generateData());
      }
      return data;
    }

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.2,
        baseInterval: {
          timeUnit: 'day',
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {}),
        tooltip: am5.Tooltip.new(root, {}),
      }),
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/

    for (let i = 0; i < aboutItem?.plotData?.length; i++) {
      let series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: aboutItem?.plotData[i]?.category,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: 'value',
          valueXField: 'date',
          legendValueText: '{valueY}',
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: 'horizontal',
            labelText: '{valueY}',
          }),
        }),
      );
      console.log('data', series);

      date = new Date();
      date.setHours(0, 0, 0, 0);
      value = 0;

      let data = generateDatas(10);
      console.log(data);
      console.log(aboutItem?.plotData[i]?.data);
      series.data.setAll(
        aboutItem?.plotData[i]?.data.map((el: any) => {
          return {
            date: moment(el.date).valueOf(),
            value: el.value,
          };
        }),
      );

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();
    }

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'none',
      }),
    );
    cursor.lineY.set('visible', false);

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    chart.set(
      'scrollbarX',
      am5.Scrollbar.new(root, {
        orientation: 'horizontal',
      }),
    );

    chart.set(
      'scrollbarY',
      am5.Scrollbar.new(root, {
        orientation: 'vertical',
      }),
    );

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    let legend = chart.rightAxesContainer.children.push(
      am5.Legend.new(root, {
        width: 200,
        paddingLeft: 15,
        height: am5.percent(100),
      }),
    );

    // When legend item container is hovered, dim all the series except the hovered one
    legend.itemContainers.template.events.on('pointerover', function (e) {
      let itemContainer: any = e.target;

      // As series list is data of a legend, dataContext is series
      let series: any = itemContainer.dataItem.dataContext;

      chart.series.each(function (chartSeries: any) {
        if (chartSeries != series) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000),
          });
        } else {
          chartSeries.strokes.template.setAll({
            strokeWidth: 3,
          });
        }
      });
    });

    // When legend item container is unhovered, make all series as they are
    legend.itemContainers.template.events.on('pointerout', function (e) {
      let itemContainer = e.target;

      chart.series.each(function (chartSeries: any) {
        chartSeries.strokes.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: chartSeries.get('fill'),
        });
      });
    });

    legend.itemContainers.template.set('width', am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: 'right',
    });

    // It's is important to set legend data after all the events are set on template, otherwise events won't be copied
    legend.data.setAll(chart.series.values);
    console.log(`rerender`);
    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);
    return () => {
      root.dispose();
    };
  }, [aboutItem]);

  return <div id="chartdiv" style={{ width: '100%', height: '500px' }}></div>;
}
export default GraphicXY;
