<template>
  <page-header-wrapper>
    <ConfigEditor
      v-if="visible"
      :editable="false"
      :visible="visible"
      :onClose="handleCloseConfigEditor"
      :initialValue="config"
    />
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="8" :sm="24">
              <a-form-item label="url">
                <a-input v-model="queryParam.url" placeholder="target url" />
              </a-form-item>
            </a-col>

            <a-col :md="8" :sm="24">
              <a-form-item label="status">
                <a-select v-model="queryParam.status" :allowClear="true" placeholder="test status">
                  <a-select-option value="processing">processing</a-select-option>
                  <a-select-option value="success">success</a-select-option>
                  <a-select-option value="error">error</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="connections">
                  <a-input-number
                    v-model="queryParam.connections"
                    style="width: 100%"
                    placeholder="concurrent connections"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="duration">
                  <a-input-number v-model="queryParam.duration" style="width: 100%" placeholder="connection duration" />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="pipelining">
                  <a-input-number
                    v-model="queryParam.pipelining"
                    style="width: 100%"
                    placeholder="request pipeline number"
                  />
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="create time">
                  <a-date-picker v-model="queryParam.createTime" style="width: 100%" placeholder="create time" />
                </a-form-item>
              </a-col>
            </template>
            <a-col :md="(!advanced && 8) || 24" :sm="24">
              <span
                class="table-page-search-submitButtons"
                :style="(advanced && { float: 'right', overflow: 'hidden' }) || {}"
              >
                <a-button type="primary" @click="$refs.table.refresh(true)">search</a-button>
                <a-button style="margin-left: 8px" @click="() => (this.queryParam = {})">reset</a-button>
                <!-- <a @click="toggleAdvanced" style="margin-left: 8px">
                  {{ advanced ? 'collapse' : 'expand' }}
                  <a-icon :type="advanced ? 'up' : 'down'" />
                </a> -->
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>

      <s-table
        ref="table"
        size="default"
        rowKey="tid"
        :columns="columns"
        :data="loadData"
        showPagination="auto"
        :innerColumns="innerColumns"
        :onExpand="handleExpandHistory"
      >
        <span slot="url" slot-scope="text">
          <template>
            <a @click="handleShowConfigEditor(text)">{{ handleGetConfigUrl({ cid: text }) }}</a>
          </template>
        </span>
        <span slot="status" slot-scope="text, record, index">
          <a-tooltip v-if="text === 'error'">
            <template slot="title"> {{ record.error || 'unknown error' }} </template>
            <a-badge status="error" text="error" />
          </a-tooltip>
          <a-badge v-else :status="text || 'processing'" :text="text || 'processing'" />
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="4" tooltip>{{ text }}</ellipsis>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleRetry(record)">retry</a>
          </template>
        </span>
      </s-table>

      <!-- <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
      <step-by-step-modal ref="modal" @ok="handleOk" /> -->
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis, ConfigEditor } from '@/components'
import { getRoleList, getServiceList } from '@/api/manage'
import { startTest } from '@/api/test'
import { getConfigs, getConfig, getTests, saveTest } from '@/utils/storage'
import { genId } from '@/utils/id'

// import StepByStepModal from './modules/StepByStepModal'
// import CreateForm from './modules/CreateForm'

const oneK = 1024
const oneM = oneK * oneK
const oneG = oneM * oneK

const columns = [
  {
    title: 'tid',
    dataIndex: 'tid',
  },
  {
    title: 'url',
    dataIndex: 'cid',
    scopedSlots: { customRender: 'url' },
  },
  {
    title: 'status',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '1xx',
    dataIndex: 'result.1xx',
    customRender: (text, { result }) => result && result['1xx'],
  },
  {
    title: '2xx',
    dataIndex: 'result.2xx',
    customRender: (text, { result }) => result && result['2xx'],
  },
  {
    title: '3xx',
    dataIndex: 'result.3xx',
    customRender: (text, { result }) => result && result['3xx'],
  },
  {
    title: '4xx',
    dataIndex: 'result.4xx',
    customRender: (text, { result }) => result && result['4xx'],
  },
  {
    title: '5xx',
    dataIndex: 'result.5xx',
    customRender: (text, { result }) => result && result['5xx'],
  },
  {
    title: 'errors',
    dataIndex: 'result.errors',
    customRender: (text, { result }) => result && result['errors'],
  },
  {
    title: 'timeouts',
    dataIndex: 'result.timeouts',
    customRender: (text, { result }) => result && result['timeouts'],
  },
  {
    title: 'create time',
    dataIndex: 'createTime',
    sorter: true,
    customRender: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: 'finish time',
    dataIndex: 'finishTime',
    sorter: true,
    customRender: (text, record) => record.result && moment(record.result.finish).format('YYYY-MM-DD HH:mm:ss'),
  },
  {
    title: 'action',
    dataIndex: 'action',
    // fixed: 'right',
    scopedSlots: { customRender: 'action' },
  },
]

const innerColumns = [
  {
    key: 'type',
    title: '',
    dataIndex: 'type',
    width: '110px',
  },

  // { key: 'p0_001', title: 'p0_001', dataIndex: 'p0_001' },
  { key: 'p0_01', title: 'p0_01', dataIndex: 'p0_01' },
  { key: 'p0_1', title: 'p0_1', dataIndex: 'p0_1' },
  { key: 'p1', title: 'p1', dataIndex: 'p1' },
  { key: 'p2_5', title: 'p2_5', dataIndex: 'p2_5' },
  // { key: 'p10', title: 'p10', dataIndex: 'p10' },
  // { key: 'p25', title: 'p25', dataIndex: 'p25' },
  { key: 'p50', title: 'p50', dataIndex: 'p50' },
  // { key: 'p75', title: 'p75', dataIndex: 'p75' },
  { key: 'p90', title: 'p90', dataIndex: 'p90' },
  // { key: 'p97.5', title: 'p97.5', dataIndex: 'p97.5' },
  { key: 'p99', title: 'p99', dataIndex: 'p99' },
  { key: 'p99_9', title: 'p99_9', dataIndex: 'p99_9' },
  { key: 'p99_99', title: 'p99_99', dataIndex: 'p99_99' },
  // { key: 'p99_999', title: 'p99_999', dataIndex: 'p99_999' },
  // { key: 'total', title: 'total', dataIndex: 'total' },
  { key: 'min', title: 'min', dataIndex: 'min' },
  { key: 'max', title: 'max', dataIndex: 'max' },
  {
    key: 'average',
    title: 'average',
    dataIndex: 'average',
  },

  // { key: 'mean', title: 'mean', dataIndex: 'mean' },
  { key: 'stddev', title: 'stddev', dataIndex: 'stddev' },
]

export default {
  name: 'Config',
  components: {
    STable,
    Ellipsis,
    ConfigEditor,
  },
  data() {
    this.columns = columns
    this.innerColumns = innerColumns
    return {
      // create model
      visible: false,
      config: {},
      confirmLoading: false,
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      // 加载数据方法 必须为 Promise 对象
      loadData: (params) => {
        const configs = getConfigs({ filter: this.queryParam })
        const data = getTests({
          sortField: 'createTime',
          sortOrder: 'descend',
          ...params,
          filter: { ...this.queryParam, cid: configs.map((c) => c.cid) },
        })
        return Promise.resolve({ data, totalCount: data.length, pageNo: params.pageNo })
      },
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  filters: {
    statusFilter(type) {
      return statusMap[type].text
    },
    statusTypeFilter(type) {
      return statusMap[type].status
    },
  },
  created() {
    getRoleList({ t: new Date() })
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
      }
    },
  },
  methods: {
    handleGetConfigUrl(params) {
      const config = getConfig(params)
      return config && `${config.method} - ${config.url}`
    },
    handleShowConfigEditor(cid) {
      this.visible = true
      this.config = getConfig({ cid })
    },
    handleCloseConfigEditor() {
      this.visible = false
    },
    handleSaveConfig() {
      this.visible = false
      this.$refs.table.refresh()
    },
    handleAdd() {
      this.visible = true
    },
    async handleRetry(record) {
      const config = getConfig(record)
      const tid = genId()
      const createTime = new Date()
      const test = { ...config, tid, createTime }
      await startTest(test)

      saveTest({ tid, createTime, cid: config.cid })

      this.$refs.table.refresh()

      this.$notification.success({
        message: `${tid} has already started`,
        // description: (
        //   <p>
        //     go to <a onclick={() => this.$router.push('/history')}>History</a> menu to check test status
        //   </p>
        // ),
      })
    },
    handleExpandHistory({ result }) {
      if (!result) {
        return []
      }
      const { latency, requests, throughput } = result
      return [
        {
          type: 'latency',
          ...Object.keys(latency).reduce(
            (acc, key) => ({
              ...acc,
              [key]: `${latency[key]}ms`,
            }),
            {}
          ),
        },
        { type: 'requests', ...requests },
        {
          type: 'throughput',
          ...Object.keys(throughput).reduce((acc, key) => {
            let value = throughput[key]
            if (value >= oneG) {
              value = `${(value / oneG).toFixed(1)}GB`
            } else if (value >= oneM) {
              value = `${(value / oneM).toFixed(1)}MB`
            } else if (value >= oneK) {
              value = `${(value / oneK).toFixed(1)}KB`
            } else {
              value = `${value.toFixed(1)}B`
            }
            return { ...acc, [key]: value }
          }, {}),
        },
      ]
    },
    handleOk() {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then((res) => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            // 新增
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then((res) => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('新增成功')
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel() {
      this.visible = false

      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleSub(record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced() {
      this.advanced = !this.advanced
    },
    resetSearchForm() {
      this.queryParam = {
        date: moment(new Date()),
      }
    },
  },
}
</script>

<style land="less">
.result-disabled {
  cursor: not-allowed;
  color: #a0a0a0 !important;
}
</style>
