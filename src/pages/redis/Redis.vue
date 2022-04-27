<!-- redis management -->
<template>
  <div style="height: 100%; position: relative">
    <!-- left -->
    <div class="left-box">
      <div class="g-tool-box">
        <a class="g-tool-btn" @click="showNewDlg('new')"><i class="el-icon-plus"/><span>{{ $t('opt.new') }}</span></a>
      </div>
      <!-- tree -->
      <el-tree ref="tree"
               class="g-tree"
               :allow-drop="treeAllowDrop"
               node-key="id"
               draggable
               :data="treeData"
               @node-drop="treeHandleDrop"
               @node-drag-end="clearDragLine"
               @node-drag-over="treeDragOver"
      >
        <div :ref="'t'+data.id"
             slot-scope="{ node, data }"
             :class="{ before: data.dragType==='before', after: data.dragType==='after' }"
             class="item">
          <i class="el-icon-set-up"/>
          <span class="name g-text-overflow"
                :class="{active:curRedis&&curRedis.id===data.id}"
                style="height: 100%; width: calc(100% - 70px)"
                @click="sel(data)"
          >
            {{ data.name }}
          </span>
          <el-dropdown class="opt" trigger="click" @command="treeHandleDroplistCmd">
            <div class="el-dropdown-link">
              <i class="el-icon-more el-icon--right"/>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="'edit'+','+data.id">{{ $t('opt.edit') }}</el-dropdown-item>
              <el-dropdown-item :command="'del'+','+data.id">{{ $t('opt.delete') }}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-tree>
    </div>
    <!-- right -->
    <div class="right-box">
      <redis-detail v-if="curRedis" :key="refreshDetailKey" :option="curRedis"/>
      <div v-else style="height: 100%">
        <el-empty style="height: 80%" :description="$t('tip.selectRedisToConnect')"/>
      </div>
    </div>
    <!-- new/edit dialog -->
    <el-dialog v-if="newDlgData.showed"
               modal
               :title="newDlgData.type==='new'?$t('opt.new'):$t('opt.edit')"
               :visible.sync="newDlgData.showed"
    >
      <el-form ref="newDlgForm"
               :model="newDlgData.obj "
               :rules="newDlgFormRules"
               style="width: 450px"
               label-position="left"
               label-width="100px"
      >
        <el-form-item prop="name" label="Name">
          <el-input v-model="newDlgData.obj.name" maxlength="50" placeholder="Name"/>
        </el-form-item>
        <el-form-item prop="host" label="Host">
          <el-input v-model="newDlgData.obj.host" maxlength="50" placeholder="Hostname/IP Address"/>
        </el-form-item>
        <el-form-item prop="port" label="Port">
          <el-input v-model="newDlgData.obj.port" maxlength="6" placeholder="Port"/>
        </el-form-item>
        <el-form-item prop="db" label="Database">
          <el-input v-model.number="newDlgData.obj.db" maxlength="3" placeholder="Database"/>
        </el-form-item>
        <el-form-item prop="password" label="Password">
          <el-input v-model="newDlgData.obj.password" maxlength="50" placeholder="Password"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newDlgData.showed=false">{{ $t('opt.cancel') }}</el-button>
        <el-button type="primary" @click="newDlgConfirm">{{ $t('opt.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import ValidateUtil from '@/utils/ValidateUtil'
import RedisDetail from '@/pages/redis/RedisDetail'
import Datas from '@/utils/datas/Datas'
import ViewUtil from '@/utils/ViewUtil'

const DEF_NEW_DLG_DATA_OBJ = {
  name: '',
  host: '',
  port: '',
  db: 0,
  password: '',
  sort: 0,
  sortUpdateTime: 0
}

export default {
  name: 'Redis',
  components: {RedisDetail},
  data() {
    return {
      newDlgFormRules: {
        name: [{required: true, message: this.$t('tip.inputCantEmpty')}],
        host: [{required: true, message: this.$t('tip.inputCantEmpty')}],
        db: [
          {required: true, message: this.$t('tip.inputCantEmpty')},
          {type: 'number', message: this.$t('tip.inputValueError')}
        ],
        port: [
          {required: true, message: this.$t('tip.inputCantEmpty')},
          {validator: ValidateUtil.isValidPortValidator}
        ]
      },
      newDlgData: {
        type: '',
        showed: false,
        obj: {...DEF_NEW_DLG_DATA_OBJ}
      },
      treeData: [],
      curRedis: null,
      refreshDetailKey: 0
    }
  },

  created() {
    this.loadData()
  },

  methods: {
    /**
     * load data
     */
    loadData() {
      this.treeData = Datas.redis.listRedis()
      this.treeData.forEach(t => {
        t.dragType = 'none'
      })
    },

    /**
     * new/edit dialog confirm
     */
    async newDlgConfirm() {
      // validate
      try {
        await this.$refs.newDlgForm.validate()
      } catch (ignored) {
        return
      }

      if (this.newDlgData.type === 'new') {
        this.newDlgData.obj.sort = new Date().valueOf()
        Datas.redis.addRedis(this.newDlgData.obj)
        this.$message.success('Success!')
      } else {
        Datas.redis.updateRedis(this.newDlgData.obj)
        this.$message.success('Success!')
      }
      this.newDlgData.showed = false
      await this.loadData()
    },

    /**
     * check if allow drop
     */
    treeAllowDrop(draggingNode, dropNode, dropType) {
      return dropType !== 'inner'
    },

    /**
     * handle tree drop, update the sort
     */
    async treeHandleDrop(draggingNode, dropNode, dropType) {
      const sort = new Date().valueOf()
      for (let i = 0; i < this.treeData.length; i++) {
        this.treeData[i].sort = sort - i
        Datas.redis.updateRedis(this.treeData[i])
      }
      /*
      if (dropType === 'before') {
        draggingNode.data.sort = dropNode.data.sort + 1
      } else {
        draggingNode.data.sort = dropNode.data.sort - 1
      }
      draggingNode.data.sortUpdateTime = new Date().valueOf()
      Datas.redis.updateRedis(draggingNode.data)
      */
      this.loadData()
    },

    clearDragLine() {
      this.treeData.forEach(d => {
        d.dragType = 'none'
      })
    },

    treeDragOver(draggingNode, dropNode, ev) {
      const up = draggingNode.data.sort < dropNode.data.sort
      const next = Math.abs(draggingNode.data.sort - dropNode.data.sort) === 1
      const el = this.$refs['t' + dropNode.data.id]
      const top = ViewUtil.pageY(el)
      const half = top + el.offsetHeight / 2
      // clear
      this.clearDragLine()
      // self
      if (draggingNode === dropNode) {
        return
      }
      // not allow
      const notAllow = ViewUtil.hasClass(this.$refs.tree.$el, 'is-drop-not-allow')
      if (notAllow) {
        return
      }
      if (up) {
        // drag up
        dropNode.data.dragType = 'before'
        if (!next && ev.clientY > half) {
          dropNode.data.dragType = 'after'
        }
      } else {
        // drag down
        dropNode.data.dragType = 'after'
        if (!next && ev.clientY < half) {
          dropNode.data.dragType = 'before'
        }
      }
    },

    /**
     * show new/edit dialog
     */
    showNewDlg(type, obj) {
      this.newDlgData.showed = true
      this.newDlgData.type = type
      if (type === 'new') {
        this.newDlgData.obj = {...DEF_NEW_DLG_DATA_OBJ}
      } else {
        this.newDlgData.obj = {...obj}
      }
    },

    /**
     * delete redis object
     */
    async del(obj) {
      try {
        await this.$confirm(`${this.$t('tip.confirmDelete')} ${obj.name} ?`)
      } catch (ignored) {
        return
      }
      Datas.redis.delRedis(obj.id)
      this.loadData()
    },

    /**
     * select the redis
     */
    sel(redis) {
      this.curRedis = redis
      this.refreshDetailKey++
    },

    /**
     * handle the tree item droplist command, del/edit
     */
    treeHandleDroplistCmd(oriCmd) {
      console.log(oriCmd)
      const id = oriCmd.split(',')[1]
      const cmd = oriCmd.split(',')[0]
      let obj
      this.treeData.forEach(e => {
        if (e.id === id) {
          obj = e
        }
      })
      if (cmd === 'del') {
        this.del(obj)
      } else if (cmd === 'edit') {
        this.showNewDlg('edit', obj)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.left-box {
  position: absolute;
  top: 0;
  width: 200px;
  height: 100%;
  background: #fff;
  overflow: auto;
}

.active {
  color: #209212;
}

.right-box {
  border-left: 1px solid #eee;
  overflow: auto;
  background: #fff;
  position: absolute;
  top: 0;
  left: 200px;
  height: 100%;
  right: 0;
}

</style>
