import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    const status = error.response?.status
    const url: string | undefined = original?.url

    // Let auth-related 401s bubble to the caller so forms can show errors
    if (
      status !== 401 ||
      original._retry ||
      url?.includes('/auth/login') ||
      url?.includes('/auth/register') ||
      url?.includes('/auth/forgot-password') ||
      url?.includes('/auth/reset-password')
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) throw new Error('No refresh token')

      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'}/auth/refresh`,
        { refreshToken },
      )

      const newToken: string = data.accessToken
      localStorage.setItem('accessToken', newToken)
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken)
      }

      refreshQueue.forEach((cb) => cb(newToken))
      refreshQueue = []

      original.headers.Authorization = `Bearer ${newToken}`
      return api(original)
    } catch {
      refreshQueue = []
      localStorage.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
