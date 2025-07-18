import React from "react";

const gradients = [
  { name: "Hero", className: "bg-hero-gradient" },
  { name: "Titre", className: "bg-title-gradient" },
  { name: "Icônes services", className: "bg-icon-gradient" },
  { name: "CTA", className: "bg-cta-gradient" },
  { name: "Section", className: "bg-section-gradient" },
];

const mainColors = [
  { name: "Bleu 600", className: "bg-blue-600" },
  { name: "Bleu 700", className: "bg-blue-700" },
  { name: "Orange 500", className: "bg-orange-500" },
  { name: "Orange 600", className: "bg-orange-600" },
  { name: "Blanc", className: "bg-white border" },
];

const accentColors = [
  { name: "Badge Bleu", className: "bg-blue-100 text-blue-700" },
  { name: "Badge Orange", className: "bg-orange-100 text-orange-700" },
  { name: "Badge Purple", className: "bg-purple-100 text-purple-700" },
  { name: "Badge Vert", className: "bg-green-100 text-green-700" },
  { name: "Badge Jaune (optionnel)", className: "bg-yellow-100 text-yellow-700" },
];

const bgColors = [
  { name: "Fond section alternée", className: "bg-gray-50" },
  { name: "Fond section principale", className: "bg-white border" },
];

export const PalettePreview = () => (
  <div className="max-w-2xl mx-auto py-10 space-y-8">
    <h2 className="text-2xl font-bold mb-4">Palette RH-Paie – Aperçu visuel</h2>
    <div>
      <h3 className="font-semibold mb-2">Dégradés</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gradients.map((g) => (
          <div key={g.name} className={`h-16 rounded-xl ${g.className} flex items-center justify-center text-white font-semibold shadow-md`}>
            {g.name}
          </div>
        ))}
      </div>
    </div>
    <div>
      <h3 className="font-semibold mb-2 mt-6">Couleurs principales</h3>
      <div className="flex gap-4">
        {mainColors.map((c) => (
          <div key={c.name} className={`w-24 h-12 rounded-lg flex items-center justify-center font-semibold shadow ${c.className}`}>{c.name}</div>
        ))}
      </div>
    </div>
    <div>
      <h3 className="font-semibold mb-2 mt-6">Couleurs d'accentuation (badges)</h3>
      <div className="flex gap-4">
        {accentColors.map((c) => (
          <div key={c.name} className={`w-40 h-10 rounded-full flex items-center justify-center font-semibold shadow border ${c.className}`}>{c.name}</div>
        ))}
      </div>
    </div>
    <div>
      <h3 className="font-semibold mb-2 mt-6">Couleurs de fond</h3>
      <div className="flex gap-4">
        {bgColors.map((c) => (
          <div key={c.name} className={`w-56 h-10 rounded-lg flex items-center justify-center font-semibold shadow ${c.className}`}>{c.name}</div>
        ))}
      </div>
    </div>
  </div>
); 