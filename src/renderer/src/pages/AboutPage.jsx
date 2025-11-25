import iconApp from '../assets/icons/icon_app.svg'

import bgTop from '@renderer/assets/image/bg-casemanagement.svg'
import bgApk from '@renderer/assets/image/bg-caseidentityinput.svg'
import bgMonitor from '@renderer/assets/image/bg-statustracking.svg'
import bgForensic from '@renderer/assets/image/bg-custodytracker.svg'
import bgReport from '@renderer/assets/image/bg-custodygenerator.svg'
import CaseLayout from './CaseLayout'

// eslint-disable-next-line react/prop-types
function LicenseCard({ title, code, bg, className = '' }) {
  return (
    <div
      className={`flex items-center select-none ${className}`}
      style={{
        backgroundImage: `url("${bg}")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <div className="flex flex-col justify-center text-left pl-40 pr-8">
        <span className="text-[#EDC702] font-bold text-2xl tracking-tight">{title}</span>

        <span className="text-[#F4F6F8] text-2xl font-medium mt-4 tracking-wide">{code}</span>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const licensesTop = [
    {
      title: 'Case Management',
      code: 'GS26-CGST-26MG-C02E',
      bg: bgForensic
    },
    {
      title: 'Case Identity Input',
      code: 'GS26-IGSC-26PT-B02T',
      bg: bgTop
    }
  ]

  const licensesBottom = [
    {
      title: 'Status Tracking',
      code: 'GS26-CGSK-26SR-N02Y',
      bg: bgApk
    },
    {
      title: 'Custody Tracker',
      code: 'GS26-GSGN-26TD-J06S',
      bg: bgMonitor
    },
    {
      title: 'Custody Generator',
      code: 'GS26-GSGN-26TD-J06S',
      bg: bgReport
    }
  ]

  return (
    <CaseLayout>
      <div className="flex-1 w-full flex flex-col items-center justify-start pt-32 pb-10">
        {/* LOGO */}
        <img
          src={iconApp}
          alt="App Logo"
          className="w-[220px] h-[220px] object-contain mb-6 select-none"
          draggable={false}
        />

        {/* TITLE */}
        <h1 className="text-[#EDC702] text-5xl font-bold tracking-wide mb-20 text-center">
          CASE ANALYTICS PLATFORM
        </h1>

        {/* ===== ROW ATAS (2 LICENSES) ===== */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {licensesTop.map((lic, idx) => (
            <LicenseCard
              key={idx}
              title={lic.title}
              code={lic.code}
              bg={lic.bg}
              className="w-[664px] h-[130px]"
            />
          ))}
        </div>

        {/* ===== ROW BAWAH (3 LICENSES) ===== */}
        <div className="flex items-center justify-center gap-8">
          {licensesBottom.map((lic, idx) => (
            <LicenseCard
              key={idx}
              title={lic.title}
              code={lic.code}
              bg={lic.bg}
              className="w-[560px] h-[130px]"
            />
          ))}
        </div>
      </div>
    </CaseLayout>
  )
}
