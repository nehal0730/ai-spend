import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()
  
  return (
    <footer className="border-t border-surface bg-app-gradient py-12 text-primary md:py-16 lg:py-20">
      <div className="container px-4 md:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl md:text-2xl font-black mb-4 inline-block transition-colors text-primary hover:text-cyan-600 dark:hover:text-cyan-300">
              AI Spend
            </Link>
            <p className="text-sm text-soft leading-relaxed dark:text-slate-300">
              Audit and optimize your AI spending with confidence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-bold text-primary">Product</h3>
            <ul className="space-y-3 text-sm text-soft dark:text-slate-300">
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Features</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Pricing</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Security</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Roadmap</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-bold text-primary">Company</h3>
            <ul className="space-y-3 text-sm text-soft dark:text-slate-300">
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Blog</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">About</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Careers</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-bold text-primary">Legal</h3>
            <ul className="space-y-3 text-sm text-soft dark:text-slate-300">
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Privacy</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Terms</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Compliance</a></li>
              <li><a href="#" className="transition-colors hover:text-cyan-600 dark:hover:text-cyan-300">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="pt-8 md:pt-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-soft dark:text-slate-300">
              © {year} AI Spend. All rights reserved. Made by engineers, for engineers.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-soft transition-colors hover:scale-110 hover:text-cyan-600 duration-300 dark:text-slate-300 dark:hover:text-cyan-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-soft transition-colors hover:scale-110 hover:text-cyan-600 duration-300 dark:text-slate-300 dark:hover:text-cyan-300">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-soft transition-colors hover:scale-110 hover:text-cyan-600 duration-300 dark:text-slate-300 dark:hover:text-cyan-300">
                <Github size={20} />
              </a>
              <a href="#" className="text-soft transition-colors hover:scale-110 hover:text-cyan-600 duration-300 dark:text-slate-300 dark:hover:text-cyan-300">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
