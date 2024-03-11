<script setup>
import { ref, reactive, computed, watch } from 'vue';
import dayjs from 'dayjs';
import { calcFreieTage, calcFreieTageMonat, flagKurzeWechsel, flagDreiNaechte, getTagesBesetzungen, flag125regel, flagAusgleichstage } from '../../assets/js/Parse-fnc.js';
import TdFlag from './TdFlag.vue';
import FilterSelector from './FilterSelector.vue';
import ToolTip from './ToolTip.vue';

const props = defineProps({
  dienstplan: Object,
  data: Object,
});


const wochenTage = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const freieTageMonat = ref(null);
const activatedFlags = reactive([]);
const flagOptions = reactive([12, 3, 125]);
const besetzungen = computed(() => {
  return getTagesBesetzungen(props.data, props.dienstplan.monat.date(1), props.dienstplan.monat.date(props.dienstplan.monat.daysInMonth()));
})
const colorThresholdAll = ref([6, 5, 4, 3]);
const colorThresholdFK = ref([3, 2, 2, 1]);

/*
  flag 0 ist kurze Wechsel default: 12
  flat 1 ist nicht mehr als n Naechte default: 3
*/

const tableHeader = computed(() => {
  return compileDateHeader();
});

function compileDateHeader() {
  let tableHeader = [[]];
  let tmpDate = dayjs(props.dienstplan.monat).subtract(1, 'month');
  //console.log(tmpDate);
  tableHeader[0][0] = tmpDate.daysInMonth() - 1;
  tableHeader[0][1] = tableHeader[0][0] + 1;
  for (let i = 2; i < props.dienstplan.monat.daysInMonth() + 2; i++) {
    tableHeader[0][i] = i - 1;
  }
  tmpDate = tmpDate.set('date', tmpDate.daysInMonth());
  tmpDate = tmpDate.subtract(1, 'day');
  //console.log(tmpDate);
  let dayCounter = tmpDate.get('day');
  tableHeader[1] = [];
  for (let i = 0; i < props.dienstplan.monat.daysInMonth() + 2; i++) {
    tableHeader[1][i] = wochenTage[(dayCounter + i) % 7];
  }
  return tableHeader;
}

function toggleDisable(row) {
  //row.mitarbeiter.disable = !row.mitarbeiter.disable;
  row.mitarbeiter.diable = true;
}

function flagRuleset() {
  //remove all flags, if performance tanks maybe only do changes in future
  for (const dReihe of props.dienstplan.dReihe) {
    for (const dienstEl of dReihe.dienstEl) {
      dienstEl.flags = [];
    }

  }
  flagKurzeWechsel(props.dienstplan, flagOptions[0]);
  flagDreiNaechte(props.dienstplan, flagOptions[1]);
  flag125regel(props.data, props.dienstplan, flagOptions[2]);
  flagAusgleichstage(props.dienstplan);
}

async function updateFreieTageMonat() {
  freieTageMonat.value = await calcFreieTageMonat(props.dienstplan.monat);
}

function checkForActiveFlag(dienstEl) {
  let ret = false;
  for (const flag of dienstEl.flags) {
    if (activatedFlags[flag]) {
      ret = true;
      break;
    }
  }
  return ret;
}

function createTooltip(besetzung) {
  console.log(besetzung);
}



flagRuleset();
compileDateHeader();
updateFreieTageMonat();

watch(() => props.dienstplan.monat, () => {
  updateFreieTageMonat();
});

watch(flagOptions, () => {
  flagRuleset();
});

function debug(msg) {
  console.log(msg);
}
</script>

<template>
  <a-row type="flex">
    <a-col flex="auto">
      <table>
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
          <th>&#127881;</th>
          <th>d</th>
        </tr>
        <tr>
          <th></th>
          <th></th>
          <th v-for="el in tableHeader[1]">
            {{ el }}
          </th>
          <th></th>
          <th></th>
        </tr>
        <tr v-for="(row, i) in props.dienstplan.dReihe" :class="{ disabled: row.mitarbeiter.disable }">
          <td :class="row.mitarbeiter.fk ? 'fk' : 'ek'">
            {{ row.mitarbeiter.name }}, {{ row.mitarbeiter.vorname }}
          </td>
          <td>
            {{ row.mitarbeiter.wochenStunden }}
          </td>
          <template v-for="(dienstEl) in props.dienstplan.dReihe[i].dienstEl">
            <TdFlag v-if="checkForActiveFlag(dienstEl)" :dienst="dienstEl" />
            <td v-else>{{ dienstEl.dienst.name }}</td>
          </template>
          <td v-if="calcFreieTage(row) < freieTageMonat" class="fFreieTage"> {{ calcFreieTage(row) }}</td>
          <td v-else> {{ calcFreieTage(row) }}</td>
          <td>
            <input type="checkbox" v-model="row.mitarbeiter.disable" @change="toggleDisable(row)" />
          </td>
        </tr>
        <tr>
          <td>Frueh</td>
          <td>a</td>
          <td>a</td>
          <td>a</td>
          <template v-for="TagesBesetzung in besetzungen">
            <td v-if="TagesBesetzung.frueh.length >= colorThresholdAll[0]" class="grad0">
              <ToolTip :besetzung="TagesBesetzung.frueh" :title="'Im Frühdienst'">{{ TagesBesetzung.frueh.length }}
              </ToolTip>
            </td>
            <td v-else-if="TagesBesetzung.frueh.length >= colorThresholdAll[1]" class="grad1">
              <ToolTip :besetzung="TagesBesetzung.frueh" :title="'Im Frühdienst'">{{ TagesBesetzung.frueh.length }}
              </ToolTip>
            </td>
            <td v-else :class="(TagesBesetzung.frueh.length >= colorThresholdAll[2]) ? 'grad2' : 'grad3'">
              <ToolTip :besetzung="TagesBesetzung.frueh" :title="'Im Frühdienst'">{{ TagesBesetzung.frueh.length }}
              </ToolTip>
            </td>
          </template>
        </tr>
        <tr>
          <td>Spaet</td>
          <td>a</td>
          <td>a</td>
          <td>a</td>
          <template v-for="TagesBesetzung in besetzungen">
            <td v-if="TagesBesetzung.spaet.length >= colorThresholdAll[0]" class="grad0">
              <ToolTip :besetzung="TagesBesetzung.spaet" :title="'Im Spätdienst'">{{ TagesBesetzung.spaet.length }}
              </ToolTip>
            </td>
            <td v-else-if="TagesBesetzung.spaet.length >= colorThresholdAll[1]" class="grad1">
              <ToolTip :besetzung="TagesBesetzung.spaet" :title="'Im Spätdienst'">{{ TagesBesetzung.spaet.length }}
              </ToolTip>
            </td>
            <td v-else :class="(TagesBesetzung.spaet.length >= colorThresholdAll[2]) ? 'grad2' : 'grad3'">
              <ToolTip :besetzung="TagesBesetzung.spaet" :title="'Im Spätdienst'">{{ TagesBesetzung.spaet.length }}
              </ToolTip>
            </td>
          </template>
        </tr>
        <tr>
          <td>Nacht</td>
          <td>a</td>
          <td>a</td>
          <td>a</td>
          <template v-for="TagesBesetzung in besetzungen">
            <td :class="TagesBesetzung.nacht.length > 0 ? '' : 'grad3'">{{
            TagesBesetzung.nacht.length
            }}
            </td>
          </template>
        </tr>
      </table>
    </a-col>
    <a-col flex=" 1 100px">
      <FilterSelector v-model:activatedFlags="activatedFlags" v-model:flagOptions="flagOptions" />
    </a-col>
  </a-row>
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

.colName {
  background: lightgrey;
  text-align: left;
}

.colWochenStunden {
  background: lightblue;
}

.colVormonat {
  background: lightgrey;
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

.grad0 {
  background: rgba(16, 255, 0, 0.6);
}

.grad1 {
  background: rgba(172, 255, 0, 0.6);
}

.grad2 {
  background: rgba(255, 255, 0, 0.6);
}

.grad3 {
  background: rgba(255, 0, 0, 0.6);
}
</style>