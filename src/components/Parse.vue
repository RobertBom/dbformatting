<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { parse, data } from '../assets/js/Parse-fnc.js';
dayjs.locale('de');

const props = defineProps({
  data: Object,
});
const emit = defineEmits(['parse']);

const parseInput = ref(null);
const sel_month = ref(dayjs());

function nextMonth() {
  sel_month.value = sel_month.value.add(1, 'month');
}
function prevMonth() {
  sel_month.value = sel_month.value.subtract(1, 'month');
}
function startParse() {
  parse(parseInput.value, sel_month.value);
  props.data.mitarbeiter = data.mitarbeiter;
  props.data.dienstplaene = data.dienstplaene;
  props.data.dienstLegende = data.dienstLegende;
  props.data.lastParse = sel_month;
  //emit('parse', data);
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%">
    <span>
      <a-button @click="prevMonth">Vorheriger Monat</a-button>
      <a-date-picker v-model:value="sel_month" picker="month" />
      <a-button input @click="nextMonth">Nächster Monat</a-button>

    </span>
    <textarea v-model="parseInput" rows="10" style="width: 100%; resize: none"></textarea>
    <a-button @click="startParse" type="primary">Parse</a-button>
    <div class="logBox">
      <pre>Log Empty</pre>
    </div>
  </a-space>
</template>

<style>
.logBox {
  display: flex;
  line-height: 2.5ex;
  min-height: 15ex;
  border: solid 2px;
  width: 100%;
  text-align: left;
}
</style>