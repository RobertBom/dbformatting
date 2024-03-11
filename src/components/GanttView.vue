<script setup>
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { getTagesBesetzungen } from '../assets/js/Parse-fnc';
dayjs.locale("de");

const props = defineProps({
  data: Object,
})

const selTimeFrame = ref(null);
const chartBegin = ref(dayjs().startOf('day'));
const chartEnd = ref((chartBegin.value.add(5, 'day')).subtract(1, 'second'));
const formatS = 'YYYY-MM-DD HH:mm'


const ganttData = computed(() => {
  if (!selTimeFrame.value) {
    return null;
  }
  else {
    return ref(getGanttData(selTimeFrame.value));
  }
});


function getGanttData(selTimeFrame) {
  let fruehRows = [];
  let spaetRows = [];
  let nachtBefore = [];
  let nachtRows = [];
  let nachtAfter = [];
  const ganttRoot = ref([]);


  const besetzungNBefore = getTagesBesetzungen(props.data, selTimeFrame[0].subtract(1, 'd'), selTimeFrame[0].subtract(1, 'd'));
  const besetzung = getTagesBesetzungen(props.data, selTimeFrame[0], selTimeFrame[1]);
  const besetzungNAfter = getTagesBesetzungen(props.data, selTimeFrame[1].add(1, 'd'), selTimeFrame[1].add(1, 'd'));

  function convertGantt(besetzung, key, color) {
    const row = [[]];

    for (let i = 0; i < besetzung.length; i++) {
      for (let j = 0; j < besetzung[i][key].length; j++) {
        if (row[j] == undefined) {
          row[j] = [];
        }
        let date = besetzung[i].date.startOf('d');
        row[j].push(
          {
            start: date.add(besetzung[i][key][j].dienst.startUm, 'ms').format(formatS),
            end: date.add(besetzung[i][key][j].dienst.endeUm, 'ms').format(formatS),
            ganttBarConfig: {
              //id: crypto.randomUUID(),
              id: Math.random(),
              label: `${besetzung[i][key][j].mitarbeiter.vorname} ${besetzung[i][key][j].mitarbeiter.name} ${besetzung[i][key][j].dienst.name}`,
              immobile: true,
              style: {
                background: color,
                'font-weight': besetzung[i][key][j].mitarbeiter.fk ? 'bold' : '',
                borderRadius: '5px',
              }
            }
          });

      }
    }
    return row;
  }

  fruehRows = convertGantt(besetzung, 'frueh', 'LightSkyBlue');
  spaetRows = convertGantt(besetzung, 'spaet', 'LimeGreen');

  nachtBefore = convertGantt(besetzungNBefore, 'nacht');
  nachtRows = convertGantt(besetzung, 'nacht');
  nachtAfter = convertGantt(besetzungNAfter, 'nacht');
  let max = Math.max(nachtBefore.length, nachtRows.length, nachtAfter.length);
  let conc = [];
  for (let i = 0; i < max; i++) {
    conc[i] = [];
  }
  for (let i = 0; i < max; i++) {
    conc[i] = conc[i].concat(nachtBefore[i]);
    conc[i] = conc[i].concat(nachtRows[i]);
    conc[i] = conc[i].concat(nachtAfter[i]);
  }
  ganttRoot.value = fruehRows.concat(spaetRows).concat(conc);
  return ref(ganttRoot);
}


function debug(msg) {
  console.log(msg);
}
</script>

<template>
  <a-range-picker v-model:value="selTimeFrame" />
  <br />
  <button @click="debug(selTimeFrame[0].format(formatS))">DEBUG BUTTON</button>

  <g-gantt-chart v-if="ganttData" :chart-start="selTimeFrame[0].startOf('d').format(formatS)"
    :chart-end="selTimeFrame[1].add(1, 'd').startOf('d').format(formatS)" precision="hour" bar-start="start"
    bar-end="end" :grid=true>
    <g-gantt-row v-for="bar in ganttData.value" label="" :bars="bar" />
  </g-gantt-chart>
</template>

<style>

</style>