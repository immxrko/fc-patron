'use client'

import { motion } from 'framer-motion'
import { socialIcons } from '../../lib/social-icons'

export default function SocialLinks() {
  const platforms = ['youtube', 'instagram', 'tiktok'] as const
  
  return (
    <motion.div 
      className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
    >
      {platforms.map((platform) => (
        <a 
          key={platform}
          href={`https://${platform}.com/@fcpatron`}
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center justify-center md:justify-start gap-3 px-5 py-3 bg-black/20 
            backdrop-blur-sm rounded-xl border border-white/5 transition-all duration-300 
            hover:bg-black/30 hover:border-red-500/20 w-full md:w-auto"
        >
          <div className="w-5 h-5 text-red-400" dangerouslySetInnerHTML={{ __html: socialIcons[platform] }} />
          <span className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>
        </a>
      ))}
    </motion.div>
  )
} 