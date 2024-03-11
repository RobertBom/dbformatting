<script setup>
import { ref } from "vue";

const props = defineProps({
  besetzung: Object,
  title: String,
})

const show = ref(false);

function test() {
  show.value = true;
  console.log(show.value)
}
</script>

<template>
  <label class="popover">
    <slot></slot><button name="popover"></button>
    <div class="popover-body">
      <h3>{{ props.title }}</h3>
      <table>
        <tr v-for="imDienst in besetzung">
          <td :class="imDienst.mitarbeiter.fk ? 'fk' : 'ek'">{{ imDienst.mitarbeiter.vorname }}</td>
          <td>{{ imDienst.dienst.name }}</td>
          <td>{{ imDienst.dienst.start }} - {{ imDienst.dienst.ende }}</td>
        </tr>
      </table>
    </div>
  </label>
</template>

<style scoped>
h3 {
  font-weight: bold;
}

label.popover {
  position: relative;
  display: block;
}

label.popover button[name="popover"] {
  font-family: inherit;
  font-size: inherit;
  background: none;
  border: 0 none;
  display: inline;
  outline: none;
  color: inherit;
  padding: unset;
}

label.popover .popover-body {
  display: none;

  font-size: 13px;
  border-radius: 2px;
  padding: 16px 36px 16px 16px;
  background-color: #ffffff;

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

  position: absolute;
  z-index: 1;
  bottom: calc(0.5rem + 100%);
  right: 50%;
  transform: translateX(50%);

  min-width: fit-content;
  max-width: 480px;
}

label.popover button:focus+.popover-body {
  display: block;
}

.fk {
  font-weight: bold;
  text-align: left;
}

.ek {
  text-align: left;
}

td {
  white-space: nowrap
}
</style>