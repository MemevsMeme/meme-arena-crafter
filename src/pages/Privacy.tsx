
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Privacy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading mb-6">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="lead text-muted-foreground">
              Last updated: May 10, 2025
            </p>
            
            <p className="mt-6">
              At MemeVsMeme, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our platform.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">1. Information We Collect</h2>
            <p>
              <strong>Personal Information:</strong> When you create an account, we collect your email address, 
              username, and password. Optionally, you may provide additional profile information.
            </p>
            <p>
              <strong>User Content:</strong> We collect the memes, captions, and other content you create 
              or upload to our platform.
            </p>
            <p>
              <strong>Usage Data:</strong> We collect information about how you interact with our platform, 
              including the pages you visit, the features you use, and the time spent on our platform.
            </p>
            <p>
              <strong>Device Information:</strong> We collect information about your device, including your 
              IP address, browser type, operating system, and device identifiers.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide, maintain, and improve our platform</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Develop new products and services</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our platform</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            </ul>
            
            <h2 className="text-xl font-heading mt-8 mb-3">3. Sharing Your Information</h2>
            <p>
              We may share your information with:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Other users, when you create or share content, participate in battles, or interact with other users</li>
              <li>Service providers who perform services on our behalf, such as hosting, data analysis, and customer service</li>
              <li>Legal authorities, if required by law or to protect our rights</li>
              <li>Business partners, in connection with a merger, acquisition, or sale of all or a portion of our assets</li>
            </ul>
            
            <h2 className="text-xl font-heading mt-8 mb-3">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your 
              personal information. However, no method of transmission over the Internet or method of electronic 
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">5. Your Choices</h2>
            <p>
              <strong>Account Information:</strong> You may update, correct, or delete your account information 
              at any time by logging into your account and modifying your profile.
            </p>
            <p>
              <strong>Cookies:</strong> Most web browsers are set to accept cookies by default. You can usually 
              choose to set your browser to remove or reject cookies.
            </p>
            <p>
              <strong>Marketing Communications:</strong> You may opt out of receiving promotional communications 
              from us by following the instructions in those communications.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">6. Children's Privacy</h2>
            <p>
              Our platform is not intended for children under the age of 13, and we do not knowingly collect 
              personal information from children under 13. If we learn that we have collected personal information 
              from a child under 13, we will delete that information.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">7. Changes to this Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify 
              you by posting the updated Privacy Policy on our platform or by other means.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@memevsmeme.com
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
