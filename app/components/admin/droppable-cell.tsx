import { useSortable } from '@dnd-kit/sortable';

interface DroppableCellProps {
  id: string;
  children: React.ReactNode;
}

export function DroppableCell({ id, children }: DroppableCellProps) {
  const { setNodeRef, isOver } = useSortable({
    id,
    data: {
      type: 'cell',
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] p-1 border-t border-white/5 rounded transition-colors ${
        isOver ? 'bg-primary/10 border-primary/30' : ''
      }`}
    >
      {children}
    </div>
  );
}
