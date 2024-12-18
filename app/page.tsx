
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Welcome to StudySphere</h1>
        <p className="text-lg text-center sm:text-left">
          StudySphere is your academic workload manager.
        </p>
        <a
          href="/dashboard"
          className="px-4 py-2 text-white bg-blue-500 rounded-md shadow-md hover:bg-blue-600"
        >
          Get Started
        </a>
      </main>
    </div>
  );
}
