<script setup>
</script>

<template>
<a-button @click="prevMonth">prev</a-button> 
<a-date-picker v-model:value="parse_month" picker="month" />
<a-button input @click="nextMonth">next</a-button> 
<br />
</template>

<style></style>