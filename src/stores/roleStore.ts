import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'child' | 'parent'

interface RoleState {
  role: Role
  setRole: (role: Role) => void
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: 'child',
      setRole: (role) => set({ role }),
    }),
    { name: 'writegrow-role' },
  ),
)
