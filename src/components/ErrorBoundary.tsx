import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[WebGL] Canvas failed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="max-w-sm rounded-2xl border border-white/10 bg-carbon/80 p-8 text-center">
              <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-gold/20 to-teal/20" />
              <p className="mt-4 font-display text-lg font-semibold text-white">Globe unavailable</p>
              <p className="mt-2 text-sm text-white/50">
                Your device could not render 3D. The rest of the site works perfectly.
              </p>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}
