<script setup>
import { ref, watch } from 'vue';
import { getFeiertageMonat } from '../assets/js/Parse-fnc';

const props = defineProps({
  sel_month: Object,
})

const feierTageMonth = ref(null);

async function updateFeierTageMonth() {
  feierTageMonth.value = await getFeiertageMonat(props.sel_month);
}

updateFeierTageMonth();

watch(() => props.sel_month, () => {
  updateFeierTageMonth();
});
</script>

<template>
  <ul>
    <li v-for="el in feierTageMonth">{{  el.date.format('dd DD/MM ')  }} {{  el.name  }}</li>
  </ul>
</template>

<style>
</style>