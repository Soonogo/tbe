import { useNavigate } from "react-router-dom"

export const Header = () => {
    const nav = useNavigate()
    return <div className="fixed w-full top-0 text-xl shadow-md  h-20 flex justify-between items-center p-2 bg-[#f8f8f8]">
        <div className="cursor-pointer" onClick={() => { nav('/') }}>TBNE</div>
        <div className="flex gap-2">

            <h1 className="cursor-pointer" onClick={() => { nav('/mint') }}>Mint</h1>
            <h1 className="cursor-pointer" onClick={() => { nav('/') }}>12221</h1>
        </div>

    </div>
}