<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import dayjs from 'dayjs';
import { getTagesBesetzungen } from '../assets/js/Parse-fnc.js'


const props = defineProps({
  data: Object,
});


const selTimeFrame = ref(null); //will be array [ dayjs, dayjs ] 
const selTimeWeek = ref(null);
const tableData = computed(() => {
  if (selTimeFrame.value === null) {
    return [];
  } else {
    selTimeWeek.value = selTimeFrame.value[0];
    return getTagesBesetzungen(props.data, selTimeFrame.value[0], selTimeFrame.value[1]);
  }
});

console.log(tableData.value);

function prev() {
  if (selTimeWeek.value === null) {
    selTimeWeek.value = dayjs();
  }
  selTimeWeek.value = selTimeWeek.value.subtract(7, 'd');
  weekToRange();
}

function next() {
  if (selTimeWeek.value === null) {
    selTimeWeek.value = dayjs();
  }
  selTimeWeek.value = selTimeWeek.value.add(7, 'd');
  weekToRange();
}

function weekToRange() {
  console.log(selTimeWeek.value);
  if (selTimeWeek.value) {
    selTimeFrame.value = []
    selTimeFrame.value[0] = selTimeWeek.value.day(1);
    selTimeFrame.value[1] = selTimeWeek.value.day(7);
  }
}


function debug() {
  console.log(selTimeFrame.value[0]);
  //console.log(selTimeFrame);
}

</script>

<template>

  <button @click="debug()">Test Button</button>
  <a-space direction="vertical" style="width: 100%">
    <span>
      <a-button @click="prev()">
        <Icon icon="fa:arrow-left" />
      </a-button>
      <a-date-picker @change="weekToRange()" v-model:value="selTimeWeek" picker="week" />
      <a-button input @click="next()">
        <Icon icon="fa:arrow-right" />
      </a-button>

    </span>
    <a-range-picker v-model:value="selTimeFrame" />

  </a-space>

  <table v-if="tableData.length > 0">
    <tr>
      <td class="header">Tag</td>
      <td class="header" v-for="el in tableData">{{ el.date.format('dd DD/MM') }}</td>
    </tr>
    <tr>
      <td class="header">Früh</td>
      <td v-for="el in tableData">
        <table class="elemtable">
          <tr v-for="print in el.frueh" style="border: 0px" :class="print.mitarbeiter.fk ? 'fk' : 'ek'">
            <td class="elemtd">{{ print.mitarbeiter.vorname }}</td>
            <td class="elemtdtag">{{ print.dienst.name }}</td>
            <td class="elemtdtime">{{ print.dienst.start }}-{{ print.dienst.ende }}</td>
            <br />
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="header">Spät</td>
      <td v-for="el in tableData">
        <table class="elemtable">
          <tr v-for="print in el.frueh" style="border: 0px" :class="print.mitarbeiter.fk ? 'fk' : 'ek'">
            <td class="elemtd">{{ print.mitarbeiter.vorname }}</td>
            <td class="elemtdtag">{{ print.dienst.name }}</td>
            <td class="elemtdtime">{{ print.dienst.start }}-{{ print.dienst.ende }}</td>
            <br />
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="header">Nacht</td>
      <td v-for="el in tableData">
        <template v-for="print in el.nacht">
          <div :class="print.mitarbeiter.fk ? 'fk' : 'ek'">
            {{ print.mitarbeiter.vorname }} {{ print.dienst.name }} {{ print.dienst.start }} - {{ print.dienst.ende }}
          </div>
          <br />
        </template>
      </td>
    </tr>
  </table>

</template>

<style scoped>
table th,
td {
  border: solid 1px;
  background: white;
  color: black;
  text-align: left;
}

.elemtd {
  border: 0px;
}

.elemtdtime {
  font-size: small;
  border: 0px;
  padding-left: 5px;
}

.elemtdtag {
  border: 0px;
  padding-left: 5px;
}

.elemtable {
  border: 0px;
}

.header {
  font-weight: bold;

}

.fk {
  font-weight: bold;
}
</style>