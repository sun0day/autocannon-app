import request from '@/utils/request'


export const startTest = config => request({
  url: '/test',
  method: 'POST',
  data: config
})

export const getTest = test => request({
  url: '/test',
  params: test
})