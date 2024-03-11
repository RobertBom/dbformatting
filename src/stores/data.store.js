import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
  const mitarbeiter = ref([]);
  const dienstplaene = ref([]);

  function addDienstplan(dienstplan) {
    dienstplaene.value.push(dienstplan);
    console.log(dienstplan);
    console.log("Zum data.store hinzugefuegt.")
  }

  return {mitarbeiter, dienstplaene}
});