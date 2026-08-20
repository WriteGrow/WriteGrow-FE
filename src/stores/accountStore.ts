import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * roleStore는 화면 모드(child/parent) 토글만 담당한다.
 * 이 스토어는 s1(인증) 전 MVP에서 세션 대용으로 쓰는 계정/프로필 신원 정보를 담는다.
 * 관심사가 다르므로 별도 스토어로 분리한다.
 */
interface AccountState {
  accountId: number | null
  accountName: string | null
  parentProfileId: number | null
  childProfileIds: number[]
  activeChildProfileId: number | null
  setAccount: (accountId: number, accountName: string) => void
  setParentProfile: (parentProfileId: number) => void
  addChildProfile: (childProfileId: number) => void
  setActiveChildProfileId: (id: number) => void
  reset: () => void
}

const initialState = {
  accountId: null,
  accountName: null,
  parentProfileId: null,
  childProfileIds: [],
  activeChildProfileId: null,
} satisfies Omit<
  AccountState,
  'setAccount' | 'setParentProfile' | 'addChildProfile' | 'setActiveChildProfileId' | 'reset'
>

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      ...initialState,
      setAccount: (accountId, accountName) => set({ accountId, accountName }),
      setParentProfile: (parentProfileId) => set({ parentProfileId }),
      addChildProfile: (childProfileId) =>
        set((state) => ({
          childProfileIds: state.childProfileIds.includes(childProfileId)
            ? state.childProfileIds
            : [...state.childProfileIds, childProfileId],
          activeChildProfileId: state.activeChildProfileId ?? childProfileId,
        })),
      setActiveChildProfileId: (id) => set({ activeChildProfileId: id }),
      reset: () => set(initialState),
    }),
    { name: 'writegrow-account' },
  ),
)

export function hasCompletedOnboarding(): boolean {
  const state = useAccountStore.getState()
  return state.accountId !== null && state.parentProfileId !== null && state.childProfileIds.length > 0
}

export function getActiveChildProfileId(): number | undefined {
  return useAccountStore.getState().activeChildProfileId ?? undefined
}

export function getParentProfileId(): number | undefined {
  return useAccountStore.getState().parentProfileId ?? undefined
}
