<script setup>
import { ref, reactive, computed, watch } from 'vue';
import dayjs from 'dayjs';
import { compareDienstplan } from '../assets/js/Parse-fnc.js';

const props = defineProps({
  dienstplan: Object,
  data: Object,
});

const sel_month = ref(props.data.lastParse);
const changeLog = ref(null);
const monthList = computed(() => {
  console.log(monthList);
  return updatemonthList(sel_month.value);
})
const comparedPlan = ref(props.data.dienstplaene[0]);
const sel1 = ref(null);
const sel2 = ref(null);
const compared1 = ref(null);
const compared2 = ref(null);


const wochenTage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/*
  flag 0 ist kurze Wechsel default: 12
  flat 1 ist nicht mehr als n Naechte default: 3
*/


const tableHeader = computed(() => {
  return compileDateHeader(comparedPlan.value);
});

function updatemonthList(sel_month) {
  let index = props.data.dienstplaene.findIndex((e) => {
    return e.monat.month() === sel_month.month();
  });
  let monthListUpdate = [];
  if (index != -1) {
    let i = index;
    monthListUpdate.push(props.data.dienstplaene.at(index));
    i++;
    //dienstplaene hinter
    while (
      props.data.dienstplaene.at(i) != undefined &&
      props.data.dienstplaene.at(i).monat.month() === sel_month.month()
    ) {
      monthListUpdate.push(props.data.dienstplaene.at(i));
      i++;
    }
    //dienstplaene davor
    i = index - 1;
    while (
      props.data.dienstplaene.at(i) != undefined &&
      props.data.dienstplaene.at(i).monat.month() ===
      sel_month.month() &&
      i >= 0
    ) {
      monthListUpdate.push(props.data.dienstplaene.at(i));
      console.log("push i= " + i);
      i--;
    }
  }
  console.log(monthListUpdate.length);
  return monthListUpdate;
}


function compileDateHeader(dienstplan) {
  if (!dienstplan) {
    return null;
  }
  let tableHeader = [[]];
  let tmpDate = dayjs(dienstplan.monat).subtract(1, 'month');
  //console.log(tmpDate);
  tableHeader[0][0] = tmpDate.daysInMonth() - 1;
  tableHeader[0][1] = tableHeader[0][0] + 1;
  for (let i = 2; i < dienstplan.monat.daysInMonth() + 2; i++) {
    tableHeader[0][i] = i - 1;
  }
  tmpDate = tmpDate.set('date', tmpDate.daysInMonth());
  tmpDate = tmpDate.subtract(1, 'day');
  //console.log(tmpDate);
  let dayCounter = tmpDate.get('day');
  tableHeader[1] = [];
  for (let i = 0; i < dienstplan.monat.daysInMonth() + 2; i++) {
    tableHeader[1][i] = wochenTage[(dayCounter + i) % 7];
  }
  return tableHeader;
}

function nextMonth() {
  sel_month.value = sel_month.value.add(1, "month");
  reset();
}

function prevMonth() {
  sel_month.value = sel_month.value.subtract(1, "month");
  reset()
}

function checkCompare() {
  console.log('ping');
  if (monthList.value.length > 0 && sel1.value != null && sel2.value != null) {
    let ret = compareDienstplan(monthList.value[sel1.value], monthList.value[sel2.value]);
    comparedPlan.value = ret.comparedPlan;
    changeLog.value = ret.changeLog;
    compared1.value = ret.compared1;
    compared2.value = ret.compared2
  }
}

function reset() {
  sel1.value = null;
  sel2.value = null;
  changeLog.value = null;
  compared1.value = null;
  compared2.value = null;
}


function debug(msg) {
  console.log(sel2.value);

}
</script>

<template>
  <a-space direction="vertical" style="width: 100%">
    <a-row>
      <a-col :span="8">
        <span>
          <select name="dienstplan1" id="selplan1" v-model="sel1" @change="checkCompare()">
            <option v-if="monthList.length > 0" v-for="(el, index) in monthList" :value="index">{{
            dayjs(el.eingelesen).format('HH:mm [am] DD/MM/YYYY')
            }}</option>
            <option v-else>Keine Plaene.</option>
          </select>
          Vergleiche mit:
          <select name="dienstplan1" id="selplan1" v-model="sel2" @change="checkCompare()">
            <option v-if="monthList.length > 0" v-for="(el, index) in monthList" :value="index">{{
            dayjs(el.eingelesen).format('HH:mm [am] DD/MM/YYYY')
            }}</option>
            <option v-else>Keine Plaene.</option>
          </select>
        </span>
      </a-col>
      <a-col :span="8">
        <a-button @click="prevMonth">vorheriger Monat</a-button>
        <a-date-picker v-model:value="sel_month" picker="month" />
        <a-button input @click="nextMonth">nächster Monat</a-button>
      </a-col>
      <a-col :span="8"></a-col>
    </a-row>
        <h1 v-if="compared1">{{ compared1.format('HH:mm [am] DD/MM/YYYY') }} Verglichen mit {{ compared2.format('HH:mm [am] DD/MM/YYYY') }}</h1>
    <h1 v-else>Noch kein Vergleich durchgeführt.</h1>
    <table v-if="monthList.length > 0">
      <colgroup>
        <col class="colName">
        <col class="colWochenStunden">
        <col class="colVormonat">
        <col class="colVormonat">
        <template v-for="el in tableHeader[1].slice(2)">
          <col v-if="el === 'Sa'" class="sat">
          <col v-else-if="el === 'So'" class="sun">
          <col v-else>
        </template>
      </colgroup>
      <tr>
        <th>Name</th>
        <th>Std.</th>
        <th v-for="el in tableHeader[0]">
          {{ el }}
        </th>
      </tr>
      <tr>
        <th></th>
        <th></th>
        <th v-for="el in tableHeader[1]">
          {{ el }}
        </th>
      </tr>
      <tr v-for="(row, i) in comparedPlan.dReihe" :class="{ disabled: row.mitarbeiter.disable }">
        <td :class="row.mitarbeiter.fk ? 'fk' : 'ek'">
          {{ row.mitarbeiter.name }}, {{ row.mitarbeiter.vorname }}
        </td>
        <td>
          {{ row.mitarbeiter.wochenStunden }}
        </td>
        <template v-for="(dienstEl) in comparedPlan.dReihe[i].dienstEl">
          <td v-if="dienstEl.before !== undefined" class="changed">
            <div class="tooltip">{{ dienstEl.dienst.name }}
              <span class="tooltiptext">{{ dienstEl.before.name }} => {{ dienstEl.dienst.name }}</span>
            </div>
          </td>
          <td v-else>{{ dienstEl.dienst.name }}</td>
        </template>
      </tr>
    </table>
    <div v-if="monthList.length > 0" class="logBox">
      <pre><template v-for="entry in changeLog">{{ entry.mitarbeiter.vorname }} {{ entry.mitarbeiter.name }} {{ entry.before.name }} => {{ entry.after.name }} &nbsp;&nbsp;&nbsp;&nbsp;am {{ entry.date.format('DD/MM') }}
</template></pre>
    </div>
    <div v-else>Keine Daten.</div>
  </a-space>
</template>


<style scoped>
:root {
  --gradOpacity: 0.5;
}

table {
  border: 0px solid;
  overflow: hidden;
  empty-cells: show;
  font-size: 0.80vw;
  margin-left: auto;
  margin-right: auto;
}

td {
  border: 0px solid;
  min-width: 1.8vw;
}

th {
  border: 1px solid;
  background: rgb(44, 44, 44);
  color: white;
}

tr:hover {
  background-color: lightyellow;
}

.changed {
  background-color: aqua;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;
  white-space: nowrap;

  position: absolute;
  bottom: calc(0.5rem + 100%);
  right: 50%;
  transform: transLateX(50%);
  z-index: 1;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}

.colWochenStunden {
  background: lightblue;
}

.colVormonat {
  background: lightgrey;
}

.colName {
  background: lightgrey;
  text-align: left;
}


.sat {
  background: lavender;
}

.sun {
  background: mistyrose;
}

.holiday {
  background: lightcoral;
}

.prevMonth {
  background: darkgrey;
}

.fk {
  font-weight: bold;
  text-align: left;
}

.ek {
  text-align: left;
}

.fFreieTage {
  background-color: red;
}

tr.disabled {
  text-decoration: line-through;
  background-color: lightgrey;
}
</style>