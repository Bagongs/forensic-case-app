// src/renderer/src/components/common/Pagination.jsx

const COLORS = {
  pageActive: '#273549'
}

// eslint-disable-next-line react/prop-types
function IconChevron({ dir = 'left' }) {
  const rotate = dir === 'right' ? 'rotate-180' : ''
  return (
    <svg
      className={`w-4 h-4 ${rotate}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      color="#EDC702"
    >
      <path d="M15 19l-7-7 7-7" />
    </svg>
  )
}

// eslint-disable-next-line react/prop-types
export default function Pagination({ page, totalPages, onChange }) {
  const go = (p) => {
    // jaga supaya tidak keluar batas
    const safe = Math.max(1, Math.min(totalPages, p))
    if (safe !== page) onChange(safe)
  }

  const buildPages = () => {
    const pages = []

    // kalau halaman sedikit, tampilkan semua
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    // selalu tampilkan halaman pertama
    pages.push(1)

    // window di sekitar current page (page-1, page, page+1)
    const left = Math.max(2, page - 1)
    const right = Math.min(totalPages - 1, page + 1)

    // ellipsis kiri kalau ada gap antara 1 dan left
    if (left > 2) {
      pages.push('left-dots')
    }

    // halaman tengah (sekitar current page)
    for (let p = left; p <= right; p++) {
      pages.push(p)
    }

    // ellipsis kanan kalau ada gap antara right dan last
    if (right < totalPages - 1) {
      pages.push('right-dots')
    }

    // selalu tampilkan halaman terakhir
    pages.push(totalPages)

    return pages
  }

  const nums = buildPages()

  return (
    <div className="flex items-center gap-2">
      {/* Prev */}
      <button
        onClick={() => go(page - 1)}
        disabled={page === 1}
        className="p-2 disabled:opacity-40"
      >
        <IconChevron dir="left" />
      </button>

      {/* Numbered pages + ellipsis */}
      {nums.map((n, idx) =>
        typeof n === 'string' && n.includes('dots') ? (
          <span key={n + idx} className="px-3 select-none">
            …
          </span>
        ) : (
          <button
            key={n}
            onClick={() => go(n)}
            className="min-w-10 h-10 px-3 rounded-sm"
            style={{
              background: n === page ? COLORS.pageActive : 'transparent',
              color: n === page ? '#EDC702' : '',
              border: '1px solid transparent'
            }}
          >
            {n}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => go(page + 1)}
        disabled={page === totalPages}
        className="p-2 disabled:opacity-40"
      >
        <IconChevron dir="right" />
      </button>
    </div>
  )
}
