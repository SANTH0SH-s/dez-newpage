import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Platform Security | Dezprox",
  description: "Security measures and practices implemented in our estimation platform.",
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <div className="max-w-3xl mx-auto px-4 py-12 w-full flex-grow">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-dezprox-primary hover:text-dezprox-accent mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Estimator
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-dezprox-accent/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-dezprox-accent" />
            </div>
            <h1 className="text-3xl font-black text-dezprox-primary tracking-tight">Platform Security</h1>
          </div>
          
          <div className="prose prose-sm md:prose-base prose-gray max-w-none text-dezprox-text/80 space-y-8">
            
            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Our Approach to Platform Security</h2>
              <p>
                We believe in building secure and reliable applications from the ground up. Our platform security approach emphasizes protecting both the integrity of our internal systems and the information submitted by our users during the estimation process.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Current Security Measures</h2>
              <p className="mb-2">We have implemented the following technical and operational controls:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Authenticated administrative access</li>
                <li>Server-side API validation</li>
                <li>Server-side pricing calculations</li>
                <li>Protected backend API routes</li>
                <li>Database access restricted through the backend application layer</li>
                <li>Security-related HTTP response headers</li>
                <li>Content Security Policy (CSP)</li>
                <li>Authentication and authorization controls for internal access</li>
                <li>Environment-based handling of sensitive credentials</li>
                <li>Row-level security where configured</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Responsible Disclosure</h2>
              <p>
                If you believe you have discovered a security vulnerability in our platform, we ask that you responsibly disclose it to us immediately. We will investigate all legitimate reports and strive to fix any verified vulnerabilities promptly. Please do not publicly disclose the vulnerability until we have had an opportunity to address it.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Security Contact</h2>
              <p>
                To report a vulnerability or for questions regarding our platform security practices, please contact our security team at: <br />
                <span className="font-mono text-dezprox-accent font-bold">info@dezprox.com</span>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
