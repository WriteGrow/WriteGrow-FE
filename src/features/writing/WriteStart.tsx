import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FREE_TOPIC, TOPICS } from '../../lib/topics'

const TOPIC_OPTIONS = [FREE_TOPIC, ...TOPICS]
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
    <div className="write-start space-y-6">
      <h1 className="text-[16px] font-semibold text-black">무엇에 대해 써볼까?</h1>

      <div className="flex flex-wrap gap-2">
        {TOPIC_OPTIONS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => setSelectedTopic(topic)}
            className={`rounded-[5px] px-4 py-2.5 text-[12px] ${
              selectedTopic === topic ? 'bg-black text-white' : 'border border-black/15 bg-white text-black/70'
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
            className="flex-1 rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90"
          >
            펜으로 쓰기
          </button>
          <button
            type="button"
            onClick={chooseKeyboard}
            className="flex-1 rounded-[5px] border border-black/20 px-4 py-2.5 text-[14px] font-semibold text-black hover:bg-black/5"
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
            className="w-full rounded-[5px] border border-black/15 p-4 text-[14px] outline-none placeholder:text-black/40 focus:border-black"
          />
          <button
            type="button"
            onClick={submitKeyboard}
            disabled={!draft.trim()}
            className="w-full rounded-[5px] bg-black px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-black/90 disabled:opacity-40"
          >
            다 썼어요
          </button>
        </div>
      )}

      {!keyboardOpen && (
        <img
          src="/writegrow-brainstorming-hills.png"
          alt=""
          aria-hidden
          className="write-start-buddies"
        />
      )}
    </div>
  )
}
