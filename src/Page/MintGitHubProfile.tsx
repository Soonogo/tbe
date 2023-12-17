import { Button, Input } from "@nextui-org/react"
import { useCallback, useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast"

export const MintGitHubProfile = () => {
    const [profileData, setProfileData] = useState({ userName: "", imgUrl: "", login: "" })

    const searchProfile = useCallback(async () => {
        toast('Requesting data from Github.');
        const res = await (await fetch("https://api.github.com/users/" + profileData.userName)).json()

        setProfileData({
            ...profileData,
            imgUrl: res.avatar_url,
            login: res.login
        })
        console.log(res);
    }, [profileData])


    return <div className="flex flex-col justify-center items-center min-h-screen">
        <Toaster
            position="top-center"
            reverseOrder={false}
        />
        <div className="bg-[#e8dfdf] p-2 rounded-full">
            <img className="w-52 h-52 rounded-full shadow-md" src={profileData.imgUrl} alt="" />
        </div>
        <br />
        {profileData.login && <p>Name: {profileData.login}</p>}

        <br />
        <div className="w-1/2 flex gap-2 justify-center items-center">
            <Input className="w-52" type="text" label="GitHub Profile" onKeyDown={e => e.key === "Enter" && searchProfile()} onChange={e => setProfileData({ ...profileData, userName: e.target.value })}></Input>
            <Button onClick={searchProfile}>Search</Button>
        </div>
        <br />
        <div>
            <Button>Mint</Button>

        </div>
    </div>
}