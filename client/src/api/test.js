import request from '@/utils/request'


export const startTest = config => request({
  url: '/test',
  method: 'POST',
  data: config
})
