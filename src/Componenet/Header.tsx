import { ConnectButton } from "@mysten/dapp-kit"
import { useNavigate } from "react-router-dom"

export const Header = () => {
    const nav = useNavigate()
    return <div className="fixed w-full top-0 text-xl shadow-md  h-20 flex justify-between items-center p-2 bg-[#f8f8f8]">
        <div className="cursor-pointer" onClick={() => { nav('/') }}>TBNE</div>
        <div className="flex gap-4 justify-center items-center">

            <h1 className="cursor-pointer" onClick={() => { nav('/reward') }}>Reward</h1>
            <h1 className="cursor-pointer" onClick={() => { nav('/game') }}>Game</h1>
            <h1 className="cursor-pointer" onClick={() => { nav('/mint') }}>Mint</h1>
            <ConnectButton />
        </div>

    </div>
}