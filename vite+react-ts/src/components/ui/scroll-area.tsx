import React from 'react'

interface ScrollAreaProps {
  children: React.ReactNode
  className?: string
}

export function ScrollArea({ children, className = '' }: ScrollAreaProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-custom">
        {children}
      </div>
      <style jsx>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 10px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin: 4px 0;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.6), rgba(168, 85, 247, 0.6));
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: background 0.2s ease;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.8));
          background-clip: padding-box;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, rgba(139, 92, 246, 1), rgba(168, 85, 247, 1));
          background-clip: padding-box;
        }

        /* Firefox scrollbar styling */
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: rgba(139, 92, 246, 0.6) rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  )
}

// Demo component to showcase the ScrollArea
export default function ScrollAreaDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">ScrollArea Component</h1>
          <p className="text-gray-400">A custom scroll area with professional dark styling</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-4">Scrollable Content</h2>

          <ScrollArea className="h-[400px] rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="space-y-4">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/10 bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-4 transition-all hover:border-white/20 hover:from-violet-500/20 hover:to-purple-500/20"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">Item {i + 1}</h3>
                  <p className="text-sm text-gray-400">
                    This is a sample content item to demonstrate the scrolling functionality.
                    The scroll bar features a sleek gradient design that matches the modern dark theme.
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
