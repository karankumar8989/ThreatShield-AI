import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Button from './Button';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        icon={FiChevronLeft}
      >
        Prev
      </Button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`
            w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer
            ${page === currentPage
              ? 'bg-primary text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}
          `}
        >
          {page}
        </button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        icon={FiChevronRight}
      >
        Next
      </Button>
    </div>
  );
}
