<script setup>
import { ref, reactive, computed, watch } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/de";
import {
  FrownOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import MonthTable from "./MonatsUebersicht/MonthTable.vue";
import SpecialDates from "./SpecialDates.vue";
dayjs.locale("de");

const props = defineProps({
  data: Object,
});

const sel_month = ref(props.data.lastParse);
const sel_dienstplan = ref(null);
const monthList = reactive([]);
const filterMitarbeiter = ref("");
const filterFK = ref(false);
const filterEK = ref(false);

updateMonth();

const filteredDienstplan = computed(() => {
  if (
    filterMitarbeiter.value.length === 0 &&
    !filterFK.value &&
    !filterEK.value
  ) {
    return sel_dienstplan.value;
  } else {
    let copy = { ...sel_dienstplan.value };
    copy.dReihe = copy.dReihe.filter((e) => {
      let searchstring = new RegExp(escapeRegExp(filterMitarbeiter.value), "i");
      let match = false;
      if (filterFK.value) {
        if (!e.mitarbeiter.fk) {
          return false;
        }
      }
      if (filterEK.value) {
        if (e.mitarbeiter.fk) {
          return false;
        }
      }
      if (e.mitarbeiter.name.search(searchstring) !== -1) {
        match = true;
      } else if (e.mitarbeiter.vorname.search(searchstring) !== -1) {
        match = true;
      }
      return match;
    });
    return copy;
  }
});

//updates monthLlist[] based on sel_dienstplan
function updatemonthList() {
  let index = props.data.dienstplaene.findIndex((e) => {
    return e.monat.month() === sel_month.value.month();
  });
  monthList.value = [];
  if (index != -1) {
    let i = index;
    monthList.value.push(props.data.dienstplaene.at(index));
    i++;
    //dienstplaene hinter
    while (
      props.data.dienstplaene.at(i) != undefined &&
      props.data.dienstplaene.at(i).monat.month() === sel_month.value.month()
    ) {
      monthList.value.push(props.data.dienstplaene.at(i));
      i++;
    }
    //dienstplaene davor
    i = index - 1;
    while (
      props.data.dienstplaene.at(i) != undefined &&
      props.data.dienstplaene.at(i).monat.month() ===
      sel_month.value.month() &&
      i >= 0
    ) {
      monthList.value.push(props.data.dienstplaene.at(i));
      console.log("push i= " + i);
      i--;
    }
  }
}

//updates selected dienstplan based on < | >
function updateSelDienstplan(i = 0) {
  sel_dienstplan.value = monthList.value[i];
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function updateMonth() {
  updatemonthList();
  updateSelDienstplan();
}
function nextMonth() {
  sel_month.value = sel_month.value.add(1, "month");
}

function prevMonth() {
  sel_month.value = sel_month.value.subtract(1, "month");
}

function print(msg) {
  console.log(msg);
}

watch(sel_month, () => {
  updateMonth();
});
</script>

<template>
  <div v-if="data.dienstplaene.length < 1">
    <h1>Keine Daten vorhanden.</h1>
    <br />
    <frown-outlined :spin="true" :style="{ fontSize: '500px', color: '#F8c' }" />
  </div>
  <div v-else>
    <a-space direction="vertical" style="width: 100%">
      <a-row>
        <a-col :span="8">
          <a-row>
            <a-col :span="12">
              <a-input v-model:value="filterMitarbeiter" placeholder="Filter Mitarbeiter">
                <template #prefix>
                  <user-outlined type="user" />
                </template>
              </a-input>
            </a-col>
            <a-col :span="12"><span>
                <a-checkbox v-model:checked="filterFK">Fachkraft</a-checkbox>
                <a-checkbox v-model:checked="filterEK">Ergänzungskraft</a-checkbox>
              </span>
            </a-col>
          </a-row>
        </a-col>
        <a-col :span="8">
          <a-button @click="prevMonth">vorheriger Monat</a-button>
          <a-date-picker v-model:value="sel_month" picker="month" />
          <a-button input @click="nextMonth">nächster Monat</a-button>
        </a-col>
        <a-col :span="8">
          <a-row>
            <a-col>
              <a-dropdown placement="bottom">
                <a-button>ältere Versionen</a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item v-for="(el, index) in monthList.value" @click="updateSelDienstplan(index)">
                      {{ dayjs(el.eingelesen).format("HH:mm [am] DD/MM/YYYY") }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-col>
            <a-col>
              <SpecialDates :sel_month="sel_month" />
            </a-col>
          </a-row>
        </a-col>
      </a-row>
      <span v-if="sel_dienstplan != undefined">
        {{ dayjs(sel_dienstplan.monat).format("MMMM YYYY") }}
        stand vom:
        {{ dayjs(sel_dienstplan.eingelesen).format("DD/MM/YYYY HH:mm") }}
      </span>
      <MonthTable v-if="sel_dienstplan != undefined" :dienstplan="reactive(filteredDienstplan)" :data="props.data" />
      <template v-else>
        <h1>Keine Daten für diesen Monat vorhanden.</h1>
        <br />
      </template>
    </a-space>
  </div>
</template>

<script></script>
