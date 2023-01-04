<template>
  <a-drawer
    :visible="visible"
    class="custom-class"
    style="color: red"
    title="Config Form"
    placement="right"
    :width="400"
    @close="onClose"
  >
    <a-form
      :form="form"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      labelAlign="right"
      :colon="false"
      @submit="handleSubmit"
    >
      <a-form-item label="url">
        <a-input
          v-decorator="[
            'url',
            {
              initialValue: 'http://',
              rules: [
                {
                  required: true,
                  pattern: /^https?:\/\/.+/,
                  message: 'Please input valid target url',
                  whitespace: true,
                },
              ],
            },
          ]"
        />
      </a-form-item>

      <a-form-item label="method">
        <a-select
          v-decorator="[
            'method',
            { initialValue: 'GET', rules: [{ required: true, message: 'Please input target url', whitespace: true }] },
          ]"
        >
          <a-select-option value="GET">GET</a-select-option>
          <a-select-option value="POST">POST</a-select-option>
          <a-select-option value="PUT">PUT</a-select-option>
          <a-select-option value="DELETE">DELETE</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="connections">
        <a-input-number :min="1" :precision="0" v-decorator="['connections', { initialValue: 10 }]" />
      </a-form-item>

      <a-form-item label="duration">
        <div class="number-wrapper">
          <a-input-number :min="1" :precision="0" v-decorator="['duration', { initialValue: 10 }]" /> s
        </div>
      </a-form-item>

      <a-form-item label="pipelining">
        <a-input-number :min="1" :precision="0" v-decorator="['pipelining', { initialValue: 1 }]" />
      </a-form-item>
      <a-col :offset="6" :span="18" :style="{ textAlign: 'left' }">
        <a-button type="primary" html-type="submit" class="submit-btn"> Save </a-button>
      </a-col>
    </a-form>
  </a-drawer>
</template>

<script>
import { saveConfig } from '@/utils/storage'
import { genId } from '@/utils/id'

export default {
  name: 'ConfigEditor',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    onClose: {
      type: Function,
      default: () => {},
    },
    onSave: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      form: this.$form.createForm(this),
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault()
      this.form.validateFields((error, values) => {
        if (!error) {
          saveConfig({ ...values, createTime: new Date(), cid: genId('config') })
          this.onSave()
        }
      })
    },
  },
}
</script>

<style lang="less">
.ant-input-number {
  width: 100%;
}
.number-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;

  .ant-input-number {
    flex: 1;
    margin-right: 6px;
  }
}

.submit-btn {
}
</style>
