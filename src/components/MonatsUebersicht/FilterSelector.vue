<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['activatedFlags', 'flagOptions']);
defineEmits(['update:activatedFlags', 'update:flagOptions']);


const all = ref(false);
const none = ref(false);
const asd = ref('abc');

function activateAll() {
  //console.log(props.activatedFlags);
  checkState();
  if (!all.value) {
    for (let i = 0; i < props.activatedFlags.length; i++) {
      props.activatedFlags[i] = true;
      all.value = true;
    }
  }
  else {
    for (let i = 0; i < props.activatedFlags.length; i++) {
      props.activatedFlags[i] = false;
    }
    all.value = false;
  }

}

function deactivateAll() {
  for (let i = 0; i < props.activatedFlags.length; i++) {
    props.activatedFlags[i] = false;
  }
}
function checkState() {
  let allFalse = true;
  let allTrue = true;
  for (let i = 0; i < props.activatedFlags.length; i++) {
    if (props.activatedFlags[i]) {
      allFalse = false;
    }
    else {
      allTrue = false;
    }
  }
  none.value = allFalse;
  all.value = allTrue;
}

//Initialisierung Zustand der Buttons
  for (let i = 0; i <= 2; i++) {
    props.activatedFlags[i] = false;
  }

function print(msg) {
  console.log(msg);
}


</script>
<template>
  <div align="left" class="filterDesc">
    <table class="filterTable">
      <tr>
        <td>
          <a-switch v-model:checked="all" @change="activateAll()" checked-children="off" un-checked-children="alle" />
        </td>
        <td>alle</td>
        <td>op</td>
      </tr>
      <tr>
        <td>
          <a-switch v-model:checked="activatedFlags[0]" @change="checkState()" checked-children="on"
            un-checked-children="off" />
        </td>
        <td>kurze Wechsel</td>
        <td>
          <a-input v-model:value="flagOptions[0]" :bordered="false" :size="'small'" :maxlength="2" />
        </td>
      </tr>
      <tr>
        <td>
          <a-switch v-model:checked="activatedFlags[1]" @change="checkState()" checked-children="on"
            un-checked-children="off" />
        </td>
        <td>3 Nächte</td>
        <td><input v-model="flagOptions[1]" type="text" maxlength="2" size="4" /></td>
      </tr>
      <tr>
        <td>
          <a-switch v-model:checked="activatedFlags[2]" @change="checkState()" checked-children="on"
            un-checked-children="off" />
        </td>
        <td>% Regel</td>
        <td><input v-model="flagOptions[2]" type="text" maxlength="3" size="4" /></td>
      </tr>

    </table>
  </div>
</template>

<style>
.filterTable {
  border: 0px;
}

.filterTable tr td {
  border: none;
}

.filterDesc {
  font-weight: bold;
}
</style>