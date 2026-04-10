import Nav from "@/src/components/navbar";
import Footer from "@/src/components/footer";
import GameRegisterForm from "@/src/components/landing/GameRegisterForm";

export default function GameRegisterPage() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#000", color: "#eef2ff" }}>
      <Nav />
      {/* Added pt-32 to clear fixed navbar, reduced mb-6 for tighter layout */}
      <div className="flex-1 flex flex-col items-center justify-start pt-32 lg:pt-40 p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(67,56,202,0.1),transparent_50%)]">
        <div className="max-w-4xl w-full text-center space-y-4 lg:space-y-6 mb-8 lg:mb-12">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
            Level Up Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">Journey</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Register now to compete, explore, and innovate in Robotic games
          </p>
        </div>

        <GameRegisterForm />
      </div>
      <Footer />
    </main>
  );
}
