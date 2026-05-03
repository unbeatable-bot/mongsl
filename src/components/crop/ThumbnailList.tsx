import React from 'react';
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface ImageFile { id: string; file: File; previewUrl: string; originalWidth?: number; originalHeight?: number; }

interface ThumbnailProps { image: ImageFile; isActive: boolean; onClick: () => void; }

function SortableThumbnail({ image, isActive, onClick }: ThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  return (
    <img ref={setNodeRef} style={style} {...attributes} {...listeners} src={image.previewUrl} alt="thumbnail"
      className={`w-full h-auto max-md:w-auto max-md:h-full shrink-0 cursor-pointer border-2 rounded-[4px] object-cover transition-colors duration-300 ${isActive ? 'border-[#0d6efd]' : 'border-transparent'} ${isDragging ? 'opacity-40 scale-90' : ''}`}
      onClick={onClick} />
  );
}

interface Props { images: ImageFile[]; setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>; selectedId?: string; onSelect: (img: ImageFile) => void; }

const ThumbnailList: React.FC<Props> = ({ images, setImages, selectedId, onSelect }) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)));
    }
  };

  return (
    <div className="w-[150px] h-full shrink-0 flex flex-col max-md:order-2 max-md:w-full max-md:h-auto max-md:static max-md:m-0">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* ✨ 배경과 테두리, 스크롤바 색상을 테마 변수로 교체 */}
        <div className="w-full h-full bg-sub-bg border border-border-color rounded-[8px] p-[10px] overflow-y-auto flex flex-col gap-[10px] box-border transition-colors duration-300 max-md:flex-row max-md:h-[100px] max-md:overflow-x-auto max-md:overflow-y-hidden [&::-webkit-scrollbar]:w-[6px] max-md:[&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border-color hover:[&::-webkit-scrollbar-thumb]:bg-main-text/30 [&::-webkit-scrollbar-thumb]:rounded-[4px]">
          <SortableContext items={images.map(img => img.id)} strategy={horizontalListSortingStrategy}>
            {images.map(img => <SortableThumbnail key={img.id} image={img} isActive={selectedId === img.id} onClick={() => onSelect(img)} />)}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
};

export default ThumbnailList;