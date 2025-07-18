import React from "react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent mb-4">
          Système RH & Paie
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Gérez la paie, les ressources humaines et la conformité sociale de votre entreprise avec une solution moderne, intuitive et 100% cloud.
        </p>
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded shadow-lg text-lg font-semibold hover:from-blue-700 hover:to-orange-500 transition">
          Démarrer maintenant
        </button>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center mb-4">
            <span className="text-3xl text-white">💼</span>
          </div>
          <h3 className="font-bold text-lg mb-2">Gestion RH</h3>
          <p className="text-gray-600 text-center">Suivi des employés, contrats, absences, congés et documents RH.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center mb-4">
            <span className="text-3xl text-white">🧾</span>
          </div>
          <h3 className="font-bold text-lg mb-2">Paie automatisée</h3>
          <p className="text-gray-600 text-center">Calcul automatique du brut, net, cotisations, bulletins et déclarations.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-orange-500 flex items-center justify-center mb-4">
            <span className="text-3xl text-white">📊</span>
          </div>
          <h3 className="font-bold text-lg mb-2">Reporting & conformité</h3>
          <p className="text-gray-600 text-center">Rapports, états sociaux, conformité légale et export Excel/CSV.</p>
        </div>
      </section>

      {/* Badges d'accentuation */}
      <section className="py-8 px-4 flex flex-wrap justify-center gap-4 bg-gray-50">
        <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold">Sécurité RGPD</span>
        <span className="px-3 py-1 rounded bg-orange-100 text-orange-700 font-semibold">Support Sénégal</span>
        <span className="px-3 py-1 rounded bg-purple-100 text-purple-700 font-semibold">Multi-secteurs</span>
        <span className="px-3 py-1 rounded bg-yellow-100 text-yellow-700 font-semibold">Cloud 24/7</span>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 text-center bg-gradient-to-r from-blue-600 to-orange-600">
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à simplifier la gestion RH & Paie ?</h2>
        <button className="bg-white text-blue-700 font-bold px-8 py-3 rounded shadow hover:bg-orange-500 hover:text-white transition">
          Essayez gratuitement
        </button>
      </section>
    </div>
  );
} 