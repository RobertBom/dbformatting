<script setup>
import { ref, computed } from 'vue';
import apexchart from 'vue3-apexcharts';
import { getDPList, getDPListRange, getStats, getStatsDienste, getNewest } from '../assets/js/Parse-fnc.js';
import dayjs from "dayjs";
import "dayjs/locale/de";
dayjs.locale("de");

const props = defineProps({
  data: Object,
});

const selMonth = ref(dayjs());
const selMonthRange = ref(null);
const statsMonth = computed(() => { return getStats(getNewest(props.data, selMonth.value)) });
const monthList = getDPList(props.data);
const monthListRange = computed(() => {
  if (selMonthRange.value) {
    return getDPListRange(props.data, selMonthRange.value[0], selMonthRange.value[1]);
  } else {
    return null;
  }

});
const monthListRangeStats = ref(null);




var series = ref([{
  name: "Desktops",
  data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
}]);
var chartOptions = ref({
  chart: {
    height: 350,
    type: 'line',
    zoom: {
      enabled: true
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'straight'
  },
  title: {
    text: 'Statistiken',
    align: 'left'
  },
  grid: {
    row: {
      colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
      opacity: 0.5
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
  },
  yaxis: {
    forceNiceScale: true,
    decimalsInFloat: 0,
  }
});

function compStats() {
  if (!monthListRange.value) {
    return null;
  }
  var statsArr = null;
  var keyList = [];
  for (let i = 0; i < monthListRange.value.length; i++) {
    let cRet = getStats(monthListRange.value[i]);
    if (statsArr == null) {
      console.log('init statsArr');
      statsArr = [];
      for (const key in cRet) {
        statsArr.push({
          name: key,
          data: [],
        })
        statsArr[key] = [];
        keyList.push(key);
      }
    }
    for (let j = 0; j < keyList.length; j++) {
      if (keyList[j] === 'date') {
        statsArr[j].data.push((cRet[keyList[j]]).format('MMM'));
      }
      else {
        statsArr[j].data.push(cRet[keyList[j]]);
      }
    }
  }
  console.log(statsArr);

  console.log(series)
  console.log([statsArr[1]]);
  //insert stats
  series.value = ([]);
  for (let i = 1; i, i < statsArr.length; i++) {
    series.value.push(statsArr[i]);
  }
  console.log(series.value);
  console.log(chartOptions.value.xaxis.categories);
  chartOptions.value = {
    ...chartOptions.value,
    ...{
      xaxis: {
        categories: statsArr[0].data,
      }
    }
  };

  //(statsArr[0].data);
  console.log(chartOptions.value.xaxis.categories);
  console.log(chartOptions.value);


}

function debug(msg) {
  compStats();
}

</script>
<template>
  Stats
  <a-range-picker v-model:value="selMonthRange" picker="month"></a-range-picker>
  <div id="chart">
    <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>
  </div>

  <a-date-picker v-model:value="selMonth" picker="month" />
  <div v-if="statsMonth" class="logBox">
    <pre style="width: 100%; height: fit-content"><template v-for="(value, key) in statsMonth">{{ key }}: {{ value }}
</template></pre>
  </div>
</template>
<style>

</style>