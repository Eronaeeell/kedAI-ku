'use client';

import { PostToLinkedIn } from '@/components/post-to-linkedin';
import { Card } from '@/components/ui/card';

export default function TestLinkedInPage() {
  const handlePostSuccess = (postId: string) => {
    console.log('LinkedIn post successful!', postId);
  };

  const handlePostError = (error: string) => {
    console.error('LinkedIn post failed:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            LinkedIn Private Posting Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Test the LinkedIn posting functionality - privately share text and images with your connections
          </p>
        </div>

        <Card className="p-8">
          <PostToLinkedIn
            initialText="🚀 Testing our new LinkedIn integration! This post was created using our campaign generator. #AI #Marketing #Innovation"
            onPostSuccess={handlePostSuccess}
            onPostError={handlePostError}
          />
        </Card>

        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
            📋 Setup Instructions
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div>
              <strong>1. Authorization Required:</strong>
              <p>Click "Authorize App" to connect your LinkedIn account</p>
            </div>
            <div>
              <strong>2. LinkedIn Developer Setup:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Go to <a href="https://developer.linkedin.com/" target="_blank" rel="noopener noreferrer" className="underline">LinkedIn Developer Console</a></li>
                <li>Create a new app and configure OAuth 2.0 settings</li>
                <li>Add redirect URI: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">http://localhost:3000/api/linkedin-callback</code></li>
                <li>Request access to the "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect" products</li>
              </ul>
            </div>
            <div>
              <strong>3. Environment Variables:</strong>
              <pre className="bg-blue-100 dark:bg-blue-900 p-2 rounded text-xs overflow-x-auto">
{`LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret  
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/linkedin-callback`}
              </pre>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <h3 className="text-lg font-semibold mb-4 text-amber-900 dark:text-amber-100">
            ⚠️ Important Notes
          </h3>
          <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
            <p>• LinkedIn access tokens last up to 60 days and cannot be refreshed</p>
            <p>• You'll need to re-authorize when the token expires</p>
            <p>• 🔒 Posts are shared privately with your CONNECTIONS only</p>
            <p>• Maximum 3000 characters per post</p>
            <p>• Image uploads are supported (JPEG, PNG, GIF)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}