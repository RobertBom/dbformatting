<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  dienst: Object,
});

</script>

<template>
  <td class="flagged">
    {{ props.dienst.dienst.name }}
    <!-- <Icon v-if="props.dienst.flags.includes(0)" icon="carbon:alarm" /> -->
  </td>
</template>

<style>
.flagged {
  background-color: aqua !important;
}
</style>