'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function TestLinkedInImagePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [text, setText] = useState('Test post with image from KedAI-ku! 🚀');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState<'upload' | 'generated'>('upload');
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState('/generated-images/campaign-poster-1758958163474-sjsfzl.jpg');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sample generated images for testing
  const generatedImages = [
    '/generated-images/campaign-poster-1758958163474-sjsfzl.jpg',
    '/generated-images/campaign-poster-1758958728004-oxgl2g.jpg',
    '/generated-images/campaign-poster-1758959708647-cue9hb.jpg',
    '/generated-images/test-image.jpg'
  ];

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const testImageProcessing = async () => {
    const testImageUrl = testMode === 'upload' ? imagePreview : selectedGeneratedImage;
    
    if (!testImageUrl) {
      setTestResult({ error: 'Please select an image first' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/test-linkedin-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          text: text
        })
      });

      const result = await response.json();
      setTestResult({ ...result, testMode, testImageUrl });
    } catch (error) {
      setTestResult({ error: 'Failed to test image processing' });
    } finally {
      setIsLoading(false);
    }
  };

  const testActualPost = async () => {
    const testImageUrl = testMode === 'upload' ? imagePreview : selectedGeneratedImage;
    
    if (!testImageUrl) {
      setTestResult({ error: 'Please select an image first' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/post-linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          text: text
        })
      });

      const result = await response.json();
      setTestResult({ 
        actualPost: true, 
        success: response.ok,
        testMode,
        testImageUrl,
        ...result 
      });
    } catch (error) {
      setTestResult({ 
        actualPost: true, 
        error: 'Failed to post to LinkedIn' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">LinkedIn Image Post Testing</h1>
      
      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">1. Select Image & Text</h2>
          
          <div className="space-y-4">
            {/* Test Mode Selector */}
            <div className="flex gap-4 mb-4">
              <Button
                type="button"
                variant={testMode === 'upload' ? 'default' : 'outline'}
                onClick={() => setTestMode('upload')}
              >
                Upload Image
              </Button>
              <Button
                type="button"
                variant={testMode === 'generated' ? 'default' : 'outline'}
                onClick={() => setTestMode('generated')}
              >
                Use Generated Image
              </Button>
            </div>
            
            {testMode === 'upload' ? (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedImage ? 'Change Image' : 'Select Image'}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Select Generated Image:</label>
                <select
                  value={selectedGeneratedImage}
                  onChange={(e) => setSelectedGeneratedImage(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  {generatedImages.map((img) => (
                    <option key={img} value={img}>
                      {img.split('/').pop()}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Image Preview */}
            {((testMode === 'upload' && imagePreview) || (testMode === 'generated' && selectedGeneratedImage)) && (
              <div>
                <img
                  src={testMode === 'upload' ? imagePreview : selectedGeneratedImage}
                  alt="Preview"
                  className="max-w-md h-auto rounded-lg border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg'; // Fallback image
                  }}
                />
                <p className="text-sm text-gray-600 mt-2">
                  Mode: {testMode === 'upload' ? 'Uploaded file' : 'Generated image'}
                  {testMode === 'generated' && ` (${selectedGeneratedImage})`}
                </p>
              </div>
            )}
            
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Post text..."
              className="min-h-[100px]"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">2. Test Functions</h2>
          
          <div className="flex gap-4">
            <Button
              onClick={testImageProcessing}
              disabled={(!imagePreview && testMode === 'upload') || (!selectedGeneratedImage && testMode === 'generated') || isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Image Processing'}
            </Button>
            
            <Button
              onClick={testActualPost}
              disabled={(!imagePreview && testMode === 'upload') || (!selectedGeneratedImage && testMode === 'generated') || isLoading}
              variant="default"
            >
              {isLoading ? 'Posting...' : 'Test Actual Post to LinkedIn'}
            </Button>
          </div>
        </Card>

        {testResult && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}