import moment from "moment"
import * as Service from '@/api/test'

export const ConfigKey = 'autocannon-config'
export const TestKey = 'autocannon-test'

export const getConfigs = ({
  sortField,
  sortOrder,
  filter,
} = {}) => {
  let data = (JSON.parse(localStorage.getItem(ConfigKey)) || [])

  if (sortField) {
    data = data.sort((next, cur) => {
      return sortOrder === "descend" ? cur[sortField].localeCompare(next[sortField]) : next[sortField].localeCompare(cur[sortField])
    })
  }

  if (filter) {
    Object.keys(filter).forEach(key => {
      const value = filter[key]

      if (value === null) {
        return
      }

      data = data.filter(item => {
        switch (key) {
          case 'url':
            return item.url.indexOf(value) > -1
          case 'method':
            return item.method === value
          case 'connections':
          case 'duration':
          case 'pipelining':
            return item[key] === value
          case 'createTime':
            return moment(item[key]).isSame(value, 'day')
          default:
            return true
        }
      })
    })
  }

  return data
}

export const getConfig = ({ cid } = {}) => {
  const data = (JSON.parse(localStorage.getItem(ConfigKey)) || [])

  return data.find(item => item.cid === cid)
}

export const saveConfig = (config) => {
  const configs = JSON.parse(localStorage.getItem(ConfigKey)) || []

  configs.unshift(config)

  localStorage.setItem(ConfigKey, JSON.stringify(configs))
}

export const getTests = ({
  sortField,
  sortOrder,
  filter
} = {}) => {
  let data = (JSON.parse(localStorage.getItem(TestKey)) || [])

  if (sortField) {
    data = data.sort((next, cur) => {
      return sortOrder === "descend" ? cur[sortField].localeCompare(next[sortField]) : next[sortField].localeCompare(cur[sortField])
    })
  }

  if (filter) {
    console.log(filter)
    Object.keys(filter).forEach(key => {
      const value = filter[key]

      if (value === null || value === undefined) {
        return
      }

      data = data.filter(item => {
        switch (key) {
          case 'status':
            return item[key] === value
          case 'cid':
            console.log(value, item[key])
            return value instanceof Array ? value.includes(item[key]) : item[key] === value
          case 'createTime':
            return moment(item[key]).isSame(value, 'day')
          default:
            return true
        }
      })
    })
  }

  return data
}

export const saveTest = (test) => {
  const tests = JSON.parse(localStorage.getItem(TestKey)) || []

  tests.unshift(test)

  localStorage.setItem(TestKey, JSON.stringify(tests))
}

export const pollTests = async () => {
  const tests = JSON.parse(localStorage.getItem(TestKey)) || []

  for (let test of tests) {
    if (test.status !== 'error' && test.status !== 'success') {
      const t = await Service.getTest(test)

      Object.assign(test, t)
    }
  }

  localStorage.setItem(TestKey, JSON.stringify(tests))
}