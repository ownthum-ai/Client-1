'use client'

import React from 'react'
import { Instrument_Serif } from "next/font/google"

const instrument = Instrument_Serif({ 
  weight: "400", 
  style: ["normal"], 
  subsets: ["latin"],
})

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className={instrument.className} style={{ margin: 0, backgroundColor: '#111110', color: 'white', display: 'flex', alignItems: 'center', minHeight: '100vh', justifyContent: 'center', textAlign: 'center', fontFamily: 'serif' }}>
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px', textTransform: 'uppercase' }}>Critical System Failure</h1>
          <p style={{ opacity: 0.5, fontSize: '14px', letterSpacing: '2px', marginBottom: '40px' }}>ROOT_LAYOUT_NOMINAL_STATE_LOST</p>
          <button 
            onClick={() => reset()}
            style={{ padding: '15px 30px', backgroundColor: '#C9963B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase' }}
          >
            Attempt System Re-Initialization
          </button>
        </div>
      </body>
    </html>
  )
}
