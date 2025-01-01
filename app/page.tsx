import { Press_Start_2P } from "next/font/google";
import { Typewriter } from 'nextjs-simple-typewriter'


const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});


export default function Home() {
  return (
    <div className={`${pressStart2P.className} bg-beige min-h-screen grid grid-rows-[20px_1fr_20px] p-8 pb-20 gap-16 sm:p-20`}>
      <main>
        <div className="grid grid-cols-1 gap-8 items-center sm:items-start mb-5">
          <h1 className="text-4xl font-bold">
            Welcome to 
            <span style={{ color: "#CC6B49" }}> Study</span>
            <span style={{ color: "#73BDA8" }}>Sphere</span>
          </h1>
          <div style={{ height: '2em' }}> {/* Set a fixed height for the Typewriter container */}
            <Typewriter 
              words={['An academic planner.', 'A workload manager.', 'A study buddy.']}
              cursorBlinking={true}
              loop={false as unknown as number} // to disable warning
            />
          </div>
        </div>
        <a
          href="/dashboard"
          className="px-4 py-2 my-10 text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600 max-w-md"
        >
          Get Started
        </a>
      </main>
    </div>
  );
}