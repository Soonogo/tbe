import { PackageID } from "../constant"

export const HowToPlay = (() => {
    const list = [
        {
            value: "Connect your wallet first",
        },
        {
            value: "You can draw a prize every twelve hours",
        },
        {
            value: "I can play rock scissors and cloth three times every two hours",
        },
        {
            value: `Each stone scissors cloth consumes 0.1 SUI`,
        },
        {
            value: `The consumed SUI will accumulate in the pool`,
        },
        {
            value: `Randomly give one of the three cards in the lottery`,
        },
        {
            value: `Randomly among three different probabilities`,
        },
        {
            value: `Collect all three types of cards to claim the prize pool, so go to SUI`,
        },
        {
            value: `Contract: ${PackageID}`,
        }
    ]
    return <div className=" w-full border flex flex-col gap-5 justify-center items-center h-screen">
        <h1 className="text-5xl">Rule</h1>
        <ol className="flex flex-col items-center justify-center text-xl gap-7 font-serif">
            {list.map((item, index) => <li key={index}>{item.value}</li>)}
        </ol>
    </div>
})