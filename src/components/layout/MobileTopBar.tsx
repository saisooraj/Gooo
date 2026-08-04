import { LogoMark } from './navIcons'

export function MobileTopBar() {
  return (
    <div className="mob-hdr safe-top sticky top-0 z-20 flex items-center gap-2 border-b border-white/[0.04] bg-s1 px-[18px] py-3.5 md:hidden">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-lime">
        <LogoMark className="h-[13px] w-[13px]" />
      </div>
      <span className="text-[15px] font-bold tracking-[-0.5px] text-t1">Gooo</span>
    </div>
  )
}
