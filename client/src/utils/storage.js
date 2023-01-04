export const ConfigKey = 'autocannon-config'

export const getConfigs = ({
  sortField,
  sortOrder
} = {}) => {
  let data = (JSON.parse(localStorage.getItem(ConfigKey)) || [])

  if (sortField) {
    data = data.sort((next, cur) => {
      return sortOrder === "descend" ? cur[sortField].localeCompare(next[sortField]) : next[sortField].localeCompare(cur[sortField])
    })
  }

  return data
}

export const saveConfig = (config) => {
  const configs = JSON.parse(localStorage.getItem(ConfigKey)) || []

  configs.push(config)

  localStorage.setItem(ConfigKey, JSON.stringify(configs))
}