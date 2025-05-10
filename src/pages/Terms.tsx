
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Terms = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading mb-6">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="lead text-muted-foreground">
              Last updated: May 10, 2025
            </p>
            
            <p className="mt-6">
              Please read these Terms of Service ("Terms") carefully before using MemeVsMeme. 
              By accessing or using our service, you agree to be bound by these Terms.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using MemeVsMeme, you agree to these Terms and our Privacy Policy. 
              If you do not agree to these Terms, you may not access or use our service.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">2. User Accounts</h2>
            <p>
              To access certain features, you may need to create an account. You are responsible 
              for maintaining the confidentiality of your account information and for all activities 
              under your account. You agree to provide accurate and complete information when creating 
              your account and to update such information as needed.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">3. User Content</h2>
            <p>
              Our platform allows you to create and share memes and other content. By submitting 
              content to MemeVsMeme, you grant us a worldwide, non-exclusive, royalty-free license 
              to use, reproduce, modify, adapt, publish, translate, distribute, and display such content.
            </p>
            <p>
              You are solely responsible for your content and the consequences of posting it. You represent 
              and warrant that you own or have the necessary rights to the content you submit, and that 
              your content does not violate the rights of any third party or any applicable law.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">4. Prohibited Content</h2>
            <p>
              You may not use MemeVsMeme to create or share content that:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Is illegal, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, or otherwise objectionable</li>
              <li>Infringes any patent, trademark, trade secret, copyright, or other intellectual property rights</li>
              <li>Contains software viruses or any other code designed to interrupt, destroy, or limit the functionality of computer software or hardware</li>
              <li>Is misleading, deceptive, or contains false information</li>
              <li>Promotes illegal activities or conduct</li>
              <li>Contains personal information about others without their consent</li>
            </ul>
            
            <h2 className="text-xl font-heading mt-8 mb-3">5. Intellectual Property</h2>
            <p>
              MemeVsMeme and its content, features, and functionality are owned by us and are protected 
              by copyright, trademark, and other intellectual property laws. You may not use our trademarks, 
              logos, or other proprietary information without our prior written consent.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">6. Limitation of Liability</h2>
            <p>
              In no event shall MemeVsMeme, its officers, directors, employees, or agents be liable 
              for any indirect, incidental, special, consequential, or punitive damages arising out of 
              or relating to your use of our service.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of significant 
              changes by posting the updated Terms on our platform. Your continued use of MemeVsMeme after 
              such modifications constitutes your acceptance of the revised Terms.
            </p>
            
            <h2 className="text-xl font-heading mt-8 mb-3">8. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which our company is registered, without regard to its conflict of law provisions.
            </p>
            
            <p className="mt-8 text-muted-foreground">
              If you have any questions about these Terms, please contact us at support@memevsmeme.com
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Terms;
