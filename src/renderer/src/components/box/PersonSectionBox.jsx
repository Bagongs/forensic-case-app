/* eslint-disable react/prop-types */
import { FaUserPlus } from 'react-icons/fa'
import { BoxAllSide } from './BaseBox'
import MiniButton, { MiniButtonContent } from '../common/MiniButton'

export function PersonSectionBox({
  title = 'Person of Interest',
  total = 0,
  onAddPerson,
  actionBgImage,
  children,
  cut = 18,
  borderColor = '#FFFFFF', // border putih
  borderW = 0.5,
  panelBg = '#111720' // sesuai screenshot
}) {
  return (
    <BoxAllSide
      cut={cut}
      borderColor={borderColor}
      borderW={borderW}
      bg={panelBg}
      className="relative w-full"
    >
      {/* header */}
      <div className="relative flex justify-between items-center mb-4">
        <div className="font-[Aldrich] text-[18px] text-[#F4F6F8]">
          {title} <span className="opacity-70">({total})</span>
        </div>

        {onAddPerson && (
          <MiniButton onClick={onAddPerson} className="ml-auto font-[Aldrich]">
            <MiniButtonContent
              bg={actionBgImage}
              text="Add Person"
              icon={<FaUserPlus />}
              textColor="text-white"
            />
          </MiniButton>
        )}
      </div>

      {/* garis pemisah */}
      <hr
        className="mb-6 w-[120%] -ml-10 border-t"
        style={{ borderColor: '#ffffff', opacity: 1 }}
      />

      {/* isi konten */}
      <div className="flex flex-col gap-10">{children}</div>
    </BoxAllSide>
  )
}
