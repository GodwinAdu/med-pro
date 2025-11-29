"use client"

import { useState, useEffect } from "react"
import { Search, Clock, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SearchResult {
  id: string
  title: string
  type: 'drug' | 'condition' | 'prescription'
  description?: string
  category?: string
}

interface SmartSearchProps {
  onSelect: (result: SearchResult) => void
  placeholder?: string
  recentSearches?: SearchResult[]
}

export function SmartSearch({ onSelect, placeholder = "Search drugs, conditions...", recentSearches = [] }: SmartSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (query.length > 2) {
      // Simulate smart search with fuzzy matching
      const mockResults: SearchResult[] = [
        { id: '1', title: 'Paracetamol', type: 'drug', description: 'Pain reliever and fever reducer', category: 'Analgesic' },
        { id: '2', title: 'Hypertension', type: 'condition', description: 'High blood pressure condition' },
        { id: '3', title: 'Diabetes Management', type: 'prescription', description: 'Standard diabetes treatment protocol' },
      ].filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      )
      
      setResults(mockResults)
      setShowResults(true)
    } else {
      setResults([])
      setShowResults(false)
    }
  }, [query])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          onFocus={() => setShowResults(query.length > 2 || recentSearches.length > 0)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>

      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            {query.length <= 2 && recentSearches.length > 0 && (
              <>
                <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </div>
                {recentSearches.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </>
            )}

            {results.length > 0 && (
              <>
                {query.length > 2 && (
                  <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground border-t">
                    <Search className="w-4 h-4" />
                    Search Results
                  </div>
                )}
                {results.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {item.category && (
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}