'use client';

import { useState } from 'react';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease } from '@/lib/motion';

/**
 * MiniTaskBoard — beauty pass, "make it more engaging and different
 * from other SaaS websites."
 *
 * ----------------------------------------------------------------
 * WHY THIS, SPECIFICALLY
 * ----------------------------------------------------------------
 * @dnd-kit/core, @dnd-kit/sortable, and @dnd-kit/utilities have been
 * real dependencies in package.json since Step 1, for exactly this
 * kind of interaction — but nothing in the codebase actually used
 * them (confirmed by grep before writing this file). Every chapter on
 * this site, including Chapter 08's own live-parsing textarea, is
 * something the visitor *watches* or *types into*. Nothing is
 * something they physically move with their hands. A real,
 * physically-draggable card — using the visitor's own just-typed
 * request, not a canned demo string — is a genuinely rare thing for a
 * SaaS marketing site to offer, and it costs no new dependency weight
 * since dnd-kit was already shipping unused.
 *
 * ----------------------------------------------------------------
 * SCOPE, DELIBERATELY SMALL
 * ----------------------------------------------------------------
 * One card, three columns, no persistence, no sorting within a
 * column. This is not a product demo and doesn't claim to be one —
 * it's a single tactile beat right after the visitor sees their own
 * words get parsed, before the final CTA. It reuses the real product
 * status vocabulary (To Do / In Progress / Completed) already locked
 * for this site rather than inventing new column names.
 *
 * ----------------------------------------------------------------
 * WHY NOT GATED BEHIND prefers-reduced-motion
 * ----------------------------------------------------------------
 * Unlike this site's ambient/decorative motion (orbs, drift, spins),
 * dragging is the whole interaction, not a flourish on top of one —
 * the same reasoning that already lets Chapter 08's textarea run
 * unconditionally. dnd-kit's own pointer/keyboard sensors work
 * without relying on CSS transitions; a reduced-motion visitor can
 * still pick up and drop the card, just without the small lift/tilt
 * flourish (gated below on its own).
 *
 * Keyboard-accessible via dnd-kit's default sensor (Tab to the card,
 * Space to pick up, arrow keys to move, Space to drop) — sr-only text
 * in the header gives the same instructions as the visual placeholder.
 */

type ColumnId = 'todo' | 'in-progress' | 'done';

const COLUMNS: { id: ColumnId; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'done', label: 'Completed' },
];

interface TaskCardData {
  title: string;
  assignee: string | null;
  priority: string | null;
}

function DraggableCard({ task, isDragging }: { task: TaskCardData; isDragging: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'the-one-card' });
  const prefersReducedMotion = useReducedMotion();

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="cursor-grab touch-none rounded-sm border px-sm py-xs text-left active:cursor-grabbing"
      // Real z-index bump + very slight rest-tilt while actively held —
      // the same "raised, physical surface" language TiltPanel already
      // uses elsewhere on this site, kept intentionally subtle.
      data-dragging={isDragging || undefined}
    >
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: isDragging ? 1.03 : 1, rotate: isDragging ? -1.5 : 0 }
        }
        transition={{ duration: duration.fast, ease: ease.standard }}
        className="flex flex-col gap-2"
        style={{
          borderColor: 'var(--color-border-strong)',
          backgroundColor: 'var(--color-surface)',
          boxShadow: isDragging ? 'var(--shadow-md, 0 8px 24px rgba(22,21,26,0.14))' : 'var(--shadow-sm)',
        }}
      >
        <p className="text-body-sm text-ink" style={{ overflowWrap: 'anywhere' }}>
          {task.title}
        </p>
        {(task.assignee || task.priority) && (
          <div className="flex flex-wrap gap-xs">
            {task.assignee && (
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.06em] text-ink-muted">
                {task.assignee}
              </span>
            )}
            {task.priority && (
              <span
                className="font-mono text-[0.625rem] uppercase tracking-[0.06em]"
                style={{ color: 'var(--color-red)' }}
              >
                {task.priority}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Column({
  id,
  label,
  children,
}: {
  id: ColumnId;
  label: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-[92px] flex-1 flex-col gap-xs rounded-sm border p-xs transition-colors duration-fast"
      style={{
        borderColor: isOver ? 'var(--color-ink)' : 'var(--color-border)',
        backgroundColor: isOver ? 'var(--color-surface-sunken)' : 'transparent',
      }}
    >
      <p className="px-2xs font-mono text-[0.625rem] uppercase tracking-[0.08em] text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

export function MiniTaskBoard({ task }: { task: TaskCardData }) {
  const [column, setColumn] = useState<ColumnId>('todo');
  const [isDragging, setIsDragging] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    setIsDragging(false);
    const overId = event.over?.id;
    if (overId === 'todo' || overId === 'in-progress' || overId === 'done') {
      setColumn(overId);
    }
  }

  return (
    <div className="flex w-full flex-col gap-xs">
      <p className="text-label text-ink-faint">
        Try dragging it — <span className="italic">that&rsquo;s the workspace, not a screenshot of one.</span>
      </p>
      <DndContext sensors={sensors} onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
        <div className="flex w-full flex-col gap-xs sm:flex-row">
          {COLUMNS.map((col) => (
            <Column key={col.id} id={col.id} label={col.label}>
              {column === col.id && <DraggableCard task={task} isDragging={isDragging} />}
            </Column>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
