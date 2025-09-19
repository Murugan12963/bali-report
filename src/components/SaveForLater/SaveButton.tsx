'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2, Tag, ArrowUp } from 'lucide-react';
import { Article } from '@/lib/rss-parser';
import { saveForLaterService } from '@/lib/save-for-later';
import { toast } from 'sonner';

interface SaveButtonProps {
  article: Article;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

export function SaveButton({ 
  article, 
  size = 'md', 
  showText = false, 
  showQuickActions = false,
  className = '' 
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickSave, setShowQuickSave] = useState(false);
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'normal' | 'high'>('normal');

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'p-1',
      icon: 12,
      text: 'text-xs',
    },
    md: {
      button: 'p-2',
      icon: 16,
      text: 'text-sm',
    },
    lg: {
      button: 'p-3',
      icon: 20,
      text: 'text-base',
    },
  };

  const config = sizeConfig[size];

  useEffect(() => {
    setIsSaved(saveForLaterService.isArticleSaved(article.id));
  }, [article.id]);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      if (isSaved) {
        // Remove from saved articles
        const removed = saveForLaterService.removeArticle(article.id);
        if (removed) {
          setIsSaved(false);
          toast.success('Article removed from reading list', {
            description: article.title,
            action: {
              label: 'Undo',
              onClick: () => handleSave(), // Re-save article
            },
          });
        }
      } else {
        // Save article
        await saveForLaterService.saveArticle(article, quickTags, selectedPriority);
        setIsSaved(true);
        toast.success('Article saved for later reading', {
          description: `${article.title} - ${saveForLaterService.getSavedArticles().find(a => a.id === article.id)?.estimatedReadTime || 1} min read`,
          action: {
            label: 'View List',
            onClick: () => window.open('/saved', '_blank'),
          },
        });
      }
    } catch (error) {
      console.error('Failed to toggle save state:', error);
      toast.error('Failed to save article', {
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
      setShowQuickSave(false);
      // Reset quick save options
      setQuickTags([]);
      setSelectedPriority('normal');
    }
  };

  const handleQuickSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (showQuickActions && !isSaved) {
      setShowQuickSave(!showQuickSave);
    } else {
      handleSave();
    }
  };

  const addQuickTag = (tag: string) => {
    if (!quickTags.includes(tag)) {
      setQuickTags([...quickTags, tag]);
    } else {
      setQuickTags(quickTags.filter(t => t !== tag));
    }
  };

  const commonTags = ['Important', 'Investment', 'Culture', 'Travel', 'Business', 'Politics'];

  const buttonContent = (
    <div className="flex items-center gap-1">
      {isLoading ? (
        <Loader2 className="animate-spin" size={config.icon} />
      ) : isSaved ? (
        <BookmarkCheck size={config.icon} className="text-blue-600" />
      ) : (
        <Bookmark size={config.icon} />
      )}
      {showText && (
        <span className={config.text}>
          {isSaved ? 'Saved' : 'Save'}
        </span>
      )}
    </div>
  );

  return (
    <div className="relative">
      <button
        onClick={handleQuickSave}
        disabled={isLoading}
        className={`
          ${config.button}
          ${className}
          ${isSaved 
            ? 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100' 
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
          }
          rounded-md transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        `}
        title={isSaved ? 'Remove from reading list' : 'Save for later reading'}
      >
        {buttonContent}
      </button>

      {/* Quick Save Options Modal */}
      {showQuickSave && showQuickActions && !isSaved && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Priority Level</h4>
              <div className="flex gap-2">
                {(['low', 'normal', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority)}
                    className={`
                      px-3 py-1 text-xs rounded-full border transition-colors
                      ${selectedPriority === priority
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1">
                      <ArrowUp size={12} />
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Tags</h4>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addQuickTag(tag)}
                    className={`
                      px-2 py-1 text-xs rounded-full border transition-colors
                      ${quickTags.includes(tag)
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1">
                      <Tag size={10} />
                      {tag}
                    </div>
                  </button>
                ))}
              </div>
              {quickTags.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  Selected: {quickTags.join(', ')}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Save Article
              </button>
              <button
                onClick={() => setShowQuickSave(false)}
                className="px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showQuickSave && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowQuickSave(false)}
        />
      )}
    </div>
  );
}

export default SaveButton;