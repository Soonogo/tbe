import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClient, useWallets } from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Card, CardBody } from "@nextui-org/react"
import { GameShareOrbject, PackageID, WeatherOracle } from "../constant";
import toast, { Toaster } from "react-hot-toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { strewFlowers } from "../utils";

export const Home = () => {
    const { } = useWallets()
    const account = useCurrentAccount();
    const [reload, setReload] = useState(false)
    const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();
    const client = useSuiClient()
    const [timeStap, setTimeStap] = useState(0)
    const [timeStapValue, setTimeStapValue] = useState("")

    useEffect(() => {
        (async function () {

            const res = await client.getObject({
                id: GameShareOrbject,
                options: {
                    showContent: true
                }
            })
            // @ts-ignore
            const x = res?.data?.content?.fields?.account_map?.fields?.contents

            setTimeStap(Number(x?.filter((t: any) => t.fields?.key === account?.address)?.[0]?.fields?.value));
        }())

    }, [account, reload])
    useEffect(() => {
        timer.current = setInterval(updateCountdown, 1000);
        return () => {
            clearInterval(timer.current);
        }
    }, [timeStap])

    const timer = useRef<any>()
    const updateCountdown = useCallback(() => {
        let currentTimestamp = Math.floor(new Date().getTime() / 1000);

        let remainingTimeInSeconds = (timeStap + 60000 * 60 * 12) / 1000 - currentTimestamp;

        if (remainingTimeInSeconds <= 0) {
            clearInterval(timer.current);
            return;
        }

        let hours = Math.floor(remainingTimeInSeconds / 3600);
        let minutes = Math.floor((remainingTimeInSeconds % 3600) / 60);
        let seconds = Math.floor(remainingTimeInSeconds % 60);

        !Number.isNaN(hours) && setTimeStapValue("Cooling time: " + hours + "h " + minutes + "m " + seconds + "s");
    }, [timeStap])

    const [obtainCard, setObtainCard] = useState("")
    const execClaim = () => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PackageID}::game::daily_claim`,
            arguments: [
                tx.object(WeatherOracle),
                tx.object(GameShareOrbject),
                tx.pure("0x06"),
            ]
        });
        console.log(tx);

        signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEvents: true
            }
        }).then(async (result: any) => {
            toast.success("Execute Successful!")
            strewFlowers()
            setReload(!reload)
            console.log(result);
            setObtainCard(result?.events[0]?.parsedJson.result)

        }, (e) => {
            toast.error("Execute Fail")
            console.log(e.message);
            setReload(!reload)

        });
    }
    // const clinet = useSuiClient()
    // const transfer = async () => {
    //     const tx = new TransactionBlock();
    //     const res = await clinet.getOwnedObjects({
    //         owner: account?.address ?? "",
    //         options: {
    //             showType: true,
    //         }
    //     })
    //     tx.setGasBudget(5 * 1e9)
    //     const a = res.data.slice(0, 10).filter((t: any) => t.data.type !== "0x2::coin::Coin<0x2::sui::SUI>").map((t: any) => tx.object(t.data?.objectId))
    //     tx.transferObjects(a, tx.pure("0x0000000000000000000000000000000000000000000000000000000000000000"))

    //     signAndExecuteTransactionBlock({
    //         transactionBlock: tx,
    //         options: {
    //             showEvents: true
    //         }
    //     }).then(async (result: any) => {
    //         console.log(result);
    //     }, (e) => {
    //         console.log(e.message);
    //         toast.error(e.message)
    //     });
    // }

    return <div className=" w-full border flex flex-col gap-5 justify-center items-center h-screen">
        <Toaster
            position="top-center"
            reverseOrder={false}
        />
        <Card>
            <CardBody className="flex flex-col gap-2 rounded-xl">
                <div className="flex items-center justify-center p-2 shadow-md">
                    <img className="w-52" src={obtainCard === "" ? `1.webp` : `${obtainCard}.webp`} alt="" />
                </div>
                <button className="button" onClick={() => { execClaim() }}>Claim</button>

            </CardBody>
        </Card>
        <div className="w-60 text-center">
            <div >{timeStapValue}&nbsp;</div>
        </div>
    </div >
}