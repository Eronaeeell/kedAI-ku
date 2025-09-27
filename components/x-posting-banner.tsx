'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Twitter, Sparkles, X } from 'lucide-react';

interface XPostingBannerProps {
  show: boolean;
  onDismiss: () => void;
}

export function XPostingBanner({ show, onDismiss }: XPostingBannerProps) {
  if (!show) return null;

  return (
    <Card className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Twitter className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">X Posting Ready!</h3>
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                NEW
              </Badge>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Generate your campaign image, then post directly to X with AI-generated captions!
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}