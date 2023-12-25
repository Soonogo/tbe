import { TransactionBlock } from "@mysten/sui.js/transactions";
import { GameShareOrbject, PackageID, WeatherOracle } from "../constant";
import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClientQuery, useWallets } from "@mysten/dapp-kit";
import toast, { Toaster } from "react-hot-toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { strewFlowers } from "../utils";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";

export const Game1 = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const [reload, setReload] = useState(false)
    const { } = useWallets()
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransactionBlock, status } = useSignAndExecuteTransactionBlock();
    const [game1Data, setGame1Data] = useState("stone")
    const [count, setCount] = useState(0)
    const [startGame, setStartGame] = useState(false)
    const timer = useRef<any>()
    const [obtainCard, setObtainCard] = useState("")
    const [timeStap, setTimeStap] = useState(0)
    const [timeStapValue, setTimeStapValue] = useState("")
    const [remainingTimes, setRemainingTimes] = useState(0)
    const timer2 = useRef<any>()

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
        // @ts-ignore
        const x = res?.data?.data?.content?.fields?.game_account_map?.fields?.contents
        // @ts-ignore
        const x2 = res?.data?.data?.content?.fields?.game_account_time_map?.fields?.contents
        x?.length > 0 && setRemainingTimes(Number(x?.filter((t: any) => t.fields?.key === account?.address)?.[0]?.fields?.value));
        setTimeStap(Number(x2?.filter((t: any) => t.fields?.key === account?.address)?.[0]?.fields?.value));

    }, [res])


    const execGame1 = () => {
        const tx = new TransactionBlock();
        const coin = tx.splitCoins(tx.gas, [1 * 1e8]);
        tx.moveCall({
            target: `${PackageID}::game::start_game`,
            arguments: [
                tx.object(WeatherOracle),
                tx.object(GameShareOrbject),
                tx.pure(game1Data === "stone" ? 0 : game1Data === "scissors" ? 1 : 2),
                tx.pure("0x06"),
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
            const gameResult = result?.events[0]?.parsedJson.win
            setStartGame(false)
            setReload(!reload)

            clearInterval(timer.current)
            if (gameResult === "1") {
                setObtainCard(result?.events[1]?.parsedJson.result)
                toast.success("You Won!")
                strewFlowers()
                onOpen()
            }
            gameResult === "2" && toast.error("You Lose!")
            gameResult === "0" && toast.error("Game Tie! Return amount.")
            console.log(result);
        }, (e) => {
            console.log(e.message);
            setStartGame(false);
            setReload(!reload)

            clearInterval(timer.current)
            toast.error("You can draw a prize every twelve hours")
        });
    }



    useEffect(() => {
        timer.current = setInterval(updateCountdown, 1000);
        return () => {
            clearInterval(timer2.current);
        }
    }, [timeStap])

    const updateCountdown = useCallback(() => {
        let currentTimestamp = Math.floor(new Date().getTime() / 1000);

        let remainingTimeInSeconds = (timeStap + 60000 * 60 * 2) / 1000 - currentTimestamp;

        if (remainingTimeInSeconds <= 0) {
            clearInterval(timer2.current);
            return;
        }

        let hours = Math.floor(remainingTimeInSeconds / 3600);
        let minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
        let seconds = Math.floor(remainingTimeInSeconds % 60);

        !Number.isNaN(hours) && setTimeStapValue("Cooling time: " + hours + "h " + minutes + "m " + seconds + "s");
    }, [timeStap])

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
        <div className="flex flex-col justify-center items-center">
            <h1>Remaining <span className="border p-1 rounded-md">{3 - remainingTimes}</span> times </h1>
            <div>{timeStapValue}</div>
        </div>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Obtain Rewards</ModalHeader>
                        <ModalBody className="flex justify-center items-center">
                            <img className="w-48" src={`${obtainCard}.webp`} alt="" />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                            <Button color="primary" onPress={onClose}>
                                OK
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    </div>
}