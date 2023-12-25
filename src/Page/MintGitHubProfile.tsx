import { Button, Input } from "@nextui-org/react"
import { useCallback, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { PackageID } from "../constant"
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useCurrentAccount, useSignAndExecuteTransactionBlock } from "@mysten/dapp-kit";

export const MintGitHubProfile = () => {
    const [profileData, setProfileData] = useState({ userName: "", imgUrl: "", login: "", description: "" })
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransactionBlock();

    const searchProfile = useCallback(async () => {
        toast('Requesting data from Github!');
        const res = await (await fetch("https://api.github.com/users/" + profileData.userName)).json()
        console.log(res);

        setProfileData({
            ...profileData,
            imgUrl: res.avatar_url,
            description: res.bio,
            login: res.login
        })
    }, [profileData])


    const execMintGithubNft = () => {
        const tx = new TransactionBlock();
        const [coin] = tx.splitCoins(tx.gas, [1 * 1e9]);
        tx.moveCall({
            target: `${PackageID}::game::mint`,
            arguments: [
                tx.pure(profileData.userName),
                tx.pure(profileData.imgUrl),
                tx.pure(profileData.description),
            ],
        });
        console.log(tx);
        tx.transferObjects([coin], tx.pure(account?.address));

        signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: {
                showEvents: true
            }
        }).then(async (result) => {
            toast.success("Execution successful")
            console.log(result);
        }, (e) => { console.log(e); toast.error("Execution failed") });
    }

    return <div className="flex flex-col justify-center items-center min-h-screen">
        <Toaster
            position="top-center"
            reverseOrder={false}
        />
        <div className="bg-[#e8dfdf] p-2 rounded-full">
            <img className="w-52 h-52 rounded-full shadow-md" src={profileData.imgUrl} alt="" />
        </div>
        <br />
        {profileData.login ? <p>Name: {profileData.login}</p> : <p>&nbsp;</p>}

        <br />
        <div className="w-1/2 flex gap-2 justify-center items-center">
            <Input className="w-52" type="text" label="GitHub Profile" onKeyDown={e => e.key === "Enter" && searchProfile()} onChange={e => setProfileData({ ...profileData, userName: e.target.value })}></Input>
            <Button onClick={searchProfile}>Search</Button>
        </div>
        <br />
        <div>
            <Button onClick={execMintGithubNft}>Mint</Button>

        </div>
    </div>
}