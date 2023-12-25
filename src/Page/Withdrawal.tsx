import { useSignAndExecuteTransactionBlock, useSuiClientQuery } from "@mysten/dapp-kit";
import { Card, CardBody } from "@nextui-org/react"
import { GameShareOrbject, PackageID } from "../constant";
import { useEffect, useState } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import toast from "react-hot-toast";

export const Withdrawal = () => {
    const [data, setData] = useState<any>()
    const res = useSuiClientQuery("getObject", {
        id: GameShareOrbject,
        options: {
            showContent: true
        }
    })
    useEffect(() => {
        setData(res?.data?.data);
    }, [res])
    const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

    const withdrawal = () => {
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PackageID}::card_collection::withdrawal`,
            arguments: [
                tx.object("0x7c47c3499af3aca11e646e2062606cb43a253b6790a643421ef260dfbfea8078"),
                tx.object("0xb8d87c70e52b6a74f3e2123b4e28dab74f95bc1ea66ca18e9ca7225a36c7c794"),
                tx.object("0xddf4814a2f69b6062cc7c5d03200386d846ac9a698656390e59fca7dadf14a48"),
                tx.object(GameShareOrbject),
            ],
        });
        console.log(tx);

        signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEvents: true
            }
        }).then(async (result: any) => {
            console.log(result);
        }, (e: any) => {
            console.log(e.message);
            toast.error(e.message)
        });
    }

    return <div className=" w-full border flex flex-col gap-5 justify-center items-center h-screen">
        <div>Reward Pool: {Number(data?.content?.fields?.balance) / 1e9} SUI</div>
        <div className="flex items-center justify-center p-2 ">
            <img className="w-[700px]" src="more_sui.png" alt="" />
        </div>
        <button className="button" onClick={() => { withdrawal() }}>Claim</button>

    </div>
}