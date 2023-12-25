import { TransactionBlock } from "@mysten/sui.js/transactions";
import { GameShareOrbject, PackageID, WeatherOracle } from "../constant";
import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClientQuery, useWallets } from "@mysten/dapp-kit";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

export const Game1 = () => {
    const { } = useWallets()
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransactionBlock, status } = useSignAndExecuteTransactionBlock();
    const [game1Data, setGame1Data] = useState("stone")

    useEffect(() => {
        if (status === "error") {
            clearInterval(timer.current)
            setStartGame(false)
        }
    }, [status])
    const res = useSuiClientQuery("getObject", {
        id: GameShareOrbject,
        options: {
            showContent: true
        }
    })
    useEffect(() => {
        console.log(res?.data?.data);
    }, [res])

    const execGame1 = () => {
        const tx = new TransactionBlock();
        const coin = tx.splitCoins(tx.gas, [1 * 1e8]);
        tx.moveCall({
            target: `${PackageID}::card_collection::start_game`,
            arguments: [
                tx.object(GameShareOrbject),
                tx.pure(game1Data === "stone" ? 0 : game1Data === "scissors" ? 1 : 2),
                coin,
                tx.pure(1 * 1e8)
            ],
        });
        tx.transferObjects([coin], tx.pure(account?.address));
        console.log(tx);

        signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEvents: true
            }
        }).then(async (result: any) => {
            setStartGame(false)
            clearInterval(timer.current)
            result?.events[0]?.parsedJson.win === "2" && toast.success("You Won!")
            console.log(result);
        }, (e) => {
            console.log(e.message);
            setStartGame(false);
            clearInterval(timer.current)
            toast.error(e.message)
        });
    }


    const [startGame, setStartGame] = useState(false)
    const timer = useRef<any>()

    const [count, setCount] = useState(0)

    useEffect(() => {
        if (startGame) {
            let i = 0
            timer.current = setInterval(() => {
                i++
                setCount(x => x + 1)
            }, 200)
        }
    }, [startGame])
    return <div className=" w-full border flex flex-col gap-5 justify-center items-center h-screen">
        <Toaster
            position="top-center"
            reverseOrder={false}
        />
        <div className="flex gap-20 items-center">
            <img src={`/${game1Data}.svg`} alt="" />
            <img className="w-20" src="/vs.svg" alt="" />
            {startGame ? <img src={`/${count % 3 === 0 && "stone" || count % 3 === 1 && "scissors" || count % 3 === 2 && "cloth"}.svg`} alt="" /> : <img src="/question_mark.svg" alt="" />}
        </div>
        <div className="mt-10 flex gap-4">
            <button className={`${game1Data === "stone" ? "selected" : ""} button`} onClick={() => setGame1Data("stone")}>Stone</button>
            <button className={`${game1Data === "scissors" ? "selected" : ""} button`} onClick={() => setGame1Data("scissors")}>Scissors</button>
            <button className={`${game1Data === "cloth" ? "selected" : ""} button`} onClick={() => setGame1Data("cloth")}>Cloth</button>

        </div>
        <div>
            <button className="button" onClick={() => { execGame1(); setStartGame(true) }}>Star Game</button>
        </div>
        {/* <h1 onClick={execGame1}>Game1</h1> */}
    </div>
}