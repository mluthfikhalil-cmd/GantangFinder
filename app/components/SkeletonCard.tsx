'use client'

export default function SkeletonCard({ featured = false }: { featured?: boolean }) {
  const base: React.CSSProperties = {
    background: featured ? 'linear-gradient(135deg,#fffbeb,#fef9c3)' : '#fff',
    borderRadius: 16,
    padding: 16,
    border: featured ? '1.5px solid #fde68a' : '1.5px solid #f1f5f9',
    overflow: 'hidden',
  }

  const shimmer: React.CSSProperties = {
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s ease infinite',
    borderRadius: 6,
  }

  const row = (w: string, h = 14): React.CSSProperties => ({
    ...shimmer,
    width: w,
    height: h,
    marginBottom: 8,
  })

  const tagRow = (count = 3): React.CSSProperties => ({
    display: 'flex',
    gap: 6,
    marginTop: 10,
  })

  const tag = (w = 60): React.CSSProperties => ({
    ...shimmer,
    width: w,
    height: 24,
    borderRadius: 9999,
  })

  return (
    <div style={base}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          <div style={{ ...tag(70), background: 'linear-gradient(90deg, #fde68a 25%, #fef3c7 50%, #fde68a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease infinite' }} />
          <div style={{ ...tag(60) }} />
        </div>
        <div style={{ ...shimmer, width: 44, height: 44, borderRadius: 10, flexShrink: 0, marginLeft: 8 }} />
      </div>

      <div style={{ ...row('75%', 16) }} />
      <div style={{ ...row('50%') }} />
      <div style={{ ...row('40%') }} />
      <div style={{ ...row('30%') }} />

      <div style={tagRow()}>
        <div style={{ ...tag(60) }} />
        <div style={{ ...tag(70) }} />
        <div style={{ ...tag(50) }} />
      </div>
    </div>
  )
}
