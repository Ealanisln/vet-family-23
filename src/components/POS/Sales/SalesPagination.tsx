// src/components/POS/Sales/SalesPagination.tsx
"use client";

import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface SalesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export function SalesPagination({
  currentPage,
  totalPages,
  onPageChange
}: SalesPaginationProps) {
  // Handle page selection
  const handlePageClick = (page: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Generate the page numbers to display
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Add ellipsis if there's a gap after first page
    if (currentPage > 3) {
      pages.push('ellipsis');
    }
    
    // Add pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }
    
    // Add ellipsis if there's a gap before last page
    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }
    
    // Always show last page if it's different from first page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#"
            onClick={(e) => handlePageClick(Math.max(1, currentPage - 1), e)} 
            tabIndex={currentPage === 1 ? -1 : 0}
            aria-disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          />
        </PaginationItem>
        
        {getPageNumbers().map((page, i) => (
          <PaginationItem key={`${page}-${i}`}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink 
                isActive={page === currentPage}
                href="#"
                onClick={(e) => handlePageClick(page as number, e)}
                style={{ cursor: 'pointer' }}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={(e) => handlePageClick(Math.min(totalPages, currentPage + 1), e)}
            tabIndex={currentPage === totalPages ? -1 : 0}
            aria-disabled={currentPage === totalPages}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}