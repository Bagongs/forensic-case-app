import iconApp from '../assets/icons/icon_app.svg'

import bgCaseManagement from '@renderer/assets/image/bg-casemanagement.svg'
import bgCaseIdentity from '@renderer/assets/image/bg-caseidentityinput.svg'
import bgStatusTracking from '@renderer/assets/image/bg-statustracking.svg'
import bgCustodyTracker from '@renderer/assets/image/bg-custodytracker.svg'
import bgCustodyGenerator from '@renderer/assets/image/bg-custodygenerator.svg'
import CaseLayout from './CaseLayout'
import { useScreenMode } from '../hooks/useScreenMode'

// eslint-disable-next-line react/prop-types
function LicenseCard({ title, code, bg, className = '', isLarge }) {
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
      <div className={`flex flex-col justify-center text-left ${isLarge ? 'pl-40' : 'pl-32'} pr-8`}>
        <span
          className={`text-[#EDC702] font-bold ${isLarge ? 'text-2xl' : 'text-xl'} tracking-tight`}
        >
          {title}
        </span>

        <span
          className={`text-[#F4F6F8] font-medium mt-4 tracking-wide ${
            isLarge ? 'text-2xl' : 'text-xl'
          }`}
        >
          {code}
        </span>
      </div>
    </div>
  )
}

export default function AboutPage() {
  const mode = useScreenMode()
  const isLarge = mode !== 'default'

  const licensesTop = [
    {
      title: 'Case Management',
      code: 'GS26-CGST-26MG-C02E',
      bg: bgCaseManagement
    },
    {
      title: 'Case Identity Input',
      code: 'GS26-IGSC-26PT-B02T',
      bg: bgCaseIdentity
    }
  ]

  const licensesBottom = [
    {
      title: 'Status Tracking',
      code: 'GS26-CGSK-26SR-N02Y',
      bg: bgStatusTracking
    },
    {
      title: 'Custody Tracker',
      code: 'GS26-TRGR-26DR-K06A',
      bg: bgCustodyTracker
    },
    {
      title: 'Custody Generator',
      code: 'GS26-GSGN-26TD-J06S',
      bg: bgCustodyGenerator
    }
  ]

  return (
    <CaseLayout>
      <div
        className={`flex-1 w-full flex flex-col items-center justify-start ${
          isLarge ? 'pt-48' : 'pt-14'
        } pb-10`}
      >
        {/* LOGO */}
        <img
          src={iconApp}
          alt="App Logo"
          className={`${
            isLarge ? 'w-[220px] h-[220px] mb-14' : 'w-[170px] h-[170px] mb-8'
          } object-contain select-none`}
          draggable={false}
        />

        {/* TITLE */}
        <h1
          className={`text-[#EDC702] font-bold tracking-wide text-center ${
            isLarge ? 'text-5xl mb-24' : 'text-3xl mb-16'
          }`}
        >
          CASE ANALYTICS PLATFORM
        </h1>

        {/* ROW TOP */}
        <div className={`flex items-center justify-center gap-12 ${isLarge ? 'mb-14' : 'mb-8'}`}>
          {licensesTop.map((lic, idx) => (
            <LicenseCard
              key={idx}
              title={lic.title}
              code={lic.code}
              bg={lic.bg}
              className={`${isLarge ? 'w-[664px] h-[130px]' : 'w-[530px] h-[130px]'}`}
              isLarge={isLarge}
            />
          ))}
        </div>

        {/* ROW BOTTOM */}
        <div className="flex items-center justify-center gap-12">
          {licensesBottom.map((lic, idx) => (
            <LicenseCard
              key={idx}
              title={lic.title}
              code={lic.code}
              bg={lic.bg}
              className={`${isLarge ? 'w-[560px] h-[130px]' : 'w-[430px] h-[130px]'}`}
              isLarge={isLarge}
            />
          ))}
        </div>
      </div>
    </CaseLayout>
  )
}
