"use client";

import React, { useState } from "react";
import { useSearch } from "@/contexts/SearchContext";
import { ContentCategory, UserLanguage } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Globe as LanguageIcon,
  Tag as CategoryIcon,
  Newspaper as SourceIcon,
  X as ClearIcon,
} from "lucide-react";

const CONTENT_CATEGORIES: Array<{ id: ContentCategory; label: string }> = [
  { id: "brics", label: "BRICS" },
  { id: "indonesia", label: "Indonesia" },
  { id: "bali", label: "Bali" },
];

const LANGUAGES: Array<{ code: UserLanguage; label: string }> = [
  { code: "en", label: "English" },
  { code: "id", label: "Indonesian" },
];

const SOURCES = [
  { id: "brics", label: "BRICS News" },
  { id: "xinhua", label: "Xinhua" },
  { id: "rt", label: "RT" },
  { id: "globaltimes", label: "Global Times" },
  { id: "tass", label: "TASS" },
];

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchFilters({ isOpen, onClose }: SearchFiltersProps) {
  const { currentFilters, updateFilters, clearFilters } = useSearch();

  // Local state to track changes before applying
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const activeFilterCount = Object.values(localFilters)
    .flat()
    .filter(Boolean).length;

  const handleApplyFilters = () => {
    updateFilters(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setLocalFilters(currentFilters);
    clearFilters();
  };

  const updateLocalFilters = (key: keyof typeof localFilters, value: any) => {
    setLocalFilters((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span>Search Filters</span>
            <div className="flex items-center space-x-2">
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount} active</Badge>
              )}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-8 px-2"
                >
                  <ClearIcon className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Accordion type="single" collapsible className="w-full">
          {/* Date Range */}
          <AccordionItem value="date">
            <AccordionTrigger className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Date Range
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <DateRangePicker
                value={localFilters.dateRange}
                onChange={(range: any) =>
                  updateLocalFilters("dateRange", range)
                }
              />
            </AccordionContent>
          </AccordionItem>

          {/* Categories */}
          <AccordionItem value="categories">
            <AccordionTrigger className="flex items-center">
              <CategoryIcon className="h-4 w-4 mr-2" />
              Categories
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {CONTENT_CATEGORIES.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={localFilters.categories?.includes(category.id)}
                    onCheckedChange={(checked: boolean) => {
                      const categories = localFilters.categories || [];
                      updateLocalFilters(
                        "categories",
                        checked
                          ? [...categories, category.id]
                          : categories.filter(
                              (c: ContentCategory) => c !== category.id,
                            ),
                      );
                    }}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Languages */}
          <AccordionItem value="languages">
            <AccordionTrigger className="flex items-center">
              <LanguageIcon className="h-4 w-4 mr-2" />
              Languages
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang.code}`}
                    checked={localFilters.languages?.includes(lang.code)}
                    onCheckedChange={(checked: boolean) => {
                      const languages = localFilters.languages || [];
                      updateLocalFilters(
                        "languages",
                        checked
                          ? [...languages, lang.code]
                          : languages.filter(
                              (l: UserLanguage) => l !== lang.code,
                            ),
                      );
                    }}
                  />
                  <label
                    htmlFor={`lang-${lang.code}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {lang.label}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Sources */}
          <AccordionItem value="sources">
            <AccordionTrigger className="flex items-center">
              <SourceIcon className="h-4 w-4 mr-2" />
              Sources
            </AccordionTrigger>
            <AccordionContent className="space-y-2">
              {SOURCES.map((source) => (
                <div key={source.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`source-${source.id}`}
                    checked={localFilters.sources?.includes(source.id)}
                    onCheckedChange={(checked: boolean) => {
                      const sources = localFilters.sources || [];
                      updateLocalFilters(
                        "sources",
                        checked
                          ? [...sources, source.id]
                          : sources.filter((s: string) => s !== source.id),
                      );
                    }}
                  />
                  <label
                    htmlFor={`source-${source.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {source.label}
                  </label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
