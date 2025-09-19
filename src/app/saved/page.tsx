'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Tag, 
  Download,
  Upload,
  Trash2,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff
} from 'lucide-react';
import { saveForLaterService, SavedArticle, ReadingStats } from '@/lib/save-for-later';
import { toast } from 'sonner';
import Link from 'next/link';

type ViewMode = 'grid' | 'list';
type SortField = 'savedAt' | 'title' | 'category' | 'readStatus' | 'priority' | 'estimatedReadTime';
type SortOrder = 'asc' | 'desc';

export default function SavedArticlesPage() {
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<SavedArticle[]>([]);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('savedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedArticles();
  }, []);

  useEffect(() => {
    filterAndSortArticles();
  }, [savedArticles, searchQuery, selectedStatus, selectedCategory, selectedPriority, selectedTags, sortField, sortOrder]);

  const loadSavedArticles = () => {
    setIsLoading(true);
    try {
      const articles = saveForLaterService.getSavedArticles();
      const stats = saveForLaterService.getReadingStats();
      setSavedArticles(articles);
      setReadingStats(stats);
    } catch (error) {
      console.error('Failed to load saved articles:', error);
      toast.error('Failed to load reading list');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortArticles = () => {
    const filtered = savedArticles.filter(article => {
      // Search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          article.title.toLowerCase().includes(searchLower) ||
          article.description.toLowerCase().includes(searchLower) ||
          article.notes.toLowerCase().includes(searchLower) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && article.readStatus !== selectedStatus) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && article.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && article.priority !== selectedPriority) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasMatchingTag = selectedTags.some(tag => article.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort articles
    const sortedFiltered = [...filtered].sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      switch (sortField) {
        case 'savedAt':
          aValue = new Date(a.savedAt).getTime();
          bValue = new Date(b.savedAt).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'readStatus':
          const statusOrder = { 'unread': 0, 'reading': 1, 'read': 2 };
          aValue = statusOrder[a.readStatus];
          bValue = statusOrder[b.readStatus];
          break;
        case 'priority':
          const priorityOrder = { 'high': 0, 'normal': 1, 'low': 2 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'estimatedReadTime':
          aValue = a.estimatedReadTime;
          bValue = b.estimatedReadTime;
          break;
        default:
          aValue = a.savedAt;
          bValue = b.savedAt;
      }

      if ((aValue as any) < (bValue as any)) return sortOrder === 'asc' ? -1 : 1;
      if ((aValue as any) > (bValue as any)) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredArticles(sortedFiltered);
  };

  const handleRemoveArticle = (articleId: string) => {
    const removed = saveForLaterService.removeArticle(articleId);
    if (removed) {
      loadSavedArticles();
      toast.success('Article removed from reading list');
    }
  };

  const handleUpdateReadingStatus = (articleId: string, status: 'unread' | 'reading' | 'read', progress: number = 0) => {
    saveForLaterService.updateReadingProgress(articleId, status, progress);
    loadSavedArticles();
    toast.success(`Article marked as ${status}`);
  };

  const handleExportArticles = () => {
    try {
      const exportData = saveForLaterService.exportSavedArticles();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bali-report-saved-articles-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Reading list exported successfully');
    } catch (error) {
      console.error('Failed to export articles:', error);
      toast.error('Failed to export reading list');
    }
  };

  const handleImportArticles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = e.target?.result as string;
        const success = saveForLaterService.importSavedArticles(importData);
        if (success) {
          loadSavedArticles();
          toast.success('Reading list imported successfully');
        } else {
          toast.error('Failed to import reading list');
        }
      } catch (error) {
        console.error('Failed to import articles:', error);
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved articles? This action cannot be undone.')) {
      saveForLaterService.clearAllSavedArticles();
      loadSavedArticles();
      toast.success('All saved articles cleared');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getAllTags = () => {
    const allTags = new Set<string>();
    savedArticles.forEach(article => {
      article.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read': return 'text-green-600 bg-green-100';
      case 'reading': return 'text-yellow-600 bg-yellow-100';
      case 'unread': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your reading list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reading List</h1>
            <p className="text-gray-600 mt-2">
              Your saved articles for offline reading
            </p>
          </div>

          {/* Stats Cards */}
          {readingStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 lg:mt-0">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">{readingStats.totalSaved}</div>
                <div className="text-sm text-gray-600">Total Saved</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-green-600">{readingStats.totalRead}</div>
                <div className="text-sm text-gray-600">Read</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-yellow-600">{readingStats.totalUnread}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="text-2xl font-bold text-purple-600">{readingStats.averageReadTime}</div>
                <div className="text-sm text-gray-600">Avg. Read Time</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search articles, tags, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Filter size={16} />
                {showFilters ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              
              <button
                onClick={handleExportArticles}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                title="Export reading list"
              >
                <Download size={16} />
              </button>
              
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                <Upload size={16} />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportArticles}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
                title="Clear all articles"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Status</option>
                    <option value="unread">Unread</option>
                    <option value="reading">Reading</option>
                    <option value="read">Read</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Categories</option>
                    <option value="BRICS">BRICS</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Bali">Bali</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="flex-1 p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="savedAt">Date Saved</option>
                      <option value="title">Title</option>
                      <option value="category">Category</option>
                      <option value="readStatus">Status</option>
                      <option value="priority">Priority</option>
                      <option value="estimatedReadTime">Read Time</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags Filter */}
              {getAllTags().length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {getAllTags().map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`
                          px-3 py-1 text-sm rounded-full border transition-colors
                          ${selectedTags.includes(tag)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }
                        `}
                      >
                        <Tag size={12} className="inline mr-1" />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {savedArticles.length === 0 ? 'No saved articles yet' : 'No articles match your filters'}
            </h3>
            <p className="text-gray-600">
              {savedArticles.length === 0 
                ? 'Start building your reading list by saving articles from the main page.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {savedArticles.length === 0 && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Articles
              </Link>
            )}
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }
          `}>
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className={`
                  bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow
                  ${viewMode === 'grid' ? 'p-6' : 'p-4 flex gap-4'}
                `}
              >
                {viewMode === 'grid' ? (
                  <div>
                    {/* Grid View */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(article.readStatus)}`}>
                          {article.readStatus}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(article.priority)}`}>
                          {article.priority}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveArticle(article.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove from reading list"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      <Link href={article.link} target="_blank" className="hover:text-blue-600 transition-colors">
                        {article.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {article.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {article.estimatedReadTime} min read
                      </span>
                      <span className="text-blue-600">{article.category}</span>
                    </div>

                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {article.notes && (
                      <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-gray-700">
                        <strong>Notes:</strong> {article.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateReadingStatus(article.id, 'unread')}
                          className={`px-2 py-1 text-xs rounded ${article.readStatus === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          Unread
                        </button>
                        <button
                          onClick={() => handleUpdateReadingStatus(article.id, 'reading')}
                          className={`px-2 py-1 text-xs rounded ${article.readStatus === 'reading' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          Reading
                        </button>
                        <button
                          onClick={() => handleUpdateReadingStatus(article.id, 'read', 100)}
                          className={`px-2 py-1 text-xs rounded ${article.readStatus === 'read' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                          Read
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        Saved {new Date(article.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    {/* List View */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        <Link href={article.link} target="_blank" className="hover:text-blue-600 transition-colors">
                          {article.title}
                        </Link>
                      </h3>
                      <button
                        onClick={() => handleRemoveArticle(article.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                        title="Remove from reading list"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(article.readStatus)}`}>
                        {article.readStatus}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(article.priority)}`}>
                        {article.priority}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {article.estimatedReadTime} min
                      </span>
                      <span className="text-blue-600">{article.category}</span>
                      <span>Saved {new Date(article.savedAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {article.description}
                    </p>

                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}