'use client'

import { motion } from 'framer-motion'

export default function ImprintPage() {
  return (
    <main className="fixed inset-0 flex items-center justify-center p-4 -mt-6 md:mt-0 overflow-hidden">
      <div className="relative w-full max-w-2xl">
        {/* Background Elements */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <motion.div 
          className="relative text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo and Title */}
          <motion.img
            src="https://www.oefb.at/oefb2/images/1278650591628556536_a80345e52fc58947d7af-1,0-320x320.png"
            alt="FC Patron Logo"
            className="w-16 h-16 md:w-24 md:h-24 object-contain mx-auto mb-4 md:mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <h1 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">Impressum</h1>

          {/* Content */}
          <div className="space-y-6 md:space-y-8 text-sm md:text-base text-gray-400">
            {/* Club Info */}
            <div>
              <p className="text-white font-medium">FC Patron Wien</p>
              <p>Hütteldorferstraße 349/4</p>
              <p>1140 Wien</p>
              <p>Österreich</p>
            </div>

            {/* Contact Info */}
            <div>
              <p className="text-white font-medium mb-2">Kontakt</p>
              <p>
                <a href="tel:+436504185099" className="hover:text-white transition-colors">
                  Telefon: 0650/418 50 99
                </a>
              </p>
              <p>
                <a href="mailto:office@team-patron.com" className="hover:text-white transition-colors">
                  E-Mail: office@team-patron.com
                </a>
              </p>
            </div>

            {/* Representative Info */}
            <div>
              <p className="text-white font-medium mb-2">Vertretungsberechtigter</p>
              <p>Michael Frühwirth (Obmann)</p>
              <p>
                <a href="tel:+436504185099" className="hover:text-white transition-colors">
                  Telefon: 0650/418 50 99
                </a>
              </p>
            </div>

            {/* ZVR Number */}
            <div className="pt-4">
              <p className="text-xs md:text-sm text-gray-500">ZVR-Nummer: 1381487295</p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
} 