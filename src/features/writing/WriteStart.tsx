import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOPICS } from '../../mocks/seed'
import { useWritingStore } from '../../stores/writingStore'

export function WriteStart() {
  const navigate = useNavigate()
  const setTopic = useWritingStore((s) => s.setTopic)
  const setMode = useWritingStore((s) => s.setMode)
  const setContent = useWritingStore((s) => s.setContent)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const [draft, setDraft] = useState('')

  function choosePen() {
    if (!selectedTopic) return
    setTopic(selectedTopic)
    setMode('pen')
    navigate('/child/write/pen')
  }

  function chooseKeyboard() {
    if (!selectedTopic) return
    setKeyboardOpen(true)
  }

  function submitKeyboard() {
    if (!selectedTopic || !draft.trim()) return
    setTopic(selectedTopic)
    setMode('keyboard')
    setContent(draft.trim())
    navigate('/child/write/analyzing')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">무엇에 대해 써볼까?</h1>

      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => setSelectedTopic(topic)}
            className={`min-h-touch rounded-xl px-4 text-body ${
              selectedTopic === topic ? 'bg-brand text-white' : 'bg-white text-ink'
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {selectedTopic && !keyboardOpen && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={choosePen}
            className="min-h-touch flex-1 rounded-xl bg-brand px-6 text-body font-semibold text-white"
          >
            펜으로 쓰기
          </button>
          <button
            type="button"
            onClick={chooseKeyboard}
            className="min-h-touch flex-1 rounded-xl border border-brand px-6 text-body font-semibold text-brand"
          >
            키보드로 쓰기
          </button>
        </div>
      )}

      {keyboardOpen && (
        <div className="space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="오늘 있었던 일을 자유롭게 써볼까?"
            rows={6}
            className="w-full rounded-xl border border-ink/10 p-4 text-body"
          />
          <button
            type="button"
            onClick={submitKeyboard}
            disabled={!draft.trim()}
            className="min-h-touch w-full rounded-xl bg-brand px-6 text-body font-semibold text-white disabled:opacity-40"
          >
            다 썼어요
          </button>
        </div>
      )}
    </div>
  )
}
