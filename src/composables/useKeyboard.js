import { onMounted, onUnmounted } from 'vue'

export function useKeyboard(handlers) {
  function onKeydown(e) {
    // 避免在输入框中触发快捷键
    const target = e.target
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return
    }

    for (const [key, handler] of Object.entries(handlers)) {
      const parts = key.toLowerCase().split('+')
      const keyName = parts.pop()
      const needsCtrl = parts.includes('ctrl') || parts.includes('control')
      const needsShift = parts.includes('shift')
      const needsAlt = parts.includes('alt')

      const ctrlOk = needsCtrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey
      const shiftOk = needsShift ? e.shiftKey : !e.shiftKey
      const altOk = needsAlt ? e.altKey : !e.altKey

      if (e.key.toLowerCase() === keyName && ctrlOk && shiftOk && altOk) {
        e.preventDefault()
        handler(e)
        break
      }
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
