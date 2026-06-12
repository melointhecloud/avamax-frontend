import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoAvaluz from "@/assets/avaluz-logo.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary/90 px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        <img
          src={logoAvaluz}
          alt="AvaLuz"
          className="mb-8 h-16 w-auto drop-shadow-lg"
        />

        {/* 404 Number with glow effect */}
        <div className="relative mb-6">
          <h1 className="text-[120px] font-bold leading-none text-white/10 sm:text-[180px]">
            404
          </h1>
          <h2 className="absolute inset-0 flex items-center justify-center text-[120px] font-bold leading-none text-accent drop-shadow-[0_0_30px_rgba(223,96,9,0.5)] sm:text-[180px]">
            404
          </h2>
        </div>

        {/* Message */}
        <h3 className="mb-3 text-2xl font-semibold text-white sm:text-3xl">
          Página não encontrada
        </h3>
        <p className="mb-8 max-w-md text-base text-white/70 sm:text-lg">
          A página que você está procurando não existe ou foi movida. 
          Verifique o endereço ou volte para a página inicial.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/30"
          >
            <Link to="/home">
              <Home className="mr-2 h-4 w-4" />
              Ir para o Início
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
          >
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>

        {/* Path info for debugging */}
        <p className="mt-8 text-sm text-white/40">
          Caminho: <code className="rounded bg-white/10 px-2 py-1">{location.pathname}</code>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
