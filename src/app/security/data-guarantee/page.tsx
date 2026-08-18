import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Secure Data Guarantee | Dezprox",
  description: "Information about how we handle and protect your data throughout the estimation process.",
};

export default function SecureDataGuaranteePage() {
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
              <ShieldCheck className="w-5 h-5 text-dezprox-accent" />
            </div>
            <h1 className="text-3xl font-black text-dezprox-primary tracking-tight">Secure Data Guarantee</h1>
          </div>
          
          <div className="prose prose-sm md:prose-base prose-gray max-w-none text-dezprox-text/80 space-y-6">
            <p className="font-medium text-dezprox-primary">
              Your data is handled with care and protected throughout the estimation process.
            </p>
            
            <p>
              We collect only the information required to provide estimates, respond to enquiries, and improve our services. Information submitted through the platform is transmitted through secure application channels and is processed through our authorized backend systems.
            </p>
            
            <p>
              We do not intentionally expose sensitive application credentials or authentication information through the client-side application. Access to administrative functionality is protected through authentication and authorization controls.
            </p>
            
            <p>
              We retain information only for legitimate business and operational purposes and take reasonable technical and organizational measures to protect it from unauthorized access, alteration, or disclosure.
            </p>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 italic">
              Note: This page describes current platform security practices and should be reviewed by the company&apos;s legal/security team before being treated as a formal security certification or guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
