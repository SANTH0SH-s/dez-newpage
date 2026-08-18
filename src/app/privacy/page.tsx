import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy | Dezprox",
  description: "Privacy policy for the estimation platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      <div className="max-w-3xl mx-auto px-4 py-12 w-full flex-grow">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-dezprox-primary hover:text-dezprox-accent mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Estimator
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-dezprox-accent/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-dezprox-accent" />
            </div>
            <h1 className="text-3xl font-black text-dezprox-primary tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">
            Last updated: [DATE]
          </p>
          
          <div className="prose prose-sm md:prose-base prose-gray max-w-none text-dezprox-text/80 space-y-8">
            
            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Information We May Collect</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and contact details</li>
                <li>Email address and phone number</li>
                <li>Company information</li>
                <li>Project requirements and questionnaire responses</li>
                <li>Estimate and enquiry information</li>
                <li>Information voluntarily provided through the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">How We Use Your Information</h2>
              <p className="mb-2">We use the collected information to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Generate and manage project estimates</li>
                <li>Respond to enquiries</li>
                <li>Understand project requirements</li>
                <li>Communicate regarding requests</li>
                <li>Maintain and improve services</li>
                <li>Maintain appropriate security and operational records</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Data Protection</h2>
              <p>
                We take reasonable technical and organizational measures to protect your information from unauthorized access, alteration, or disclosure. Information submitted through the platform is transmitted through secure application channels and processed via authorized backend systems.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Data Sharing</h2>
              <p>
                We do not sell your personal information. However, information may be processed by service providers required to operate the platform where applicable. We share information only to the extent necessary to deliver our services, comply with legal obligations, or protect our operational rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Your Choices</h2>
              <p>
                You may request access to, correction, or deletion of your personal information stored on our platform. Please contact us using the details below to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Policy Updates</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. The updated version will be indicated by an updated &quot;Last updated&quot; date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-black text-dezprox-primary mb-3">Contact</h2>
              <p>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us at: <br />
                <span className="font-mono text-dezprox-accent font-bold">info@dezprox.com</span>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
