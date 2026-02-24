import React from 'react';

interface LibertarButtonProps {
  production: {
    id: string;
    status: "BLOCKED" | "RELEASED";
  };
  releaseProduction: (id: string) => void;
}

export const LibertarButton: React.FC<LibertarButtonProps> = ({
  production,
  releaseProduction,
}) => {
  return (
    <>
      {production.status === "BLOCKED" && (
        <button
          onClick={() => {
            releaseProduction(production.id);
            // Toast notification would be better
            alert('Encomenda libertada para produção com sucesso!');
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          Libertar para Produção
        </button>
      )}
      {production.status === "RELEASED" && (
        <span className="text-green-600 font-medium">✓ Libertada</span>
      )}
    </>
  );
};
