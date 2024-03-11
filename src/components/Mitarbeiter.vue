<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  data: Object,
});

const filteredMitarbeiter = computed(() => {
  return props.data.mitarbeiter;
})


</script>

<template>
  <table v-if="props.data">
    <tr>
      <th>Name</th>
      <th>Qualifkation</th>
      <th>Beruf</th>
      <th>wochenStunden</th>
      <th>FK</th>
      <th>D</th>
    </tr>
    <tr v-for="mitarbeiter in filteredMitarbeiter">
      <td>{{ mitarbeiter.name }}, {{ mitarbeiter.vorname }}</td>
      <td>{{ mitarbeiter.qualifikation }}</td>
      <td>{{ mitarbeiter.beruf }}</td>
      <td>{{ mitarbeiter.wochenStunden }}</td>
      <td>{{ mitarbeiter.fk }}</td>
      <td>{{ mitarbeiter.disable }}</td>
    </tr>
  </table>
</template>

<style scoped>
table {
  border: 1px solid;
  margin-left: auto;
  margin-right: auto;
}

th,
tr,
td {
  border: 1px solid;
}
</style>