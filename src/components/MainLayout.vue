<template>
  <a-layout>
    <a-layout-header :style="{ position: 'fixed', height: '50px', zIndex: 1, width: '100%' }">Dienstplan Utilities
    </a-layout-header>
    <a-layout>
      <a-layout-sider
        :style="{ overflow: 'auto', height: '100vh', width: '150px', marginTop: '50px', position: 'fixed', left: 0, top: 0, bottom: 0 }"
        style="min-height: 100vh;" :width="150">
        <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
          <a-menu-item key="1">
            <span>Parse</span>
          </a-menu-item>
          <a-menu-item key="2">
            <span>Dienstplan</span>
          </a-menu-item>
          <a-menu-item key="3">
            <span>Mitarbeiter</span>
          </a-menu-item>
          <a-menu-item key="4">
            <span>Comparator</span>
          </a-menu-item>
          <a-menu-item key="5">
            <span>RangeView</span>
          </a-menu-item>
          <a-menu-item key="6">
            <span>Gantt</span>
          </a-menu-item>
          <a-menu-item key="7">
            <span>Stats</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content :style="{ marginLeft: '160px', marginTop: '50px' }">
        <div class="box" v-if="selectedKeys == 1">
          <Parse :data="data" @parse="(msg) => update(msg)" />
        </div>
        <div class="box" v-if="selectedKeys == 2">
          <MonatsUebersicht :data="data" />
        </div>
        <div class="box" v-if="selectedKeys == 3">
          <Mitarbeiter :data="data" />
        </div>
        <div class="box" v-if="selectedKeys == 4">
          <Comparator :data="data" />
        </div>
        <div class="box" v-if="selectedKeys == 5">
          <RangeView :data="data" />
        </div>
        <div class="box" v-if="selectedKeys == 6">
          <GanttView :data="data" />
        </div>
        <div class="box" v-if="selectedKeys == 7">
          <Stats :data="data" />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>

</template>


<script>
import { reactive, ref } from 'vue';
import Parse from './Parse.vue';
import MonatsUebersicht from './MonatsUebersicht.vue';
import Mitarbeiter from './Mitarbeiter.vue';
import RangeView from './RangeView.vue';
import GanttView from './GanttView.vue';
import Comparator from './Comparator.vue';
import Stats from './Stats.vue'

export default {
  name: 'MainLayout',
  components: {
    Parse,
    MonatsUebersicht,
    Mitarbeiter,
    RangeView,
    GanttView,
    Comparator,
    Stats
  },
  setup() {
    return {
      selectedKeys: ref(['1']),
    }
  },
  data() {
    return {
      data: reactive({
        mitarbeiter: [],
        dienstplaene: [],
        dienstLegende: [],
        lastParse: null,
      })
    };
  },
  methods: {
    update(msg) {
      this.data = msg;
      console.log(this.data)
    }
  },
}
</script>

<style>
.box {
  margin: 10px;
}
</style>
