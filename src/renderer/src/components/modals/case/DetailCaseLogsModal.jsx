/* eslint-disable react/prop-types */
import Modal from '../Modal'

export default function AllLogsModal({ open, onClose, logs }) {
  // Convert logs → table row
  const rows = logs.map((log) => {
    let by = log.by || ''
    if (by.includes('By:')) by = by.split('By:')[1].trim()

    let activity = ''
    if (log.notes) activity = log.notes
    else if (log.change) activity = log.change.replace(/^Change:\s*/i, '')

    let date = log.date || ''

    return {
      action: log.status,
      by,
      date,
      activity
    }
  })

  return (
    <Modal size="2xl" open={open} title="All Case Logs" onCancel={onClose} confirmText="Close">
      <div className="overflow-x-auto max-h-[60vh] overflow-y-auto pr-2">
        <table className="w-full text-sm table-fixed border-collapse">
          <thead>
            <tr className="uppercase text-[13px]" style={{ background: 'var(--panel)' }}>
              <th
                className="py-3 px-4 border-b font-semibold text-left"
                style={{ borderColor: 'var(--border)', width: '120px' }}
              >
                Action
              </th>
              <th
                className="py-3 px-4 border-b font-semibold text-left"
                style={{ borderColor: 'var(--border)', width: '180px' }}
              >
                By
              </th>
              <th
                className="py-3 px-4 border-b font-semibold text-left"
                style={{ borderColor: 'var(--border)', width: '160px' }}
              >
                Date
              </th>
              <th
                className="py-3 px-4 border-b font-semibold text-left"
                style={{ borderColor: 'var(--border)' }}
              >
                Activity
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-white/5">
                <td
                  className="py-3 px-4 border-b whitespace-pre-wrap break-all"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {r.action}
                </td>

                <td
                  className="py-3 px-4 border-b whitespace-pre-wrap break-all"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {r.by}
                </td>

                <td
                  className="py-3 px-4 border-b whitespace-pre-wrap break-all"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {r.date}
                </td>

                <td
                  className="py-3 px-4 border-b whitespace-pre-wrap break-all"
                  style={{
                    borderColor: 'var(--border)',
                    maxWidth: '550px'
                  }}
                >
                  {r.activity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  )
}
