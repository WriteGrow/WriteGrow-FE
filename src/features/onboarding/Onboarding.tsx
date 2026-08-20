import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { createAccount, createProfile, getAccountProfiles } from '../../lib/api'
import { ApiRequestError } from '../../lib/api'
import { useAccountStore } from '../../stores/accountStore'
import { useRoleStore } from '../../stores/roleStore'

const CURRENT_YEAR = new Date().getFullYear()

function errorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiRequestError) return error.message
  if (error instanceof Error) return error.message
  return '알 수 없는 오류가 발생했어요.'
}

export function Onboarding() {
  const navigate = useNavigate()
  const accountId = useAccountStore((s) => s.accountId)
  const setAccount = useAccountStore((s) => s.setAccount)
  const setParentProfile = useAccountStore((s) => s.setParentProfile)
  const addChildProfile = useAccountStore((s) => s.addChildProfile)
  const setRole = useRoleStore((s) => s.setRole)

  const [mode, setMode] = useState<'create' | 'recover'>('create')
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [familyName, setFamilyName] = useState('')
  const [parentNickname, setParentNickname] = useState('')
  const [parentBirthYear, setParentBirthYear] = useState('')
  const [childNickname, setChildNickname] = useState('')
  const [childBirthYear, setChildBirthYear] = useState('')
  const [recoverAccountId, setRecoverAccountId] = useState('')

  const accountMutation = useMutation({
    mutationFn: (name: string) => createAccount({ name }),
    onSuccess: (data) => {
      setAccount(data.id, data.name)
      setStep(2)
    },
  })

  const parentProfileMutation = useMutation({
    mutationFn: (input: { accountId: number; nickname: string; birthYear: number }) =>
      createProfile(input.accountId, { role: 'PARENTS', nickname: input.nickname, birthYear: input.birthYear }),
    onSuccess: (data) => {
      setParentProfile(data.id)
      setStep(3)
    },
  })

  const childProfileMutation = useMutation({
    mutationFn: (input: { accountId: number; nickname: string; birthYear: number }) =>
      createProfile(input.accountId, { role: 'CHILD', nickname: input.nickname, birthYear: input.birthYear }),
    onSuccess: (data) => {
      addChildProfile(data.id)
      setRole('parent')
      navigate('/parent', { replace: true })
    },
  })

  const recoverMutation = useMutation({
    mutationFn: async (accountId: number) => {
      const profiles = await getAccountProfiles(accountId)
      const parent = profiles.find((p) => p.role === 'PARENTS')
      const kids = profiles.filter((p) => p.role === 'CHILD')
      if (!parent) throw new Error('이 계정에 보호자 프로필이 없어요.')
      if (kids.length === 0) throw new Error('이 계정에 아이 프로필이 없어요.')
      return { accountId, parent, kids }
    },
    onSuccess: ({ accountId, parent, kids }) => {
      setAccount(accountId, `가족 계정 ${accountId}`)
      setParentProfile(parent.id)
      kids.forEach((kid) => addChildProfile(kid.id))
      setRole('parent')
      navigate('/parent', { replace: true })
    },
  })

  function submitRecover() {
    const accountId = Number(recoverAccountId)
    if (!recoverAccountId.trim() || !Number.isInteger(accountId)) return
    recoverMutation.mutate(accountId)
  }

  function submitFamilyName() {
    if (!familyName.trim()) return
    accountMutation.mutate(familyName.trim())
  }

  function submitParentProfile() {
    if (accountId === null || !parentNickname.trim() || !parentBirthYear.trim()) return
    parentProfileMutation.mutate({
      accountId,
      nickname: parentNickname.trim(),
      birthYear: Number(parentBirthYear),
    })
  }

  function submitChildProfile() {
    if (accountId === null || !childNickname.trim() || !childBirthYear.trim()) return
    childProfileMutation.mutate({
      accountId,
      nickname: childNickname.trim(),
      birthYear: Number(childBirthYear),
    })
  }

  return (
    <div className="onboarding-theme flex min-h-svh items-center justify-center bg-[#f3f4f6] p-6">
      <div className="onboarding-scene">
        <div className="onboarding-card w-full max-w-md rounded-[10px] border border-black/10 bg-white p-6 shadow-sm">
          <div className="onboarding-brand mb-6">
            <span aria-hidden>●</span>
            <p className="text-lg font-bold tracking-tight text-black">하루 한글</p>
            <p>나의 글쓰기 놀이터</p>
          </div>
          <p className="onboarding-step mb-4 text-[12px] font-medium text-black/50">
            {mode === 'recover' ? '계정 불러오기' : `${step} / 3 단계`}
          </p>

          {mode === 'recover' && (
          <div className="space-y-4">
            <div>
              <h1 className="mb-1 text-[16px] font-semibold text-black">이미 있는 가족 계정을 불러와요</h1>
              <p className="text-[12px] text-black/50">
                계정 ID를 입력하면 그 계정에 속한 보호자·아이 프로필을 그대로 불러와요.
              </p>
            </div>
            <input
              type="number"
              value={recoverAccountId}
              onChange={(e) => setRecoverAccountId(e.target.value)}
              placeholder="계정 ID (예: 1)"
              className="w-full rounded-[5px] border border-black/15 p-3 text-[14px] outline-none placeholder:text-black/40 focus:border-black"
            />
            {errorMessage(recoverMutation.error) && (
              <p className="text-[12px] text-red-700">{errorMessage(recoverMutation.error)}</p>
            )}
            <button
              type="button"
              onClick={submitRecover}
              disabled={!recoverAccountId.trim() || recoverMutation.isPending}
              className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
            >
              {recoverMutation.isPending ? '불러오는 중...' : '불러오기'}
            </button>
            <button
              type="button"
              onClick={() => setMode('create')}
              className="w-full text-center text-[12px] text-black/50 underline-offset-2 hover:underline"
            >
              새로 계정 만들기로 돌아가기
            </button>
          </div>
          )}

          {mode === 'create' && step === 1 && (
          <div className="space-y-4">
            <div>
              <h1 className="mb-1 text-[16px] font-semibold text-black">우리 가족 이름을 알려주세요</h1>
              <p className="text-[12px] text-black/50">보호자와 아이 프로필을 담을 계정 이름이에요.</p>
            </div>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="예: 김민준네 가족"
              className="w-full rounded-[5px] border border-black/15 p-3 text-[14px] outline-none placeholder:text-black/40 focus:border-black"
            />
            {errorMessage(accountMutation.error) && (
              <p className="text-[12px] text-red-700">{errorMessage(accountMutation.error)}</p>
            )}
            <button
              type="button"
              onClick={submitFamilyName}
              disabled={!familyName.trim() || accountMutation.isPending}
              className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
            >
              {accountMutation.isPending ? '만드는 중...' : '다음'}
            </button>
            <button
              type="button"
              onClick={() => setMode('recover')}
              className="w-full text-center text-[12px] text-black/50 underline-offset-2 hover:underline"
            >
              이미 계정이 있으신가요?
            </button>
          </div>
          )}

          {mode === 'create' && step === 2 && (
          <div className="space-y-4">
            <div>
              <h1 className="mb-1 text-[16px] font-semibold text-black">보호자 프로필을 만들어요</h1>
              <p className="text-[12px] text-black/50">닉네임과 출생연도를 입력해 주세요.</p>
            </div>
            <input
              type="text"
              value={parentNickname}
              onChange={(e) => setParentNickname(e.target.value)}
              placeholder="닉네임 (예: 엄마)"
              className="w-full rounded-[5px] border border-black/15 p-3 text-[14px] outline-none placeholder:text-black/40 focus:border-black"
            />
            <input
              type="number"
              value={parentBirthYear}
              onChange={(e) => setParentBirthYear(e.target.value)}
              placeholder="출생연도 (예: 1985)"
              min={1950}
              max={CURRENT_YEAR}
              className="w-full rounded-[5px] border border-black/15 p-3 text-[14px] outline-none placeholder:text-black/40 focus:border-black"
            />
            {errorMessage(parentProfileMutation.error) && (
              <p className="text-[12px] text-red-700">{errorMessage(parentProfileMutation.error)}</p>
            )}
            <button
              type="button"
              onClick={submitParentProfile}
              disabled={!parentNickname.trim() || !parentBirthYear.trim() || parentProfileMutation.isPending}
              className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
            >
              {parentProfileMutation.isPending ? '만드는 중...' : '다음'}
            </button>
          </div>
          )}

          {mode === 'create' && step === 3 && (
          <div className="space-y-4">
            <div>
              <h1 className="mb-1 text-[16px] font-semibold text-black">아이 프로필을 만들어요</h1>
              <p className="text-[12px] text-black/50">닉네임과 출생연도를 입력해 주세요.</p>
            </div>
            <input
              type="text"
              value={childNickname}
              onChange={(e) => setChildNickname(e.target.value)}
              placeholder="닉네임 (예: 민준)"
              className="w-full rounded-[5px] border border-black/15 p-3 text-[14px] outline-none placeholder:text-black/40 focus:border-black"
            />
            <input
              type="number"
              value={childBirthYear}
              onChange={(e) => setChildBirthYear(e.target.value)}
              placeholder="출생연도 (예: 2018)"
              min={2000}
              max={CURRENT_YEAR}
              className="w-full rounded-[5px] border border-black/15 p-3 text-[14px] outline-none placeholder:text-black/40 focus:border-black"
            />
            {errorMessage(childProfileMutation.error) && (
              <p className="text-[12px] text-red-700">{errorMessage(childProfileMutation.error)}</p>
            )}
            <button
              type="button"
              onClick={submitChildProfile}
              disabled={!childNickname.trim() || !childBirthYear.trim() || childProfileMutation.isPending}
              className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
            >
              {childProfileMutation.isPending ? '만드는 중...' : '시작하기'}
            </button>
          </div>
          )}
        </div>

        <div className="onboarding-friend" aria-hidden>
          <img className="onboarding-hills" src="/writegrow-brainstorming-hills.png" alt="" />
          <img className="onboarding-chick" src="/writegrow-chick-writing.png" alt="" />
          <p>우리 같이 시작해 볼까?</p>
        </div>
      </div>
    </div>
  )
}
