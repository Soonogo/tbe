import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { Button, Card, CardBody, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react"
import { CardType, GameShareOrbject, PackageID } from "../constant";
import { useEffect, useState } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import toast, { Toaster } from "react-hot-toast";

export const Withdrawal = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [amount, setAmount] = useState(0)
    const [data, setData] = useState<any>()
    const [reload, setReload] = useState(false)
    const account = useCurrentAccount();
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


    const client = useSuiClient()
    const [ownerCard, setOwnerCard] = useState<any>()

    useEffect(() => {
        (async function () {
            const res: any = await client.getOwnedObjects({
                owner: account?.address ?? "",
                options: {
                    showContent: true,
                },
                filter: {
                    StructType: CardType
                }
            })

            const groupedByType = res?.data.reduce((result: any, item: any) => {
                const type = item.data.content.fields.type;

                // 如果result中已经有该类型的数组，则将当前item添加到对应类型的数组中
                if (result[type]) {
                    result[type].push(item);
                } else {
                    // 否则，创建一个新的数组并添加到result中
                    result[type] = [item];
                }

                return result;
            }, {});
            console.log(groupedByType);

            setOwnerCard(groupedByType);

        }())


    }, [account])



    const withdrawal = () => {
        if (!ownerCard?.copper || ownerCard?.copper?.length < 1) { return toast.error("No Copper Card") }
        if (!ownerCard?.silver || ownerCard?.silver?.length < 1) { return toast.error("No Silver Card") }
        if (!ownerCard?.gold || ownerCard?.gold?.length < 1) { return toast.error("No Gold Card") }
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PackageID}::game::withdrawal`,
            arguments: [
                tx.object(ownerCard?.copper[0].data.objectId),
                tx.object(ownerCard?.silver[0].data.objectId),
                tx.object(ownerCard?.gold[0].data.objectId),
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
            setReload(!reload)

        }, (e: any) => {
            console.log(e.message);
            setReload(!reload)

            toast.error(e.message)
        });
    }
    const Coining = () => {
        const tx = new TransactionBlock();
        const coin = tx.splitCoins(tx.gas, [amount]);
        tx.moveCall({
            target: `${PackageID}::game::coining`,
            arguments: [
                coin,
                tx.pure(amount),
                tx.object(GameShareOrbject),
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
            console.log(result);
            setReload(!reload)

        }, (e: any) => {
            console.log(e.message);
            setReload(!reload)

            toast.error(e.message)
        });
    }


    return <div className=" w-full border flex flex-col gap-5 justify-center items-center h-screen">
        <Toaster
            position="top-center"
            reverseOrder={false}
        />
        <div className="fixed top-28 right-10">
            <Card>
                <CardBody className="flex gap-4 flex-row justify-center items-center ">
                    <div className="h-32 flex flex-col items-center justify-between">
                        <div className="h-48"><img className="w-[140px] mt-[-13px]" src="101.webp" alt="" /></div>
                        <div className="mt-[-13px]">x {ownerCard?.copper?.length ?? 0}</div></div>

                    <div className="h-32 flex flex-col items-center justify-between">
                        <div className="h-28"><img className="w-28" src="102.webp" alt="" /></div>
                        <div className="mt-[2px]">x {ownerCard?.silver?.length ?? 0}</div></div>

                    <div className=" h-32 flex flex-col items-center justify-between">
                        <div className="h-32"><img className="w-28" src="103.webp" alt="" /></div>
                        x {ownerCard?.gold?.length ?? 0}</div>
                </CardBody>
            </Card>
        </div>

        <div><img className="absolute w-20 left-[32%] top-[32%]" src="/point.svg" alt="" /></div>
        <button className="button absolute left-[28%] top-[27%]" onClick={() => { onOpen() }}>Coining</button>

        <div>Reward Pool: <span className="border p-1 rounded-md">{Number(data?.content?.fields?.balance) / 1e9}</span> SUI</div>
        <div className="flex items-center justify-center p-2 ">
            <img className="w-[700px]" src="more_sui.png" alt="" />
        </div>
        <button className="button" onClick={() => { withdrawal() }}>Claim</button>
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Input Amount</ModalHeader>
                        <ModalBody>
                            <Input onChange={e => { setAmount(Number(e.target.value) * 1e9) }} label="Amount"></Input>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                            <Button color="primary" onClick={Coining} onPress={onClose}>
                                OK
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    </div>
}