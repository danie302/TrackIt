import { create } from 'zustand'
import type { Company } from '@/types/models'

interface CompanyState {
  currentCompany: Company | null
  setCurrentCompany: (company: Company | null) => void
}

export const useCompanyStore = create<CompanyState>((set) => ({
  currentCompany: null,
  setCurrentCompany: (company) => set({ currentCompany: company }),
}))
