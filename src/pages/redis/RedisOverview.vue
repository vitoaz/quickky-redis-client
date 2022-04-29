<!-- redis overview -->
<template>
  <div v-loading="loading" style="height: 100%; position: relative">
    <!-- fail -->
    <div v-if="fail">
      <el-result icon="warning" title="Get info fail!" sub-title="">
        <template slot="extra">
          <el-button type="primary" size="medium" @click="loadData">Retry</el-button>
        </template>
      </el-result>
    </div>
    <div v-else>
      <el-button style="margin-bottom: 5px" @click="loadData">{{ $t('opt.refresh') }}</el-button>
      <!-- cluster -->
      <div v-if="redis.mode==='cluster'">
        <div style="font-size: 20px; margin-bottom: 10px">Cluster Nodes</div>
        <el-table :data="clusterNodes"
                  row-key="id"
                  style="width: 100%;margin-bottom: 20px;"
                  default-expand-all
                  border
                  :tree-props="{children: 'replicas', hasChildren: 'haReplicas'}"
        >
          <el-table-column prop="name" label="Name" width="250">
            <template slot-scope="scope">
              <a @click="jump(scope.row.name)">{{ scope.row.name }}</a>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="Type" width="80" align="center"></el-table-column>
          <el-table-column prop="mem" label="Memory" align="center"></el-table-column>
          <el-table-column prop="keys" label="Keys" align="center"></el-table-column>
          <el-table-column prop="ops" label="Ops" align="center"></el-table-column>
          <el-table-column prop="clients" label="Clients" align="center"></el-table-column>
          <el-table-column prop="state" label="State" align="center" width="100">
            <template slot-scope="scope">
              <span class="state" :class="{'state-err': scope.row.state!=='connected'}">{{ scope.row.state }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div style="font-size: 20px; margin-bottom: 10px">Nodes Info</div>
        <el-table v-for="(tmp, i) in infoDatas"
                  :key="i"
                  :data="tmp"
                  class="info-table"
                  border
                  :show-header="false">
          <el-table-column prop="key" label="key" width="120">
            <template slot-scope="scope">
              <span v-if="scope.row.key==='Name'" :id="'a'+scope.row.value">{{ scope.row.key }}</span>
              <span v-else>{{ scope.row.key }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="value">
            <template slot-scope="scope">
              <div v-if="scope.row.key === 'Node Info'">
                <a v-if="!scope.row.open" @click="rawOpenClose(scope.row)">{{ $t('opt.unfold') + '>' }}</a>
                <a v-else @click="rawOpenClose(scope.row)">{{ $t('opt.fold') + '<' }}</a>
                <pre v-if="scope.row.open">{{ scope.row.value }}</pre>
              </div>
              <span v-else>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- standalone -->
      <div v-else>
        <el-table :data="infoData"
                  style="width: 100%;margin-bottom: 20px;"
                  border
                  :show-header="false"
                  default-expand-all
                  :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
          <el-table-column prop="key" label="key" width="200"></el-table-column>
          <el-table-column prop="value" label="value">
            <template slot-scope="scope">
              <div v-if="scope.row.key === 'Node Info'">
                <a v-if="!scope.row.open" @click="rawOpenClose(scope.row)">{{ $t('opt.unfold') + '>' }}</a>
                <a v-else @click="rawOpenClose(scope.row)">{{ $t('opt.fold') + '<' }}</a>
                <pre v-if="scope.row.open">{{ scope.row.value }}</pre>
              </div>
              <span v-else>{{ scope.row.value }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>
<script>

import RedisUtil from '@/utils/RedisUtil'

export default {
  name: 'RedisOverview',
  components: {},

  props: {
    redis: {
      type: Object,
      default() {
        return null
      }
    },

    reconnect: {
      type: Function,
      default() {
        return null
      }
    }
  },

  data() {
    return {
      loading: false,
      fail: false,
      infoData: [],
      clusterNodes: [],
      infoDatas: []
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    parseNodes(info) {
      if (!info.clusterNodes) {
        return []
      }

      const nodes = []
      info.clusterNodes.forEach(node => {
        if (node.type !== 'master') {
          return
        }
        const nodeInfo = {
          id: node.id,
          name: `${node.host}:${node.port}`,
          state: node.state,
          type: node.type,
          ops: node.info.instantaneous_ops_per_sec,
          mem: node.info.used_memory_human,
          keys: node.info.keys,
          clients: node.info.connected_clients,
          replicas: [],
          hasReplicas: false
        }
        info.clusterNodes.forEach(subNode => {
          if (subNode.replicaId !== node.id) {
            return
          }
          nodeInfo.replicas.push({
            id: subNode.id,
            name: `${subNode.host}:${subNode.port}`,
            state: subNode.state,
            type: subNode.type,
            ops: subNode.info.instantaneous_ops_per_sec,
            mem: subNode.info.used_memory_human,
            clients: node.info.connected_clients,
            keys: subNode.info.keys
          })
          nodeInfo.hasReplicas = true
        })
        nodes.push(nodeInfo)
      })
      return nodes
    },

    parseInfo(info, node) {
      const infoData = []
      if (node) {
        infoData.push({key: 'Name', value: `${node.host}:${node.port}`})
      } else {
        infoData.push({key: 'Name', value: `${this.redis.option.host}:${this.redis.option.port}`})
      }
      infoData.push({key: 'Redis Version', value: `${info.redis_version}`})
      infoData.push({key: 'Redis Mode', value: `${info.redis_mode}`})
      infoData.push({key: 'Up Time', value: `${Math.round(info.uptime_in_seconds / 60 / 60 * 100) / 100}H`})
      infoData.push({key: 'Memory', value: `${info.used_memory_human}`})
      infoData.push({key: 'Keys', value: info.keys})
      infoData.push({key: 'Connected Clients', value: `${info.connected_clients}`})
      const total = parseInt(info.keyspace_misses) + parseInt(info.keyspace_hits)
      const hit_ratio = Math.round(info.keyspace_misses / total * 100)
      //infoData.push({key: 'Hit Ratio', value: `${hit_ratio}%`})
      infoData.push({key: 'Ops', value: `${info.instantaneous_ops_per_sec}`})
      infoData.push({key: 'In', value: `${info.instantaneous_input_kbps}kb/s`})
      infoData.push({key: 'Out', value: `${info.instantaneous_output_kbps}kb/s`})
      infoData.push({key: 'Node Info', value: info.raw, open: false})
      return infoData
    },

    /**
     * load the view data
     */
    async loadData() {
      this.loading = true
      this.fail = false
      try {
        const info = await RedisUtil.info(this.redis)
        this.infoData = this.parseInfo(info)
        this.clusterNodes = this.parseNodes(info)
        console.log(this.clusterNodes)
        if (info.clusterNodes) {
          info.clusterNodes.forEach(node => {
            this.infoDatas.push(this.parseInfo(node.info, node))
          })
        }
      } catch (e) {
        this.fail = true
        this.$message.error(e.message)
      }
      this.loading = false
    },

    appendLog(text) {
      this.log += text + '\r\n'
    },

    async sendCmd(cmd) {
      try {
        this.appendLog(`>>  ${cmd}`)
        const res = await RedisUtil.exec(this.redis, cmd)
        this.appendLog(`<<  ${res}`)
      } catch (e) {
        this.appendLog(`<<  ${e.message}`)
      }
    },

    rawOpenClose(raw) {
      console.log(raw.open)
      raw.open = !raw.open
    },

    jump(id) {
      id = 'a' + id
      document.getElementById(id).scrollIntoView(true)
    }
  }
}
</script>

<style lang="scss" scoped>

.info-table {
  width: calc(50% - 10px);
  margin-bottom: 20px;
  margin-right: 10px;
  display: inline-block;
  vertical-align: top;
}

.state {
  color: #5cb87a;
  &.state-err {
    color: #f56c6c;
  }
}

</style>
